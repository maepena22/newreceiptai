import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import db from '../../lib/db';
import { getUserFromRequest } from '../../lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Environment variables will be loaded at runtime
const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-1';
const BUCKET = process.env.AWS_S3_BUCKET || 'ai-receipt-apex';

function getS3Client() {
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials are not properly configured');
  }
  
  return new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  let s3;
  try {
    s3 = getS3Client();
  } catch (error) {
    console.error('Failed to initialize S3 client:', error);
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const form = formidable();
  
  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const uploader_name = user.email;
    let uploadedFiles = files.file;
    if (!uploadedFiles) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!Array.isArray(uploadedFiles)) {
      uploadedFiles = [uploadedFiles];
    }

    // Check and deduct credits before processing
    const fileCount = uploadedFiles.length;
    const userCredits = db.getUserCredits(user.id);
    
    if (!userCredits || userCredits.credits_remaining < fileCount) {
      return res.status(402).json({ 
        error: 'Insufficient credits', 
        required: fileCount,
        available: userCredits ? userCredits.credits_remaining : 0
      });
    }

    // Deduct credits
    try {
      db.useUserCredits(user.id, fileCount);
    } catch (creditError) {
      return res.status(500).json({ error: 'Failed to deduct credits' });
    }

    let batchId;
    try {
      batchId = db.createJobBatch(uploader_name);
    } catch (batchError) {
      return res.status(500).json({ error: 'Failed to create job batch' });
    }

    const jobIds = [];
    const errors = [];

    for (const uploadedFile of uploadedFiles) {
      try {
        if (!uploadedFile || !uploadedFile.filepath) {
          errors.push('Invalid file object');
          continue;
        }
        // Read file buffer
        const fileBuffer = fs.readFileSync(uploadedFile.filepath);
        const ext = path.extname(uploadedFile.originalFilename || '');
        const uuidName = uuidv4() + ext;
        // Upload to S3
        await s3.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: uuidName,
          Body: fileBuffer,
          ContentType: uploadedFile.mimetype || 'application/octet-stream',
        }));
        const s3Url = `https://${BUCKET}.s3.ap-northeast-1.amazonaws.com/${uuidName}`;
        // Create job in DB with S3 URL as file_path
        try {
          const stmt = db.prepare(
            'INSERT INTO jobs (uploader_name, file_path, status, progress, batch_id) VALUES (?, ?, ?, ?, ?)'
          );
          const info = stmt.run(uploader_name, s3Url, 'pending', 0, batchId);
          jobIds.push(info.lastInsertRowid);
        } catch (dbError) {
          errors.push(`Database error: ${dbError.message}`);
          continue;
        }
      } catch (fileError) {
        errors.push(`File processing error: ${fileError.message}`);
      }
    }

    if (jobIds.length === 0) {
      return res.status(500).json({
        error: 'No files were processed successfully',
        details: errors,
      });
    }

    return res.json({
      message: 'Upload successful. Processing will continue asynchronously.',
      batchId,
      jobIds,
      errors,
    });
    
  } catch (error) {
    console.error('[Upload API] Error:', error);
    return res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
}
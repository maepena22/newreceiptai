import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import db from '../../lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.error(`[Upload API] Invalid method: ${req.method}`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[Upload API] Starting file upload processing');

  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('[Upload API] Formidable parsing error:', err);
      return res.status(500).json({ error: 'Upload failed: ' + err.message });
    }

    console.log('[Upload API] Form parsed successfully');
    console.log('[Upload API] Fields:', fields);
    console.log('[Upload API] Files:', Object.keys(files));

    // Get uploader_name from fields
    const uploader_name = fields.uploader_name || '';
    console.log('[Upload API] Uploader name:', uploader_name);

    // Support multiple files
    let uploadedFiles = files.file;
    if (!uploadedFiles) {
      console.error('[Upload API] No files uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!Array.isArray(uploadedFiles)) {
      uploadedFiles = [uploadedFiles];
    }

    console.log(`[Upload API] Processing ${uploadedFiles.length} file(s)`);

    // Create a job batch for this upload
    let batchId;
    try {
      batchId = db.createJobBatch(uploader_name);
      console.log('[Upload API] Created job batch:', batchId);
    } catch (batchError) {
      console.error('[Upload API] Failed to create job batch:', batchError);
      return res.status(500).json({ error: 'Failed to create job batch: ' + batchError.message });
    }

    const jobIds = [];
    const errors = [];

    for (const uploadedFile of uploadedFiles) {
      try {
        if (!uploadedFile || !uploadedFile.filepath) {
          console.warn('[Upload API] Skipping invalid file:', uploadedFile);
          errors.push('Invalid file object');
          continue;
        }

        console.log('[Upload API] Processing file:', uploadedFile.originalFilename || 'unknown');

        // Save file to temp directory (if not already there)
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
          console.log('[Upload API] Creating temp directory:', tempDir);
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const destPath = path.join(tempDir, path.basename(uploadedFile.filepath));
        console.log('[Upload API] Copying file to:', destPath);

        try {
          fs.copyFileSync(uploadedFile.filepath, destPath);
          console.log('[Upload API] File copied successfully');
        } catch (copyError) {
          console.error('[Upload API] File copy failed:', copyError);
          errors.push(`File copy failed: ${copyError.message}`);
          continue;
        }

        // Create job in DB with batch_id
        try {
          const stmt = db.prepare(
            'INSERT INTO jobs (uploader_name, file_path, status, progress, batch_id) VALUES (?, ?, ?, ?, ?)' 
          );
          const info = stmt.run(uploader_name, destPath, 'pending', 0, batchId);
          jobIds.push(info.lastInsertRowid);
          console.log('[Upload API] Created job:', info.lastInsertRowid);
        } catch (dbError) {
          console.error('[Upload API] Database error creating job:', dbError);
          errors.push(`Database error: ${dbError.message}`);
          continue;
        }

      } catch (fileError) {
        console.error('[Upload API] Error processing file:', fileError);
        errors.push(`File processing error: ${fileError.message}`);
      }
    }

    console.log(`[Upload API] Upload complete. Created ${jobIds.length} jobs, ${errors.length} errors`);

    if (jobIds.length === 0) {
      console.error('[Upload API] No jobs created successfully');
      return res.status(500).json({ 
        error: 'No files were processed successfully', 
        details: errors 
      });
    }

    res.json({ 
      message: 'Upload successful. Processing will continue asynchronously.', 
      batchId, 
      jobIds,
      errors: errors.length > 0 ? errors : undefined
    });
  });
}
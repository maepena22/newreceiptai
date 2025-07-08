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
  if (req.method !== 'POST') return res.status(405).end();

  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload failed' });

    // Get uploader_name from fields
    const uploader_name = fields.uploader_name || '';

    // Support multiple files
    let uploadedFiles = files.file;
    if (!uploadedFiles) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!Array.isArray(uploadedFiles)) {
      uploadedFiles = [uploadedFiles];
    }

    // Create a job batch for this upload
    const batchId = db.createJobBatch(uploader_name);

    const jobIds = [];
    for (const uploadedFile of uploadedFiles) {
      if (!uploadedFile || !uploadedFile.filepath) continue;

      // Save file to temp directory (if not already there)
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
      const destPath = path.join(tempDir, path.basename(uploadedFile.filepath));
      fs.copyFileSync(uploadedFile.filepath, destPath);

      // Create job in DB with batch_id
      const stmt = db.prepare(
        'INSERT INTO jobs (uploader_name, file_path, status, progress, batch_id) VALUES (?, ?, ?, ?, ?)' 
      );
      const info = stmt.run(uploader_name, destPath, 'pending', 0, batchId);
      jobIds.push(info.lastInsertRowid);
    }

    res.json({ message: 'Upload successful. Processing will continue asynchronously.', batchId, jobIds });
  });
}
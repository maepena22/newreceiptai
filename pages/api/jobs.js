import db from '../../lib/db';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;
    
    if (id) {
      // Get specific job details
      const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      return res.json(job);
    }
    
    // List all jobs with enhanced error information
    const jobs = db.prepare(`
      SELECT 
        j.*,
        jb.uploader_name as batch_uploader,
        jb.created_at as batch_created_at
      FROM jobs j
      LEFT JOIN job_batches jb ON j.batch_id = jb.id
      ORDER BY j.created_at DESC
    `).all();
    
    res.json(jobs);
  } else if (req.method === 'POST') {
    // Optionally, allow job creation (not used for now)
    res.status(405).json({ error: 'Not allowed' });
  } else {
    res.status(405).end();
  }
} 
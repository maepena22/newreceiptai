import db from '../../lib/db';
import { getUserFromRequest } from '../../lib/auth';

export default function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.method === 'GET') {
    const { id } = req.query;
    if (id) {
      // Get specific job details
      const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      // Only allow access if admin or uploader
      if (!user.is_admin && job.uploader_name !== user.email) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      return res.json(job);
    }
    // List jobs
    let jobs;
    if (user.is_admin) {
      jobs = db.prepare(`
        SELECT 
          j.*,
          jb.uploader_name as batch_uploader,
          jb.created_at as batch_created_at
        FROM jobs j
        LEFT JOIN job_batches jb ON j.batch_id = jb.id
        ORDER BY j.created_at DESC
      `).all();
    } else {
      jobs = db.prepare(`
        SELECT 
          j.*,
          jb.uploader_name as batch_uploader,
          jb.created_at as batch_created_at
        FROM jobs j
        LEFT JOIN job_batches jb ON j.batch_id = jb.id
        WHERE j.uploader_name = ?
        ORDER BY j.created_at DESC
      `).all(user.email);
    }
    res.json(jobs);
  } else if (req.method === 'POST') {
    res.status(405).json({ error: 'Not allowed' });
  } else {
    res.status(405).end();
  }
} 
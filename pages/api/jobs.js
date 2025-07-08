import db from '../../lib/db';

export default function handler(req, res) {
  if (req.method === 'GET') {
    // List all jobs
    const jobs = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all();
    res.json(jobs);
  } else if (req.method === 'POST') {
    // Optionally, allow job creation (not used for now)
    res.status(405).json({ error: 'Not allowed' });
  } else {
    res.status(405).end();
  }
} 
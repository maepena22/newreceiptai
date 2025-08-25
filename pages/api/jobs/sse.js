import db from '../../../lib/db.mjs';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // Send initial connection message
  res.write('data: {"type": "connected", "message": "SSE connection established"}\n\n');

  // Function to send job updates
  const sendJobUpdate = () => {
    try {
      let jobs;
      if (user.is_admin) {
        // Admin can see all jobs
        jobs = db.prepare(`
          SELECT 
            id, status, progress, error, result, file_path, created_at, updated_at, batch_id,
            uploader_name
          FROM jobs
          ORDER BY created_at DESC
          LIMIT 100
        `).all();
      } else {
        // Regular users can only see their own jobs
        jobs = db.prepare(`
          SELECT 
            id, status, progress, error, result, file_path, created_at, updated_at, batch_id,
            uploader_name
          FROM jobs
          WHERE uploader_name = ?
          ORDER BY created_at DESC
          LIMIT 100
        `).all(user.email);
      }

      const data = JSON.stringify({
        type: 'jobs_update',
        jobs: jobs,
        timestamp: new Date().toISOString()
      });

      res.write(`data: ${data}\n\n`);
    } catch (error) {
      console.error('SSE Error:', error);
      res.write(`data: {"type": "error", "message": "Failed to fetch jobs"}\n\n`);
    }
  };

  // Send initial data
  sendJobUpdate();

  // Set up interval for updates
  const interval = setInterval(sendJobUpdate, 2000); // Update every 2 seconds

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });

  // Handle server shutdown
  req.on('abort', () => {
    clearInterval(interval);
    res.end();
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 
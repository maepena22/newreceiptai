import db from '../../../lib/db.mjs';
import { verifyToken } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify user authentication
    const token = req.cookies.token;
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's current subscription
    const subscription = db.prepare(`
      SELECT * FROM subscriptions 
      WHERE user_id = ? AND status IN ('active', 'past_due', 'trialing')
      ORDER BY created_at DESC 
      LIMIT 1
    `).get(decoded.userId);

    if (subscription) {
      res.status(200).json({ subscription });
    } else {
      res.status(200).json({ subscription: null });
    }
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 
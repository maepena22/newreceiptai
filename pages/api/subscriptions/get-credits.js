import db from '../../../lib/db.mjs';
import { verifyToken } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.cookies.token;
    console.log('Credits API - Token present:', !!token);
    console.log('Credits API - All cookies:', req.cookies);
    
    if (!token) {
      console.log('Credits API - No token found');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = await verifyToken(token);
    console.log('Credits API - Token decoded:', !!decoded);
    console.log('Credits API - Full decoded payload:', decoded);
    console.log('Credits API - User ID:', decoded?.userId);
    console.log('Credits API - User ID type:', typeof decoded?.userId);
    
    if (!decoded) {
      console.log('Credits API - Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user credits
    const credits = db.prepare(`
      SELECT credits_remaining, credits_total, last_reset_date, created_at, updated_at
      FROM user_credits 
      WHERE user_id = ?
    `).get(decoded.userId);

    console.log('Credits API - Credits found:', !!credits);
    console.log('Credits API - Credits data:', credits);

    // If user has no credits, create them with 10 free credits
    if (!credits) {
      console.log('Credits API - Creating free credits for new user');
      db.addUserCredits(decoded.userId, 10);
      
      // Get the newly created credits
      const newCredits = db.prepare(`
        SELECT credits_remaining, credits_total, last_reset_date, created_at, updated_at
        FROM user_credits 
        WHERE user_id = ?
      `).get(decoded.userId);
      
      res.status(200).json({ credits: newCredits });
    } else {
      res.status(200).json({ credits });
    }
  } catch (error) {
    console.error('Credits API - Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 
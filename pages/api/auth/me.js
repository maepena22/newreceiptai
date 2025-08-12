import db from '../../../lib/db';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export default function handler(req, res) {
  // Check if JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare('SELECT id, email, name, mobile, address, created_at FROM users WHERE id = ?').get(payload.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
} 
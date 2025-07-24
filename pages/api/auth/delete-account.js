import db from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';
import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  db.deleteUserByEmail(user.email);
  res.setHeader('Set-Cookie', serialize('token', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0),
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  }));
  res.json({ success: true });
} 
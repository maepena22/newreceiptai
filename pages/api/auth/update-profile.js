import db from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const { name, mobile, address } = req.body;
  db.updateUserProfile(user.id, { name, mobile, address });
  const updated = db.getUserById(user.id);
  res.json({ user: { id: updated.id, email: updated.email, name: updated.name, mobile: updated.mobile, address: updated.address, created_at: updated.created_at } });
} 
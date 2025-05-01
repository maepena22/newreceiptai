import db from '../../lib/db';

export default function handler(req, res) {
  const rows = db.prepare('SELECT * FROM receipts ORDER BY created_at DESC').all();
  res.status(200).json(rows);
}
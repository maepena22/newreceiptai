import db from '../../lib/db';
import { getUserFromRequest } from '../../lib/auth';

export default function handler(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  if (req.method === 'PATCH') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { company_name, receipt_type, date, image_name, price } = req.body;
    try {
      const stmt = db.prepare(
        'UPDATE receipts SET company_name = ?, receipt_type = ?, date = ?, image_name = ?, price = ? WHERE id = ?'
      );
      stmt.run(company_name, receipt_type, date, image_name, price, id);
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  let rows;
  if (user.is_admin) {
    rows = db.prepare(`
      SELECT 
        id,
        uploader_name,
        receipt_type,
        date,
        company_name,
        price,
        raw_ocr,
        file_path,
        image_name,
        items_json,
        created_at
      FROM receipts 
      ORDER BY created_at DESC
    `).all();
  } else {
    rows = db.prepare(`
      SELECT 
        id,
        uploader_name,
        receipt_type,
        date,
        company_name,
        price,
        raw_ocr,
        file_path,
        image_name,
        items_json,
        created_at
      FROM receipts 
      WHERE uploader_name = ?
      ORDER BY created_at DESC
    `).all(user.email);
  }
  res.status(200).json(rows);
}
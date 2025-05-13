import db from '../../lib/db';

export default function handler(req, res) {
  const rows = db.prepare(`
    SELECT 
      id,
      uploader_name,
      receipt_type,
      date,
      company_name,
      price,
      raw_ocr,
      created_at
    FROM receipts 
    ORDER BY created_at DESC
  `).all();
  res.status(200).json(rows);
}
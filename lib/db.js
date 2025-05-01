import Database from 'better-sqlite3';
const db = new Database('invoices.db');

// Update table schema for new fields
db.prepare(`
  CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uploader_name TEXT,
    receipt_type TEXT,
    date TEXT,
    company_name TEXT,
    price TEXT,
    raw_ocr TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

module.exports = db;
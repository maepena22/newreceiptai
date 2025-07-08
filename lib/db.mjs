import Database from 'better-sqlite3';
const db = new Database('invoices.db');

// Receipts table
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

// Jobs table
 db.prepare(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uploader_name TEXT,
    file_path TEXT,
    status TEXT DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    result TEXT,
    error TEXT,
    batch_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Add batch_id column if it doesn't exist (for existing databases)
try {
  db.prepare('ALTER TABLE jobs ADD COLUMN batch_id INTEGER').run();
} catch (error) {
  // Column already exists, ignore error
  console.log('[DB] batch_id column already exists or error adding it:', error.message);
}

// Job batches table
 db.prepare(`
  CREATE TABLE IF NOT EXISTS job_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uploader_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.createJobBatch = function(uploader_name) {
  const info = db.prepare('INSERT INTO job_batches (uploader_name) VALUES (?)').run(uploader_name);
  return info.lastInsertRowid;
};

db.updateJob = function (id, { status, progress, result, error }) {
  db.prepare(`
    UPDATE jobs SET 
      status = COALESCE(?, status),
      progress = COALESCE(?, progress),
      result = COALESCE(?, result),
      error = COALESCE(?, error),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, progress, result, error, id);
};

export default db; 
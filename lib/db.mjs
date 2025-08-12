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
    file_path TEXT,
    image_name TEXT,
    items_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Add file_path column if it doesn't exist (for existing databases)
try {
  db.prepare('ALTER TABLE receipts ADD COLUMN file_path TEXT').run();
} catch (error) {
  // Column already exists, ignore error
}
// Add image_name column if it doesn't exist (for existing databases)
try {
  db.prepare('ALTER TABLE receipts ADD COLUMN image_name TEXT').run();
} catch (error) {
  // Column already exists, ignore error
}
// Add items_json column if it doesn't exist (for existing databases)
try {
  db.prepare('ALTER TABLE receipts ADD COLUMN items_json TEXT').run();
} catch (error) {
  // Column already exists, ignore error
}

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

// Users table
 db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    mobile TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_admin INTEGER DEFAULT 0
  )
`).run();

// Add subscription-related columns to users table
try {
  db.prepare('ALTER TABLE users ADD COLUMN name TEXT').run();
} catch (error) {
  // Column already exists, ignore error
}
try {
  db.prepare('ALTER TABLE users ADD COLUMN mobile TEXT').run();
} catch (error) {
  // Column already exists, ignore error
}
try {
  db.prepare('ALTER TABLE users ADD COLUMN address TEXT').run();
} catch (error) {
  // Column already exists, ignore error
}
try {
  db.prepare('ALTER TABLE users ADD COLUMN stripe_customer_id TEXT').run();
} catch (error) {
  // Column already exists, ignore error
}

// Subscriptions table
db.prepare(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    plan_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    current_period_start DATETIME,
    current_period_end DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
`).run();

// Payment intents table
db.prepare(`
  CREATE TABLE IF NOT EXISTS payment_intents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    stripe_payment_intent_id TEXT UNIQUE,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
`).run();

// User helpers

db.getUserByEmail = function(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
};

db.createUser = function(email, password_hash, is_admin = 0) {
  return db.prepare('INSERT INTO users (email, password_hash, is_admin) VALUES (?, ?, ?)').run(email, password_hash, is_admin);
};

db.setUserAdmin = function(email) {
  return db.prepare('UPDATE users SET is_admin = 1 WHERE email = ?').run(email);
};

db.deleteUserByEmail = function(email) {
  return db.prepare('DELETE FROM users WHERE email = ?').run(email);
};

db.getUserById = function(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
};

db.updateUserProfile = function(id, { name, mobile, address }) {
  return db.prepare('UPDATE users SET name = COALESCE(?, name), mobile = COALESCE(?, mobile), address = COALESCE(?, address) WHERE id = ?')
    .run(name, mobile, address, id);
};

export default db; 
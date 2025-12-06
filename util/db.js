const path = require('path');
const Database = require('better-sqlite3');

const DB_FILE = path.join(__dirname, '../data/app.db');

const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');

db.prepare(`
  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    description TEXT,
    category TEXT,
    allow_card INTEGER DEFAULT 1,
    allow_bank INTEGER DEFAULT 0,
    allow_gift_card INTEGER DEFAULT 1,
    updated_at TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    invoice_id TEXT,
    type TEXT NOT NULL,
    payload TEXT,
    timestamp TEXT NOT NULL
  )
`).run();

module.exports = db;

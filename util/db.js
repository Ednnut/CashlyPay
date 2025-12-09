const path = require("path");
const Database = require("better-sqlite3");

const DB_FILE = path.join(__dirname, "../data/app.db");

const db = new Database(DB_FILE);
db.pragma("journal_mode = WAL");

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    description TEXT,
    breakdown TEXT,
    category TEXT,
    allow_card INTEGER DEFAULT 1,
    allow_bank INTEGER DEFAULT 0,
    allow_gift_card INTEGER DEFAULT 1,
    allow_cash_app INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL
  )
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    invoice_id TEXT,
    type TEXT NOT NULL,
    payload TEXT,
    timestamp TEXT NOT NULL
  )
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS service_catalog (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT NOT NULL,
    created_by TEXT,
    approved_by TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS service_versions (
    id TEXT PRIMARY KEY,
    service_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    base_price INTEGER NOT NULL,
    currency TEXT NOT NULL,
    allow_card INTEGER DEFAULT 1,
    allow_bank INTEGER DEFAULT 0,
    allow_gift_card INTEGER DEFAULT 1,
    allow_cash_app INTEGER DEFAULT 0,
    payment_source_preference TEXT,
    status TEXT NOT NULL,
    effective_from TEXT,
    notes TEXT,
    created_by TEXT,
    submitted_by TEXT,
    approved_by TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(service_id) REFERENCES service_catalog(id)
  )
`,
).run();

db.prepare(
  `
  CREATE UNIQUE INDEX IF NOT EXISTS service_versions_unique
  ON service_versions(service_id, version)
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS service_components (
    id TEXT PRIMARY KEY,
    version_id TEXT NOT NULL,
    component_type TEXT NOT NULL,
    label TEXT NOT NULL,
    amount INTEGER DEFAULT 0,
    quantity REAL,
    unit TEXT,
    linked_service_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(version_id) REFERENCES service_versions(id)
  )
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS service_audit_log (
    id TEXT PRIMARY KEY,
    service_id TEXT,
    version_id TEXT,
    actor TEXT,
    action TEXT NOT NULL,
    payload TEXT,
    created_at TEXT NOT NULL
  )
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS invoice_milestones (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    label TEXT NOT NULL,
    due_date TEXT,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    payment_source TEXT,
    allow_card INTEGER DEFAULT 1,
    allow_bank INTEGER DEFAULT 0,
    allow_gift_card INTEGER DEFAULT 1,
    allow_cash_app INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled',
    created_at TEXT NOT NULL
  )
`,
).run();

module.exports = db;

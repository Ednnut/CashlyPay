const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/activity.json');

const ensureFile = () => {
  if (!fs.exists(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
  }
};

const readAll = () => {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to parse activity log: ${error.message}`);
  }
  return [];
};

const writeAll = (entries) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2));
};

const addEvent = (event) => {
  const entries = readAll();
  entries.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    ...event,
  });
  writeAll(entries);
};

const listByInvoice = (invoiceId) => {
  const entries = readAll();
  return entries.filter((entry) => entry.invoiceId === invoiceId);
};

module.exports = {
  addEvent,
  listByInvoice,
};

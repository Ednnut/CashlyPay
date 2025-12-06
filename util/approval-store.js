const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/approvals.json');

const ensureFile = () => {
  if (!fs.exists(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf-8');
  }
};

const readStore = () => {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
};

const writeStore = (store) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
};

const getStatus = (invoiceId) => {
  const store = readStore();
  return store[invoiceId];
};

const setStatus = (invoiceId, status, note) => {
  const store = readStore();
  store[invoiceId] = {
    status,
    note: note || '',
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
  return store[invoiceId];
};

module.exports = {
  getStatus,
  setStatus,
};

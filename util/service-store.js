const db = require('./db');
const defaultServices = require('../config/services').services;

const toRow = (row) =>
  row && {
    id: row.id,
    name: row.name,
    priceAmount: row.price_amount,
    currency: row.currency,
    description: row.description,
    category: row.category,
    paymentMethods: {
      card: !!row.allow_card,
      bankAccount: !!row.allow_bank,
      squareGiftCard: !!row.allow_gift_card,
    },
  };

const seedDefaults = () => {
  const count = db.prepare('SELECT COUNT(*) as count FROM services').get().count;
  if (count > 0) return;
  const insert = db.prepare(
    `INSERT INTO services (id, name, price_amount, currency, description, category, allow_card, allow_bank, allow_gift_card, updated_at)
    VALUES (@id, @name, @price_amount, @currency, @description, @category, @allow_card, @allow_bank, @allow_gift_card, @updated_at)`
  );
  const now = new Date().toISOString();
  const payload = defaultServices.map((item) => ({
    id: item.id,
    name: item.name,
    price_amount: item.priceAmount,
    currency: item.currency || 'USD',
    description: item.description,
    category: item.category,
    allow_card: item.paymentMethods?.card === false ? 0 : 1,
    allow_bank: item.paymentMethods?.bankAccount ? 1 : 0,
    allow_gift_card: item.paymentMethods?.squareGiftCard ? 1 : 0,
    updated_at: now,
  }));
  const insertMany = db.transaction((records) => {
    records.forEach((record) => insert.run(record));
  });
  insertMany(payload);
};

seedDefaults();

const list = () => {
  const rows = db.prepare('SELECT * FROM services ORDER BY name ASC').all();
  return rows.map(toRow);
};

const findById = (id) => {
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  return toRow(row);
};

const findByCategory = (category) => {
  if (!category) return list();
  const rows = db.prepare('SELECT * FROM services WHERE category = ?').all(category);
  return rows.map(toRow);
};

const search = (term) => {
  if (!term) return list();
  const rows = db
    .prepare('SELECT * FROM services WHERE name LIKE ? OR description LIKE ? ORDER BY name ASC')
    .all(`%${term}%`, `%${term}%`);
  return rows.map(toRow);
};

module.exports = {
  list,
  findById,
  findByCategory,
  search,
};

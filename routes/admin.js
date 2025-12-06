const express = require('express');
const { listReminders, runNow } = require('../util/reminder-queue');

const router = express.Router();

router.get('/reminders', (req, res) => {
  const reminders = listReminders();
  res.render('admin-reminders', { reminders });
});

router.post('/reminders/run', (req, res) => {
  runNow();
  res.redirect('/admin/reminders');
});

module.exports = router;

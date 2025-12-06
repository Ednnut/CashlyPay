const express = require('express');
const activityStore = require('../util/activity-store');
const reminderQueue = require('../util/reminder-queue');

const router = express.Router();

router.get('/', (req, res) => {
  const activities = activityStore.listAll();
  const totalReminders = activities.filter((item) => item.type === 'REMINDER_SENT').length;
  const totalApprovals = activities.filter((item) => item.type === 'APPROVAL_STATUS_CHANGED').length;
  const reminderBacklog = reminderQueue.listReminders().length;

  const recentActivities = activities.slice(-10).reverse();

  res.render('analytics', {
    metrics: {
      totalEvents: activities.length,
      totalReminders,
      totalApprovals,
      reminderBacklog,
    },
    recentActivities,
  });
});

module.exports = router;

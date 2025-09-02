import cron from 'node-cron';
import { sendReminders } from './reminder.js'; // we will export sendReminders from reminder.js

// Schedule to run every day at 9 AM
cron.schedule('0 9 * * *', () => {
  console.log('Running daily payment reminders...');
  sendReminders();
}, {
  timezone: "Asia/Kolkata"
});

console.log('Cron job started: Payment reminders scheduled at 9 AM daily.');
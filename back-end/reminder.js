import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import QRCode from 'qrcode';

dotenv.config();

// ES module way to get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to payments.json
const paymentsPath = join(__dirname, 'payments.json');

// Setup Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Check if reminder is due (7 days before nextDate)
function isReminderDue(nextDate) {
  const today = new Date();
  const target = new Date(nextDate);
  target.setDate(target.getDate() - 7);

  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  );
}

// -------------------- Export function --------------------
export async function sendReminders() {
  try {
    if (!fs.existsSync(paymentsPath)) {
      console.log('payments.json not found.');
      return;
    }

    const data = fs.readFileSync(paymentsPath, 'utf-8');
    const payments = JSON.parse(data);

    for (let entry of payments) {
      if (entry.reminder && entry.nextDate && isReminderDue(entry.nextDate)) {
        // UPI link + QR
        const upiId = process.env.UPI_VPA;
        const upiName = process.env.UPI_NAME;
        const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&cu=INR&am=${entry.amount}`;
        const qrDataUrl = await QRCode.toDataURL(upiLink);

        // Email content
        const mailOptions = {
          from: process.env.SMTP_FROM,
          to: entry.email,
          subject: `Payment Reminder - ${entry.type}`,
          html: `
            <p>Hi ${entry.name},</p>
            <p>This is a reminder for your upcoming payment due on <b>${entry.nextDate}</b>.</p>
            <p>Amount: <b>₹${entry.amount}</b></p>
            <p>Payment Options:</p>
            <ul>
              <li>UPI: Scan QR or <a href="${upiLink}">${upiLink}</a></li>
              <li>Card: <a href="${process.env.CARD_PAY_BASE}">Pay via Card</a></li>
            </ul>
            <img src="${qrDataUrl}" alt="UPI QR Code" style="width:180px;height:180px;"/>
            <p>Thank you,<br/>KPH Trainings</p>
          `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Reminder sent to ${entry.email} - ${info.messageId}`);
      }
    }
  } catch (err) {
    console.error('Error sending reminders:', err);
  }
}

// -------------------- Optional manual run --------------------
if (process.argv[2] === '--run') {
  sendReminders();
}

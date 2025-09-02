import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly from the backend folder
dotenv.config({ path: path.resolve('./backend/.env') });

async function sendTestEmail() {
  console.log("SMTP_HOST:", process.env.SMTP_HOST); // for debugging
  console.log("SMTP_PORT:", process.env.SMTP_PORT); // for debugging

  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  let info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: "akhilesh232002@gmail.com",
    subject: "Test Email from Payment Portal",
    text: "This is a test email to confirm Gmail SMTP is working."
  });

  console.log("Email sent: %s", info.messageId);
}

sendTestEmail().catch(console.error);

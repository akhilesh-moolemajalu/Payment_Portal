import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const paymentsPath = join(__dirname, 'payments.json');

// Endpoint to receive new payments
app.post('/api/payments', (req, res) => {
  const newEntry = req.body;

  let payments = [];
  if (fs.existsSync(paymentsPath)) {
    payments = JSON.parse(fs.readFileSync(paymentsPath, 'utf-8'));
  }

  payments.push(newEntry);
  fs.writeFileSync(paymentsPath, JSON.stringify(payments, null, 2));

  res.json({ success: true, message: 'Payment saved' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

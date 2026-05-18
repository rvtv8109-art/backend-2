import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Cashfree Payment API
  app.post('/api/payment-create', async (req, res) => {
    const { amount, squadName, email, mobile, customer_id } = req.body;

    const appId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_APPID || '').trim();
    const secretKey = (process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_SECRET || '').trim();

    if (!appId || !secretKey) {
      return res.status(500).json({ error: 'Payment gateway configuration missing' });
    }

    try {
      const orderId = `ASF_${Date.now()}`;
      const mode = (process.env.VITE_CASHFREE_MODE || 'sandbox').toLowerCase().trim();
      const isProduction = mode === 'production';
      const baseUrl = isProduction ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

      const cleanMobile = mobile.toString().replace(/\D/g, '').slice(-10);

      const response = await axios.post(`${baseUrl}/orders`, {
        order_id: orderId,
        order_amount: Number(amount).toFixed(2),
        order_currency: 'INR',
        customer_details: {
          customer_id: customer_id || `cust_${Date.now()}`,
          customer_email: (email || 'user@example.com').toLowerCase().trim(),
          customer_phone: cleanMobile,
        },
        order_meta: {
          return_url: `${appUrl}/api/payment-verify?order_id={order_id}`,
        },
        order_note: `Registration for ${squadName || 'ASF Tournament'}`,
      }, {
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json'
        }
      });

      res.json({ 
        payment_session_id: response.data.payment_session_id,
        order_id: response.data.order_id
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to initiate payment', details: error.response?.data || error.message });
    }
  });

  app.get('/api/payment-verify', async (req, res) => {
    const { order_id } = req.query;
    const appId = (process.env.CASHFREE_APP_ID || '').trim();
    const secretKey = (process.env.CASHFREE_SECRET_KEY || '').trim();

    try {
      const mode = (process.env.VITE_CASHFREE_MODE || 'sandbox').toLowerCase().trim();
      const baseUrl = mode === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

      const response = await axios.get(`${baseUrl}/orders/${order_id}`, {
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': '2023-08-01',
        }
      });

      const status = response.data.order_status;
      res.redirect(`/?payment_status=${status}&order_id=${order_id}`);
    } catch (error: any) {
      res.redirect('/?payment_status=ERROR');
    }
  });

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}

startServer();

import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { amount, squadName, email, mobile, customer_id } = req.body || {};

  const appId = (process.env.CASHFREE_APP_ID || '').trim();
  const secretKey = (process.env.CASHFREE_SECRET_KEY || '').trim();

  if (!appId || !secretKey) {
    return res.status(500).json({ error: 'Gateway config missing. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in Vercel.' });
  }

  try {
    const orderId = `ASF_${Date.now()}`;
    const mode = (process.env.VITE_CASHFREE_MODE || 'sandbox').toLowerCase().trim();
    const isProduction = mode === 'production' || mode === 'live';
    const baseUrl = isProduction ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
    
    // Redirect logic
    const host = req.headers.host;
    const protocol = 'https';
    const frontendUrl = `${protocol}://${host}`;

    const response = await axios.post(`${baseUrl}/orders`, {
      order_id: orderId,
      order_amount: Number(amount).toFixed(2),
      order_currency: 'INR',
      customer_details: {
        customer_id: customer_id || `cust_${Date.now()}`,
        customer_email: email || 'user@example.com',
        customer_phone: mobile,
      },
      order_meta: {
        return_url: `${frontendUrl}/api/payment-verify?order_id={order_id}&frontend_url=${encodeURIComponent(frontendUrl)}`,
      },
      order_note: `Registration for ${squadName}`,
    }, {
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json({ 
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id
    });
  } catch (error: any) {
    return res.status(500).json(error.response?.data || { error: error.message });
  }
}

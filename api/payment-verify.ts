import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { order_id, frontend_url } = req.query || {};
  const appId = (process.env.CASHFREE_APP_ID || '').trim();
  const secretKey = (process.env.CASHFREE_SECRET_KEY || '').trim();

  if (!order_id) return res.status(400).send('Missing order_id');

  try {
    const mode = (process.env.VITE_CASHFREE_MODE || 'sandbox').toLowerCase().trim();
    const isProduction = mode === 'production' || mode === 'live';
    const baseUrl = isProduction ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

    const response = await axios.get(`${baseUrl}/orders/${order_id}`, {
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      }
    });

    const status = response.data.order_status;
    const redirectUrl = `${frontend_url || ''}/?payment_status=${status}&order_id=${order_id}`;
    
    res.setHeader('Location', redirectUrl);
    return res.status(302).send('');
  } catch (error) {
    res.setHeader('Location', `${frontend_url || ''}/?payment_status=ERROR`);
    return res.status(302).send('');
  }
}

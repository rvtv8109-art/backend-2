import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { order_id, frontend_url } = req.query || {};
  const appId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_APPID || process.env.CASHFREE_APP_ || '').trim().replace(/^["']|["']$/g, '');
  const secretKey = (process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_SECRET || process.env.CASHFREE_SECRF || '').trim().replace(/^["']|["']$/g, '');

  if (!order_id) {
     return res.status(400).send('Missing order_id');
  }

  try {
    const mode = (process.env.VITE_CASHFREE_MODE || 'sandbox').toLowerCase().trim();
    const isProduction = mode === 'production' || mode === 'live';
    
    let baseUrl = process.env.CASHFREE_BASE_URL || (isProduction ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg');
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    const response = await axios.get(`${baseUrl}/orders/${order_id}`, {
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      }
    });

    const status = response.data.order_status;
    const fUrl = Array.isArray(frontend_url) ? frontend_url[0] : frontend_url;
    const redirectUrl = fUrl ? `${fUrl}/?payment_status=${status}&order_id=${order_id}` : `/?payment_status=${status}&order_id=${order_id}`;
    
    res.setHeader('Location', redirectUrl);
    return res.status(302).send('');
  } catch (error: any) {
    const fUrl = Array.isArray(frontend_url) ? frontend_url[0] : frontend_url;
    res.setHeader('Location', `${fUrl || ''}/?payment_status=ERROR`);
    return res.status(302).send('');
  }
}

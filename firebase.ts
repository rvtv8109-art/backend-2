import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { amount, squadName, email, mobile, customer_id } = req.body || {};

  if (!amount || !mobile) {
    return res.status(400).json({ error: 'Missing required fields: amount and mobile are required.' });
  }

  const appId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_APPID || process.env.CASHFREE_APP_ || '').trim().replace(/^["']|["']$/g, '');
  const secretKey = (process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_SECRET || process.env.CASHFREE_SECRF || '').trim().replace(/^["']|["']$/g, '');

  if (!appId || !secretKey) {
    console.error('Cashfree credentials missing');
    return res.status(500).json({ 
      error: 'Payment gateway configuration missing',
      details: 'CASHFREE_APP_ID or CASHFREE_SECRET_KEY not found in environment variables.'
    });
  }

  try {
    const orderId = `ASF_${Date.now()}`;
    const mode = (process.env.VITE_CASHFREE_MODE || 'sandbox').toLowerCase().trim();
    const isProduction = mode === 'production' || mode === 'live';
    
    let baseUrl = process.env.CASHFREE_BASE_URL || (isProduction ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg');
    
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const frontendUrl = `${protocol}://${host}`;
    
    const safeMobile = (mobile || '').toString().replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(safeMobile)) {
       return res.status(400).json({ error: 'Invalid Indian mobile number. Please provide a 10-digit number starting with 6, 7, 8, or 9.' });
    }

    const targetUrl = `${baseUrl}/orders`;
    console.log(`[PAYMENT] Creating order for ${squadName} | Mode: ${mode} | URL: ${targetUrl}`);

    const response = await axios.post(targetUrl, {
      order_id: orderId,
      order_amount: Number(amount).toFixed(2),
      order_currency: 'INR',
      customer_details: {
        customer_id: customer_id || `cust_${Date.now()}`,
        customer_email: (email || 'user@example.com').toLowerCase().trim(),
        customer_phone: safeMobile,
      },
      order_meta: {
        return_url: `${frontendUrl}/api/payment-verify?order_id={order_id}&frontend_url=${encodeURIComponent(frontendUrl)}`,
      },
      order_note: `Registration for ${squadName || 'ASF Tournament'}`,
    }, {
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    return res.status(200).json({ 
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id
    });
  } catch (error: any) {
    const errorData = error.response?.data || error.message;
    console.error('[PAYMENT ERROR]', JSON.stringify(errorData, null, 2));
    
    return res.status(error.response?.status || 500).json(errorData);
  }
}

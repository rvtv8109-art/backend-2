<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0a39c1ee-4456-475c-b1a3-84df43d7c8d7

## Deploy to Netlify (A to Z Guide)

1. **Download Code**: Click the "Export" or "Download" button in AI Studio to get the ZIP file.
2. **Extract ZIP**: Extract the folder on your computer or mobile.
3. **Upload to Netlify**:
   - Go to [Netlify Drop](https://app.netlify.com/drop).
   - Drag and drop the **entire extracted folder** (the one containing `package.json` and `netlify.toml`).
4. **Configure Environment Variables**:
   - Go to **Site Settings** > **Environment variables** on Netlify.
   - Add the following keys (values from your dashboards):
     - `CASHFREE_APP_ID`: Your Cashfree App ID.
     - `CASHFREE_SECRET_KEY`: Your Cashfree Secret Key.
     - `VITE_CASHFREE_MODE`: `sandbox` (test) or `production` (live).

Your backend (Payments) will now work automatically via Netlify Functions!

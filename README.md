{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "start": "NODE_ENV=production node dist/server.cjs",
    "preview": "vite preview",
    "clean": "rm -rf dist",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^1.30.0",
    "@tailwindcss/vite": "^4.0.0",
    "@vercel/node": "^5.8.2",
    "@vitejs/plugin-react": "^4.3.4",
    "axios": "^1.7.9",
    "dom-to-image-more": "^3.7.2",
    "dotenv": "^16.4.7",
    "esbuild": "^0.25.0",
    "express": "^4.21.2",
    "firebase": "^11.3.1",
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.1",
    "lucide-react": "^0.546.0",
    "motion": "^12.4.7",
    "qrcode.react": "^4.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.28.0",
    "vite": "^6.1.0"
  },
  "devDependencies": {
    "@netlify/functions": "^5.2.1",
    "@types/express": "^5.0.6",
    "@types/node": "^22.15.5",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.3",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.22.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}

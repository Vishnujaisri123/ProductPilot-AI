# ProductVision AI Showcase 

An AI-powered, Admin-Controlled Product Showcase platform. Transforms e-commerce product screenshots into structured data using Groq Vision, OCR, and RAG validation, then automatically publishes them to a beautiful public storefront with hidden affiliate link redirection.

## Features

- **Public Storefront:** A fast, Amazon-inspired public marketplace to display curated products.
- **Hidden Affiliate Links:** Visitors click products to be securely redirected via backend (`/api/public/redirect/:id`) so your raw affiliate tags are never exposed to the browser.
- **Admin Dashboard:** Secure backend panel exclusively for you to upload, manage, and dispatch products.
- **AI Extraction Pipeline:** Upload a screenshot and the system automatically runs OCR and Vision AI to extract Name, Price, Rating, Platform, and Features.
- **Telegram Dispatching:** Send products directly to your Telegram channel with one click.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Queue/Cache**: Upstash Redis + BullMQ
- **AI**: Groq Llama Vision + Tesseract.js OCR
- **Storage**: Cloudinary

---

## Deployment Guide

### Part 1: Deploying the Backend on Render

1. Create an account on [Render.com](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository (`ProductPilot-AI`).
4. **Configuration Settings:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (Make sure your `package.json` has `"start": "node src/index.js"`)
5. **Environment Variables:** Add the following keys in Render's "Environment" tab:

| Key | Description |
|-----|-------------|
| `PORT` | `5000` (Optional, Render assigns one automatically) |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB connection string (e.g., from MongoDB Atlas) |
| `REDIS_URL` | Your Upstash Redis URL (must start with `rediss://`) |
| `JWT_SECRET` | A long, random string for authentication |
| `GROQ_API_KEY` | Your Groq API key for Vision extraction |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary credentials for image storage |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET`| Cloudinary Secret |
| `CLIENT_URL` | The URL of your Vercel frontend (e.g., `https://my-store.vercel.app`) |

6. Click **Deploy Web Service**. Once complete, copy the deployed backend URL (e.g., `https://productpilot-api.onrender.com`).

---

### Part 2: Deploying the Frontend on Vercel

1. Create an account on [Vercel.com](https://vercel.com/).
2. Click **Add New -> Project**.
3. Import your GitHub repository (`ProductPilot-AI`).
4. **Configuration Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
5. **Environment Variables:** Add the following keys in Vercel's "Environment Variables" tab:

| Key | Description |
|-----|-------------|
| `VITE_API_URL` | The URL of your deployed Render backend + `/api` (e.g., `https://productpilot-api.onrender.com/api`) |

6. Click **Deploy**. Vercel will build and launch your storefront.

---

### Part 3: Post-Deployment Setup

1. **Update Allowed Origins:** Make sure the `CLIENT_URL` in Render exactly matches your live Vercel URL so CORS doesn't block requests.
2. **Login & Management:** Visit `https://your-vercel-app.vercel.app/login` to access the Admin panel.
3. **Telegram Webhooks (Optional):** If you use the Telegram bot, ensure the server has outgoing internet access.

## Local Development

```bash
# Clone and setup env variables based on backend/.env.example
git clone https://github.com/Vishnujaisri123/ProductPilot-AI.git

# Install and run backend
cd backend
npm install
npm run dev

# Install and run frontend
cd ../frontend
npm install
npm run dev
```

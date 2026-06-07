# ProductVision AI - Complete Deployment Guide

## Prerequisites

- GitHub repository pushed with latest code
- MongoDB Atlas account (free tier OK)
- Render.com account
- Vercel.com account

---

## PART 1: Deploy Backend on Render

### Step 1: Create Render Web Service

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Choose branch: `main`

### Step 2: Configure Render Settings

**Name:** `productvision-api` (or your choice)

**Environment:** Node  
**Build Command:** `cd backend && npm install`  
**Start Command:** `cd backend && node src/index.js`

**Root Directory:** Leave blank (Render auto-detects)

### Step 3: Add Environment Variables

In Render Dashboard → Your Service → **Environment**

Copy and paste EXACTLY:

```
PORT=5000
NODE_ENV=production

MONGODB_URI=your_mongodb_uri

REDIS_URL=your_redis_url

JWT_SECRET=your_jwt_secret

GROQ_API_KEY=your_groq_api_key

CLIENT_URL=https://your-frontend-url.vercel.app

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=productvision

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=vishnuketa999@gmail.com
SMTP_PASS=afzz bxok abdv rsto
```

**⚠️ IMPORTANT:** Replace `https://your-frontend-url.vercel.app` with your actual Vercel frontend URL (get this after deploying frontend)

### Step 4: Deploy

Click **"Create Web Service"** and wait ~5 minutes.

**Note the URL:** `https://your-api-name.onrender.com`

### Step 5: Create Admin User on Render

After backend deploys, run seed script:

```bash
# In your local terminal, from project root:
curl -X POST https://your-api-name.onrender.com/api/seed
```

Or use Render Shell:

```bash
cd backend && node seed.js
```

---

## PART 2: Deploy Frontend on Vercel

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository

### Step 2: Configure Vercel Settings

**Framework Preset:** Vite  
**Root Directory:** `frontend`  
**Build Command:** `npm run build`  
**Output Directory:** `dist`

### Step 3: Add Environment Variables

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**

```
VITE_API_URL=https://your-api-name.onrender.com/api
```

Replace `your-api-name` with actual Render backend URL.

### Step 4: Deploy

Click **"Deploy"** and wait ~3 minutes.

**Note the URL:** `https://your-project.vercel.app`

### Step 5: Update Backend CLIENT_URL

Go back to Render → Your Backend Service → **Environment**

Update `CLIENT_URL` to your new Vercel URL:

```
CLIENT_URL=https://your-project.vercel.app
```

---

## PART 3: Verify Deployment

### Test Backend API

```bash
# Check if backend is running
curl https://your-api-name.onrender.com/api/auth/me

# Should return 401 Unauthorized (expected, no token)
# If you get "Cannot GET", backend has issues
```

### Test Frontend

1. Open `https://your-project.vercel.app` in browser
2. Go to `/login`
3. Try logging in with:
   - Email: `admin@productvision.ai`
   - Password: `AdminPassword123!`

If login fails, check:

- Backend `CLIENT_URL` matches your Vercel URL
- Backend environment variables are set
- Admin user was created (run seed script again)

### Test Product Upload

1. Login as admin
2. Go to Dashboard → Upload Screenshot
3. Upload an image
4. Wait for extraction
5. Add an affiliate link
6. Go to public store and verify product appears

---

## TROUBLESHOOTING

### "Login failed" on deployed app

**Solution:**

1. Check Render logs: Dashboard → Your Service → "Logs"
2. Look for `[AUTH]` messages
3. If user not found, run seed script again:
   ```bash
   # Via Render Shell or SSH
   cd backend && node seed.js
   ```

### Frontend can't reach backend

**Solutions:**

1. Verify `VITE_API_URL` is set in Vercel
2. Check backend `CLIENT_URL` in Render matches frontend URL exactly
3. Restart both services:
   - Render: Dashboard → Your Service → "Restart"
   - Vercel: Dashboard → Your Project → "Redeploy"

### Products not showing on public store

1. Login as admin
2. Upload a product
3. **Add an affiliate link** (this is required for public visibility)
4. Go back to public store
5. Product should appear

### "CORS error" or network timeouts

**Solution:**

1. Check backend is running: `curl https://your-api-name.onrender.com/api/auth/me`
2. Verify `CLIENT_URL` in backend `.env` matches frontend URL exactly
3. Check Render logs for connection errors

### Extraction fails or takes too long

1. Check Render logs for Groq API errors
2. Verify `GROQ_API_KEY` is correct in environment variables
3. Check Redis is connected: `REDIS_URL` should be `rediss://...`

---

## Environment Variables Checklist

### Backend (Render)

- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `REDIS_URL` - Upstash Redis URL (must start with `rediss://`)
- [ ] `JWT_SECRET` - Random secure string
- [ ] `CLIENT_URL` - Your Vercel frontend URL (must match exactly)
- [ ] `GROQ_API_KEY` - Groq API key for vision extraction
- [ ] `CLOUDINARY_*` - Image hosting credentials
- [ ] `PINECONE_*` - Vector database credentials

### Frontend (Vercel)

- [ ] `VITE_API_URL` - Your Render backend URL + `/api`

---

## Post-Deployment Tasks

1. **Change Admin Password**
   - Login with default credentials
   - Go to Settings
   - Change password to something secure

2. **Configure OAuth** (if needed)
   - Get Google OAuth credentials
   - Get GitHub OAuth credentials
   - Add to Render environment variables

3. **Setup Telegram Integration** (if needed)
   - Create Telegram bot
   - Get bot token and chat ID
   - Add in admin settings

4. **Monitor Logs**
   - Render: Dashboard → Your Service → "Logs"
   - Vercel: Dashboard → Your Project → "Analytics"

---

## Local Testing Before Deployment

Before deploying to production, test locally:

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Run seed (create admin)
cd backend
node seed.js

# Terminal 3: Frontend
cd frontend
npm install
npm run dev

# Open http://localhost:5173 and test flow
```

---

## Quick Rollback

If something breaks in production:

### Render

1. Go to service settings
2. Click "Redeploy"
3. Select previous deployment

### Vercel

1. Go to project settings
2. Click "Deployments"
3. Select previous deployment → "Promote to Production"

---

## Support & Debugging

### Enable Debug Logging

In backend `.env`:

```
NODE_ENV=production
# Add this for debug logs:
DEBUG=*
```

### View Real-Time Logs

Render:

```bash
# If you have Render CLI
render logs your-service-name --follow
```

Vercel:

```bash
# Go to project → Analytics → Edge Logs
```

### Test API Directly

```bash
# List all products
curl https://your-api-name.onrender.com/api/public/products

# List admin products (need token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-api-name.onrender.com/api/products
```

---

## Success Indicators

After complete deployment, you should see:

- ✅ Admin can login at `/login`
- ✅ Admin dashboard at `/admin` shows products
- ✅ Public store at `/` shows products with affiliate links
- ✅ Clicking product redirects to affiliate URL
- ✅ Backend logs show `[AUTH]` messages
- ✅ Vercel shows successful builds with `VITE_API_URL` set
- ✅ No CORS errors in browser console

---

## Final Checklist

Before going live:

- [ ] Admin user created (`admin@productvision.ai`)
- [ ] Backend running on Render
- [ ] Frontend running on Vercel
- [ ] `CLIENT_URL` in backend matches Vercel URL
- [ ] `VITE_API_URL` in frontend matches Render URL
- [ ] Can login as admin
- [ ] Can upload and extract products
- [ ] Can add affiliate links
- [ ] Products appear on public store
- [ ] Public redirects work
- [ ] No errors in browser console
- [ ] No errors in Render logs

🎉 **You're live!**

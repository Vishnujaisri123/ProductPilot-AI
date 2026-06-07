# ProductVision AI - Complete Setup & Debugging Guide

Welcome to ProductVision AI! This document provides everything you need to get the system running locally, deploy to production, and troubleshoot issues.

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Project Structure](#-project-structure)
3. [Local Development](#-local-development)
4. [Common Issues](#-common-issues)
5. [Deployment](#-deployment)
6. [API Documentation](#-api-documentation)
7. [Debugging Guide](#-debugging-guide)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free tier)
- Git

### One-Minute Setup

```bash
# 1. Clone and navigate
cd amazon_extraction

# 2. Start backend
cd backend
npm install
npm run dev

# 3. In new terminal, start frontend
cd frontend
npm install
npm run dev

# 4. In another terminal, create admin user
cd backend
node seed.js

# 5. Login
# Go to http://localhost:5173/login
# Email: admin@productvision.ai
# Password: AdminPassword123!
```

✅ **You're done!** Now you can:

- Upload product screenshots
- Extract product data
- Add affiliate links
- Publish to public store

---

## 📁 Project Structure

```
amazon_extraction/
├── backend/                 # Node.js + Express server
│   ├── src/
│   │   ├── index.js        # Main server file
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # API controllers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   ├── workers/        # Background jobs
│   │   └── utils/          # Helper functions
│   ├── package.json
│   ├── .env               # Environment variables
│   └── seed.js            # Create admin user
│
├── frontend/              # React + Vite application
│   ├── src/
│   │   ├── main.tsx       # Entry point
│   │   ├── App.tsx        # Root component
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   ├── lib/           # Utilities and API client
│   │   └── hooks/         # Custom React hooks
│   ├── package.json
│   ├── vite.config.ts     # Vite configuration
│   └── .env               # Environment variables
│
├── docker-compose.yml     # Docker configuration
├── QUICK_START.js         # Quick reference guide
├── DEPLOYMENT_GUIDE.md    # Production deployment
├── TROUBLESHOOTING.md     # Common issues and fixes
└── API_DOCUMENTATION.md   # API reference
```

### Key Files

- **backend/seed.js** - Creates admin user (run once after first setup)
- **backend/src/index.js** - Server entry point
- **frontend/src/lib/api.ts** - API client configuration
- **docker-compose.yml** - Local MongoDB and Redis setup

---

## 💻 Local Development

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example if exists)
# Required env variables:
# - MONGODB_URI
# - JWT_SECRET
# - CLIENT_URL=http://localhost:5173

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

### Database Setup

**Option 1: MongoDB Atlas (Recommended)**

1. Go to [mongodb.com](https://mongodb.com)
2. Create free account
3. Create cluster
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/productvision`
5. Add to backend `.env` as `MONGODB_URI`

**Option 2: Local MongoDB with Docker**

```bash
# If you have Docker:
docker-compose up -d
# Starts local MongoDB and Redis
# Then update MONGODB_URI in .env:
# MONGODB_URI=mongodb://mongodb:27017/productvision
```

### Create Admin User

After backend is running:

```bash
cd backend
node seed.js
# Output: ✓ Admin user created successfully
# Email: admin@productvision.ai
# Password: AdminPassword123!
```

---

## ⚙️ Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/productvision

# Authentication
JWT_SECRET=your-random-secret-string-here

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# AI/Vision
GROQ_API_KEY=gsk_xxxxxxxxxxxxx

# Image Storage
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxx

# Vector Database
PINECONE_API_KEY=pcsk_xxxxxxxxxxxxxxx
PINECONE_INDEX=productvision

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-specific-password

# Redis
REDIS_URL=redis://localhost:6379
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔧 Common Issues

### "Login failed" Error

**Problem**: Can't login even with correct credentials

**Solution**:

```bash
# 1. Make sure admin user exists
cd backend && node seed.js

# 2. Check database has user
# MongoDB Atlas → Collections → users → should see admin@productvision.ai

# 3. Check backend logs
# Look for: [AUTH] Login attempt: admin@productvision.ai
```

### Products Not Visible

**Problem**: Upload products but they don't appear anywhere

**Solution**:

1. Check products were created in database
   ```javascript
   // MongoDB Atlas console:
   db.products.find();
   ```
2. For public visibility, add affiliate link
   - Admin dashboard → click product → add affiliate link → save
3. Check public store for products with affiliate links

### Can't Reach Backend

**Problem**: Frontend shows network errors

**Solution**:

```bash
# 1. Check backend is running
curl http://localhost:5000/api/auth/me
# Should return 401 (expected without token)

# 2. Check frontend has correct API URL
# frontend/.env should have:
VITE_API_URL=http://localhost:5000/api

# 3. Restart frontend
# npm run dev
```

### Database Connection Error

**Problem**: "Cannot connect to MongoDB"

**Solution**:

1. Check connection string in `.env`
2. If using Atlas:
   - Verify IP whitelist includes your IP (or use 0.0.0.0/0)
   - Check username/password in connection string
   - Verify @ is encoded as %40 if in password
3. Restart backend after fixing

For more issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 🌍 Deployment

### Deploy to Production (5 minutes)

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete instructions:

1. **Backend on Render**
   - Connect GitHub repo
   - Add environment variables
   - Deploy

2. **Frontend on Vercel**
   - Connect GitHub repo
   - Add `VITE_API_URL` environment variable
   - Deploy

3. **Create Admin User**
   ```bash
   cd backend && node seed.js
   # (Run on Render backend)
   ```

### Environment Variables for Production

**Render Backend:**

- `MONGODB_URI` - Your MongoDB Atlas URI
- `CLIENT_URL` - Your Vercel frontend URL
- `JWT_SECRET` - Random secure string
- `GROQ_API_KEY` - Your Groq API key
- All other API keys as needed

**Vercel Frontend:**

- `VITE_API_URL` - Your Render backend URL + `/api`

---

## 📚 API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

### Quick API Examples

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@productvision.ai",
    "password": "AdminPassword123!"
  }'

# Upload image for extraction
curl -X POST http://localhost:5000/api/extraction/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@product.jpg"

# Get all products
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/products

# Get public products
curl http://localhost:5000/api/public/products
```

---

## 🐛 Debugging Guide

### Enable Debug Logging

**Backend:**

```bash
# Terminal
DEBUG=* npm run dev
```

**Frontend:**

```javascript
// main.tsx
window.DEBUG = true;

// Then in components:
if (window.DEBUG) console.log("...");
```

### Check System Status

```bash
# Is backend running?
curl http://localhost:5000/api/auth/me

# Is database connected?
# Go to MongoDB Atlas dashboard and check collections exist

# Check frontend can reach backend
# Browser DevTools → Network tab → filter /api/

# Check for CORS errors
# Browser DevTools → Console → look for CORS errors
```

### View Logs

```bash
# Backend logs
# Terminal where you ran "npm run dev"

# Frontend logs
# Browser DevTools → Console

# Database logs
# MongoDB Atlas → Metrics → Slow Queries
```

---

## 📝 Workflow Guide

### For Users/Admins

1. **Login**
   - Go to http://localhost:5173/login
   - Enter: admin@productvision.ai / AdminPassword123!

2. **Upload Product**
   - Dashboard → Upload Screenshot
   - Select product image
   - Wait for extraction (5-10 seconds)

3. **Add Affiliate Link**
   - Click product in dashboard
   - Paste affiliate URL (Amazon, Flipkart, etc.)
   - Click Save

4. **Publish Product**
   - Product automatically appears in public store
   - Click product on public store to redirect to affiliate link

### For Developers

1. **Make Changes**
   - Edit files in `backend/src/` or `frontend/src/`
   - Changes hot-reload automatically

2. **Test Changes**
   - Backend: Server reloads automatically
   - Frontend: Browser refreshes automatically
   - Database: Use MongoDB Atlas console to inspect

3. **Commit & Deploy**
   - Git push to main branch
   - Render/Vercel auto-deploys
   - Monitor logs in Render/Vercel dashboards

---

## 🚨 Emergency Troubleshooting

### Nuclear Reset

If everything is broken:

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install && npm run dev

# Frontend (separate terminal)
cd frontend
rm -rf node_modules package-lock.json dist
npm install && npm run dev

# Reset database (optional)
# MongoDB Atlas → Delete all collections

# Recreate admin
cd backend && node seed.js
```

### Quick Health Check

```bash
# All these should return something (not error):
curl http://localhost:5000/api/auth/me
curl http://localhost:5173
curl http://localhost:5000/api/public/products
```

---

## 📞 Support Resources

### Important Files

- [QUICK_START.js](QUICK_START.js) - Quick reference commands
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production deployment
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Issue fixes
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference

### Useful Links

- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- MongoDB Atlas: https://cloud.mongodb.com
- Render: https://render.com
- Vercel: https://vercel.com

### Debug Commands

```bash
# Check Node process
lsof -i :5000      # Backend
lsof -i :5173      # Frontend
lsof -i :6379      # Redis

# Check environment
echo $MONGODB_URI   # Should show your URI
node -v             # Should be 18+

# Test database
mongosh "your-connection-string"

# Test API
curl http://localhost:5000/api/auth/me
```

---

## ✅ Success Checklist

After setup, verify:

- [ ] Backend running without errors
- [ ] Frontend loading at http://localhost:5173
- [ ] Can login as admin
- [ ] Can upload product image
- [ ] Extraction completes
- [ ] Product appears in dashboard
- [ ] Can add affiliate link
- [ ] Product appears on public store
- [ ] Public link works (redirects)
- [ ] No errors in console/logs

✅ **All checked?** → System ready to use!

---

## 🎯 Next Steps

1. **Try the workflow**: Upload a product, add affiliate link, check public store
2. **Create more admins**: Edit backend/seed.js, change email, run again
3. **Configure OAuth**: Add Google/GitHub client IDs to .env
4. **Deploy to production**: Follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
5. **Monitor usage**: Check Render/Vercel dashboards

---

## 📄 License

ProductVision AI - All rights reserved

---

## Last Updated

January 2025

For latest version and documentation, check this repository.

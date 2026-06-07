/**
 * QUICK START GUIDE - Run These Commands
 *
 * STEP 1: Create Admin User (One-time setup)
 * =========================================
 * cd backend
 * node seed.js
 *
 * STEP 2: Start Backend (Development)
 * ==================================
 * cd backend
 * npm install
 * npm run dev
 *
 * STEP 3: Start Frontend (New terminal)
 * ====================================
 * cd frontend
 * npm install
 * npm run dev
 *
 * STEP 4: Login to Admin Dashboard
 * ================================
 * URL: http://localhost:5173/login
 * Email: admin@productvision.ai
 * Password: AdminPassword123!
 *
 * STEP 5: Upload Your First Product
 * ================================
 * 1. Go to Dashboard → Upload Screenshot
 * 2. Upload a product screenshot
 * 3. Wait for extraction to complete
 * 4. Add an Affiliate Link (Amazon, Flipkart, etc.)
 * 5. Product appears on public storefront
 *
 * TROUBLESHOOTING
 * ==============
 *
 * Q: "Login failed" error
 * A: Run "node backend/seed.js" to create admin user
 *
 * Q: Products not showing in admin dashboard
 * A: Make sure you're logged in as admin (check User.role in MongoDB)
 *
 * Q: Public store shows "No products found"
 * A: Products need affiliate links to be public. Add one in product details.
 *
 * Q: MongoDB connection error
 * A: Check MONGODB_URI in backend/.env or ensure local MongoDB is running
 *
 * Q: Frontend can't reach backend
 * A: Check CORS - ensure CLIENT_URL in backend/.env matches frontend URL
 *
 * PRODUCTION DEPLOYMENT
 * ====================
 *
 * Render Backend (.env):
 *   - MONGODB_URI=your_atlas_uri
 *   - CLIENT_URL=https://your-frontend.vercel.app
 *   - JWT_SECRET=random_string
 *   - (other API keys as needed)
 *
 * Vercel Frontend (.env):
 *   - VITE_API_URL=https://your-backend.onrender.com/api
 *
 * Then run: node seed.js on Render to create admin user
 *
 */

console.log(
  __filename.includes("QUICK_START")
    ? "Quick start guide loaded"
    : "Run this file for help",
);

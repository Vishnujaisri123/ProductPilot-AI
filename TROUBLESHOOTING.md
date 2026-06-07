# ProductVision AI - Troubleshooting Guide

## Quick Diagnostics

### Test Backend API Health

```bash
# Check if backend is responding
curl http://localhost:5000/api/auth/me

# Expected: 401 Unauthorized (because no token)
# If error: backend not running or wrong port
```

### Test Database Connection

```bash
# Via MongoDB Atlas
# 1. Go to Atlas dashboard
# 2. Click "Collections"
# 3. If you see collections, database is connected

# Or via terminal:
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/productvision"
```

### Test Frontend API Configuration

In browser console at `http://localhost:5173`:

```javascript
// Check if API URL is configured
fetch("/api/auth/me")
  .then((r) => r.json())
  .then(console.log);
// Should show 401 or error (not 404)
```

---

## Common Issues & Fixes

### Issue 1: "Login failed" Error

#### Symptoms

- Can't login even with correct credentials
- Registration works but login fails

#### Diagnosis

**Check 1: Is admin user created?**

```bash
# Run seed script
cd backend && node seed.js
# Should output: "✓ Admin user created"
```

**Check 2: Database has user?**

```javascript
// In MongoDB Atlas console:
db.users.findOne({ email: "admin@productvision.ai" });
// Should return user object
```

**Check 3: Backend logs show what's happening?**

```bash
# Look for [AUTH] messages:
# [AUTH] Login attempt: admin@productvision.ai
# [AUTH] User found, checking password...
# [AUTH] Password match: true
```

#### Fixes

**If: "User not found"**

```bash
cd backend && node seed.js  # Create admin user
```

**If: "Password mismatch"**

```bash
# Wrong password - try: AdminPassword123!
# Or reset via MongoDB:
db.users.updateOne(
  {email: "admin@productvision.ai"},
  {$set: {password: "new-password"}}  # Note: needs hashing
)
```

**If: User exists but still fails**

```bash
# Check if user is OAuth-only (no password field)
db.users.findOne({email: "admin@productvision.ai"})
# If no "password" field, user is OAuth account - can't login with email/password
```

---

### Issue 2: Products Not Visible Anywhere

#### Symptoms

- Admin uploads products but they don't appear in dashboard
- Public store shows "No products found"
- Products exist in MongoDB but not visible in UI

#### Diagnosis

**Check 1: Products exist in database?**

```javascript
// MongoDB Atlas:
db.products.find();
// Should return products if any uploaded
db.products.countDocuments(); // How many products?
```

**Check 2: Products have required fields?**

```javascript
// Check a product:
db.products.findOne();
// Should have: userId, extractionId
// For public: affiliateLink must be non-empty string
```

**Check 3: Admin dashboard API responding?**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/products
# Should return array of products
```

#### Fixes

**If: No products in database**

- Upload one first! Go to Dashboard → Upload
- Wait for extraction to complete (5-10 seconds)
- Check extraction logs in Render/terminal

**If: Products exist but dashboard shows nothing**

1. Check admin is logged in: `auth/me` should return user
2. Check token is valid: copy from localStorage (DevTools → Application)
3. Check API call: Open DevTools → Network → filter `/api/products`
4. See response: should be `[{_id, userId, ...}]`

**If: Products not public (public store empty)**

- Products need `affiliateLink` field to be public
- Go to admin dashboard → click product → add affiliate link
- Save and check public store again

---

### Issue 3: Extraction Fails or Hangs

#### Symptoms

- Upload screenshot but extraction never completes
- Spinner keeps spinning
- No error message shown

#### Diagnosis

**Check 1: Background job queue working?**

```javascript
// In Redis, check if jobs exist:
// Use Redis console or Upstash dashboard
// Look for keys with `bull:` prefix
```

**Check 2: Groq API working?**

```bash
# Test Groq API directly:
curl -H "Authorization: Bearer $GROQ_API_KEY" \
  https://api.groq.com/api/v1/models
# Should return list of models
```

**Check 3: Backend logs for extraction worker errors**

```bash
# Look for:
# [EXTRACTION] Job started: xxx
# [EXTRACTION] Error: ...
```

#### Fixes

**If: BullMQ queue stuck**

```bash
# Restart Redis connection
# Render: Redeploy backend service
# Local: Restart backend with `npm run dev`
```

**If: Groq API errors**

- Check `GROQ_API_KEY` is correct in `.env`
- Check API key has quota remaining
- Check rate limits not exceeded

**If: No logs at all**

- Extraction worker might not be starting
- Check `backend/src/workers/extractionWorker.js` is loaded
- Check `NODE_ENV` is not blocking worker startup

---

### Issue 4: Frontend Can't Reach Backend

#### Symptoms

- "Network error" when uploading
- API calls return 404
- CORS error in console
- Products API returns "Cannot GET"

#### Diagnosis

**Check 1: Backend is running?**

```bash
curl http://localhost:5000/api/auth/me
# Should get response (401 or 200)
# If: "Connection refused" - backend not running
```

**Check 2: Frontend API URL configured?**

```javascript
// In browser console:
console.log(import.meta.env.VITE_API_URL);
// Should show: http://localhost:5000/api
// If undefined: .env not loaded
```

**Check 3: CORS configured?**

```javascript
// Browser console → Network tab
// Look at response headers:
// Access-Control-Allow-Origin: should match your frontend URL
```

#### Fixes

**If: Backend not running**

```bash
cd backend && npm run dev
# Check: "Server running on port 5000"
```

**If: API URL wrong in frontend**

```bash
# Create .env file:
cd frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env
# Restart: npm run dev
```

**If: CORS error**

1. Check backend `.env` has `CLIENT_URL=http://localhost:5173`
2. Restart backend: `npm run dev`
3. Check CORS middleware is enabled in `index.js`

---

### Issue 5: Database Connection Failed

#### Symptoms

- "Cannot connect to MongoDB"
- "ECONNREFUSED" in logs
- Products not saving

#### Diagnosis

**Check 1: Connection string valid?**

```bash
# Copy from MongoDB Atlas:
# Cluster → Connect → Connection String
# Format: mongodb+srv://user:pass@host/db?options
```

**Check 2: Username/password correct?**

```bash
# In MongoDB Atlas:
# Database Access → Users → check credentials
# Make sure @ is encoded as %40 if in password
```

**Check 3: IP allowed?**

```bash
# In MongoDB Atlas:
# Network Access → IP Whitelist
# Make sure your IP is added (or 0.0.0.0/0 for development)
```

#### Fixes

**If: Wrong connection string**

```bash
# Update .env:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
npm run dev  # Restart
```

**If: Authentication fails**

```bash
# In MongoDB Atlas:
# 1. Go to Database Access
# 2. Edit user
# 3. Regenerate password
# 4. Update .env
```

**If: IP not whitelisted**

```bash
# In MongoDB Atlas:
# 1. Go to Network Access
# 2. Click "Add IP Address"
# 3. Enter your IP or 0.0.0.0/0
# 4. Click "Confirm"
```

---

### Issue 6: "Role is not admin" After Login

#### Symptoms

- Login works but get "Admin only" error
- User created but doesn't have admin role

#### Diagnosis

**Check 1: User role in database**

```javascript
// MongoDB Atlas:
db.users.findOne({ email: "your-email@example.com" });
// Check "role" field: should be "admin"
```

**Check 2: New registrations getting wrong role?**

```javascript
// All new users should have role: "user"
// Only seed admin should have "admin"
```

#### Fixes

**If: User not admin**

```javascript
// Update in MongoDB:
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } },
);
```

**If: Want to create another admin**

```bash
# Edit backend/seed.js, line XX:
# Change email from admin@productvision.ai to your email
# Run: node seed.js
```

---

### Issue 7: Affiliate Links Not Working

#### Symptoms

- Click product link on public store
- Redirected somewhere wrong
- Link doesn't go to Amazon/Flipkart

#### Diagnosis

**Check 1: Product has affiliate link?**

```javascript
// MongoDB:
db.products.findOne({ _id: ObjectId("...") });
// Check "affiliateLink" field - should have URL
```

**Check 2: Frontend button configuration**

```bash
# Check ProductDetailsPage.tsx
# Button should have onClick={() => window.open(affiliateLink)}
```

#### Fixes

**If: Affiliate link empty in product**

1. Admin dashboard → click product
2. Scroll to "Affiliate Link" field
3. Paste full URL: `https://amazon.in/dp/XXXXX`
4. Click Save

**If: Product doesn't have affiliate link field in form**

- Check ProductDetailsPage component exists
- Should have input field for affiliate link
- May need to add if missing

---

### Issue 8: Changes Not Reflecting After Restart

#### Symptoms

- Updated code but changes not showing
- .env changes not working
- Deleted data still showing

#### Diagnosis

**Check 1: Code rebuilt?**

```bash
# Frontend:
# Check console - should show "Vite x.x.x ready in xxx ms"
# Not old build output

# Backend:
# Should show "Server running on port 5000" after restart
```

**Check 2: Cache cleared?**

```bash
# Browser:
# Ctrl+Shift+Delete → Clear cached images/files
# Or: DevTools → Network → Disable cache
```

**Check 3: Node process killed?**

```bash
# Check no old process running:
lsof -i :5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows
# Kill old process if exists
```

#### Fixes

**If: Frontend not reloading**

```bash
cd frontend
rm -rf node_modules dist
npm install
npm run dev  # Hard refresh browser (Ctrl+Shift+R)
```

**If: Backend not reloading**

```bash
cd backend
# Kill process: Ctrl+C
# Check: lsof -i :5000 | grep node (should be empty)
npm run dev  # Restart
```

---

### Issue 9: Strange TypeScript Errors

#### Symptoms

- "Property 'X' does not exist on type 'Y'"
- Autocomplete not working
- Build succeeds but editor shows errors

#### Diagnosis

**Check 1: TypeScript version?**

```bash
npx tsc --version
# Should be >= 5.0
```

**Check 2: tsconfig correct?**

```bash
# Check: tsconfig.json exists and valid
# Try: npm run build (should show actual errors)
```

#### Fixes

**If: Editor out of sync**

```bash
# VS Code:
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

**If: Type errors**

```bash
# Check if type definitions installed:
npm install -D @types/react @types/node
```

---

## Emergency Fixes

### Reset Everything (Nuclear Option)

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev

# Frontend (separate terminal)
cd frontend
rm -rf node_modules package-lock.json .next dist
npm install
npm run dev

# Reset database
# Go to MongoDB Atlas → Delete all documents in collections
# Or: db.dropDatabase()

# Recreate admin
cd backend && node seed.js
```

### Force Deploy on Render

```bash
# Render Dashboard → Your Service → Manual Deploy → Select Branch
# Or restart: → Restart Service
```

### Check All Services Running

```bash
# Backend health:
curl http://localhost:5000/api/health

# Database:
mongosh connection_string

# Redis:
redis-cli ping  # Should return PONG

# Check ports:
lsof -i :5000   # Backend
lsof -i :5173   # Frontend
lsof -i :6379   # Redis (local)
```

---

## Debug Mode

### Enable Verbose Logging

**Backend:**

```bash
# In .env:
DEBUG=*
LOG_LEVEL=debug

# Or run with:
DEBUG=* npm run dev
```

**Frontend:**

```javascript
// In main.tsx:
if (import.meta.env.DEV) {
  window.DEBUG = true;
}

// Then in code:
if (window.DEBUG) console.log("...");
```

### Monitor in Real-Time

```bash
# Backend logs:
tail -f backend/logs/*.log

# Database queries:
# MongoDB Atlas → Metrics → Slow Queries

# Frontend errors:
# DevTools → Console → filter type:error
```

---

## Getting Help

If none of this works:

1. **Check logs first:**
   - Terminal output: full error message
   - Browser console: DevTools → Console
   - MongoDB Atlas: Atlas UI → error details
   - Render logs: Dashboard → Logs

2. **Collect information:**
   - OS: Windows/Mac/Linux
   - Error message: copy exact text
   - What you were doing: step-by-step
   - What happened: expected vs actual

3. **Share logs:**
   - Screenshot of error
   - Terminal output (full command + output)
   - Browser console errors
   - Render service logs (last 50 lines)

4. **Try isolation:**
   - Test backend API with curl
   - Test frontend without backend
   - Test database separately
   - Test each service independently

---

## Success Checklist After Fixes

- [ ] Backend running without errors
- [ ] Can login as admin
- [ ] Can upload product screenshot
- [ ] Extraction completes (5-10 seconds)
- [ ] Product appears in admin dashboard
- [ ] Can add affiliate link to product
- [ ] Product appears on public store
- [ ] Public link works (redirects to affiliate)
- [ ] No errors in browser console
- [ ] No errors in terminal/Render logs

✅ If all checked → System working correctly!

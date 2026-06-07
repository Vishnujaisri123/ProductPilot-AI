# ProductVision AI - API Documentation

Base URL: `http://localhost:5000/api` (local) or `https://your-backend.onrender.com/api` (production)

---

## Authentication Endpoints

### POST `/auth/register`

Register a new user account.

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "plan": "free",
    "credits": 0
  }
}
```

**Errors:**

- `400`: Email already exists
- `400`: Password too weak

---

### POST `/auth/login`

Login with email and password.

**Request:**

```json
{
  "email": "admin@productvision.ai",
  "password": "AdminPassword123!"
}
```

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin",
    "email": "admin@productvision.ai",
    "role": "admin",
    "plan": "enterprise",
    "credits": 1000
  }
}
```

**Errors:**

- `401`: Invalid credentials
- `401`: Account uses social login

---

### POST `/auth/google`

Login/register with Google OAuth.

**Request:**

```json
{
  "token": "google_id_token_here"
}
```

**Response:** Same as login

---

### POST `/auth/github`

Login/register with GitHub OAuth.

**Request:**

```json
{
  "code": "github_authorization_code"
}
```

**Response:** Same as login

---

### GET `/auth/me`

Get current authenticated user details.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Admin",
  "email": "admin@productvision.ai",
  "role": "admin",
  "plan": "enterprise",
  "credits": 1000,
  "telegramEnabled": false
}
```

**Errors:**

- `401`: No token provided
- `401`: Invalid token
- `403`: Token expired

---

## Product Endpoints

### GET `/products`

Get all products for authenticated admin.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `skip` (optional): Number of products to skip (default: 0)
- `limit` (optional): Number of products to return (default: 10)

**Response (200):**

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "extractionId": "507f1f77bcf86cd799439013",
    "name": "iPhone 15 Pro",
    "description": "Latest Apple iPhone",
    "price": "999",
    "currency": "USD",
    "affiliateLink": "https://amazon.com/dp/B123456",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

**Errors:**

- `401`: Not authenticated
- `403`: Insufficient permissions

---

### GET `/products/:id`

Get a specific product by ID.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):** Single product object

**Errors:**

- `401`: Not authenticated
- `404`: Product not found

---

### PUT `/products/:id`

Update a product (admin only).

**Headers:**

```
Authorization: Bearer <token>
```

**Request:**

```json
{
  "affiliateLink": "https://amazon.in/dp/XXXXX",
  "name": "Updated Product Name"
}
```

**Response (200):** Updated product object

**Errors:**

- `401`: Not authenticated
- `403`: Not admin
- `404`: Product not found

---

### DELETE `/products/:id`

Delete a product (admin only).

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{ "message": "Product deleted" }
```

**Errors:**

- `401`: Not authenticated
- `403`: Not admin
- `404`: Product not found

---

## Public Endpoints (No Auth Required)

### GET `/public/products`

Get all public products (with affiliate links).

**Query Parameters:**

- `skip` (optional): Default 0
- `limit` (optional): Default 20
- `search` (optional): Search by name

**Response (200):**

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Pro",
    "price": "999",
    "currency": "USD",
    "affiliateLink": "https://amazon.com/dp/B123456",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### GET `/public/products/:id`

Get a specific public product.

**Response (200):** Public product object

**Errors:**

- `404`: Product not found or no affiliate link

---

## Extraction Endpoints

### POST `/extraction/upload`

Upload an image for product extraction.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**

```
file: <image_file>
```

**Response (200):**

```json
{
  "extractionId": "507f1f77bcf86cd799439014",
  "status": "processing",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Errors:**

- `401`: Not authenticated
- `400`: No file provided
- `413`: File too large

---

### GET `/extraction/:id`

Get extraction status and results.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "_id": "507f1f77bcf86cd799439014",
  "status": "completed",
  "productData": {
    "name": "iPhone 15 Pro",
    "price": "999",
    "currency": "USD",
    "description": "Latest Apple smartphone"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:35:00Z"
}
```

**Status values:**

- `processing`: Extraction in progress
- `completed`: Extraction finished
- `failed`: Extraction failed

**Errors:**

- `401`: Not authenticated
- `404`: Extraction not found

---

### GET `/extraction`

Get all extractions for current user.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `skip` (optional): Default 0
- `limit` (optional): Default 10

**Response (200):** Array of extractions

---

## History Endpoints

### GET `/history`

Get upload history.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "total": 42,
  "uploads": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fileName": "product.jpg",
      "uploadedAt": "2024-01-15T10:30:00Z",
      "status": "completed"
    }
  ]
}
```

---

## Analytics Endpoints

### GET `/analytics/dashboard`

Get dashboard analytics (admin only).

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "totalUsers": 156,
  "totalExtractions": 892,
  "totalProducts": 234,
  "thisMonthExtractions": 123,
  "activeUsers": 45,
  "revenueThisMonth": 5432.5
}
```

**Errors:**

- `401`: Not authenticated
- `403`: Not admin

---

### GET `/analytics/usage`

Get user's usage stats.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "monthlyLimit": 100,
  "usedThisMonth": 42,
  "remainingCredits": 58,
  "resetDate": "2024-02-15T00:00:00Z"
}
```

---

## Knowledge Base Endpoints

### GET `/knowledge-base`

Get knowledge base articles (admin only).

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "How to Extract Product Data",
    "content": "Step 1: Upload image...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### POST `/knowledge-base`

Create knowledge base article (admin only).

**Headers:**

```
Authorization: Bearer <token>
```

**Request:**

```json
{
  "title": "Article Title",
  "content": "Article content here"
}
```

**Response (201):** Created article object

---

## Billing Endpoints

### GET `/billing/usage`

Get billing usage stats.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "plan": "pro",
  "monthlyBill": 9.99,
  "nextBillingDate": "2024-02-15T00:00:00Z",
  "extractionsUsed": 42,
  "extractionsIncluded": 100
}
```

---

### POST `/billing/upgrade`

Upgrade subscription plan.

**Headers:**

```
Authorization: Bearer <token>
```

**Request:**

```json
{
  "plan": "enterprise"
}
```

**Response (200):**

```json
{
  "message": "Plan upgraded successfully",
  "plan": "enterprise",
  "nextBillingDate": "2024-02-15T00:00:00Z"
}
```

---

## Telegram Endpoints

### POST `/telegram/connect`

Generate Telegram connection code.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "code": "ABC123XYZ",
  "expiresIn": 3600
}
```

---

### POST `/telegram/verify`

Verify Telegram connection.

**Headers:**

```
Authorization: Bearer <token>
```

**Request:**

```json
{
  "chatId": "123456789",
  "code": "ABC123XYZ"
}
```

**Response (200):**

```json
{
  "message": "Telegram connected successfully",
  "enabled": true
}
```

---

## Admin Endpoints

### GET `/admin/users`

List all users (admin only).

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "plan": "free",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### PUT `/admin/users/:id`

Update user role/plan (admin only).

**Headers:**

```
Authorization: Bearer <token>
```

**Request:**

```json
{
  "role": "admin",
  "plan": "enterprise"
}
```

**Response (200):** Updated user object

---

### GET `/admin/stats`

Get system statistics (admin only).

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "totalUsers": 156,
  "premiumUsers": 23,
  "totalExtractions": 892,
  "totalRevenue": 4532.5,
  "apiRequestsToday": 1234,
  "errorRate": 0.02,
  "avgResponseTime": 245
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Rate Limiting

API requests are rate-limited per user:

- **Free plan**: 10 requests/minute
- **Pro plan**: 100 requests/minute
- **Enterprise plan**: Unlimited

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642348800
```

---

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are valid for 30 days. After expiration, you must login again.

---

## Example Workflow

```bash
# 1. Register/Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@productvision.ai",
    "password": "AdminPassword123!"
  }'
# Response includes token

# 2. Upload image for extraction
curl -X POST http://localhost:5000/api/extraction/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@product.jpg"
# Response includes extractionId

# 3. Check extraction status
curl -X GET http://localhost:5000/api/extraction/<extractionId> \
  -H "Authorization: Bearer <token>"
# Wait until status = "completed"

# 4. Update product with affiliate link
curl -X PUT http://localhost:5000/api/products/<productId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "affiliateLink": "https://amazon.in/dp/XXXXX"
  }'

# 5. Product now appears on public store
curl http://localhost:5000/api/public/products

# 6. Get public product
curl http://localhost:5000/api/public/products/<productId>
```

---

## Testing Endpoints

### Test Backend Health

```bash
curl http://localhost:5000/api/auth/me
# Should return 401 (expected - no token)
```

### Test Database

```bash
curl http://localhost:5000/api/public/products
# Should return [] or array of products
```

### Test Authentication

```bash
# Replace with actual token from login response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/me
# Should return user object
```

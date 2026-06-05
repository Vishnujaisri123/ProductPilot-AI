# ProductVision AI

AI-powered product extraction SaaS platform. Transforms e-commerce product screenshots into structured JSON using OpenAI Vision, OCR, and RAG validation with automatic Telegram delivery.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Cache/Queue**: Redis + BullMQ
- **AI**: OpenAI GPT-4o Vision + Tesseract.js OCR
- **RAG**: Pinecone vector database
- **Storage**: Cloudinary
- **Auth**: JWT + Google OAuth + GitHub OAuth
- **Payments**: Stripe
- **Notifications**: Telegram Bot API

## Quick Start

### 1. Clone and configure

```bash
# Copy env file
cp backend/.env.example backend/.env
# Fill in your API keys in backend/.env
```

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Start development

```bash
# Terminal 1 – Backend
cd backend && npm run dev

# Terminal 2 – Frontend
cd frontend && npm run dev
```

### 4. Docker (production)

```bash
docker-compose up -d
```

## Required API Keys

| Service | Purpose | Get at |
|---------|---------|--------|
| OpenAI | GPT-4o Vision + Embeddings | platform.openai.com |
| Cloudinary | Image storage | cloudinary.com |
| Pinecone | Vector database for RAG | pinecone.io |
| Google OAuth | Social login | console.cloud.google.com |
| GitHub OAuth | Social login | github.com/settings/developers |
| Stripe | Payments | stripe.com |

## Pinecone Setup

Create an index named `productvision` with dimension `1536` (text-embedding-3-small).

## Stripe Setup

Create three products in Stripe dashboard:
- Starter: ₹999/month → add price ID to `STRIPE_STARTER_PRICE_ID`
- Pro: ₹2,999/month → add price ID to `STRIPE_PRO_PRICE_ID`
- Enterprise: Custom → add price ID to `STRIPE_ENTERPRISE_PRICE_ID`

## AI Pipeline

```
Image Upload → OCR (Tesseract.js) → GPT-4o Vision → RAG Context Retrieval
→ Field Validation → Confidence Scoring → JSON Generation
→ MongoDB Storage → Telegram Delivery
```

## API Usage

```bash
# Extract product (API key auth)
curl -X POST https://your-domain.com/api/extract/api/extract \
  -H "x-api-key: your_api_key" \
  -F "image=@screenshot.png"
```

## Project Structure

```
amazon_extraction/
├── backend/
│   └── src/
│       ├── config/        # DB, Redis, Cloudinary, Passport
│       ├── controllers/   # Auth, Extraction, Telegram, Analytics, etc.
│       ├── middleware/    # Auth, Rate limiting, Upload, Error handler
│       ├── models/        # User, Extraction, KnowledgeBase
│       ├── routes/        # All API routes
│       ├── services/      # AI extraction, RAG, Telegram
│       └── workers/       # BullMQ extraction worker
├── frontend/
│   └── src/
│       ├── lib/           # API client, utilities
│       ├── pages/         # Landing, Auth, Dashboard pages
│       ├── store/         # Zustand auth store
│       └── components/    # Reusable UI components
└── docker-compose.yml
```

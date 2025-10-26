# SMS Trading - Enterprise SMS Platform

<div align="center">

![Version](https://img.shields.io/badge/Version-0.1.0-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black?style=flat-square&logo=nextjs)
![Supabase](https://img.shields.io/badge/Supabase-Auth%2BRLS-green?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

**Production-ready enterprise SMS platform built with Next.js 16 and modern web technologies**

[Features](#-features) • [Tech Stack](#-tech-stack) • [API Docs](#-api-documentation) • [Deployment](#-deployment) • [Security](#-security)

</div>

---

## Overview

SMS Trading is a battle-tested, enterprise-grade SMS messaging platform designed for businesses across Africa. Built with Next.js 16, TypeScript, Supabase Auth, and a comprehensive RESTful API, it delivers reliable SMS communication at scale.

### Why SMS Trading?

- **Sub-100ms Response Times** - Optimized edge performance
- **Enterprise Security** - JWT auth, RLS policies, rate limiting  
- **Real-time Analytics** - Campaign tracking & delivery reports
- **Multi-Provider** - Failover support for reliability
- **Data Integrity** - Idempotency keys & audit logging
- **Production Ready** - Health checks, structured logging, Sentry integration

---

## Features

### SMS Capabilities
- Bulk SMS sending with real-time delivery tracking
- Campaign management with scheduling and time windows
- Contact management with CSV import/export
- Phone number normalization (international formats)
- Message templates with variable substitution
- Suppression list for STOP compliance
- Test send to self feature

### Enterprise Features  
- **RESTful API** with OpenAPI specification
- **Authentication** - Email/password via Supabase Auth
- **Authorization** - Role-based access + row-level security
- **API Key Management** - Create, rotate, and manage API keys
- **Audit Logging** - Complete change tracking with correlation IDs
- **Cost Accounting** - Per-campaign cost tracking
- **Rate Limiting** - 100 req/min per API key
- **Health Checks** - /health and /ready endpoints

### Compliance & Security
- GDPR/POPIA consent tracking
- 2FA for admin accounts
- Structured logging with request IDs
- Sentry error tracking
- HTTP security headers (HSTS, CSP, X-Frame-Options)
- TLS 1.3 for all connections

---

## Tech Stack

### Frontend Layer
```typescript
// Modern React 19 with TypeScript
- Next.js 16        // App Router, SSR, API Routes
- React 19          // Latest concurrent features
- TypeScript 5      // Full type safety
- Tailwind CSS 4    // Utility-first styling
- Lucide React      // Professional icons (no emoji)
- Framer Motion     // Smooth animations
```

### Backend & API Layer
```typescript
// Next.js API Routes as serverless backend
- Node.js Runtime
- TypeScript strict mode
- Zod schemas for validation
- Structured logging with correlation IDs
- Request/response middleware
```

### Database & Auth Layer
```sql
-- Supabase (PostgreSQL)
- Supabase Auth        // Email/password authentication
- Row Level Security   // Database-level access control
- PostgreSQL           // Proven relational DB
- Indexes              // Optimized query performance
- Audit Triggers       // Automatic change tracking
```

---

## Architecture

### Request Flow
```
┌─ Browser/Mobile Client
│
├─ HTTP/HTTPS
│
├─ Next.js Middleware (Auth, Rate Limiting)
│
├─ API Route Handler (/api/v1/*)
│   └─ getClientContext() → Extract JWT or API key
│       ├─ Validate token/key
│       └─ Get user/client info
│
├─ Business Logic
│   ├─ Validate request (Zod schema)
│   ├─ Check permissions (RLS policies)
│   ├─ Process data
│   └─ Log changes (audit trail)
│
├─ Supabase PostgreSQL
│   ├─ Execute query with RLS context
│   └─ Return data rows
│
└─ JSON Response
    ├─ Correlation ID for tracing
    ├─ Metadata (pagination, timing)
    └─ Data payload
```

### Database Design
```sql
-- Core tables with RLS enabled

clients
├─ id (UUID)
├─ supabase_user_id (FK to auth.users)
├─ email, company_name
├─ used, allowance (quota tracking)
└─ is_admin (role flag)

campaigns
├─ id, client_id (FK)
├─ name, message, status
├─ scheduled_for (timestamp)
└─ created_by (FK to auth.users)

campaign_messages
├─ id, campaign_id (FK)
├─ to_number, status
├─ provider_message_id
└─ delivery_timestamp

contacts
├─ id, client_id (FK)
├─ phone, email, firstname, lastname
├─ tags (ARRAY)
└─ metadata (JSONB)

api_keys
├─ id, client_id (FK)
├─ key_hash (hashed + salted)
├─ name, last_used_at
└─ scopes (ARRAY)

audit_logs
├─ id, client_id (FK)
├─ action, entity_type, entity_id
├─ changes (JSONB with old/new values)
└─ ip_address, user_agent
```

---

## API Documentation

### Base URL
```
Development: http://localhost:3000/api/v1
Production:  https://api.smstrading.example.com/api/v1
```

### Authentication Methods

**1. JWT Bearer Token (Session-based)**
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**2. API Key (Server-to-server)**
```bash
X-API-Key: sk_live_abc123xyz789...
```

### RESTful Endpoints

#### Authentication
```bash
# Sign up
POST /auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# Sign in
POST /auth/signin
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# Sign out
GET /auth/signout
```

#### Campaigns
```bash
# List campaigns with pagination
GET /campaigns?limit=20&offset=0
Authorization: Bearer {token}

# Create campaign
POST /campaigns
{
  "name": "Q4 Campaign",
  "message": "50% off - Limited time",
  "recipients": ["+27721234567"],
  "scheduleAt": "2025-11-15T10:00:00Z"
}
Idempotency-Key: unique-key-123

# Get campaign details
GET /campaigns/{id}

# Update campaign
PATCH /campaigns/{id}
{
  "status": "active",
  "name": "Updated Q4 Campaign"
}

# Send test
POST /campaigns/{id}/test
{
  "phone": "+27721234567"
}

# Schedule campaign
POST /campaigns/schedule
{
  "campaignId": "camp_abc123",
  "scheduledFor": "2025-11-15T10:00:00Z"
}
```

#### Contacts
```bash
# List contacts
GET /contacts?limit=20&offset=0

# Create contact
POST /contacts
{
  "phone": "+27721234567",
  "firstname": "John",
  "lastname": "Doe",
  "tags": ["vip", "premium"]
}

# Bulk import (CSV)
POST /contacts/upload
Content-Type: multipart/form-data
file: contacts.csv

# Export contacts
GET /contacts/export?format=csv&tag=vip

# Bulk actions
PATCH /contacts
{
  "ids": ["contact_1", "contact_2"],
  "action": "add_tag",
  "tag": "engaged"
}
```

#### SMS
```bash
# Send single SMS
POST /sms
{
  "to": "+27721234567",
  "message": "Your message here"
}

# Batch send
POST /sms/batch-upload
file: recipients.csv

# Test send
POST /sms/test
{
  "message": "Test message"
}
```

#### Admin
```bash
# Audit logs
GET /admin/audit-logs?limit=100

# Client management
GET /admin/clients
PATCH /admin/clients/{id}

# Billing
GET /admin/invoices
```

#### Infrastructure
```bash
# Health check
GET /health
→ 200 { "status": "healthy" }

# Readiness probe
GET /ready
→ 200 { "status": "ready", "checks": {...} }

# OpenAPI spec
GET /openapi
→ OpenAPI 3.0 JSON schema
```

### Response Format
```json
{
  "success": true,
  "data": {
    "items": [],
    "meta": {
      "limit": 20,
      "offset": 0,
      "total": 150
    }
  },
  "correlationId": "req_abc123xyz",
  "timestamp": "2025-10-26T10:30:00Z"
}
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn
- Supabase account (free tier available)

### Installation

```bash
# Clone and navigate
git clone https://github.com/yourorg/sms-trading.git
cd sms-trading

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_here
SUPABASE_SERVICE_KEY=service_key_here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
PREVIEW_MODE=false

# SMS Providers
BULKSMS_USERNAME=your_username
BULKSMS_PASSWORD=your_password
AFRICASTALKING_API_KEY=your_api_key

# Optional
SENTRY_DSN=https://your-sentry-dsn
```

### Development

```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type check
npx tsc --noEmit
```

---

## Database Migration

Run this in Supabase SQL Editor:

```sql
-- Add supabase_user_id to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS supabase_user_id UUID UNIQUE 
REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_supabase_user_id 
ON clients(supabase_user_id);

CREATE INDEX IF NOT EXISTS idx_clients_is_admin 
ON clients(is_admin) WHERE is_admin = true;

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users see own data"
  ON clients FOR SELECT
  USING (auth.uid() = supabase_user_id OR is_admin);
```

---

## Deployment

### Vercel (Recommended)

```bash
# Link to Vercel
vercel link

# Deploy to production
vercel deploy --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
# ... add all other variables
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci --only=production && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### AWS/GCP/Azure

- Deploy Next.js to serverless (Lambda, Cloud Functions, Azure Functions)
- Use environment variables for secrets
- Enable auto-scaling based on traffic
- Configure monitoring and alerts

---

## Security Best Practices

1. **Never commit secrets** - Use .env.local (added to .gitignore)
2. **HTTPS only** - All traffic must be encrypted (TLS 1.3)
3. **Rate limiting** - 100 requests/min per API key
4. **Input validation** - All inputs validated with Zod schemas
5. **SQL injection protection** - Use parameterized queries via Supabase
6. **CORS policy** - Restrict to authorized origins
7. **Security headers** - HSTS, CSP, X-Frame-Options configured
8. **Audit logging** - All changes tracked with user context

---

## Performance Optimization

### Response Times (Target)
- GET /campaigns: < 100ms
- POST /campaigns: < 200ms
- POST /sms: < 500ms

### Database Optimization
- Connection pooling via Supabase
- Composite indexes on frequently queried columns
- Query result caching (5-minute TTL)
- Pagination for large datasets

### Frontend Optimization
- Next.js automatic code splitting
- Image optimization with next/image
- Font optimization with next/font
- CSS purging with Tailwind

---

## Monitoring & Observability

### Health Endpoints
```bash
curl http://localhost:3000/api/health
# → { "status": "healthy", "timestamp": "..." }

curl http://localhost:3000/api/ready
# → { "status": "ready", "checks": { "db": "ok", ... } }
```

### Structured Logging
```typescript
// All logs include correlation ID
logger.info('Campaign created', {
  campaignId: 'camp_123',
  clientId: 'client_456',
  correlationId: 'req_xyz',
  duration: 125  // ms
});
```

### Error Tracking
- Sentry integration for exception monitoring
- Automatic error grouping and alerting
- Source maps for stack traces
- Session replay for debugging

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing`)
5. Open Pull Request

### Code Standards
- ESLint configuration must pass
- TypeScript strict mode required
- Minimum 80% test coverage
- All PRs require review

---

## License

Commercial License. See LICENSE file.



<div align="center">

**Built with care for businesses across Africa**

[Star us](https://github.com/yourorg/sms-trading) • [Follow](https://twitter.com) • [Blog](https://blog.smstrading.example.com)

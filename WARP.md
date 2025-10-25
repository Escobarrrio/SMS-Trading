# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**SMS Trading** is a Next.js-based SMS platform that enables customers to send bulk SMS messages with real-time tracking and usage monitoring. It's a multi-tenant SaaS platform with customer dashboards and admin management capabilities.

## Project Structure

```
sms-trading/
├── app/
│   ├── api/
│   │   ├── send-sms/route.ts          # Send SMS endpoint
│   │   ├── check-balance/route.ts     # Check remaining quota
│   │   └── webhook/route.ts           # Payment webhooks (future)
│   ├── dashboard/                     # Customer dashboard
│   ├── admin/                         # Admin panel (future)
│   ├── sign-in/                       # Clerk auth pages
│   ├── sign-up/
│   └── page.tsx                       # Landing page
├── components/
│   ├── SMSForm.tsx                    # Send SMS form
│   ├── UsageChart.tsx                 # Usage stats (future)
│   └── ClientList.tsx                 # Admin client list (future)
├── lib/
│   ├── supabase.ts                    # Supabase client
│   ├── bulksms.ts                     # BulkSMS API wrapper
│   ├── africastalking.ts              # Africa's Talking API wrapper
│   └── schemas.ts                     # Zod validation schemas
├── .env.example                       # Environment variables template
├── package.json
└── README.md
```

## Key Components

- **SMS Service**: Integrations with BulkSMS or Africa's Talking (lib/bulksms.ts, lib/africastalking.ts)
- **Customer Dashboard**: SMS sending interface with quota tracking (app/dashboard/)
- **API Layer**: Next.js API routes for sending SMS and checking balance
- **Authentication**: Clerk for user auth with multi-tenant support
- **Data Persistence**: Supabase PostgreSQL database for clients, transactions, and usage

## Technology Stack

- **Frontend/Backend**: Next.js 15 + TypeScript
- **UI**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk (free tier)
- **SMS Providers**: BulkSMS (~R0.68/SMS) or Africa's Talking (~R0.65/SMS)
- **Hosting**: Vercel (free tier handles 100+ clients)
- **Validation**: Zod
- **HTTP Client**: Axios

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npx prettier --write .
```

## Database Schema (Supabase)

```sql
-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'business', 'pro')),
  allowance INT NOT NULL DEFAULT 1000,
  used INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- SMS transactions table
CREATE TABLE sms_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  to_number TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  cost DECIMAL(5,2) DEFAULT 0.68,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_client_id ON sms_transactions(client_id);
```

## Implementation Notes

- SMS sending is rate-limited per client based on plan allowance
- All transactions logged for audit and billing purposes
- Store credentials in .env - never commit to git
- Client quotas reset monthly (use Supabase scheduled functions)
- Error handling includes retry logic for API failures
- Input validation via Zod schemas before SMS sending

## Testing Strategy

- Unit tests for SMSForm component validation
- Integration tests for API routes with mocked SMS providers
- E2E tests for complete SMS sending flow
- Mock BulkSMS/Africa's Talking responses

## Deployment Checklist

- Create Supabase project and run schema migrations
- Set up Clerk authentication
- Register SMS provider account (BulkSMS/Africa's Talking)
- Configure environment variables in Vercel
- Test SMS sending in staging
- Deploy via Vercel GitHub integration

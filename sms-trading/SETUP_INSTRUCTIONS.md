# Complete Setup Instructions - SMS Trading Platform

**Estimated time: 30 minutes**

## Prerequisites
- Node.js 18+ (`node --version`)
- npm or yarn
- Git
- Supabase account (free)
- Clerk account (free)
- SMS provider accounts (BulkSMS, Africa's Talking)

---

## Phase 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to https://supabase.com → Sign up/Login
2. Click **"New Project"**
3. Fill in:
   - Project name: `sms-trading`
   - Database password: (generate strong password, save it!)
   - Region: Choose closest to your users
4. Wait ~2 minutes for provisioning

### 1.2 Get Supabase Credentials
1. In Supabase, go **Settings → API**
2. Copy to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
   SUPABASE_SERVICE_KEY=eyJxx...
   ```

### 1.3 Load Database Schema
1. Open **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open `supabase/schema-complete.sql` (in project)
4. Copy entire content → Paste into SQL Editor
5. Click **"Run"** (top right)
6. ✅ Wait for success

**Verify:** Go to **Table Editor**, should see 18+ tables

---

## Phase 2: Local Development Setup

### 2.1 Install Dependencies
```bash
cd /path/to/sms-trading
npm install
```

### 2.2 Create `.env.local`
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials from Phase 1.2

### 2.3 Test Database Connection
```bash
npm run dev
```

In another terminal:
```bash
curl http://localhost:3000/api/ready
```

Should return:
```json
{ "success": true, "data": { "status": "ready", "db": "connected" } }
```

**If error:** Check `.env.local` Supabase URLs are correct and project is provisioned

---

## Phase 3: Authentication (Clerk)

### 3.1 Create Clerk Project
1. Go to https://dashboard.clerk.com → Sign up/Login
2. Click **"Create Application"**
3. Choose **"Email"** (phone optional)
4. Click **"Create Application"**

### 3.2 Get Clerk Credentials
1. Go to **API Keys** (left sidebar)
2. Copy to `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   ```

### 3.3 Configure Clerk Redirects
1. Go **Paths** (left sidebar) → **Redirects**
2. Add:
   - **After sign-in:** `/dashboard`
   - **After sign-up:** `/dashboard`
3. (For production, update to your domain)

### 3.4 Test Auth
```bash
npm run dev

# Visit http://localhost:3000/sign-in
# Sign up with test email
# Should redirect to /dashboard
```

---

## Phase 4: SMS Providers

### 4.1 BulkSMS Setup (Primary)
1. Sign up at https://www.bulksms.com
2. Go to **Settings** (top right)
3. Find **API Credentials** or **Advanced**
4. Copy username & password
5. Encode as base64: `echo -n "username:password" | base64`
6. Add to `.env.local`:
   ```env
   BULKSMS_AUTH_HEADER=Basic YWJjMTIzOm15cGFzc3dvcmQ=
   ```

### 4.2 Africa's Talking Setup (Fallback)
1. Sign up at https://africastalking.com
2. Go to **API Keys** (dashboard)
3. Copy **Username** and **API Key**
4. Add to `.env.local`:
   ```env
   AT_USERNAME=sandbox
   AT_API_KEY=atsk_xxxxx
   ```

### 4.3 Test Providers (Optional)
```bash
curl -X POST http://localhost:3000/api/v1/sms/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+27123456789",
    "message": "Test SMS"
  }'
```

---

## Phase 5: Local Development Testing

### 5.1 Start Dev Server
```bash
npm run dev
```

### 5.2 Test Core Flows
1. **Sign in:** http://localhost:3000/sign-in
2. **Dashboard:** http://localhost:3000/dashboard
3. **Send SMS:** http://localhost:3000/send
4. **Contacts:** http://localhost:3000/contacts
5. **Campaigns:** http://localhost:3000/campaigns

### 5.3 Test API Directly
```bash
# Create contact
curl -X POST http://localhost:3000/api/v1/contacts \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: sk_test_xxx" \
  -d '{"phone": "+27123456789", "name": "John", "tag": "test"}'

# List contacts
curl http://localhost:3000/api/v1/contacts

# Send SMS
curl -X POST http://localhost:3000/api/v1/sms \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: unique-123" \
  -d '{"to": "+27123456789", "message": "Hello"}'
```

---

## Phase 6: Deployment to Vercel

### 6.1 Connect to Vercel
```bash
npm install -g vercel
vercel link
# Follow prompts to connect GitHub repo
```

### 6.2 Set Environment Variables
1. In Vercel dashboard, go to **Settings → Environment Variables**
2. Add all `.env.local` variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `BULKSMS_AUTH_HEADER`
   - `AT_USERNAME`
   - `AT_API_KEY`

### 6.3 Deploy
```bash
git push origin main
# Vercel auto-deploys on push
# Visit your-app.vercel.app
```

### 6.4 Update Clerk Redirects
1. In Clerk dashboard, go **Paths → Redirects**
2. Update to production domain:
   - **After sign-in:** `https://your-domain.com/dashboard`
   - **After sign-up:** `https://your-domain.com/dashboard`

---

## Phase 7: Provider Webhooks (Optional, for DLRs)

### 7.1 BulkSMS Webhooks
1. Go to BulkSMS **Settings → Webhooks**
2. Add URL: `https://your-domain.com/api/v1/webhooks/bulksms`
3. Select events: Delivery Reports, Inbound SMS
4. Save

### 7.2 Africa's Talking Webhooks
1. Go to Africa's Talking **Settings → Webhooks**
2. Add URL: `https://your-domain.com/api/v1/webhooks/africastalking`
3. Select events: DLR, Inbound SMS
4. Save

---

## Phase 8: Production Checklist

- [ ] Supabase project created & schema loaded
- [ ] Clerk configured (email-only, redirects set)
- [ ] SMS providers configured (API keys in .env)
- [ ] `.env.local` never committed to git
- [ ] Local dev tested (sign in, send SMS, manage contacts)
- [ ] Vercel deployed (environment variables set)
- [ ] Clerk redirects updated to production domain
- [ ] Provider webhooks configured (for DLRs)
- [ ] Test SMS sent via production app
- [ ] Monitor logs (Vercel dashboard, Supabase logs)

---

## Troubleshooting

### "Cannot find module @supabase/supabase-js"
```bash
npm install
```

### "auth.protect() not found"
- Ensure Clerk keys are correct in `.env.local`
- Restart dev server after updating .env

### "Database connection refused"
- Check `.env.local` Supabase URL is correct
- Verify Supabase project is provisioned (green status)
- Check network connectivity

### "SMS send returns 401 Unauthorized"
- Verify SMS provider credentials in `.env.local`
- Check provider API keys are active
- Test credentials directly with provider

### Deployed app is blank
- Check Vercel build logs
- Ensure all env vars set in Vercel dashboard
- Run `npm run build` locally to verify

---

## Next Steps

1. **Analytics:** Wire up campaign stats to dashboard charts
2. **Admin Panel:** Build UI for client/credit management
3. **2FA:** Add TOTP for admin accounts
4. **RLS:** Activate row-level security when confident
5. **E2E Tests:** Run Playwright tests: `npm run test:e2e`

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Clerk Docs:** https://clerk.com/docs
- **Project Docs:** See `COMPLETION_SUMMARY.md` and `QUICKSTART.md`
- **API Docs:** `docs/openapi.yaml`

---

**You're ready to launch!** 🚀

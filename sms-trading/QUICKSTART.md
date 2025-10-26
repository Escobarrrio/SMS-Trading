# SMS Trading API - Quick Start Guide

## Local Development Setup

```bash
npm install
npx supabase start           # Start local Supabase
npm run dev                  # Start Next.js on http://localhost:3000
```

## Environment Variables

Create `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
SUPABASE_SERVICE_KEY=eyJxx...

# SMS Providers
BULKSMS_AUTH_HEADER=Basic YWE6YmI=
AT_USERNAME=sandbox
AT_API_KEY=xxxxx

# Optional
PREVIEW_MODE=false
```

## API Examples

### Send SMS

```bash
curl -X POST http://localhost:3000/api/v1/sms \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: unique-key-here" \
  -d '{
    "to": "+27123456789",
    "message": "Hello World!"
  }'
```

### Send Test SMS (to your own number)

```bash
curl -X POST http://localhost:3000/api/v1/sms/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+27123456789",
    "message": "Test message"
  }'
```

### Create Contact

```bash
curl -X POST http://localhost:3000/api/v1/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+27123456789",
    "tag": "vip"
  }'
```

### List Contacts

```bash
curl http://localhost:3000/api/v1/contacts?limit=20&offset=0
```

### Export Contacts as CSV

```bash
curl "http://localhost:3000/api/v1/contacts/export?format=csv" > contacts.csv
```

### Create Campaign

```bash
curl -X POST http://localhost:3000/api/v1/campaigns \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: campaign-123" \
  -d '{
    "name": "Welcome Campaign",
    "message": "Welcome to SMS Trading!",
    "tag": "vip"
  }'
```

### Schedule Campaign

```bash
curl -X POST http://localhost:3000/api/v1/campaigns/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "uuid-here",
    "scheduledFor": "2025-10-27T10:00:00Z",
    "timeWindowStart": 9,
    "timeWindowEnd": 17,
    "throttleRate": 50
  }'
```

### CSV Batch Send with Merge Fields

**Step 1: Preview (dry run)**

```bash
curl -X POST http://localhost:3000/api/v1/sms/batch-upload \
  -F "file=@recipients.csv" \
  -F "message=Hi {name}, your order #{order_id} is ready!" \
  -F "commit=false"
```

Response:
```json
{
  "success": true,
  "data": {
    "preview": true,
    "total": 100,
    "invalid": [
      { "row": 5, "reason": "invalid E.164" }
    ],
    "samples": [
      {
        "phone": "+27123456789",
        "message": "Hi John, your order #12345 is ready!",
        "missing": []
      }
    ]
  }
}
```

**Step 2: Commit (actually send)**

```bash
curl -X POST http://localhost:3000/api/v1/sms/batch-upload \
  -F "file=@recipients.csv" \
  -F "message=Hi {name}, your order #{order_id} is ready!" \
  -F "commit=true"
```

Response:
```json
{
  "success": true,
  "data": {
    "sent": 99,
    "failed": 1,
    "invalid": [{ "row": 5, "reason": "invalid E.164" }]
  }
}
```

### Get Campaign Stats

```bash
curl http://localhost:3000/api/v1/campaigns/uuid-here
```

Response includes:
- Campaign details
- Stats: sent, delivered, failed, queued
- Total cost
- Failed messages (for resend)

### Resend Failed Messages

```bash
curl -X POST http://localhost:3000/api/v1/campaigns/uuid-here \
  -H "Content-Type: application/json" \
  -d '{ "action": "resend-failed" }'
```

## Authentication

### Using Clerk (Frontend/Protected Routes)

Sign in via `/sign-in`, then access protected routes:
- `/dashboard`
- `/contacts`
- `/campaigns`
- `/send`

### Using API Keys (Programmatic)

1. Generate key: `POST /api/v1/api-keys` (returns plaintext once)
2. Use in headers:

```bash
curl -H "X-Api-Key: sk_xxxxx" http://localhost:3000/api/v1/contacts
```

## Health & Monitoring

```bash
# Liveness check
curl http://localhost:3000/api/health

# Readiness check (includes DB connection)
curl http://localhost:3000/api/ready
```

## Testing

### Unit Tests (helpers)

```bash
npm test
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Runs:
- Send SMS flow
- Contact import
- Campaign creation
- Error cases

## Deployment

### Vercel

```bash
vercel link
vercel env add CLERK_SECRET_KEY ...  # Add secrets
git push                             # Auto-deploys preview
```

### Staging → Production

```bash
git push origin main  # Manual promote to prod via Vercel dashboard
```

## Common Errors

### Rate Limited (429)
Add `Retry-After` header wait time, then retry.

### Idempotency Key Duplicate
Same request within 24h returns cached response (idempotent).

### Invalid Phone
Must be E.164 format: `+CC` followed by digits (9-15 total).

### Suppressed Contact
Phone is in do-not-contact list. Remove from `suppression_list` table via admin panel if legitimate.

## Support

- **Docs**: `docs/openapi.yaml`
- **Examples**: `e2e/*.spec.ts`
- **Postman**: Run `npx ts-node scripts/export-postman.ts`
- **Issues**: Check `/api/ready` first for service health

---

**Ready to build?** Start with `/api/v1/sms` (send), then `/api/v1/contacts` (manage), then `/api/v1/campaigns` (scale).

# SMS Trading - Quick Start Guide

## 5-Minute Setup

### Step 1: Clone & Install
```bash
cd sms-trading
npm install
```

### Step 2: Create .env.local
```bash
cp .env.example .env.local
```

### Step 3: Add Your Credentials
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_service_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
BULKSMS_USERNAME=your_username
BULKSMS_PASSWORD=your_password
```

### Step 4: Run Dev Server
```bash
npm run dev
```

Visit: http://localhost:3000

---

## File Locations

**Core Business Logic**
- Send SMS: `app/api/send-sms/route.ts`
- Check Balance: `app/api/check-balance/route.ts`

**UI Components**
- SMS Form: `components/SMSForm.tsx`
- Dashboard: `app/dashboard/page.tsx`

**Database**
- Supabase Client: `lib/supabase.ts`
- Schemas: `lib/schemas.ts`

**SMS Providers**
- BulkSMS: `lib/bulksms.ts`
- Africa's Talking: `lib/africastalking.ts`

---

## API Endpoints

### Send SMS
```
POST /api/send-sms
Body: {
  "to": "+27123456789",
  "message": "Hello world"
}
```

### Check Balance
```
GET /api/check-balance
```

---

## Database Tables

**clients**
```
id (UUID)
clerk_id (TEXT) - User ID from Clerk
email (TEXT)
plan (TEXT) - 'starter', 'business', 'pro'
allowance (INT) - Monthly quota
used (INT) - SMS used this month
created_at (TIMESTAMP)
```

**sms_transactions**
```
id (UUID)
client_id (UUID) - Links to clients
to_number (TEXT)
message (TEXT)
status (TEXT) - 'sent', 'failed'
cost (DECIMAL) - SMS cost
created_at (TIMESTAMP)
```

---

## Common Tasks

### Add New Feature
1. Create file in appropriate directory
2. Add route in `app/api/` if backend
3. Add component in `components/` if UI
4. Test locally

### Update SMS Provider
Edit `lib/bulksms.ts` or `lib/africastalking.ts`

### Add Validation
Update `lib/schemas.ts` with new Zod schema

### Change Pricing
Update `app/dashboard/page.tsx` balance display

---

## Deployment

```bash
# 1. Commit changes
git add .
git commit -m "description"

# 2. Push to GitHub
git push origin main

# 3. Vercel auto-deploys
# Check: github.com/Escobarrrio/SMS-Trading/deployments
```

---

## Debugging

### SMS not sending?
1. Check `.env.local` credentials
2. Verify BulkSMS/AT account has balance
3. Check `app/api/send-sms/route.ts` error logs
4. Test in browser console

### User can't login?
1. Verify Clerk credentials in `.env.local`
2. Check Clerk dashboard settings
3. Look at Clerk error logs

### Database errors?
1. Verify Supabase credentials
2. Check table schema in Supabase
3. Run migrations from WARP.md

---

## Next Steps After Setup

1. ✅ Set up external services (Supabase, Clerk, SMS provider)
2. ✅ Add Clerk middleware
3. ✅ Create Supabase tables
4. Add admin panel
5. Add payment integration
6. Add scheduled quota reset
7. Deploy to Vercel

---

## Architecture at a Glance

```
Frontend (React)
    ↓
Next.js API Routes
    ↓
Supabase (Database)
    ↓
SMS Provider (BulkSMS/AT)
    ↓
Customer's Phone
```

---

## Support

- Docs: See `README.md`
- Architecture: See `WARP.md`
- Setup: See `SETUP_SUMMARY.md`
- Code: Browse `/app`, `/lib`, `/components`

---

**Ready to deploy?** Follow `SETUP_SUMMARY.md` → `WARP.md` → Deploy

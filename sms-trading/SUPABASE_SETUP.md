# Supabase Setup Guide - Step by Step

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `sms-trading`
   - **Database Password**: Generate a strong one (save it!)
   - **Region**: Choose closest to your users (e.g., `us-east-1` or `eu-west-1`)
4. Click **"Create new project"** (takes ~2 min)

## Step 2: Get Credentials

Once project is ready:

1. Navigate to **Settings** → **API**
2. Copy these values to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
SUPABASE_SERVICE_KEY=eyJxx...
```

**Locations in Supabase UI:**
- **NEXT_PUBLIC_SUPABASE_URL**: Top of API page (Project URL)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: "anon" row under Project API keys
- **SUPABASE_SERVICE_KEY**: "service_role" row (keep secret! Use only in backend)

## Step 3: Load the Schema

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire content from `supabase/schema-complete.sql`
4. Paste into the SQL editor
5. Click **"Run"** (top right)
6. Wait for success ✓

This creates:
- 18 tables (clients, contacts, campaigns, etc.)
- 25+ indexes (for performance)
- 4 helper functions (ensure_tag, increment_usage, etc.)
- RLS policies (commented out, ready to enable)

## Step 4: Verify Tables Created

1. Go to **Table Editor** (left sidebar)
2. You should see all tables listed:
   - clients
   - contacts
   - campaigns
   - campaign_messages
   - sms_transactions
   - templates
   - tags
   - contact_tags
   - suppression_list
   - audit_logs
   - organizations
   - team_members
   - ... and more

If all present ✓, schema is ready!

## Step 5: Enable Auth (Optional Now, Required Later)

For Clerk integration later:

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled (default)
3. Disable phone (we're email-only)

## Step 6: Test Connection Locally

```bash
# From project root
npm run dev

# In another terminal, test:
curl http://localhost:3000/api/ready
```

Should return:
```json
{
  "success": true,
  "data": {
    "status": "ready",
    "db": "connected"
  }
}
```

If you see errors, check:
1. `.env.local` has correct Supabase URLs
2. Supabase project is fully provisioned (green status)
3. Network connectivity

## Step 7: Insert Test Data (Optional)

```sql
-- Paste into SQL Editor to create a test client:
insert into clients(clerk_id, email, plan, allowance)
values ('test-user-123', 'test@example.com', 'starter', 1000);
```

Then fetch it:
```bash
curl http://localhost:3000/api/v1/clients \
  -H "X-Api-Key: your-test-key"
```

## Step 8: Enable RLS (Production Only)

**⚠️ Do this ONLY after thoroughly testing with RLS disabled!**

When ready to enforce multi-tenancy:

1. Go to **SQL Editor**
2. Uncomment all `ALTER TABLE ... ENABLE RLS` statements in schema
3. Uncomment the `CREATE POLICY` statements
4. Run the SQL
5. Test that your app still works (backend uses service_role, which bypasses RLS)

## Backup & Maintenance

### Daily Backups (Automatic)
Supabase automatically backs up your data. View in **Settings** → **Backups**.

### Manual Backup
1. Go to **Settings** → **Backups**
2. Click **"Create backup"** to manually trigger

### Restore from Backup
1. **Settings** → **Backups**
2. Click restore button on desired backup
3. Choose new database or replace current (careful!)

## Common Issues & Fixes

### "Connection refused" error
- Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL`
- Ensure project is provisioned (check Supabase dashboard)
- Verify network connection

### "unauthorized" or "permission denied"
- For client-side queries: Use `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- For server-side (API routes): Use `SUPABASE_SERVICE_KEY`
- Never expose service key in browser!

### RLS blocking queries unexpectedly
- Check policies are correct (view in **Authentication** → **Policies**)
- Service role should bypass RLS automatically
- Disable RLS temporarily to debug: `ALTER TABLE xxx DISABLE ROW LEVEL SECURITY;`

### Quota exceeded
- Check **Billing** tab for limits
- Free tier: 500MB storage, 2GB bandwidth
- Upgrade plan if needed

## Next Steps

1. ✅ Database ready
2. Configure Clerk (next guide)
3. Add SMS provider credentials to `.env`
4. Run `npm run dev` and test flows
5. Deploy to Vercel

---

**Questions?** Check Supabase docs: https://supabase.com/docs

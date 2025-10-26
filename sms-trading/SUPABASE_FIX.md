# Supabase Schema Fix - organization_id Error

## Problem
```
ERROR:  42703: column "organization_id" does not exist
```

Your existing `clients` table is missing the `organization_id` column that the schema expects.

---

## Solution: Run This SQL

In Supabase **SQL Editor**, paste and run the following:

```sql
-- Add missing organization_id column
ALTER TABLE clients ADD COLUMN IF NOT EXISTS organization_id uuid;

-- Create organizations table
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references clients(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- Add foreign key
ALTER TABLE clients ADD CONSTRAINT fk_clients_organization
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Create index
create index if not exists idx_clients_organization on clients(organization_id);
```

Click **Run** ✓

---

## Or: Use Pre-Made Fix File

**Easier option:** I created `supabase/schema-fixed.sql` with all fixes.

1. Open `supabase/schema-fixed.sql` from project
2. Copy entire content
3. Paste into Supabase **SQL Editor**
4. Click **Run** ✓

---

## Verify Fix

In Supabase **Table Editor**, you should now see:

- `clients` table has `organization_id` column ✓
- `organizations` table exists ✓
- `team_members` table exists ✓
- `team_invitations` table exists ✓

---

## What Was Wrong?

The original `schema-complete.sql` referenced `organization_id` on the `clients` table but didn't properly handle the column creation order. Now fixed!

---

**Done!** Your schema is now complete and ready to use. 🎉

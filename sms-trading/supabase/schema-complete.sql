-- ============================================================================
-- SMS Trading Platform - Complete Supabase Schema
-- ============================================================================
-- Copy-paste this entire script into Supabase SQL Editor
-- It's safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================================

-- Enable extensions
create extension if not exists pgcrypto;
create extension if not exists pgjwt;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Clients (tenants)
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text not null,
  is_admin boolean default false,
  plan text not null default 'starter',
  allowance int not null default 1000,
  used int not null default 0,
  created_at timestamptz default now()
);

-- Add organization_id after organizations table exists
alter table clients add column if not exists organization_id uuid;

-- Contacts
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  name text,
  phone text not null,
  normalized_phone text,
  tag text,
  consent_status text default 'unknown',
  consent_date timestamptz,
  created_at timestamptz default now(),
  unique(client_id, normalized_phone)
);

-- Tags (for many-to-many with contacts)
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  unique(client_id, name)
);

-- Contact-Tags (many-to-many)
create table if not exists contact_tags (
  contact_id uuid references contacts(id) on delete cascade not null,
  tag_id uuid references tags(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key(contact_id, tag_id)
);

-- Suppression List (opt-outs, do-not-contact)
create table if not exists suppression_list (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  phone text not null,
  reason text,
  created_at timestamptz default now(),
  unique(client_id, phone)
);

-- Templates
create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  name text not null,
  text text not null,
  variables text[] default '{}',
  created_at timestamptz default now()
);

-- Campaigns
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  name text not null,
  message text not null,
  scheduled_for timestamptz,
  dispatched_at timestamptz,
  status text default 'draft',
  scheduling_metadata text,
  created_by text,
  created_at timestamptz default now()
);

-- Campaign Messages (queued for sending)
create table if not exists campaign_messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade not null,
  to_number text not null,
  status text not null,
  provider_id text,
  error text,
  cost numeric(10,2),
  created_at timestamptz default now(),
  delivered_at timestamptz
);

-- SMS Transactions (accounting log)
create table if not exists sms_transactions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  to_number text not null,
  message text not null,
  status text not null,
  cost numeric(10,2),
  created_at timestamptz default now()
);

-- Usage Ledger (quota tracking)
create table if not exists usage_ledger (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  delta int not null,
  reason text,
  ref_table text,
  ref_id uuid,
  created_at timestamptz default now()
);

-- Idempotency (24h request deduplication)
create table if not exists idempotency (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  key text unique not null,
  request_hash text,
  created_at timestamptz default now()
);

-- API Keys
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  key_hash text unique not null,
  created_at timestamptz default now(),
  last_used_at timestamptz
);

-- Webhooks Registry
create table if not exists webhooks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  url text not null,
  secret text,
  events text[] default '{}',
  created_at timestamptz default now()
);

-- ============================================================================
-- COMPLIANCE & AUDIT TABLES
-- ============================================================================

-- Audit Logs (admin actions)
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references clients(id) on delete cascade,
  action text not null,
  resource_type text not null,
  resource_id text,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- ============================================================================
-- ORGANIZATIONS & TEAMS
-- ============================================================================

-- Organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references clients(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- Team Members
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  role text default 'viewer',
  invited_at timestamptz default now(),
  joined_at timestamptz,
  unique(organization_id, client_id)
);

-- Team Invitations
create table if not exists team_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade not null,
  email text not null,
  role text default 'viewer',
  token text unique not null,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================================
-- INDEXES (Performance)
-- ============================================================================

create index if not exists idx_clients_clerk_id on clients(clerk_id);
create index if not exists idx_clients_organization on clients(organization_id);
create index if not exists idx_contacts_client on contacts(client_id);
create index if not exists idx_contacts_phone on contacts(phone);
create index if not exists idx_contacts_normalized on contacts(normalized_phone);
create index if not exists idx_contacts_created on contacts(client_id, created_at);
create index if not exists idx_contacts_consent on contacts(client_id, consent_status);
create index if not exists idx_tags_client on tags(client_id);
create index if not exists idx_contact_tags_tag on contact_tags(tag_id);
create index if not exists idx_suppression_list_client on suppression_list(client_id);
create index if not exists idx_suppression_list_phone on suppression_list(phone);
create index if not exists idx_templates_client on templates(client_id);
create index if not exists idx_campaigns_client on campaigns(client_id);
create index if not exists idx_campaigns_created on campaigns(created_at);
create index if not exists idx_campaigns_scheduled on campaigns(scheduled_for) where scheduled_for is not null;
create index if not exists idx_campaign_messages_campaign on campaign_messages(campaign_id);
create index if not exists idx_campaign_messages_status on campaign_messages(status);
create index if not exists idx_campaign_messages_provider on campaign_messages(provider_id);
create index if not exists idx_sms_transactions_client on sms_transactions(client_id);
create index if not exists idx_sms_transactions_created on sms_transactions(client_id, created_at);
create index if not exists idx_usage_ledger_client on usage_ledger(client_id);
create index if not exists idx_idempotency_key on idempotency(key);
create index if not exists idx_audit_logs_admin on audit_logs(admin_id);
create index if not exists idx_audit_logs_created on audit_logs(created_at);
create index if not exists idx_audit_logs_resource on audit_logs(resource_type, resource_id);
create index if not exists idx_organizations_owner on organizations(owner_id);
create index if not exists idx_team_members_org on team_members(organization_id);
create index if not exists idx_team_members_client on team_members(client_id);
create index if not exists idx_team_invitations_org on team_invitations(organization_id);
create index if not exists idx_team_invitations_email on team_invitations(email);

-- ============================================================================
-- FUNCTIONS & STORED PROCEDURES
-- ============================================================================

-- Helper: Get or create tag
create or replace function ensure_tag(p_client uuid, p_name text)
returns uuid language plpgsql as $$
declare
  v_id uuid;
begin
  insert into tags(client_id, name) values (p_client, p_name)
  on conflict (client_id, name) do nothing;
  select id into v_id from tags where client_id = p_client and name = p_name;
  return v_id;
end;$$;

-- Helper: Increment usage
create or replace function increment_usage(p_client_id uuid, p_delta int)
returns void language sql as $$
  update clients set used = used + p_delta where id = p_client_id;
  insert into usage_ledger(client_id, delta, reason) values (p_client_id, p_delta, 'send');
$$;

-- Helper: Reset monthly usage
create or replace function reset_monthly_usage()
returns void language sql as $$
  update clients set used = 0;
  insert into usage_ledger(client_id, delta, reason)
    select id, 0, 'monthly_reset' from clients;
$$;

-- Helper: Log audit action
create or replace function log_audit_action(
  p_admin_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id text default null,
  p_changes jsonb default null,
  p_ip text default null,
  p_ua text default null
)
returns uuid language plpgsql as $$
declare
  v_id uuid;
begin
  insert into audit_logs(admin_id, action, resource_type, resource_id, changes, ip_address, user_agent)
  values (p_admin_id, p_action, p_resource_type, p_resource_id, p_changes, p_ip, p_ua)
  returning id into v_id;
  return v_id;
end;$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- WARNING: Enable RLS policies below ONLY after ensuring all data is properly scoped.
-- Uncomment when ready to activate tenancy enforcement.

-- Enable RLS on all tables
-- alter table clients enable row level security;
-- alter table contacts enable row level security;
-- alter table tags enable row level security;
-- alter table contact_tags enable row level security;
-- alter table campaigns enable row level security;
-- alter table campaign_messages enable row level security;
-- alter table templates enable row level security;
-- alter table suppression_list enable row level security;
-- alter table sms_transactions enable row level security;
-- alter table usage_ledger enable row level security;
-- alter table api_keys enable row level security;
-- alter table idempotency enable row level security;
-- alter table audit_logs enable row level security;
-- alter table organizations enable row level security;
-- alter table team_members enable row level security;

-- Service role bypass (allows app backend to operate)
-- create policy if not exists allow_service_role on clients for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
-- create policy if not exists allow_service_role on contacts for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
-- [... repeat for all tables ...]

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. RLS is defined but NOT enabled by default (to avoid breaking existing queries)
-- 2. Uncomment "ALTER TABLE ... ENABLE RLS" and policies when ready
-- 3. Service role (backend) will bypass RLS automatically
-- 4. Run "select log_audit_action(...)" to log admin actions
-- 5. Use "select ensure_tag(...)" to safely create tags
-- 6. Call "select increment_usage(...)" to track SMS usage
-- 7. Monthly quota reset: "select reset_monthly_usage()" (run via cron)
-- ============================================================================

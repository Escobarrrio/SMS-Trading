-- Supabase migration: core tables and routines for SMS Trading
-- Safe to run multiple times if objects already exist.

-- Extensions
create extension if not exists pgcrypto;

-- Clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique,
  email text not null,
  is_admin boolean default false,
  plan text not null default 'starter',
  allowance int not null default 1000,
  used int not null default 0,
  created_at timestamptz default now()
);

-- Contacts and tags
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  name text,
  phone text not null,
  normalized_phone text,
  tag text,
  created_at timestamptz default now(),
  unique (client_id, normalized_phone)
);

create table if not exists suppression_list (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  phone text not null,
  reason text,
  created_at timestamptz default now(),
  unique (client_id, phone)
);

-- Templates
create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  text text not null,
  variables text[] default '{}',
  created_at timestamptz default now()
);

-- Campaigns
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  message text not null,
  scheduled_for timestamptz,
  dispatched_at timestamptz,
  status text default 'draft',
  created_by text,
  created_at timestamptz default now()
);

create table if not exists campaign_messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  to_number text not null,
  status text not null,
  provider_id text,
  error text,
  cost numeric(10,2),
  created_at timestamptz default now(),
  delivered_at timestamptz
);

-- Transactions & usage
create table if not exists sms_transactions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  to_number text not null,
  message text not null,
  status text not null,
  cost numeric(10,2),
  created_at timestamptz default now()
);

create table if not exists usage_ledger (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  delta int not null,
  reason text,
  ref_table text,
  ref_id uuid,
  created_at timestamptz default now()
);

-- Idempotency and API keys
create table if not exists idempotency (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  key text unique not null,
  request_hash text,
  created_at timestamptz default now()
);

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  key_hash text unique not null,
  created_at timestamptz default now(),
  last_used_at timestamptz
);

-- Webhooks registry
create table if not exists webhooks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  url text not null,
  secret text,
  events text[] default '{}',
  created_at timestamptz default now()
);

-- Performance indexes
create index if not exists idx_contacts_client on contacts(client_id);
create index if not exists idx_campaigns_client on campaigns(client_id);
create index if not exists idx_campaign_messages_campaign on campaign_messages(campaign_id);
create index if not exists idx_sms_transactions_client on sms_transactions(client_id);

-- Usage helpers
create or replace function increment_usage(p_client_id uuid, p_delta int)
returns void language sql as $$
  update clients set used = used + p_delta where id = p_client_id;
  insert into usage_ledger(client_id, delta, reason) values (p_client_id, p_delta, 'send');
$$;

-- Monthly reset (run via pg_cron or external scheduler)
create or replace function reset_monthly_usage()
returns void language sql as $$
  update clients set used = 0;
  insert into usage_ledger(client_id, delta, reason)
    select id, 0, 'monthly_reset' from clients;
$$;

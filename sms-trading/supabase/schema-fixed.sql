-- ============================================================================
-- SMS Trading Platform - Fixed Schema (Adds Missing organization_id)
-- ============================================================================
-- Run this AFTER the initial schema, or use if you have an existing clients table
-- ============================================================================

-- Step 1: Add missing organization_id column to clients (if not exists)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS organization_id uuid;

-- Step 2: Create organizations table (if not exists)
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references clients(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- Step 3: Create team_members table (if not exists)
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  role text default 'viewer',
  invited_at timestamptz default now(),
  joined_at timestamptz,
  unique(organization_id, client_id)
);

-- Step 4: Create team_invitations table (if not exists)
create table if not exists team_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade not null,
  email text not null,
  role text default 'viewer',
  token text unique not null,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Step 5: Add foreign key constraint on clients.organization_id (if not exists)
ALTER TABLE clients ADD CONSTRAINT fk_clients_organization
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Step 6: Create indexes for organizations/teams
create index if not exists idx_organizations_owner on organizations(owner_id);
create index if not exists idx_team_members_org on team_members(organization_id);
create index if not exists idx_team_members_client on team_members(client_id);
create index if not exists idx_team_invitations_org on team_invitations(organization_id);
create index if not exists idx_team_invitations_email on team_invitations(email);
create index if not exists idx_clients_organization on clients(organization_id);

-- ============================================================================
-- Done! Your schema now supports organization/team features
-- ============================================================================

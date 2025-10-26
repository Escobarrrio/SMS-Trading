-- Organizations table
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references clients(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Team members (teammates)
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  role text default 'viewer', -- admin, editor, viewer
  invited_at timestamptz default now(),
  joined_at timestamptz,
  unique(organization_id, client_id)
);

-- Invitations (email-based)
create table if not exists team_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  email text not null,
  role text default 'viewer',
  token text unique not null,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_organizations_owner on organizations(owner_id);
create index if not exists idx_team_members_org on team_members(organization_id);
create index if not exists idx_team_members_client on team_members(client_id);
create index if not exists idx_team_invitations_org on team_invitations(organization_id);
create index if not exists idx_team_invitations_email on team_invitations(email);

-- Link client to organization
alter table clients add column if not exists organization_id uuid references organizations(id) on delete set null;
create index if not exists idx_clients_organization on clients(organization_id);

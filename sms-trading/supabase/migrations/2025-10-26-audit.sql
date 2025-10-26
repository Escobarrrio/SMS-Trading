-- Audit log table for admin actions
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

create index if not exists idx_audit_logs_admin on audit_logs(admin_id);
create index if not exists idx_audit_logs_created on audit_logs(created_at);
create index if not exists idx_audit_logs_resource on audit_logs(resource_type, resource_id);

-- Consent tracking for contacts
alter table contacts add column if not exists consent_status text default 'unknown';
alter table contacts add column if not exists consent_date timestamptz;

create index if not exists idx_contacts_consent on contacts(client_id, consent_status);

-- Helper function to log admin actions
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

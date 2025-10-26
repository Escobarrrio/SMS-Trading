-- Supabase migration: RLS, tags/contact_tags, and policies

-- Tags and bridge table
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique (client_id, name)
);

create table if not exists contact_tags (
  contact_id uuid references contacts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (contact_id, tag_id)
);

-- Helper to get-or-create tag
create or replace function ensure_tag(p_client uuid, p_name text)
returns uuid language plpgsql as $$
begin
  insert into tags(client_id, name) values (p_client, p_name)
  on conflict (client_id, name) do nothing;
  return (select id from tags where client_id = p_client and name = p_name);
end;$$;

-- Enable RLS (service role will bypass)
alter table clients enable row level security;
alter table contacts enable row level security;
alter table templates enable row level security;
alter table campaigns enable row level security;
alter table campaign_messages enable row level security;
alter table sms_transactions enable row level security;
alter table usage_ledger enable row level security;
alter table tags enable row level security;
alter table contact_tags enable row level security;
alter table api_keys enable row level security;
alter table idempotency enable row level security;

-- Policies: allow service role; deny others by default (app enforces tenancy)
create policy if not exists allow_service_role on clients for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists allow_service_role on contacts for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists allow_service_role on templates for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists allow_service_role on campaigns for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists allow_service_role on campaign_messages for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists allow_service_role on sms_transactions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists allow_service_role on usage_ledger for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists allow_service_role on tags for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists allow_service_role on contact_tags for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists allow_service_role on api_keys for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists allow_service_role on idempotency for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

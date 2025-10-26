-- Supabase Auth Migration: Add supabase_user_id to clients table
-- This migration connects clients to Supabase Auth users

-- Step 1: Add supabase_user_id column if it doesn't exist
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS supabase_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE;

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_supabase_user_id ON clients(supabase_user_id);

-- Step 3: Create index on is_admin for admin queries
CREATE INDEX IF NOT EXISTS idx_clients_is_admin ON clients(is_admin) WHERE is_admin = true;

-- Step 4: Add created_at index for sorting
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- Step 5: Add composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_clients_supabase_user_id_is_admin ON clients(supabase_user_id, is_admin);

-- Step 6: Update any existing clerk_id references if needed (optional, only if migrating)
-- This is commented out as it depends on your specific migration strategy
-- UPDATE clients SET supabase_user_id = new_supabase_id 
-- FROM clerk_migration_map 
-- WHERE clients.clerk_id = clerk_migration_map.clerk_id;

-- Step 7: Enable Row Level Security policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Step 8: Drop existing RLS policies if they reference clerk_id
DROP POLICY IF EXISTS "Users can read their own data" ON clients;
DROP POLICY IF EXISTS "Users can update their own data" ON clients;
DROP POLICY IF EXISTS "Admins can read all data" ON clients;

-- Step 9: Create RLS policy for users to read their own data
CREATE POLICY "Users can read their own client data"
  ON clients
  FOR SELECT
  USING (auth.uid() = supabase_user_id OR is_admin);

-- Step 10: Create RLS policy for users to update their own data
CREATE POLICY "Users can update their own client data"
  ON clients
  FOR UPDATE
  USING (auth.uid() = supabase_user_id)
  WITH CHECK (auth.uid() = supabase_user_id);

-- Step 11: Create RLS policy for admins
CREATE POLICY "Admins have full access to clients"
  ON clients
  FOR ALL
  USING (
    (auth.uid() = supabase_user_id) OR
    (
      SELECT is_admin FROM clients 
      WHERE supabase_user_id = auth.uid() 
      LIMIT 1
    )
  );

-- Step 12: Add comment to clients table
COMMENT ON TABLE clients IS 'Client accounts linked to Supabase Auth users';
COMMENT ON COLUMN clients.supabase_user_id IS 'Foreign key reference to Supabase Auth user';
COMMENT ON COLUMN clients.is_admin IS 'Admin flag for access control';

-- Step 13: Add audit tracking - create audit log table if not exists
CREATE TABLE IF NOT EXISTS client_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Step 14: Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_client_audit_log_client_id ON client_audit_log(client_id);
CREATE INDEX IF NOT EXISTS idx_client_audit_log_created_at ON client_audit_log(created_at DESC);

-- Step 15: Enable RLS on audit log
ALTER TABLE client_audit_log ENABLE ROW LEVEL SECURITY;

-- Step 16: Create RLS policy for audit log
CREATE POLICY "Clients can read their own audit logs"
  ON client_audit_log
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE supabase_user_id = auth.uid() OR is_admin
    )
  );

-- Step 17: Create trigger to log client changes
CREATE OR REPLACE FUNCTION log_client_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO client_audit_log (client_id, action, changes, created_by)
  VALUES (
    NEW.id,
    TG_OP,
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ),
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 18: Create trigger
DROP TRIGGER IF EXISTS client_changes_trigger ON clients;
CREATE TRIGGER client_changes_trigger
  AFTER UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION log_client_changes();

-- Verify migration
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  constraint_name
FROM information_schema.columns
LEFT JOIN information_schema.key_column_usage USING (column_name, table_name)
WHERE table_name = 'clients'
ORDER BY ordinal_position;
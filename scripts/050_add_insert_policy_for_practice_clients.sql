-- Add RLS policy to allow inserts on dyh_practice_clients table
-- This allows the CSV import to work without requiring service role key

-- First, enable RLS if not already enabled
ALTER TABLE dyh_practice_clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid duplicates)
DROP POLICY IF EXISTS "Allow public read access" ON dyh_practice_clients;
DROP POLICY IF EXISTS "Allow public insert access" ON dyh_practice_clients;
DROP POLICY IF EXISTS "Allow public update access" ON dyh_practice_clients;
DROP POLICY IF EXISTS "Allow public delete access" ON dyh_practice_clients;

-- Create policies for full CRUD access (admin table - no auth required)
CREATE POLICY "Allow public read access" ON dyh_practice_clients
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON dyh_practice_clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON dyh_practice_clients
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete access" ON dyh_practice_clients
  FOR DELETE USING (true);

-- Also add policies for related tables
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to client_notes" ON client_notes;
CREATE POLICY "Allow public access to client_notes" ON client_notes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE client_group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to client_group_members" ON client_group_members;
CREATE POLICY "Allow public access to client_group_members" ON client_group_members FOR ALL USING (true) WITH CHECK (true);

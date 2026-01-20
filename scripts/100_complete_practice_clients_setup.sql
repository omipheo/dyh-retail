-- Complete setup script for Practice Manager clients
-- This creates all necessary tables with all columns needed for CSV import

-- Create the dyh_practice_clients table with all fields
CREATE TABLE IF NOT EXISTS public.dyh_practice_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID,
  client_email TEXT,
  full_name TEXT,
  phone TEXT,
  type TEXT CHECK (type IN ('individual', 'company', 'partnership', 'trust', 'smsf', 'sole_trader')) DEFAULT 'individual',
  questionnaire_data JSONB DEFAULT '{}',
  purchase_data JSONB DEFAULT '{}',
  final_report_purchased_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'archived')) DEFAULT 'active',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create client_notes table
CREATE TABLE IF NOT EXISTS public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.dyh_practice_clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_groups table
CREATE TABLE IF NOT EXISTS public.client_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_group_members junction table
CREATE TABLE IF NOT EXISTS public.client_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.client_groups(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.dyh_practice_clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, client_id)
);

-- Enable Row Level Security
ALTER TABLE public.dyh_practice_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_group_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all operations on practice clients" ON public.dyh_practice_clients;
DROP POLICY IF EXISTS "Allow all operations on client notes" ON public.client_notes;
DROP POLICY IF EXISTS "Allow all operations on client groups" ON public.client_groups;
DROP POLICY IF EXISTS "Allow all operations on client group members" ON public.client_group_members;

-- Create permissive policies for admin access (no auth required for this admin app)
CREATE POLICY "Allow all operations on practice clients"
  ON public.dyh_practice_clients FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on client notes"
  ON public.client_notes FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on client groups"
  ON public.client_groups FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on client group members"
  ON public.client_group_members FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dyh_clients_email ON public.dyh_practice_clients(client_email);
CREATE INDEX IF NOT EXISTS idx_dyh_clients_status ON public.dyh_practice_clients(status);
CREATE INDEX IF NOT EXISTS idx_dyh_clients_full_name ON public.dyh_practice_clients(full_name);
CREATE INDEX IF NOT EXISTS idx_dyh_clients_created_at ON public.dyh_practice_clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON public.client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_group_members_group_id ON public.client_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_client_group_members_client_id ON public.client_group_members(client_id);

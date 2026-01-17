-- Create Client Groups table for managing related clients (family/business relationships)
CREATE TABLE IF NOT EXISTS public.client_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name TEXT NOT NULL,
  group_type TEXT NOT NULL CHECK (group_type IN ('family', 'business', 'other')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Client Group Members junction table
CREATE TABLE IF NOT EXISTS public.client_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.client_groups(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.dyh_practice_clients(id) ON DELETE CASCADE,
  role_in_group TEXT, -- e.g., "Director", "Trustee", "Family Member"
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, client_id)
);

-- Add client_type field to dyh_practice_clients if it doesn't exist
ALTER TABLE public.dyh_practice_clients 
ADD COLUMN IF NOT EXISTS client_type TEXT CHECK (client_type IN ('individual', 'sole_trader', 'partnership', 'company', 'trust', 'smsf'));

-- Enable Row Level Security
ALTER TABLE public.client_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_group_members ENABLE ROW LEVEL SECURITY;

-- Policies for tax agents
CREATE POLICY "Tax agents can view all client groups"
  ON public.client_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can manage client groups"
  ON public.client_groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can view group members"
  ON public.client_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can manage group members"
  ON public.client_group_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_client_groups_created_at ON public.client_groups(created_at DESC);
CREATE INDEX idx_client_group_members_group_id ON public.client_group_members(group_id);
CREATE INDEX idx_client_group_members_client_id ON public.client_group_members(client_id);
CREATE INDEX idx_dyh_clients_client_type ON public.dyh_practice_clients(client_type);

-- Add updated_at trigger for client_groups
CREATE OR REPLACE FUNCTION update_client_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_groups_updated_at
  BEFORE UPDATE ON public.client_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_client_groups_updated_at();

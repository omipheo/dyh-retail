-- Create DYH Explorer Prospects table to store prospective clients from DYH Explorer workspace
CREATE TABLE IF NOT EXISTS public.dyh_explorer_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  client_name TEXT,
  phone TEXT,
  questionnaire_data JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'contacted', 'qualified', 'converted')) DEFAULT 'pending',
  source TEXT DEFAULT 'dyh_explorer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create DYH Practice Clients table to store converted clients after Final Report purchase
CREATE TABLE IF NOT EXISTS public.dyh_practice_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES public.dyh_explorer_prospects(id) ON DELETE SET NULL,
  client_email TEXT NOT NULL,
  client_name TEXT,
  phone TEXT,
  questionnaire_data JSONB NOT NULL,
  purchase_data JSONB,
  final_report_purchased_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'archived')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.dyh_explorer_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dyh_practice_clients ENABLE ROW LEVEL SECURITY;

-- Policies for tax agents only
CREATE POLICY "Tax agents can view all prospects"
  ON public.dyh_explorer_prospects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can insert prospects"
  ON public.dyh_explorer_prospects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can update prospects"
  ON public.dyh_explorer_prospects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can view all practice clients"
  ON public.dyh_practice_clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can insert practice clients"
  ON public.dyh_practice_clients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can update practice clients"
  ON public.dyh_practice_clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_dyh_prospects_email ON public.dyh_explorer_prospects(client_email);
CREATE INDEX idx_dyh_prospects_status ON public.dyh_explorer_prospects(status);
CREATE INDEX idx_dyh_prospects_created_at ON public.dyh_explorer_prospects(created_at DESC);

CREATE INDEX idx_dyh_clients_email ON public.dyh_practice_clients(client_email);
CREATE INDEX idx_dyh_clients_prospect_id ON public.dyh_practice_clients(prospect_id);
CREATE INDEX idx_dyh_clients_status ON public.dyh_practice_clients(status);
CREATE INDEX idx_dyh_clients_created_at ON public.dyh_practice_clients(created_at DESC);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_dyh_prospects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dyh_prospects_updated_at
  BEFORE UPDATE ON public.dyh_explorer_prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_dyh_prospects_updated_at();

CREATE OR REPLACE FUNCTION update_dyh_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dyh_clients_updated_at
  BEFORE UPDATE ON public.dyh_practice_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_dyh_clients_updated_at();

-- Create complaints table for tracking client complaints
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complainant_first_name TEXT NOT NULL,
  complainant_last_name TEXT NOT NULL,
  complainant_email TEXT,
  complainant_phone TEXT,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  complaint_date DATE NOT NULL,
  complaint_details TEXT NOT NULL,
  our_response TEXT,
  response_date DATE,
  referred_to_tpb BOOLEAN DEFAULT FALSE,
  tpb_reference_number TEXT,
  tpb_date DATE,
  referred_to_ipa BOOLEAN DEFAULT FALSE,
  ipa_reference_number TEXT,
  ipa_date DATE,
  matter_in_litigation BOOLEAN DEFAULT FALSE,
  litigation_details TEXT,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Policies for tax agents (can view all)
CREATE POLICY "Tax agents can view all complaints"
  ON public.complaints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can insert complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can update complaints"
  ON public.complaints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_complaints_complainant_last_name ON public.complaints(complainant_last_name);
CREATE INDEX idx_complaints_complaint_date ON public.complaints(complaint_date DESC);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_client_id ON public.complaints(client_id);
CREATE INDEX idx_complaints_deleted_at ON public.complaints(deleted_at);
CREATE INDEX idx_complaints_referred_tpb ON public.complaints(referred_to_tpb) WHERE referred_to_tpb = TRUE;
CREATE INDEX idx_complaints_referred_ipa ON public.complaints(referred_to_ipa) WHERE referred_to_ipa = TRUE;
CREATE INDEX idx_complaints_litigation ON public.complaints(matter_in_litigation) WHERE matter_in_litigation = TRUE;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_complaints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_complaints_updated_at();

-- Add comment
COMMENT ON TABLE public.complaints IS 'Tracks client complaints including TPB/IPA referrals and litigation status for compliance';

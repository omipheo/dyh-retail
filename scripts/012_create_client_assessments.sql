-- Create client_assessments table to store Quick Questionnaire + Strategy Selector submissions
CREATE TABLE IF NOT EXISTS public.client_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'archived')) DEFAULT 'draft',
  questionnaire_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.client_assessments ENABLE ROW LEVEL SECURITY;

-- Policies for end users
CREATE POLICY "Users can view their own assessments"
  ON public.client_assessments FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Users can insert their own assessments"
  ON public.client_assessments FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own assessments"
  ON public.client_assessments FOR UPDATE
  USING (auth.uid() = client_id);

-- Policies for tax agents
CREATE POLICY "Tax agents can view all assessments"
  ON public.client_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can update all assessments"
  ON public.client_assessments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_client_assessments_client_id ON public.client_assessments(client_id);
CREATE INDEX idx_client_assessments_status ON public.client_assessments(status);
CREATE INDEX idx_client_assessments_created_at ON public.client_assessments(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_client_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_assessments_updated_at
  BEFORE UPDATE ON public.client_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_client_assessments_updated_at();

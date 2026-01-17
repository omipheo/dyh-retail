-- Create client_followups table to track follow-up requests sent to clients
CREATE TABLE IF NOT EXISTS public.client_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  subject TEXT NOT NULL,
  message_text TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  
  -- Requirements flags
  requires_documents BOOLEAN DEFAULT false,
  requires_signature BOOLEAN DEFAULT false,
  requires_information BOOLEAN DEFAULT false,
  
  -- Status tracking
  status TEXT NOT NULL CHECK (status IN ('sent', 'viewed', 'responded', 'completed', 'cancelled')) DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Response data
  response_text TEXT,
  signature_data TEXT, -- Stores signature image or acknowledgment
  signed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  notes TEXT
);

-- Create followup_documents table to store uploaded documents for follow-ups
CREATE TABLE IF NOT EXISTS public.followup_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  followup_id UUID NOT NULL REFERENCES public.client_followups(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  document_type TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.client_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_documents ENABLE ROW LEVEL SECURITY;

-- Follow-ups policies
CREATE POLICY "Tax agents can view followups they created"
  ON public.client_followups FOR SELECT
  USING (
    auth.uid() = tax_agent_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Clients can view their own followups"
  ON public.client_followups FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Tax agents can create followups"
  ON public.client_followups FOR INSERT
  WITH CHECK (
    auth.uid() = tax_agent_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can update their followups"
  ON public.client_followups FOR UPDATE
  USING (
    auth.uid() = tax_agent_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Clients can update their followup responses"
  ON public.client_followups FOR UPDATE
  USING (auth.uid() = client_id);

-- Followup documents policies
CREATE POLICY "Users can view followup documents"
  ON public.followup_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_followups cf
      WHERE cf.id = followup_id AND (cf.client_id = auth.uid() OR cf.tax_agent_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Users can upload followup documents"
  ON public.followup_documents FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
      SELECT 1 FROM public.client_followups cf
      WHERE cf.id = followup_id AND (cf.client_id = auth.uid() OR cf.tax_agent_id = auth.uid())
    )
  );

-- Create indexes for performance
CREATE INDEX idx_client_followups_tax_agent ON public.client_followups(tax_agent_id);
CREATE INDEX idx_client_followups_client ON public.client_followups(client_id);
CREATE INDEX idx_client_followups_status ON public.client_followups(status);
CREATE INDEX idx_client_followups_due_date ON public.client_followups(due_date);
CREATE INDEX idx_client_followups_created_at ON public.client_followups(created_at DESC);
CREATE INDEX idx_followup_documents_followup_id ON public.followup_documents(followup_id);

-- Add full-text search index for global and client-specific search
CREATE INDEX idx_client_followups_search ON public.client_followups 
  USING gin(to_tsvector('english', coalesce(subject, '') || ' ' || coalesce(message_text, '') || ' ' || coalesce(response_text, '') || ' ' || coalesce(notes, '')));

-- Add index for client-specific searches
CREATE INDEX idx_client_followups_client_search ON public.client_followups(client_id, created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_client_followups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_followups_updated_at
  BEFORE UPDATE ON public.client_followups
  FOR EACH ROW
  EXECUTE FUNCTION update_client_followups_updated_at();

-- Create client_notes table for timestamped note entries
CREATE TABLE IF NOT EXISTS public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.dyh_practice_clients(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

-- Tax agents can view all notes
CREATE POLICY "Tax agents can view all client notes"
  ON public.client_notes
  FOR SELECT
  USING (true);

-- Tax agents can insert notes
CREATE POLICY "Tax agents can insert client notes"
  ON public.client_notes
  FOR INSERT
  WITH CHECK (true);

-- Tax agents can update notes
CREATE POLICY "Tax agents can update client notes"
  ON public.client_notes
  FOR UPDATE
  USING (true);

-- Tax agents can delete notes
CREATE POLICY "Tax agents can delete client notes"
  ON public.client_notes
  FOR DELETE
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON public.client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_created_at ON public.client_notes(created_at DESC);

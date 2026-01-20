-- Add client_type column to dyh_practice_clients table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dyh_practice_clients' 
    AND column_name = 'client_type'
  ) THEN
    ALTER TABLE public.dyh_practice_clients 
    ADD COLUMN client_type TEXT CHECK (client_type IN ('individual', 'sole_trader', 'partnership', 'company', 'trust', 'smsf'));
    
    CREATE INDEX idx_dyh_clients_type ON public.dyh_practice_clients(client_type);
  END IF;
END $$;

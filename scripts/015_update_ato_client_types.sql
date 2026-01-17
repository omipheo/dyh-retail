-- Update the ato_due_dates table to support 'company' client type
-- This extends the existing Individual and Trust system to include 30 June balancers

ALTER TABLE public.ato_due_dates 
DROP CONSTRAINT IF EXISTS ato_due_dates_client_type_check;

ALTER TABLE public.ato_due_dates 
ADD CONSTRAINT ato_due_dates_client_type_check 
CHECK (client_type IN ('individual', 'trust', 'partnership', 'company'));

-- Update the comment
COMMENT ON TABLE public.ato_due_dates IS 'ATO lodgment due dates schedule for Individual, Trust, Partnership, and Company clients (including 30 June balancers) based on 2025-2026 ATO guidelines';

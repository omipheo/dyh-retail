-- Add display_order column to preserve CSV import order
ALTER TABLE dyh_practice_clients
ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Create index for efficient sorting
CREATE INDEX IF NOT EXISTS idx_dyh_practice_clients_display_order 
ON dyh_practice_clients(display_order);

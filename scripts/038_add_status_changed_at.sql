-- Add status_changed_at column to track when archive/active status changes
ALTER TABLE dyh_practice_clients
ADD COLUMN IF NOT EXISTS status_changed_at timestamp with time zone DEFAULT now();

-- Set existing records to have the updated_at value as status_changed_at
UPDATE dyh_practice_clients
SET status_changed_at = updated_at
WHERE status_changed_at IS NULL;

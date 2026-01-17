-- Remove the status_changed_at column from dyh_practice_clients table
ALTER TABLE dyh_practice_clients DROP COLUMN IF EXISTS status_changed_at;

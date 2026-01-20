-- Add missing email column to dyh_practice_clients
ALTER TABLE dyh_practice_clients ADD COLUMN IF NOT EXISTS email TEXT;

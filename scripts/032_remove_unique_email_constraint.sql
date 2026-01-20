-- Remove unique email constraint to allow same email for different client types
-- (e.g., "john@email.com" for both "John Smith - Individual" and "John Smith Pty Ltd - Company")

ALTER TABLE dyh_practice_clients DROP CONSTRAINT IF EXISTS unique_client_email;

-- Add comment explaining why duplicates are allowed
COMMENT ON COLUMN dyh_practice_clients.email IS 'Email address - can be duplicated across different client types for same person/business';

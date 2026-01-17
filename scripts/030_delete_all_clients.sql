-- Delete all existing clients and related data
-- This allows for a fresh import of client data

-- Delete all client notes first (foreign key dependency)
DELETE FROM client_notes;

-- Delete all client group memberships
DELETE FROM client_group_members;

-- Delete all practice clients
DELETE FROM dyh_practice_clients;

-- Reset any sequences if needed
-- (Postgres will handle this automatically)

-- Verify deletion
DO $$
DECLARE
    client_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO client_count FROM dyh_practice_clients;
    RAISE NOTICE 'Remaining clients after cleanup: %', client_count;
END $$;

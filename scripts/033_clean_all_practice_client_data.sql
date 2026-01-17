-- Single script to clean all practice client data
-- Removes all clients, notes, and group memberships in one transaction

BEGIN;

-- Delete client notes first (foreign key dependency)
DELETE FROM client_notes WHERE client_id IN (SELECT id FROM dyh_practice_clients);

-- Delete client group memberships (foreign key dependency)
DELETE FROM client_group_members WHERE client_id IN (SELECT id FROM dyh_practice_clients);

-- Delete all practice clients
DELETE FROM dyh_practice_clients;

-- Reset any sequences (if needed)
-- Note: UUIDs don't use sequences

COMMIT;

-- Verify cleanup
SELECT 'Cleanup complete. Client count: ' || COUNT(*) FROM dyh_practice_clients;

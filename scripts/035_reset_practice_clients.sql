-- Reset all practice client data for clean re-import
-- This deletes all clients, notes, and group memberships

BEGIN;

-- Delete all client notes
DELETE FROM client_notes;

-- Delete all client group memberships
DELETE FROM client_group_members;

-- Delete all practice clients
DELETE FROM dyh_practice_clients;

COMMIT;

-- Verify deletion
SELECT 'Clients remaining: ' || COUNT(*) FROM dyh_practice_clients;
SELECT 'Notes remaining: ' || COUNT(*) FROM client_notes;
SELECT 'Group memberships remaining: ' || COUNT(*) FROM client_group_members;

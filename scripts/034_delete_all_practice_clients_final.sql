-- Delete all practice clients and related data
-- This removes all client records, notes, and group memberships

BEGIN;

-- Delete all client notes
DELETE FROM client_notes WHERE client_id IN (SELECT id FROM dyh_practice_clients);

-- Delete all client group memberships
DELETE FROM client_group_members WHERE client_id IN (SELECT id FROM dyh_practice_clients);

-- Delete all practice clients
DELETE FROM dyh_practice_clients;

COMMIT;

-- Verify cleanup
SELECT 'All practice clients deleted' as status, 
       (SELECT COUNT(*) FROM dyh_practice_clients) as remaining_clients;

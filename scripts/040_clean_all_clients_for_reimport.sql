-- Delete all existing practice clients and related data
-- This prepares for a clean reimport of Active and Archived CSV files

BEGIN;

-- Delete all client notes
DELETE FROM client_notes;

-- Delete all client group memberships
DELETE FROM client_group_members;

-- Delete all practice clients
DELETE FROM dyh_practice_clients;

COMMIT;

-- Verify deletion
SELECT 
    (SELECT COUNT(*) FROM dyh_practice_clients) as remaining_clients,
    (SELECT COUNT(*) FROM client_notes) as remaining_notes,
    (SELECT COUNT(*) FROM client_group_members) as remaining_memberships;

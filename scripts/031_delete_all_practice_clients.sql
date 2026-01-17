-- Delete all practice clients for clean re-import
-- This removes all existing client data to allow fresh CSV import

-- First, delete all related client notes
DELETE FROM client_notes WHERE client_id IN (SELECT id FROM dyh_practice_clients);

-- Delete all client group memberships
DELETE FROM client_group_members WHERE client_id IN (SELECT id FROM dyh_practice_clients);

-- Finally, delete all practice clients
DELETE FROM dyh_practice_clients;

-- Reset any sequences if needed
-- Note: Supabase handles UUID generation automatically, no sequence reset needed

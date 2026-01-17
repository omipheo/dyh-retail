DELETE FROM client_notes WHERE client_id IN (SELECT id FROM dyh_practice_clients);
DELETE FROM client_group_members WHERE client_id IN (SELECT id FROM dyh_practice_clients);
DELETE FROM dyh_practice_clients;

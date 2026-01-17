-- Clean up corrupted client data where email looks like a phone number
-- or phone_number looks like a name

-- Delete clients where email doesn't contain @ symbol (likely corrupted)
DELETE FROM dyh_practice_clients
WHERE email NOT LIKE '%@%';

-- Delete clients where email is all numbers (phone number got into email field)
DELETE FROM dyh_practice_clients
WHERE email ~ '^[0-9 ]+$';

-- Delete clients where full_name contains only one word and no comma (incomplete name)
DELETE FROM dyh_practice_clients
WHERE full_name NOT LIKE '% %' AND full_name NOT LIKE '%,%';

-- Update any remaining 'inactive' status to 'archived' for consistency
UPDATE dyh_practice_clients
SET status = 'archived'
WHERE status = 'inactive';

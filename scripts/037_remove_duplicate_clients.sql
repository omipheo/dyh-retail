-- Remove duplicate clients, keeping only the first occurrence of each unique name+email combination
DELETE FROM dyh_practice_clients
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY full_name, COALESCE(email, 'no-email'), COALESCE(phone_number, 'no-phone')
        ORDER BY created_at ASC
      ) as rn
    FROM dyh_practice_clients
  ) t
  WHERE rn > 1
);

-- This will keep 81 unique active clients (the first import)
-- After running this, upload the Archived CSV (13 clients) to reach 94 total

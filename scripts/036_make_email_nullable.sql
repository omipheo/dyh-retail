-- Make email column nullable to allow clients without email addresses
ALTER TABLE dyh_practice_clients 
ALTER COLUMN email DROP NOT NULL;

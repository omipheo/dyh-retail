-- Direct SQL import for 71 Active clients
-- Run this script to import your active clients directly

BEGIN;

-- Clear existing clients first
DELETE FROM client_notes;
DELETE FROM client_group_members;
DELETE FROM dyh_practice_clients;

-- Import active clients (you'll need to replace with actual data from your CSV)
-- This is a template - copy your CSV data here

INSERT INTO dyh_practice_clients (full_name, email, phone_number, status, questionnaire_data)
VALUES
  ('Amor Da Mota, Christina', 'cdamota7@gmail.com', NULL, 'active', '{"client_type": "Individual"}'),
  ('Amor Da Mota, Daniel', 'laadaniel29@gmail.com', NULL, 'active', '{"client_type": "Individual"}');
  -- Add remaining 69 clients here from your CSV

COMMIT;

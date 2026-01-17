-- Direct SQL import for 15 Archived clients

BEGIN;

-- Import archived clients (you'll need to replace with actual data from your CSV)
INSERT INTO dyh_practice_clients (full_name, email, phone_number, status, questionnaire_data)
VALUES
  ('Client One', 'email1@example.com', '1234567890', 'archived', '{"client_type": "Individual"}');
  -- Add remaining 14 clients here from your CSV

COMMIT;

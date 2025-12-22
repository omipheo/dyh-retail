-- Script to promote an existing user to Tax Agent status
-- Replace 'user@example.com' with the actual email address

-- First, let's create a function to promote a user to tax agent
CREATE OR REPLACE FUNCTION promote_to_tax_agent(
  user_email TEXT,
  tax_agent_number TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  result_message TEXT;
BEGIN
  -- Find the user by email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;

  -- Check if user exists
  IF user_id IS NULL THEN
    RETURN 'Error: User not found with email ' || user_email;
  END IF;

  -- Update the profile role
  UPDATE public.profiles
  SET 
    role = 'tax_agent',
    tax_agent_number = COALESCE(tax_agent_number, 'PENDING'),
    updated_at = NOW()
  WHERE id = user_id;

  -- Update the auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"tax_agent"'::jsonb
  )
  WHERE id = user_id;

  result_message := 'Success: User ' || user_email || ' has been promoted to Tax Agent with ID ' || user_id::TEXT;
  
  -- Log the promotion in audit log
  INSERT INTO public.audit_logs (
    user_id,
    table_name,
    action,
    details
  ) VALUES (
    user_id,
    'profiles',
    'PROMOTE',
    jsonb_build_object(
      'promoted_to', 'tax_agent',
      'tax_agent_number', COALESCE(tax_agent_number, 'PENDING')
    )
  );

  RETURN result_message;
END;
$$;

-- USAGE EXAMPLES:

-- Example 1: Promote user without tax agent number (can add later)
-- SELECT promote_to_tax_agent('user@example.com');

-- Example 2: Promote user with tax agent number
-- SELECT promote_to_tax_agent('user@example.com', '12345678');

-- To promote YOUR account, run one of these:
-- SELECT promote_to_tax_agent('your-email@example.com');
-- SELECT promote_to_tax_agent('your-email@example.com', 'your-tax-agent-number');

-- After running this script, the user will need to log out and log back in
-- for the changes to take effect in their session.

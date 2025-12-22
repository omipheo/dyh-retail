-- Optional: Script to demote a tax agent back to end user
-- This is useful if you accidentally promote the wrong account

CREATE OR REPLACE FUNCTION demote_to_end_user(
  user_email TEXT
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
    role = 'end_user',
    tax_agent_number = NULL,
    updated_at = NOW()
  WHERE id = user_id;

  -- Update the auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"end_user"'::jsonb
  )
  WHERE id = user_id;

  result_message := 'Success: User ' || user_email || ' has been demoted to End User';
  
  -- Log the demotion in audit log
  INSERT INTO public.audit_logs (
    user_id,
    table_name,
    action,
    details
  ) VALUES (
    user_id,
    'profiles',
    'DEMOTE',
    jsonb_build_object(
      'demoted_to', 'end_user'
    )
  );

  RETURN result_message;
END;
$$;

-- USAGE:
-- SELECT demote_to_end_user('user@example.com');

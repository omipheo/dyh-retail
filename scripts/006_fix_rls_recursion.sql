-- Fix infinite recursion in RLS policies
-- The issue: policies that query the same table they're protecting cause recursion

-- ================================================
-- CREATE SECURITY DEFINER FUNCTIONS TO BYPASS RLS
-- ================================================

-- Function to check if user is a tax agent (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_tax_agent(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'tax_agent'
  );
END;
$$;

-- Function to check if agent is assigned to client (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_assigned_agent(client_id UUID, agent_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.client_agent_relationships
    WHERE client_agent_relationships.agent_id = is_assigned_agent.agent_id
    AND client_agent_relationships.client_id = is_assigned_agent.client_id
    AND is_active = true
  );
END;
$$;

-- ================================================
-- DROP ALL EXISTING PROFILES POLICIES
-- ================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Tax agents can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Tax agents can view assigned client profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Tax agents view assigned clients" ON public.profiles;

-- ================================================
-- CREATE NON-RECURSIVE PROFILES POLICIES
-- ================================================

-- Using SECURITY DEFINER functions instead of direct queries
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Tax agents can view assigned clients using helper function
CREATE POLICY "Tax agents view assigned clients"
  ON public.profiles FOR SELECT
  USING (
    public.is_tax_agent() AND (
      auth.uid() = id OR -- Own profile
      public.is_assigned_agent(id) -- Assigned client
    )
  );

-- ================================================
-- FIX OTHER TABLE POLICIES TO AVOID RECURSION
-- ================================================

-- Drop and recreate questionnaire policies without recursion
DROP POLICY IF EXISTS "Tax agents can view all questionnaire responses" ON public.questionnaire_responses;
DROP POLICY IF EXISTS "Tax agents can view assigned client questionnaires" ON public.questionnaire_responses;
DROP POLICY IF EXISTS "Tax agents view assigned questionnaires" ON public.questionnaire_responses;

-- Using helper function
CREATE POLICY "Tax agents view assigned questionnaires"
  ON public.questionnaire_responses FOR SELECT
  USING (
    public.is_tax_agent() AND public.is_assigned_agent(user_id)
  );

-- Drop and recreate documents policies without recursion
DROP POLICY IF EXISTS "Tax agents can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Tax agents can view assigned client documents" ON public.documents;
DROP POLICY IF EXISTS "Tax agents view assigned documents" ON public.documents;

-- Using helper function
CREATE POLICY "Tax agents view assigned documents"
  ON public.documents FOR SELECT
  USING (
    public.is_tax_agent() AND public.is_assigned_agent(user_id)
  );

-- Drop and recreate usage tracking policies without recursion
DROP POLICY IF EXISTS "Tax agents can view all usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Tax agents can view assigned client usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Tax agents view assigned usage" ON public.usage_tracking;

-- Using helper function
CREATE POLICY "Tax agents view assigned usage"
  ON public.usage_tracking FOR SELECT
  USING (
    public.is_tax_agent() AND public.is_assigned_agent(user_id)
  );

-- Fix reference documents policies
DROP POLICY IF EXISTS "Tax agents can insert reference documents" ON public.reference_documents;
DROP POLICY IF EXISTS "Tax agents can update reference documents" ON public.reference_documents;
DROP POLICY IF EXISTS "Tax agents can delete reference documents" ON public.reference_documents;
DROP POLICY IF EXISTS "Tax agents insert reference docs" ON public.reference_documents;
DROP POLICY IF EXISTS "Tax agents update reference docs" ON public.reference_documents;
DROP POLICY IF EXISTS "Tax agents delete reference docs" ON public.reference_documents;

-- Using helper function
CREATE POLICY "Tax agents insert reference docs"
  ON public.reference_documents FOR INSERT
  WITH CHECK (public.is_tax_agent());

CREATE POLICY "Tax agents update reference docs"
  ON public.reference_documents FOR UPDATE
  USING (public.is_tax_agent());

CREATE POLICY "Tax agents delete reference docs"
  ON public.reference_documents FOR DELETE
  USING (public.is_tax_agent());

-- Fix audit logs policies
DROP POLICY IF EXISTS "Tax agents can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Tax agents view audit logs" ON public.audit_logs;

-- Using helper function
CREATE POLICY "Tax agents view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_tax_agent());

-- ================================================
-- GRANT EXECUTE PERMISSIONS ON FUNCTIONS
-- ================================================

GRANT EXECUTE ON FUNCTION public.is_tax_agent(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_assigned_agent(UUID, UUID) TO authenticated;

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON FUNCTION public.is_tax_agent(UUID) IS 
  'Checks if user is a tax agent using SECURITY DEFINER to bypass RLS and prevent infinite recursion';

COMMENT ON FUNCTION public.is_assigned_agent(UUID, UUID) IS 
  'Checks if agent is assigned to client using SECURITY DEFINER to bypass RLS';

COMMENT ON POLICY "Tax agents view assigned clients" ON public.profiles IS 
  'Uses SECURITY DEFINER functions instead of querying profiles table directly to avoid infinite recursion';

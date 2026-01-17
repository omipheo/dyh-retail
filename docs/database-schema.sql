-- Complete DYH Explorer Schema Migration
-- This script is idempotent - safe to run multiple times

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add role column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'client';
  END IF;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =====================================================
-- QUESTIONNAIRE RESPONSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  business_name TEXT,
  abn TEXT,
  business_structure TEXT,
  business_description TEXT,
  home_office_area DECIMAL,
  total_home_area DECIMAL,
  home_office_percentage DECIMAL,
  rent_mortgage DECIMAL DEFAULT 0,
  electricity DECIMAL DEFAULT 0,
  internet DECIMAL DEFAULT 0,
  phone DECIMAL DEFAULT 0,
  cleaning DECIMAL DEFAULT 0,
  repairs DECIMAL DEFAULT 0,
  insurance DECIMAL DEFAULT 0,
  rates DECIMAL DEFAULT 0,
  other_expenses DECIMAL DEFAULT 0,
  total_home_expenses DECIMAL,
  total_deduction DECIMAL,
  tax_savings DECIMAL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "questionnaires_select_own" ON public.questionnaire_responses;
CREATE POLICY "questionnaires_select_own" ON public.questionnaire_responses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "questionnaires_insert_own" ON public.questionnaire_responses;
CREATE POLICY "questionnaires_insert_own" ON public.questionnaire_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "questionnaires_update_own" ON public.questionnaire_responses;
CREATE POLICY "questionnaires_update_own" ON public.questionnaire_responses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "questionnaires_delete_own" ON public.questionnaire_responses;
CREATE POLICY "questionnaires_delete_own" ON public.questionnaire_responses FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT,
  phase TEXT,
  amount DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- FORM SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.form_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  questionnaire_type TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

ALTER TABLE public.form_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view their session with token" ON public.form_sessions;
CREATE POLICY "Anyone can view their session with token" ON public.form_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert form sessions" ON public.form_sessions;
CREATE POLICY "Anyone can insert form sessions" ON public.form_sessions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update their session with token" ON public.form_sessions;
CREATE POLICY "Anyone can update their session with token" ON public.form_sessions FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS form_sessions_token_idx ON public.form_sessions(session_token);
CREATE INDEX IF NOT EXISTS form_sessions_email_idx ON public.form_sessions(email);
CREATE INDEX IF NOT EXISTS form_sessions_expires_at_idx ON public.form_sessions(expires_at);

-- =====================================================
-- DYH EXPLORER PROSPECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.dyh_explorer_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  street_address TEXT,
  suburb TEXT,
  state TEXT,
  postcode TEXT,
  questionnaire_data JSONB,
  strategy_selector_data JSONB,
  status TEXT DEFAULT 'prospect',
  source TEXT DEFAULT 'dyh_explorer',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_prospect_email UNIQUE (email)
);

ALTER TABLE public.dyh_explorer_prospects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own prospect data" ON public.dyh_explorer_prospects;
CREATE POLICY "Users can view own prospect data" ON public.dyh_explorer_prospects FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own prospect data" ON public.dyh_explorer_prospects;
CREATE POLICY "Users can insert own prospect data" ON public.dyh_explorer_prospects FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own prospect data" ON public.dyh_explorer_prospects;
CREATE POLICY "Users can update own prospect data" ON public.dyh_explorer_prospects FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Tax agents can view all prospects" ON public.dyh_explorer_prospects;
CREATE POLICY "Tax agents can view all prospects" ON public.dyh_explorer_prospects FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'tax_agent')
);

CREATE INDEX IF NOT EXISTS idx_prospects_email ON public.dyh_explorer_prospects(email);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON public.dyh_explorer_prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_created_at ON public.dyh_explorer_prospects(created_at DESC);

-- =====================================================
-- DYH PRACTICE CLIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.dyh_practice_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prospect_id UUID REFERENCES public.dyh_explorer_prospects(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  street_address TEXT,
  suburb TEXT,
  state TEXT,
  postcode TEXT,
  questionnaire_data JSONB NOT NULL,
  strategy_selector_data JSONB,
  purchase_id UUID,
  purchased_product TEXT,
  amount_paid INTEGER,
  status TEXT DEFAULT 'active',
  client_type TEXT DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contact_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_client_email UNIQUE (email)
);

ALTER TABLE public.dyh_practice_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own client data" ON public.dyh_practice_clients;
CREATE POLICY "Users can view own client data" ON public.dyh_practice_clients FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Tax agents can view all clients" ON public.dyh_practice_clients;
CREATE POLICY "Tax agents can view all clients" ON public.dyh_practice_clients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'tax_agent')
);

DROP POLICY IF EXISTS "Tax agents can update all clients" ON public.dyh_practice_clients;
CREATE POLICY "Tax agents can update all clients" ON public.dyh_practice_clients FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'tax_agent')
);

DROP POLICY IF EXISTS "System can insert clients" ON public.dyh_practice_clients;
CREATE POLICY "System can insert clients" ON public.dyh_practice_clients FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_clients_email ON public.dyh_practice_clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.dyh_practice_clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_prospect_id ON public.dyh_practice_clients(prospect_id);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Profile trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data ->> 'full_name', null))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_prospects_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prospects_updated_at ON public.dyh_explorer_prospects;
CREATE TRIGGER trigger_prospects_updated_at BEFORE UPDATE ON public.dyh_explorer_prospects FOR EACH ROW EXECUTE FUNCTION update_prospects_updated_at();

CREATE OR REPLACE FUNCTION update_clients_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_clients_updated_at ON public.dyh_practice_clients;
CREATE TRIGGER trigger_clients_updated_at BEFORE UPDATE ON public.dyh_practice_clients FOR EACH ROW EXECUTE FUNCTION update_clients_updated_at();

-- Cleanup function for expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS void AS $$
BEGIN DELETE FROM form_sessions WHERE expires_at < NOW(); END;
$$ LANGUAGE plpgsql;

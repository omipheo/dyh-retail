-- Create FBT Returns Schedule for Fringe Benefits Tax
-- Based on ATO registered agent lodgment program due dates

-- ================================================
-- FBT RETURNS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.ato_fbt_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lodgment_method TEXT NOT NULL CHECK (lodgment_method IN ('electronic', 'paper')),
  due_date DATE NOT NULL,
  financial_year TEXT NOT NULL, -- e.g., '2025-2026'
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'reminded', 'in_progress', 'lodged', 'overdue')) DEFAULT 'upcoming',
  work_started_at TIMESTAMP WITH TIME ZONE,
  lodged_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- FBT REMINDER HISTORY TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.ato_fbt_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fbt_return_id UUID NOT NULL REFERENCES public.ato_fbt_returns(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('six_month', 'thirty_day_followup')),
  scheduled_for DATE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'sent', 'cancelled')) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================
ALTER TABLE public.ato_fbt_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ato_fbt_reminders ENABLE ROW LEVEL SECURITY;

-- Clients can view their own FBT returns
CREATE POLICY "Clients can view their own FBT returns"
  ON public.ato_fbt_returns FOR SELECT
  USING (auth.uid() = client_id);

-- Tax agents can view all FBT returns
CREATE POLICY "Tax agents can view all FBT returns"
  ON public.ato_fbt_returns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Tax agents can manage FBT returns
CREATE POLICY "Tax agents can insert FBT returns"
  ON public.ato_fbt_returns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can update FBT returns"
  ON public.ato_fbt_returns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- FBT Reminder policies
CREATE POLICY "Tax agents can view all FBT reminders"
  ON public.ato_fbt_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "System can manage FBT reminders"
  ON public.ato_fbt_reminders FOR ALL
  USING (true)
  WITH CHECK (true);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX idx_ato_fbt_returns_client_id ON public.ato_fbt_returns(client_id);
CREATE INDEX idx_ato_fbt_returns_due_date ON public.ato_fbt_returns(due_date);
CREATE INDEX idx_ato_fbt_returns_status ON public.ato_fbt_returns(status);
CREATE INDEX idx_ato_fbt_returns_lodgment_method ON public.ato_fbt_returns(lodgment_method);

CREATE INDEX idx_ato_fbt_reminders_fbt_return_id ON public.ato_fbt_reminders(fbt_return_id);
CREATE INDEX idx_ato_fbt_reminders_scheduled_for ON public.ato_fbt_reminders(scheduled_for);
CREATE INDEX idx_ato_fbt_reminders_status ON public.ato_fbt_reminders(status) WHERE status = 'scheduled';

-- ================================================
-- UPDATED_AT TRIGGER
-- ================================================
CREATE OR REPLACE FUNCTION update_ato_fbt_returns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ato_fbt_returns_updated_at
  BEFORE UPDATE ON public.ato_fbt_returns
  FOR EACH ROW
  EXECUTE FUNCTION update_ato_fbt_returns_updated_at();

-- ================================================
-- SEED FBT RETURNS FOR 2026 FINANCIAL YEAR
-- ================================================
-- This function seeds FBT return due dates for all clients

CREATE OR REPLACE FUNCTION seed_fbt_returns()
RETURNS void AS $$
DECLARE
  client_record RECORD;
BEGIN
  -- Loop through all end_user clients
  FOR client_record IN 
    SELECT id FROM auth.users 
    WHERE id IN (SELECT id FROM public.profiles WHERE role = 'end_user')
  LOOP
    -- Electronic lodgment via practitioner service - Due 25 June 2026
    INSERT INTO public.ato_fbt_returns (client_id, lodgment_method, due_date, financial_year)
    VALUES 
      (client_record.id, 'electronic', '2026-06-25', '2025-2026')
    ON CONFLICT DO NOTHING;
    
    -- Paper lodgment - Due 21 May 2026
    INSERT INTO public.ato_fbt_returns (client_id, lodgment_method, due_date, financial_year)
    VALUES
      (client_record.id, 'paper', '2026-05-21', '2025-2026')
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- AUTO-GENERATE FBT REMINDERS FUNCTION
-- ================================================
-- This function creates reminder schedules: 6 months before due date, then every 30 days if not started

CREATE OR REPLACE FUNCTION generate_fbt_reminders()
RETURNS void AS $$
DECLARE
  fbt_record RECORD;
  six_month_reminder_date DATE;
  current_reminder_date DATE;
BEGIN
  -- Loop through all upcoming FBT returns that don't have reminders yet
  FOR fbt_record IN 
    SELECT * FROM public.ato_fbt_returns 
    WHERE status IN ('upcoming', 'reminded')
  LOOP
    -- Calculate 6-month-before date
    six_month_reminder_date := fbt_record.due_date - INTERVAL '6 months';
    
    -- Insert 6-month reminder if it doesn't exist and is in the future
    IF six_month_reminder_date >= CURRENT_DATE THEN
      INSERT INTO public.ato_fbt_reminders (fbt_return_id, client_id, reminder_type, scheduled_for)
      VALUES (fbt_record.id, fbt_record.client_id, 'six_month', six_month_reminder_date)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- If work hasn't started and 6-month date has passed, generate 30-day follow-ups
    IF fbt_record.work_started_at IS NULL AND six_month_reminder_date < CURRENT_DATE THEN
      current_reminder_date := six_month_reminder_date + INTERVAL '30 days';
      
      -- Generate 30-day reminders until due date
      WHILE current_reminder_date < fbt_record.due_date LOOP
        INSERT INTO public.ato_fbt_reminders (fbt_return_id, client_id, reminder_type, scheduled_for)
        VALUES (fbt_record.id, fbt_record.client_id, 'thirty_day_followup', current_reminder_date)
        ON CONFLICT DO NOTHING;
        
        current_reminder_date := current_reminder_date + INTERVAL '30 days';
      END LOOP;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================
COMMENT ON TABLE public.ato_fbt_returns IS 'FBT (Fringe Benefits Tax) return lodgment schedule for 2025-2026 based on ATO registered agent program';
COMMENT ON TABLE public.ato_fbt_reminders IS 'Automated FBT reminder tracking: 6 months before due date, then every 30 days if work not started';
COMMENT ON FUNCTION seed_fbt_returns() IS 'Seeds FBT return due dates for electronic (25 June) and paper (21 May) lodgments';
COMMENT ON FUNCTION generate_fbt_reminders() IS 'Generates FBT reminder schedule: 6-month advance notice + 30-day follow-ups if work not started';

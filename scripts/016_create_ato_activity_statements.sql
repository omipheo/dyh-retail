-- Create ATO Activity Statements Schedule and Reminder System
-- Based on Australian Tax Office BAS lodgment dates
-- Reminders: 30 days before due date, then every 7 days thereafter if not started

-- ================================================
-- ATO ACTIVITY STATEMENTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.ato_activity_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  statement_type TEXT NOT NULL CHECK (statement_type IN ('monthly', 'quarterly_payg', 'quarterly_electronic', 'quarterly_standard')),
  period TEXT NOT NULL, -- e.g., 'January 2026', 'Q1 2026', 'Q2 July-September'
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'reminded', 'in_progress', 'lodged', 'overdue')) DEFAULT 'upcoming',
  work_started_at TIMESTAMP WITH TIME ZONE,
  lodged_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- ACTIVITY STATEMENT REMINDER HISTORY TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.ato_activity_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID NOT NULL REFERENCES public.ato_activity_statements(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('thirty_day', 'seven_day_followup')),
  scheduled_for DATE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'sent', 'cancelled')) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================
ALTER TABLE public.ato_activity_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ato_activity_reminders ENABLE ROW LEVEL SECURITY;

-- Clients can view their own activity statements
CREATE POLICY "Clients can view their own activity statements"
  ON public.ato_activity_statements FOR SELECT
  USING (auth.uid() = client_id);

-- Tax agents can view all activity statements
CREATE POLICY "Tax agents can view all activity statements"
  ON public.ato_activity_statements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Tax agents can manage activity statements
CREATE POLICY "Tax agents can insert activity statements"
  ON public.ato_activity_statements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can update activity statements"
  ON public.ato_activity_statements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Reminder policies
CREATE POLICY "Tax agents can view all activity reminders"
  ON public.ato_activity_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "System can manage activity reminders"
  ON public.ato_activity_reminders FOR ALL
  USING (true)
  WITH CHECK (true);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX idx_ato_activity_statements_client_id ON public.ato_activity_statements(client_id);
CREATE INDEX idx_ato_activity_statements_due_date ON public.ato_activity_statements(due_date);
CREATE INDEX idx_ato_activity_statements_status ON public.ato_activity_statements(status);
CREATE INDEX idx_ato_activity_statements_type ON public.ato_activity_statements(statement_type);

CREATE INDEX idx_ato_activity_reminders_statement_id ON public.ato_activity_reminders(statement_id);
CREATE INDEX idx_ato_activity_reminders_scheduled_for ON public.ato_activity_reminders(scheduled_for);
CREATE INDEX idx_ato_activity_reminders_status ON public.ato_activity_reminders(status) WHERE status = 'scheduled';

-- ================================================
-- UPDATED_AT TRIGGER
-- ================================================
CREATE OR REPLACE FUNCTION update_ato_activity_statements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ato_activity_statements_updated_at
  BEFORE UPDATE ON public.ato_activity_statements
  FOR EACH ROW
  EXECUTE FUNCTION update_ato_activity_statements_updated_at();

-- ================================================
-- SEED ATO ACTIVITY STATEMENTS 2025-2026
-- ================================================
-- This function seeds all activity statement due dates based on ATO schedule

CREATE OR REPLACE FUNCTION seed_ato_activity_statements()
RETURNS void AS $$
DECLARE
  client_record RECORD;
  current_year INT := 2025;
  next_year INT := 2026;
BEGIN
  -- Loop through all business clients
  FOR client_record IN 
    SELECT id FROM auth.users 
    WHERE id IN (SELECT id FROM public.profiles WHERE role = 'end_user')
  LOOP
    -- Monthly Activity Statements - due on 21st of each month (for previous month)
    INSERT INTO public.ato_activity_statements (client_id, statement_type, period, due_date)
    VALUES
      (client_record.id, 'monthly', 'January 2026', '2026-02-21'),
      (client_record.id, 'monthly', 'February 2026', '2026-03-21'),
      (client_record.id, 'monthly', 'March 2026', '2026-04-21'),
      (client_record.id, 'monthly', 'April 2026', '2026-05-21'),
      (client_record.id, 'monthly', 'May 2026', '2026-06-21'),
      (client_record.id, 'monthly', 'June 2026', '2026-07-21'),
      (client_record.id, 'monthly', 'July 2026', '2026-08-21'),
      (client_record.id, 'monthly', 'August 2026', '2026-09-21'),
      (client_record.id, 'monthly', 'September 2026', '2026-10-21'),
      (client_record.id, 'monthly', 'October 2026', '2026-11-21'),
      (client_record.id, 'monthly', 'November 2026', '2026-12-21'),
      (client_record.id, 'monthly', 'December 2026', '2027-01-21')
    ON CONFLICT DO NOTHING;
    
    -- Quarter PAYG Instalment (for head companies of consolidated groups)
    INSERT INTO public.ato_activity_statements (client_id, statement_type, period, due_date)
    VALUES
      (client_record.id, 'quarterly_payg', 'Q4 April-June 2025', '2025-07-21'),
      (client_record.id, 'quarterly_payg', 'Q1 July-September 2025', '2025-10-21'),
      (client_record.id, 'quarterly_payg', 'Q2 October-December 2025', '2026-01-21'),
      (client_record.id, 'quarterly_payg', 'Q3 January-March 2026', '2026-04-21'),
      (client_record.id, 'quarterly_payg', 'Q4 April-June 2026', '2026-07-21')
    ON CONFLICT DO NOTHING;
    
    -- Quarterly Activity Statements (lodged electronically)
    INSERT INTO public.ato_activity_statements (client_id, statement_type, period, due_date)
    VALUES
      (client_record.id, 'quarterly_electronic', 'Q4 April-June 2025', '2025-08-11'),
      (client_record.id, 'quarterly_electronic', 'Q1 July-September 2025', '2025-11-11'),
      (client_record.id, 'quarterly_electronic', 'Q2 October-December 2025', '2026-02-28'),
      (client_record.id, 'quarterly_electronic', 'Q3 January-March 2026', '2026-05-12'),
      (client_record.id, 'quarterly_electronic', 'Q4 April-June 2026', '2026-08-11')
    ON CONFLICT DO NOTHING;
    
    -- All Other Quarterly Activity Statements
    INSERT INTO public.ato_activity_statements (client_id, statement_type, period, due_date)
    VALUES
      (client_record.id, 'quarterly_standard', 'Q4 April-June 2025', '2025-07-28'),
      (client_record.id, 'quarterly_standard', 'Q1 July-September 2025', '2025-10-28'),
      (client_record.id, 'quarterly_standard', 'Q2 October-December 2025', '2026-02-28'),
      (client_record.id, 'quarterly_standard', 'Q3 January-March 2026', '2026-04-28'),
      (client_record.id, 'quarterly_standard', 'Q4 April-June 2026', '2026-07-28')
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- AUTO-GENERATE ACTIVITY STATEMENT REMINDERS
-- ================================================
-- This function creates reminder schedules: 30 days before due date, then every 7 days if not started

CREATE OR REPLACE FUNCTION generate_ato_activity_reminders()
RETURNS void AS $$
DECLARE
  statement_record RECORD;
  thirty_day_reminder_date DATE;
  current_reminder_date DATE;
BEGIN
  -- Loop through all upcoming activity statements that don't have reminders yet
  FOR statement_record IN 
    SELECT * FROM public.ato_activity_statements 
    WHERE status IN ('upcoming', 'reminded')
  LOOP
    -- Calculate 30-day-before date
    thirty_day_reminder_date := statement_record.due_date - INTERVAL '30 days';
    
    -- Insert 30-day reminder if it doesn't exist and is in the future
    IF thirty_day_reminder_date >= CURRENT_DATE THEN
      INSERT INTO public.ato_activity_reminders (statement_id, client_id, reminder_type, scheduled_for)
      VALUES (statement_record.id, statement_record.client_id, 'thirty_day', thirty_day_reminder_date)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- If work hasn't started and 30-day date has passed, generate 7-day follow-ups
    IF statement_record.work_started_at IS NULL AND thirty_day_reminder_date < CURRENT_DATE THEN
      current_reminder_date := thirty_day_reminder_date + INTERVAL '7 days';
      
      -- Generate 7-day reminders until due date
      WHILE current_reminder_date < statement_record.due_date LOOP
        INSERT INTO public.ato_activity_reminders (statement_id, client_id, reminder_type, scheduled_for)
        VALUES (statement_record.id, statement_record.client_id, 'seven_day_followup', current_reminder_date)
        ON CONFLICT DO NOTHING;
        
        current_reminder_date := current_reminder_date + INTERVAL '7 days';
      END LOOP;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SEND ACTIVITY STATEMENT REMINDERS
-- ================================================
-- This function sends scheduled reminders by creating messages

CREATE OR REPLACE FUNCTION send_scheduled_activity_reminders()
RETURNS void AS $$
DECLARE
  reminder_record RECORD;
  agent_record RECORD;
  message_id UUID;
  client_name TEXT;
  statement_info TEXT;
BEGIN
  -- Loop through all scheduled reminders for today
  FOR reminder_record IN 
    SELECT r.*, s.statement_type, s.due_date, s.period
    FROM public.ato_activity_reminders r
    JOIN public.ato_activity_statements s ON s.id = r.statement_id
    WHERE r.status = 'scheduled' 
    AND r.scheduled_for <= CURRENT_DATE
  LOOP
    -- Get client name
    SELECT full_name INTO client_name 
    FROM public.profiles 
    WHERE id = reminder_record.client_id;
    
    -- Find assigned tax agent for this client
    SELECT agent_id INTO agent_record
    FROM public.client_agent_relationships
    WHERE client_id = reminder_record.client_id 
    AND is_active = true
    LIMIT 1;
    
    -- If no assigned agent, use first available tax agent
    IF agent_record IS NULL THEN
      SELECT id INTO agent_record
      FROM public.profiles
      WHERE role = 'tax_agent'
      LIMIT 1;
    END IF;
    
    -- Create reminder message
    statement_info := format(
      'BAS Reminder: %s Activity Statement - %s - Due %s',
      INITCAP(REPLACE(reminder_record.statement_type, '_', ' ')),
      reminder_record.period,
      reminder_record.due_date::TEXT
    );
    
    INSERT INTO public.messages (
      sender_id, 
      recipient_id, 
      subject, 
      message_text, 
      message_type, 
      priority
    ) VALUES (
      agent_record,
      reminder_record.client_id,
      statement_info,
      format(
        'Reminder: Your %s activity statement for %s is due on %s. Please contact your tax agent to prepare and lodge.',
        REPLACE(reminder_record.statement_type, '_', ' '),
        reminder_record.period,
        reminder_record.due_date::TEXT
      ),
      'system_alert',
      CASE 
        WHEN reminder_record.due_date - CURRENT_DATE <= 7 THEN 'urgent'
        WHEN reminder_record.due_date - CURRENT_DATE <= 14 THEN 'high'
        ELSE 'normal'
      END
    )
    RETURNING id INTO message_id;
    
    -- Update reminder status
    UPDATE public.ato_activity_reminders
    SET status = 'sent', sent_at = NOW(), message_id = message_id, agent_id = agent_record
    WHERE id = reminder_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================
COMMENT ON TABLE public.ato_activity_statements IS 'ATO Activity Statements (BAS) schedule for business clients based on ATO guidelines';
COMMENT ON TABLE public.ato_activity_reminders IS 'Automated reminder tracking: 30 days before due date, then every 7 days if work not started';
COMMENT ON FUNCTION generate_ato_activity_reminders() IS 'Generates reminder schedule: 30-day advance notice + 7-day follow-ups if work not started';
COMMENT ON FUNCTION send_scheduled_activity_reminders() IS 'Sends scheduled BAS reminders via messaging system to tax agents';
COMMENT ON FUNCTION seed_ato_activity_statements() IS 'Seeds all activity statement due dates for 2025-2026 financial year';

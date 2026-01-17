-- Create ATO Due Dates Schedule and Reminder System for Individual and Trust clients
-- Based on Australian Tax Office 2025-2026 lodgment dates

-- ================================================
-- ATO DUE DATES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.ato_due_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_type TEXT NOT NULL CHECK (client_type IN ('individual', 'trust', 'partnership', 'company')),
  lodgment_category TEXT NOT NULL,
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
-- ATO REMINDER HISTORY TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.ato_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  due_date_id UUID NOT NULL REFERENCES public.ato_due_dates(id) ON DELETE CASCADE,
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
ALTER TABLE public.ato_due_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ato_reminders ENABLE ROW LEVEL SECURITY;

-- Clients can view their own due dates
CREATE POLICY "Clients can view their own due dates"
  ON public.ato_due_dates FOR SELECT
  USING (auth.uid() = client_id);

-- Tax agents can view all due dates
CREATE POLICY "Tax agents can view all due dates"
  ON public.ato_due_dates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Tax agents can manage due dates
CREATE POLICY "Tax agents can insert due dates"
  ON public.ato_due_dates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can update due dates"
  ON public.ato_due_dates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Reminder policies
CREATE POLICY "Tax agents can view all reminders"
  ON public.ato_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "System can manage reminders"
  ON public.ato_reminders FOR ALL
  USING (true)
  WITH CHECK (true);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX idx_ato_due_dates_client_id ON public.ato_due_dates(client_id);
CREATE INDEX idx_ato_due_dates_due_date ON public.ato_due_dates(due_date);
CREATE INDEX idx_ato_due_dates_status ON public.ato_due_dates(status);
CREATE INDEX idx_ato_due_dates_client_type ON public.ato_due_dates(client_type);

CREATE INDEX idx_ato_reminders_due_date_id ON public.ato_reminders(due_date_id);
CREATE INDEX idx_ato_reminders_scheduled_for ON public.ato_reminders(scheduled_for);
CREATE INDEX idx_ato_reminders_status ON public.ato_reminders(status) WHERE status = 'scheduled';

-- ================================================
-- UPDATED_AT TRIGGER
-- ================================================
CREATE OR REPLACE FUNCTION update_ato_due_dates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ato_due_dates_updated_at
  BEFORE UPDATE ON public.ato_due_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_ato_due_dates_updated_at();

-- ================================================
-- SEED ATO 2025-2026 DUE DATES FOR INDIVIDUALS AND TRUSTS
-- ================================================
-- This function will be called to automatically populate due dates for all Individual and Trust clients

CREATE OR REPLACE FUNCTION seed_ato_due_dates_for_clients()
RETURNS void AS $$
DECLARE
  client_record RECORD;
BEGIN
  -- Loop through all end_user clients
  FOR client_record IN 
    SELECT id FROM auth.users 
    WHERE id IN (SELECT id FROM public.profiles WHERE role = 'end_user')
  LOOP
    -- Individual lodgment dates for 2025-2026
    INSERT INTO public.ato_due_dates (client_id, client_type, lodgment_category, due_date, financial_year)
    VALUES 
      (client_record.id, 'individual', 'Tax return for all individuals and trusts', '2025-10-31', '2025-2026'),
      (client_record.id, 'individual', 'Tax returns (for partnership, non-lodgment prior year or clients under tax equality)', '2026-05-15', '2025-2026')
    ON CONFLICT DO NOTHING;
    
    -- Trust lodgment dates for 2025-2026
    INSERT INTO public.ato_due_dates (client_id, client_type, lodgment_category, due_date, financial_year)
    VALUES
      (client_record.id, 'trust', 'Large and medium trusts (annual total income more than $10 million)', '2026-01-31', '2025-2026'),
      (client_record.id, 'trust', 'Small and medium trusts (annual total income more than $10 million in prior year)', '2026-02-28', '2025-2026'),
      (client_record.id, 'trust', 'New registrant large and medium trusts', '2026-02-28', '2025-2026'),
      (client_record.id, 'trust', 'Tax return for individuals and trusts with taxable income in tax equality of $30,000 or more', '2026-03-31', '2025-2026')
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SEED ATO 2025-2026 DUE DATES FOR 30 JUNE BALANCERS
-- ================================================
-- This function seeds 30 June balancers (companies and trusts) lodgment schedule for 2025-2026

CREATE OR REPLACE FUNCTION seed_ato_30_june_balancers()
RETURNS void AS $$
DECLARE
  client_record RECORD;
BEGIN
  -- Loop through all company and trust clients (30 June balancers)
  FOR client_record IN 
    SELECT id FROM auth.users 
    WHERE id IN (SELECT id FROM public.profiles WHERE role = 'end_user')
  LOOP
    -- 30 June balancers - Companies and Trusts lodgment dates
    INSERT INTO public.ato_due_dates (client_id, client_type, lodgment_category, due_date, financial_year)
    VALUES
      -- December dates
      (client_record.id, 'company', 'Companies and large and medium trusts (annual total income over $10 million) after completing their own lodgment as at 30 June', '2025-12-31', '2025-2026'),
      (client_record.id, 'company', 'Companies with a substituted accounting period (SAP) not taxable unless otherwise stated', '2025-12-01', '2025-2026'),
      
      -- January dates  
      (client_record.id, 'company', 'Companies with SAP and trusts whose income year began on 1 July and accounted for companies', '2026-01-31', '2025-2026'),
      (client_record.id, 'trust', 'Large and medium trusts (excludes testamentary trusts and deceased estates with gross income under $10 million)', '2026-01-31', '2025-2026'),
      
      -- February dates
      (client_record.id, 'company', 'Companies with SAP and small and medium trusts (annual total income under $10 million in the prior year)', '2026-02-28', '2025-2026'),
      (client_record.id, 'trust', 'Small and medium trusts (annual total income under $10 million in the prior year)', '2026-02-28', '2025-2026'),
      (client_record.id, 'trust', 'New registrant large and medium trusts', '2026-02-28', '2025-2026'),
      
      -- March dates
      (client_record.id, 'company', 'Tax return for individuals and trusts whose taxable income in a tax equality of $30,000 or more (including large and medium trusts)', '2026-03-31', '2025-2026'),
      
      -- May dates  
      (client_record.id, 'company', 'Companies who may not have an obligation to lodge but must advise us if they are not lodging for a year', '2026-05-15', '2025-2026'),
      (client_record.id, 'company', 'Companies with SAP (annual total income more than $10 million or a tax consolidated group that had been consolidated on or for all year)', '2026-05-15', '2025-2026'),
      
      -- June dates
      (client_record.id, 'company', 'Tax agent for companies and super funds (lodgment tax return not required)', '2026-06-02', '2025-2026')
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- AUTO-GENERATE REMINDERS FUNCTION
-- ================================================
-- This function creates reminder schedules: 6 months before due date, then every 30 days if not started

CREATE OR REPLACE FUNCTION generate_ato_reminders()
RETURNS void AS $$
DECLARE
  due_date_record RECORD;
  six_month_reminder_date DATE;
  current_reminder_date DATE;
BEGIN
  -- Loop through all upcoming due dates that don't have reminders yet
  FOR due_date_record IN 
    SELECT * FROM public.ato_due_dates 
    WHERE status IN ('upcoming', 'reminded')
  LOOP
    -- Calculate 6-month-before date
    six_month_reminder_date := due_date_record.due_date - INTERVAL '6 months';
    
    -- Insert 6-month reminder if it doesn't exist and is in the future
    IF six_month_reminder_date >= CURRENT_DATE THEN
      INSERT INTO public.ato_reminders (due_date_id, client_id, reminder_type, scheduled_for)
      VALUES (due_date_record.id, due_date_record.client_id, 'six_month', six_month_reminder_date)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- If work hasn't started and 6-month date has passed, generate 30-day follow-ups
    IF due_date_record.work_started_at IS NULL AND six_month_reminder_date < CURRENT_DATE THEN
      current_reminder_date := six_month_reminder_date + INTERVAL '30 days';
      
      -- Generate 30-day reminders until due date
      WHILE current_reminder_date < due_date_record.due_date LOOP
        INSERT INTO public.ato_reminders (due_date_id, client_id, reminder_type, scheduled_for)
        VALUES (due_date_record.id, due_date_record.client_id, 'thirty_day_followup', current_reminder_date)
        ON CONFLICT DO NOTHING;
        
        current_reminder_date := current_reminder_date + INTERVAL '30 days';
      END LOOP;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SEND REMINDERS FUNCTION
-- ================================================
-- This function sends scheduled reminders by creating messages

CREATE OR REPLACE FUNCTION send_scheduled_ato_reminders()
RETURNS void AS $$
DECLARE
  reminder_record RECORD;
  agent_record RECORD;
  message_id UUID;
  client_name TEXT;
  due_date_info TEXT;
BEGIN
  -- Loop through all scheduled reminders for today
  FOR reminder_record IN 
    SELECT r.*, d.lodgment_category, d.due_date, d.client_type
    FROM public.ato_reminders r
    JOIN public.ato_due_dates d ON d.id = r.due_date_id
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
    due_date_info := format(
      'ATO Reminder: %s (%s) - Due %s',
      reminder_record.lodgment_category,
      reminder_record.client_type,
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
      due_date_info,
      format(
        'Reminder: %s tax return is due on %s. Please contact your tax agent to begin preparation.',
        INITCAP(reminder_record.client_type),
        reminder_record.due_date::TEXT
      ),
      'system_alert',
      CASE 
        WHEN reminder_record.due_date - CURRENT_DATE <= 30 THEN 'urgent'
        WHEN reminder_record.due_date - CURRENT_DATE <= 60 THEN 'high'
        ELSE 'normal'
      END
    )
    RETURNING id INTO message_id;
    
    -- Update reminder status
    UPDATE public.ato_reminders
    SET status = 'sent', sent_at = NOW(), message_id = message_id, agent_id = agent_record
    WHERE id = reminder_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================
COMMENT ON TABLE public.ato_due_dates IS 'ATO lodgment due dates schedule for Individual, Trust, and Company clients based on 2025-2026 ATO guidelines';
COMMENT ON TABLE public.ato_reminders IS 'Automated reminder tracking: 6 months before due date, then every 30 days if work not started';
COMMENT ON FUNCTION generate_ato_reminders() IS 'Generates reminder schedule: 6-month advance notice + 30-day follow-ups if work not started';
COMMENT ON FUNCTION send_scheduled_ato_reminders() IS 'Sends scheduled reminders via messaging system to tax agents';
COMMENT ON FUNCTION seed_ato_30_june_balancers() IS 'Seeds 30 June balancers (companies and trusts) lodgment schedule for 2025-2026';

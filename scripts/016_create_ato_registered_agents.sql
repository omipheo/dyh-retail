-- Create ATO ASIC Registered Agents Lodgment Schedule and Reminder System
-- Based on Australian Tax Office ASIC registered agent program due dates
-- Reminders: 30 days before due date, then every 7 days thereafter if not started

-- ================================================
-- ATO ASIC REGISTERED AGENTS LODGMENT TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.ato_registered_agents_lodgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quarter TEXT NOT NULL, -- e.g., 'Q4 2024-25', 'Q1 2025-26'
  original_due_date DATE NOT NULL,
  program_due_date DATE, -- NULL if not applicable
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'reminded', 'in_progress', 'lodged', 'overdue')) DEFAULT 'upcoming',
  work_started_at TIMESTAMP WITH TIME ZONE,
  lodged_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- REGISTERED AGENTS REMINDER HISTORY TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.ato_registered_agents_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lodgment_id UUID NOT NULL REFERENCES public.ato_registered_agents_lodgments(id) ON DELETE CASCADE,
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
ALTER TABLE public.ato_registered_agents_lodgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ato_registered_agents_reminders ENABLE ROW LEVEL SECURITY;

-- Clients can view their own lodgments
CREATE POLICY "Clients can view their own registered agent lodgments"
  ON public.ato_registered_agents_lodgments FOR SELECT
  USING (auth.uid() = client_id);

-- Tax agents can view all lodgments
CREATE POLICY "Tax agents can view all registered agent lodgments"
  ON public.ato_registered_agents_lodgments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Tax agents can manage lodgments
CREATE POLICY "Tax agents can insert registered agent lodgments"
  ON public.ato_registered_agents_lodgments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can update registered agent lodgments"
  ON public.ato_registered_agents_lodgments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Reminder policies
CREATE POLICY "Tax agents can view all registered agent reminders"
  ON public.ato_registered_agents_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "System can manage registered agent reminders"
  ON public.ato_registered_agents_reminders FOR ALL
  USING (true)
  WITH CHECK (true);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX idx_ato_registered_agents_lodgments_client_id ON public.ato_registered_agents_lodgments(client_id);
CREATE INDEX idx_ato_registered_agents_lodgments_due_date ON public.ato_registered_agents_lodgments(original_due_date);
CREATE INDEX idx_ato_registered_agents_lodgments_status ON public.ato_registered_agents_lodgments(status);

CREATE INDEX idx_ato_registered_agents_reminders_lodgment_id ON public.ato_registered_agents_reminders(lodgment_id);
CREATE INDEX idx_ato_registered_agents_reminders_scheduled_for ON public.ato_registered_agents_reminders(scheduled_for);
CREATE INDEX idx_ato_registered_agents_reminders_status ON public.ato_registered_agents_reminders(status) WHERE status = 'scheduled';

-- ================================================
-- UPDATED_AT TRIGGER
-- ================================================
CREATE OR REPLACE FUNCTION update_ato_registered_agents_lodgments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ato_registered_agents_lodgments_updated_at
  BEFORE UPDATE ON public.ato_registered_agents_lodgments
  FOR EACH ROW
  EXECUTE FUNCTION update_ato_registered_agents_lodgments_updated_at();

-- ================================================
-- SEED ATO ASIC REGISTERED AGENTS LODGMENTS 2024-2026
-- ================================================
CREATE OR REPLACE FUNCTION seed_ato_registered_agents_lodgments()
RETURNS void AS $$
DECLARE
  client_record RECORD;
BEGIN
  -- Loop through all registered agent clients
  FOR client_record IN 
    SELECT id FROM auth.users 
    WHERE id IN (SELECT id FROM public.profiles WHERE role = 'end_user')
  LOOP
    -- Insert registered agent lodgment obligations based on ATO schedule
    INSERT INTO public.ato_registered_agents_lodgments (client_id, quarter, original_due_date, program_due_date)
    VALUES
      -- Quarter 4, 2024-25
      (client_record.id, 'Q4 2024-25', '2025-07-28', '2025-08-25'),
      -- Quarter 1, 2025-26
      (client_record.id, 'Q1 2025-26', '2025-10-28', '2025-11-25'),
      -- Quarter 2, 2025-26 (No program due date)
      (client_record.id, 'Q2 2025-26', '2026-02-28', NULL),
      -- Quarter 3, 2025-26
      (client_record.id, 'Q3 2025-26', '2026-04-28', '2026-05-26'),
      -- Quarter 4, 2025-26 (TBC for program)
      (client_record.id, 'Q4 2025-26', '2026-07-28', '2026-08-25')
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- AUTO-GENERATE REGISTERED AGENTS REMINDERS
-- ================================================
-- This function creates reminder schedules: 30 days before due date, then every 7 days if not started

CREATE OR REPLACE FUNCTION generate_ato_registered_agents_reminders()
RETURNS void AS $$
DECLARE
  lodgment_record RECORD;
  thirty_day_reminder_date DATE;
  current_reminder_date DATE;
  effective_due_date DATE;
BEGIN
  -- Loop through all upcoming lodgments that don't have reminders yet
  FOR lodgment_record IN 
    SELECT * FROM public.ato_registered_agents_lodgments 
    WHERE status IN ('upcoming', 'reminded')
  LOOP
    -- Use program due date if available, otherwise use original due date
    effective_due_date := COALESCE(lodgment_record.program_due_date, lodgment_record.original_due_date);
    
    -- Calculate 30-day-before date
    thirty_day_reminder_date := effective_due_date - INTERVAL '30 days';
    
    -- Insert 30-day reminder if it doesn't exist and is in the future
    IF thirty_day_reminder_date >= CURRENT_DATE THEN
      INSERT INTO public.ato_registered_agents_reminders (lodgment_id, client_id, reminder_type, scheduled_for)
      VALUES (lodgment_record.id, lodgment_record.client_id, 'thirty_day', thirty_day_reminder_date)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- If work hasn't started and 30-day date has passed, generate 7-day follow-ups
    IF lodgment_record.work_started_at IS NULL AND thirty_day_reminder_date < CURRENT_DATE THEN
      current_reminder_date := thirty_day_reminder_date + INTERVAL '7 days';
      
      -- Generate 7-day reminders until due date
      WHILE current_reminder_date < effective_due_date LOOP
        INSERT INTO public.ato_registered_agents_reminders (lodgment_id, client_id, reminder_type, scheduled_for)
        VALUES (lodgment_record.id, lodgment_record.client_id, 'seven_day_followup', current_reminder_date)
        ON CONFLICT DO NOTHING;
        
        current_reminder_date := current_reminder_date + INTERVAL '7 days';
      END LOOP;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SEND REGISTERED AGENTS REMINDERS
-- ================================================
CREATE OR REPLACE FUNCTION send_scheduled_registered_agents_reminders()
RETURNS void AS $$
DECLARE
  reminder_record RECORD;
  agent_record RECORD;
  message_id UUID;
  client_name TEXT;
  lodgment_info TEXT;
  effective_due_date DATE;
BEGIN
  -- Loop through all scheduled reminders for today
  FOR reminder_record IN 
    SELECT r.*, l.quarter, l.original_due_date, l.program_due_date
    FROM public.ato_registered_agents_reminders r
    JOIN public.ato_registered_agents_lodgments l ON l.id = r.lodgment_id
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
    
    -- Use program due date if available
    effective_due_date := COALESCE(reminder_record.program_due_date, reminder_record.original_due_date);
    
    -- Create reminder message
    lodgment_info := format(
      'Registered Agent Lodgment Reminder: %s - Due %s',
      reminder_record.quarter,
      effective_due_date::TEXT
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
      lodgment_info,
      format(
        'Reminder: Your registered agent lodgment for %s is due on %s%s. Please contact your tax agent to prepare and lodge.',
        reminder_record.quarter,
        effective_due_date::TEXT,
        CASE 
          WHEN reminder_record.program_due_date IS NOT NULL 
          THEN ' (Lodgment Program due date - original: ' || reminder_record.original_due_date::TEXT || ')'
          ELSE ''
        END
      ),
      'system_alert',
      CASE 
        WHEN effective_due_date - CURRENT_DATE <= 7 THEN 'urgent'
        WHEN effective_due_date - CURRENT_DATE <= 14 THEN 'high'
        ELSE 'normal'
      END
    )
    RETURNING id INTO message_id;
    
    -- Update reminder status
    UPDATE public.ato_registered_agents_reminders
    SET status = 'sent', sent_at = NOW(), message_id = message_id, agent_id = agent_record
    WHERE id = reminder_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================
COMMENT ON TABLE public.ato_registered_agents_lodgments IS 'ATO ASIC Registered Agents quarterly lodgment schedule based on ATO guidelines';
COMMENT ON TABLE public.ato_registered_agents_reminders IS 'Automated reminder tracking for ASIC Registered Agents: 30 days before due date, then every 7 days if work not started';
COMMENT ON FUNCTION generate_ato_registered_agents_reminders() IS 'Generates ASIC Registered Agents reminder schedule: 30-day advance notice + 7-day follow-ups if work not started';
COMMENT ON FUNCTION send_scheduled_registered_agents_reminders() IS 'Sends scheduled ASIC registered agent reminders via messaging system to tax agents';
COMMENT ON FUNCTION seed_ato_registered_agents_lodgments() IS 'Seeds all ASIC registered agent lodgment due dates for 2024-2026';

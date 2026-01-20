-- Create Super Fund Lodgment Schedule and Reminder System
-- Based on ATO "Key lodgment due dates for super" 2025-2026

-- ================================================
-- SUPER FUND LODGMENTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.ato_super_fund_lodgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lodgment_type TEXT NOT NULL, -- e.g., 'SMSF Annual Return', 'SGC Statement', 'Super Guarantee Contributions'
  due_date DATE NOT NULL,
  financial_year TEXT NOT NULL, -- e.g., '2025-2026'
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'reminded', 'in_progress', 'lodged', 'overdue')) DEFAULT 'upcoming',
  work_started_at TIMESTAMP WITH TIME ZONE,
  lodged_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- SUPER FUND REMINDERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.ato_super_fund_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lodgment_id UUID NOT NULL REFERENCES public.ato_super_fund_lodgments(id) ON DELETE CASCADE,
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
ALTER TABLE public.ato_super_fund_lodgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ato_super_fund_reminders ENABLE ROW LEVEL SECURITY;

-- Clients can view their own lodgments
CREATE POLICY "Clients can view their own super fund lodgments"
  ON public.ato_super_fund_lodgments FOR SELECT
  USING (auth.uid() = client_id);

-- Tax agents can view all lodgments
CREATE POLICY "Tax agents can view all super fund lodgments"
  ON public.ato_super_fund_lodgments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Tax agents can manage lodgments
CREATE POLICY "Tax agents can insert super fund lodgments"
  ON public.ato_super_fund_lodgments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "Tax agents can update super fund lodgments"
  ON public.ato_super_fund_lodgments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Reminder policies
CREATE POLICY "Tax agents can view all super fund reminders"
  ON public.ato_super_fund_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

CREATE POLICY "System can manage super fund reminders"
  ON public.ato_super_fund_reminders FOR ALL
  USING (true)
  WITH CHECK (true);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX idx_ato_super_fund_lodgments_client_id ON public.ato_super_fund_lodgments(client_id);
CREATE INDEX idx_ato_super_fund_lodgments_due_date ON public.ato_super_fund_lodgments(due_date);
CREATE INDEX idx_ato_super_fund_lodgments_status ON public.ato_super_fund_lodgments(status);

CREATE INDEX idx_ato_super_fund_reminders_lodgment_id ON public.ato_super_fund_reminders(lodgment_id);
CREATE INDEX idx_ato_super_fund_reminders_scheduled_for ON public.ato_super_fund_reminders(scheduled_for);
CREATE INDEX idx_ato_super_fund_reminders_status ON public.ato_super_fund_reminders(status) WHERE status = 'scheduled';

-- ================================================
-- UPDATED_AT TRIGGER
-- ================================================
CREATE OR REPLACE FUNCTION update_ato_super_fund_lodgments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ato_super_fund_lodgments_updated_at
  BEFORE UPDATE ON public.ato_super_fund_lodgments
  FOR EACH ROW
  EXECUTE FUNCTION update_ato_super_fund_lodgments_updated_at();

-- ================================================
-- SEED SUPER FUND LODGMENT DATES FOR 2025-2026
-- ================================================
CREATE OR REPLACE FUNCTION seed_ato_super_fund_lodgments()
RETURNS void AS $$
DECLARE
  client_record RECORD;
BEGIN
  -- Loop through all clients with super fund obligations
  FOR client_record IN 
    SELECT id FROM auth.users 
    WHERE id IN (SELECT id FROM public.profiles WHERE role = 'end_user')
  LOOP
    -- Super fund lodgment dates for 2025-2026
    INSERT INTO public.ato_super_fund_lodgments (client_id, lodgment_type, due_date, financial_year, description)
    VALUES
      -- July 2025
      (client_record.id, 'SMSF Annual Return', '2025-07-28', '2025-2026', 
       'Tax return for all individuals and trusts where one or more prior year income years, super, partnerships or in an ABN entity is more than nil. Tax return for clients prescribed for non-lodgment of prior year tax returns and advices of a lodgment due date or at 31 October 2025.'),
      
      -- August 2025
      (client_record.id, 'SGC Statement', '2025-08-14', '2025-2026',
       'Superannuation guarantee charge (SGC) due for the quarter 1 April – 30 June. Summary annual report.'),
      (client_record.id, 'Employer Annual Report', '2025-08-28', '2025-2026',
       'Employer annual report and late payment SGC amounts—employers of choice for super must lodge the SGC statement on the due date.'),
      
      -- October 2025
      (client_record.id, 'Quarter 1 SG Contributions', '2025-10-28', '2025-2026',
       'Super guarantee contributions were not made by the due date—SGC statement must be lodged with ATO by 28 October 2024. The SGC tax return or cancel status.'),
      (client_record.id, 'APRA Quarterly Return Q1', '2025-10-31', '2025-2026',
       'APRA annual return. SMSF Trustee attestation to satisfy the lodgment history. Super fund lookup details when the Trustee was advised or that that super return was not lodged by 31 October.'),
      
      -- Newly registered SMSF lodgment dates
      (client_record.id, 'Newly Registered SMSF (Self-Prepared)', '2025-10-31', '2024-2025',
       'Annual returns for newly registered SMSFs (taxable and non-taxable) who prepare their own annual return. Due 31 October 2025. Note: SMSF is not legally established until the fund has assets set aside for the benefit of members.'),
      
      -- November 2025
      (client_record.id, 'Member Contribution Statement', '2025-11-28', '2025-2026',
       'Member contribution statement from quarter 1, 2025–26 (1 July – 30 September 2025) if you did not make any member contributions or the due date. The same deadlines apply.'),
      
      -- December 2025
      (client_record.id, 'Register of Trustees', '2025-12-01', '2025-2026',
       'Register of trustees for SMSFs (with a medium super contributions or self-managed super fund).'),
      
      -- January 2026
      (client_record.id, 'Quarter 2 SG Contributions', '2026-01-28', '2025-2026',
       'Super guarantee contributions were not made by the due date—SGC statement must be lodged with ATO by 28 January.'),
      (client_record.id, 'APRA Quarterly Return Q2', '2026-01-31', '2025-2026',
       'APRA quarterly return for the quarter 1 October 2025 to 31 December 2025. Due date for super large and medium super funds (annual total income more than $10 million in length and trustees where the Trust has taxable on or before 31 October 2024).'),
      
      -- February 2026
      (client_record.id, 'Late/Taxable Super Funds', '2026-02-28', '2025-2026',
       'Tax return for non-taxable super funds and medium super funds to latest return. Unless they were advised of a 31 October 2025 due date or are an income year of the SMSF registration. Register of SMSF contributors.'),
      
      -- Newly registered SMSF lodgment date for tax agent clients
      (client_record.id, 'Newly Registered SMSF (Tax Agent Client)', '2026-02-28', '2024-2025',
       'Annual returns for newly registered SMSFs who are tax agent clients, due 28 February 2026. Exception: Due 31 October 2025 if client was advised of this date at finalisation of a review of the SMSF at registration. Note: Systems will not process returns with zero assets, and supervisory levy does not need to be paid for newly registered SMSFs that registered in the 2024–25 financial year and were not legally established or had no assets set aside.'),
      
      -- March 2026
      (client_record.id, 'SGC Quarterly Report Q2', '2026-03-28', '2025-2026',
       'Superannuation guarantee quarterly report if required for October–December quarter (quarter 2) Quarter 1 or employer obligations.'),
      (client_record.id, 'APRA Quarterly Return Q3', '2026-03-31', '2025-2026',
       'APRA quarterly return for the quarter 1, 2025–26 (1 January – 31 March 2026). SMSF if required contributions were not made by the due date.'),
      
      -- April 2026
      (client_record.id, 'Quarter 3 SG Contributions', '2026-04-28', '2025-2026',
       'Report late payments for quarter 1 (July–30 September 2025).'),
      (client_record.id, 'SGC Statement Q3', '2026-04-28', '2025-2026',
       'Super guarantee contributions were not made by the due date—SGC statement must be lodged with ATO by 28 April 2026.'),
      
      -- April/May 2026
      (client_record.id, 'Report Late Payments', '2026-04-30', '2025-2026',
       'Report late payments for quarter 1 (July – 30 September 2025).'),
      (client_record.id, 'Super Co-Contribution', '2026-05-15', '2025-2026',
       'Once the return and required earlier and not eligible for the 5 June application.'),
      (client_record.id, 'Late and Superannuation', '2026-05-28', '2025-2026',
       'Late and pay superannuation/unclaimed personal contact information—employers were given for in a warning super contributions, unclaimed super and co-contribution return.'),
      
      -- June 2026
      (client_record.id, 'Super Fund Lookups', '2026-06-05', '2025-2026',
       'The return for super funds that have were non-taxable or received a warning following that client had a registered (including where super with a unclaimed or undeposited contribution).')
    
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- AUTO-GENERATE SUPER FUND REMINDERS FUNCTION
-- ================================================
-- Same pattern as tax returns: 6 months before due date, then every 30 days if not started

CREATE OR REPLACE FUNCTION generate_ato_super_fund_reminders()
RETURNS void AS $$
DECLARE
  lodgment_record RECORD;
  six_month_reminder_date DATE;
  current_reminder_date DATE;
BEGIN
  FOR lodgment_record IN 
    SELECT * FROM public.ato_super_fund_lodgments 
    WHERE status IN ('upcoming', 'reminded')
  LOOP
    six_month_reminder_date := lodgment_record.due_date - INTERVAL '6 months';
    
    IF six_month_reminder_date >= CURRENT_DATE THEN
      INSERT INTO public.ato_super_fund_reminders (lodgment_id, client_id, reminder_type, scheduled_for)
      VALUES (lodgment_record.id, lodgment_record.client_id, 'six_month', six_month_reminder_date)
      ON CONFLICT DO NOTHING;
    END IF;
    
    IF lodgment_record.work_started_at IS NULL AND six_month_reminder_date < CURRENT_DATE THEN
      current_reminder_date := six_month_reminder_date + INTERVAL '30 days';
      
      WHILE current_reminder_date < lodgment_record.due_date LOOP
        INSERT INTO public.ato_super_fund_reminders (lodgment_id, client_id, reminder_type, scheduled_for)
        VALUES (lodgment_record.id, lodgment_record.client_id, 'thirty_day_followup', current_reminder_date)
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
COMMENT ON TABLE public.ato_super_fund_lodgments IS 'Super fund lodgment schedule for 2025-2026 based on ATO key lodgment due dates for super';
COMMENT ON TABLE public.ato_super_fund_reminders IS 'Automated reminder tracking: 6 months before due date, then every 30 days if work not started';
COMMENT ON FUNCTION generate_ato_super_fund_reminders() IS 'Generates reminder schedule for super fund lodgments: 6-month advance notice + 30-day follow-ups';

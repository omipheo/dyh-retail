-- Australian Privacy Principles (APPs) & Regulatory Compliance
-- ASIC, ATO, and TPB compliance requirements

-- Enable additional security extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CLIENT CONSENT MANAGEMENT (APP 3)
-- ============================================
CREATE TABLE IF NOT EXISTS client_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'data_collection',
    'data_processing',
    'data_disclosure',
    'marketing',
    'third_party_sharing'
  )),
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMPTZ,
  withdrawal_date TIMESTAMPTZ,
  purpose TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for consents
ALTER TABLE client_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consents"
  ON client_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own consents"
  ON client_consents FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Tax agents view assigned client consents"
  ON client_consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tax_agent'
      AND EXISTS (
        SELECT 1 FROM agent_client_assignments
        WHERE agent_id = auth.uid()
        AND client_id = client_consents.user_id
        AND status = 'active'
      )
    )
  );

-- ============================================
-- 2. DATA BREACH REGISTER (Notifiable Data Breaches scheme)
-- ============================================
CREATE TABLE IF NOT EXISTS data_breach_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_reference TEXT UNIQUE NOT NULL,
  breach_date TIMESTAMPTZ NOT NULL,
  discovered_date TIMESTAMPTZ NOT NULL,
  breach_type TEXT NOT NULL CHECK (breach_type IN (
    'unauthorized_access',
    'unauthorized_disclosure',
    'loss_of_data',
    'ransomware',
    'phishing',
    'system_compromise',
    'human_error'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  affected_users_count INTEGER,
  data_types_affected TEXT[], -- e.g., ['TFN', 'address', 'financial_data']
  description TEXT NOT NULL,
  containment_actions TEXT,
  notification_required BOOLEAN DEFAULT true,
  oaic_notified BOOLEAN DEFAULT false, -- Office of the Australian Information Commissioner
  oaic_notification_date TIMESTAMPTZ,
  affected_users_notified BOOLEAN DEFAULT false,
  notification_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN (
    'investigating',
    'contained',
    'remediated',
    'closed'
  )),
  reported_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only security admins and tax agents can view breach incidents
ALTER TABLE data_breach_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tax agents view breach incidents"
  ON data_breach_incidents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tax_agent'
    )
  );

-- ============================================
-- 3. TPB PROFESSIONAL INDEMNITY TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS professional_indemnity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_number TEXT NOT NULL,
  insurer_name TEXT NOT NULL,
  coverage_amount DECIMAL(15,2) NOT NULL,
  policy_start_date DATE NOT NULL,
  policy_end_date DATE NOT NULL,
  certificate_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_coverage CHECK (coverage_amount >= 1500000) -- TPB minimum requirement
);

ALTER TABLE professional_indemnity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents view own indemnity"
  ON professional_indemnity FOR SELECT
  USING (auth.uid() = agent_id);

-- ============================================
-- 4. TAX AGENT REGISTRATION VERIFICATION
-- ============================================
CREATE TABLE IF NOT EXISTS tax_agent_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tpb_registration_number TEXT UNIQUE NOT NULL, -- 9-digit TPB number
  registration_type TEXT NOT NULL CHECK (registration_type IN (
    'registered_tax_agent',
    'bas_agent',
    'tax_financial_advisor'
  )),
  registration_status TEXT NOT NULL DEFAULT 'pending' CHECK (registration_status IN (
    'pending',
    'verified',
    'suspended',
    'cancelled'
  )),
  registration_date DATE,
  expiry_date DATE,
  conditions TEXT[],
  verified_at TIMESTAMPTZ,
  last_verification_check TIMESTAMPTZ,
  abn TEXT, -- Australian Business Number
  business_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tax_agent_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents view own registration"
  ON tax_agent_registrations FOR SELECT
  USING (auth.uid() = agent_id);

-- ============================================
-- 5. SESSION MANAGEMENT & MFA TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  location_country TEXT,
  location_city TEXT,
  mfa_verified BOOLEAN DEFAULT false,
  mfa_method TEXT CHECK (mfa_method IN ('totp', 'sms', 'email')),
  login_time TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  terminated_at TIMESTAMPTZ,
  termination_reason TEXT,
  is_active BOOLEAN DEFAULT true,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 6. DATA ACCESS LOGGING (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS sensitive_data_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  accessed_user_id UUID REFERENCES auth.users(id), -- Whose data was accessed
  data_type TEXT NOT NULL CHECK (data_type IN (
    'tfn',
    'financial_data',
    'personal_info',
    'documents',
    'assessments',
    'questionnaire_responses'
  )),
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'create', 'update', 'delete', 'download', 'export')),
  record_id UUID,
  justification TEXT, -- Why was this data accessed?
  ip_address INET,
  user_agent TEXT,
  session_id UUID REFERENCES user_sessions(id),
  purpose TEXT, -- Business purpose for access
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  risk_indicators JSONB -- Any anomalies detected
);

-- Partition by month for performance
CREATE INDEX idx_sensitive_access_user ON sensitive_data_access_log(user_id, accessed_at);
CREATE INDEX idx_sensitive_access_target ON sensitive_data_access_log(accessed_user_id, accessed_at);

-- This table has NO update or delete - append only for audit trail
ALTER TABLE sensitive_data_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tax agents view access logs"
  ON sensitive_data_access_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tax_agent'
    )
  );

-- ============================================
-- 7. ENCRYPTION KEY MANAGEMENT
-- ============================================
CREATE TABLE IF NOT EXISTS encryption_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_purpose TEXT NOT NULL CHECK (key_purpose IN ('tfn', 'financial', 'documents', 'personal')),
  key_version INTEGER NOT NULL,
  key_hash TEXT NOT NULL, -- Don't store actual key, only hash
  algorithm TEXT NOT NULL DEFAULT 'AES-256-GCM',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  rotated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'rotated', 'expired', 'compromised')),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(key_purpose, key_version)
);

-- No RLS - only accessible via secure functions
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to keys"
  ON encryption_keys FOR ALL
  USING (false);

-- ============================================
-- 8. COMPLIANCE DECLARATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS compliance_declarations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  declaration_type TEXT NOT NULL CHECK (declaration_type IN (
    'annual_compliance',
    'privacy_policy',
    'security_review',
    'cpd_completion', -- Continuing Professional Development
    'code_of_conduct'
  )),
  declaration_text TEXT NOT NULL,
  declared_at TIMESTAMPTZ DEFAULT NOW(),
  declaration_period_start DATE,
  declaration_period_end DATE,
  evidence_urls TEXT[],
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE compliance_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents manage own declarations"
  ON compliance_declarations FOR ALL
  USING (auth.uid() = agent_id);

-- ============================================
-- 9. IP WHITELIST FOR TAX AGENTS
-- ============================================
CREATE TABLE IF NOT EXISTS agent_ip_whitelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  ip_range CIDR, -- For office networks
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  UNIQUE(agent_id, ip_address)
);

ALTER TABLE agent_ip_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents manage own IP whitelist"
  ON agent_ip_whitelist FOR ALL
  USING (auth.uid() = agent_id);

-- ============================================
-- 10. SECURITY FUNCTIONS
-- ============================================

-- Function to check if IP is whitelisted
CREATE OR REPLACE FUNCTION check_ip_whitelist(
  p_user_id UUID,
  p_ip_address INET
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM agent_ip_whitelist
    WHERE agent_id = p_user_id
    AND is_active = true
    AND (
      ip_address = p_ip_address
      OR p_ip_address <<= ip_range -- IP is within CIDR range
    )
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log sensitive data access
CREATE OR REPLACE FUNCTION log_sensitive_access(
  p_accessed_user_id UUID,
  p_data_type TEXT,
  p_access_type TEXT,
  p_record_id UUID DEFAULT NULL,
  p_justification TEXT DEFAULT NULL,
  p_purpose TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_session_ip INET;
  v_session_agent TEXT;
BEGIN
  -- Get session details from current request
  v_session_ip := inet_client_addr();
  
  INSERT INTO sensitive_data_access_log (
    user_id,
    accessed_user_id,
    data_type,
    access_type,
    record_id,
    justification,
    purpose,
    ip_address,
    accessed_at
  ) VALUES (
    auth.uid(),
    p_accessed_user_id,
    p_data_type,
    p_access_type,
    p_record_id,
    p_justification,
    p_purpose,
    v_session_ip,
    NOW()
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check data retention compliance
CREATE OR REPLACE FUNCTION check_data_retention()
RETURNS TABLE(
  table_name TEXT,
  record_count BIGINT,
  oldest_record TIMESTAMPTZ,
  retention_policy_days INTEGER,
  action_required TEXT
) AS $$
BEGIN
  -- ATO requires 5 years retention for tax records
  -- Check questionnaire_responses older than 5 years
  RETURN QUERY
  SELECT 
    'questionnaire_responses'::TEXT,
    COUNT(*)::BIGINT,
    MIN(created_at),
    1825::INTEGER, -- 5 years in days
    CASE 
      WHEN MIN(created_at) < NOW() - INTERVAL '5 years' THEN 'Archive old records'
      ELSE 'Compliant'
    END::TEXT
  FROM questionnaire_responses;
  
  -- Check audit_logs older than 7 years
  RETURN QUERY
  SELECT 
    'audit_logs'::TEXT,
    COUNT(*)::BIGINT,
    MIN(created_at),
    2555::INTEGER, -- 7 years in days
    CASE 
      WHEN MIN(created_at) < NOW() - INTERVAL '7 years' THEN 'Archive old logs'
      ELSE 'Compliant'
    END::TEXT
  FROM audit_logs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 11. AUTOMATED COMPLIANCE CHECKS
-- ============================================

-- Trigger to enforce consent before data processing
CREATE OR REPLACE FUNCTION check_consent_before_processing()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has given consent for data processing
  IF NOT EXISTS (
    SELECT 1 FROM client_consents
    WHERE user_id = NEW.user_id
    AND consent_type = 'data_processing'
    AND consent_given = true
    AND withdrawal_date IS NULL
  ) THEN
    RAISE EXCEPTION 'User has not provided consent for data processing (APP 3 compliance)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply consent check to questionnaire responses
CREATE TRIGGER enforce_consent_questionnaire
  BEFORE INSERT ON questionnaire_responses
  FOR EACH ROW
  EXECUTE FUNCTION check_consent_before_processing();

-- Trigger to expire old sessions (2-hour timeout for tax data)
CREATE OR REPLACE FUNCTION expire_inactive_sessions()
RETURNS void AS $$
BEGIN
  UPDATE user_sessions
  SET 
    is_active = false,
    terminated_at = NOW(),
    termination_reason = 'Inactive timeout'
  WHERE 
    is_active = true
    AND last_activity < NOW() - INTERVAL '2 hours'
    AND expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 12. INDEXES FOR COMPLIANCE QUERIES
-- ============================================
CREATE INDEX idx_consents_user_type ON client_consents(user_id, consent_type, consent_given);
CREATE INDEX idx_consents_active ON client_consents(user_id, withdrawal_date) WHERE withdrawal_date IS NULL;
CREATE INDEX idx_breach_severity ON data_breach_incidents(severity, status);
CREATE INDEX idx_agent_registration_status ON tax_agent_registrations(agent_id, registration_status);
CREATE INDEX idx_indemnity_expiry ON professional_indemnity(agent_id, policy_end_date) WHERE status = 'active';

-- ============================================
-- 13. GRANT EXECUTE PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION check_ip_whitelist TO authenticated;
GRANT EXECUTE ON FUNCTION log_sensitive_access TO authenticated;
GRANT EXECUTE ON FUNCTION check_data_retention TO authenticated;
GRANT EXECUTE ON FUNCTION expire_inactive_sessions TO authenticated;

-- ============================================
-- COMPLIANCE SUMMARY VIEW
-- ============================================
CREATE OR REPLACE VIEW compliance_status AS
SELECT
  'RLS Enabled' AS check_name,
  COUNT(*) FILTER (WHERE relrowsecurity = true)::TEXT AS status,
  'All sensitive tables must have RLS' AS requirement
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
AND relkind = 'r'
UNION ALL
SELECT
  'Audit Logging' AS check_name,
  CASE WHEN COUNT(*) > 0 THEN 'Active' ELSE 'Missing' END AS status,
  'All data access must be logged' AS requirement
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT
  'Encryption Keys' AS check_name,
  COUNT(*)::TEXT AS status,
  'Active encryption keys for sensitive data' AS requirement
FROM encryption_keys
WHERE status = 'active';

GRANT SELECT ON compliance_status TO authenticated;

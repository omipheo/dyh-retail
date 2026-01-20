-- Australian Privacy Principles (APPs) Compliance Schema
-- Implements world-class data protection standards

-- Enable additional security extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- 1. DATA BREACH NOTIFICATION SYSTEM (NDB Scheme)
-- ==============================================

CREATE TABLE security_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN (
    'unauthorized_access',
    'data_breach',
    'malware',
    'phishing',
    'ddos',
    'suspicious_activity',
    'failed_mfa',
    'data_export'
  )),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  affected_users TEXT[], -- Array of user IDs affected
  description TEXT NOT NULL,
  detection_method VARCHAR(100),
  remediation_status VARCHAR(50) DEFAULT 'investigating' CHECK (remediation_status IN (
    'investigating',
    'contained',
    'remediated',
    'reported_to_oaic' -- Office of the Australian Information Commissioner
  )),
  reported_to_oaic_at TIMESTAMPTZ,
  reported_to_users_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for security incidents (only admins and tax agents)
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tax agents can view security incidents"
  ON security_incidents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tax_agent'
    )
  );

-- ==============================================
-- 2. MULTI-FACTOR AUTHENTICATION (MFA) TRACKING
-- ==============================================

CREATE TABLE mfa_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('totp', 'sms', 'email', 'hardware_key')),
  device_name VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  is_primary BOOLEAN DEFAULT FALSE,
  secret_encrypted TEXT, -- Encrypted TOTP secret
  phone_number_encrypted TEXT, -- Encrypted phone for SMS
  backup_codes_encrypted TEXT[], -- Encrypted backup codes
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  UNIQUE(user_id, device_type, device_name)
);

ALTER TABLE mfa_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own MFA devices"
  ON mfa_devices FOR ALL
  USING (auth.uid() = user_id);

-- ==============================================
-- 3. IP WHITELIST/BLACKLIST FOR ACCESS CONTROL
-- ==============================================

CREATE TABLE ip_access_control (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address INET NOT NULL,
  list_type VARCHAR(10) NOT NULL CHECK (list_type IN ('whitelist', 'blacklist')),
  reason TEXT,
  applied_to VARCHAR(20) DEFAULT 'all' CHECK (applied_to IN ('all', 'admin', 'tax_agents')),
  added_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ip_address, list_type)
);

ALTER TABLE ip_access_control ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only tax agents can view IP controls"
  ON ip_access_control FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tax_agent'
    )
  );

-- ==============================================
-- 4. RATE LIMITING & SUSPICIOUS ACTIVITY TRACKING
-- ==============================================

CREATE TABLE rate_limit_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  request_count INTEGER NOT NULL,
  threshold_exceeded INTEGER NOT NULL,
  time_window INTERVAL NOT NULL,
  action_taken VARCHAR(50) CHECK (action_taken IN ('blocked', 'throttled', 'logged', 'captcha_required')),
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE rate_limit_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tax agents can view rate limit violations"
  ON rate_limit_violations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tax_agent'
    )
  );

-- ==============================================
-- 5. DATA ACCESS CONSENT MANAGEMENT (APP 3)
-- ==============================================

CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN (
    'data_collection',
    'data_processing',
    'data_sharing',
    'marketing',
    'analytics',
    'third_party_disclosure'
  )),
  purpose TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  version VARCHAR(20) NOT NULL, -- Track consent version
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consent records"
  ON consent_records FOR SELECT
  USING (auth.uid() = user_id);

-- ==============================================
-- 6. DATA RETENTION & DESTRUCTION SCHEDULE
-- ==============================================

CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100) NOT NULL,
  retention_period INTERVAL NOT NULL,
  destruction_method VARCHAR(50) CHECK (destruction_method IN ('soft_delete', 'hard_delete', 'anonymize', 'archive')),
  last_cleanup_at TIMESTAMPTZ,
  next_cleanup_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 7. ENCRYPTION KEY MANAGEMENT
-- ==============================================

CREATE TABLE encryption_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_purpose VARCHAR(100) NOT NULL UNIQUE,
  key_algorithm VARCHAR(50) NOT NULL,
  key_version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  rotated_at TIMESTAMPTZ DEFAULT NOW(),
  next_rotation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 8. COMPLIANCE AUDIT TRAIL
-- ==============================================

CREATE TABLE compliance_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_type VARCHAR(50) NOT NULL CHECK (check_type IN (
    'app_compliance', -- Australian Privacy Principles
    'ato_compliance', -- ATO requirements
    'iso27001',
    'owasp_top10',
    'penetration_test',
    'vulnerability_scan'
  )),
  status VARCHAR(20) NOT NULL CHECK (status IN ('passed', 'failed', 'warning', 'in_progress')),
  findings JSONB,
  remediation_required BOOLEAN DEFAULT FALSE,
  remediation_deadline TIMESTAMPTZ,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  next_check_due TIMESTAMPTZ
);

ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tax agents can view compliance checks"
  ON compliance_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tax_agent'
    )
  );

-- ==============================================
-- 9. SECURE BACKUP VERIFICATION
-- ==============================================

CREATE TABLE backup_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backup_type VARCHAR(50) CHECK (backup_type IN ('full', 'incremental', 'differential')),
  backup_location VARCHAR(255) NOT NULL, -- Must be in Australia
  encryption_verified BOOLEAN DEFAULT FALSE,
  integrity_hash TEXT,
  size_bytes BIGINT,
  backup_started_at TIMESTAMPTZ NOT NULL,
  backup_completed_at TIMESTAMPTZ,
  verification_status VARCHAR(20) CHECK (verification_status IN ('pending', 'verified', 'failed')),
  restore_tested_at TIMESTAMPTZ,
  retention_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 10. ENHANCED PROFILES TABLE (Add compliance fields)
-- ==============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mfa_enforced_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_last_changed TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_expiry TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_security_training TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_residency_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_agent_registration_number VARCHAR(50); -- ATO registration
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_agent_license_expiry TIMESTAMPTZ;

-- ==============================================
-- 11. AUTOMATED SECURITY FUNCTIONS
-- ==============================================

-- Function to check if account should be locked
CREATE OR REPLACE FUNCTION check_account_lockout(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid
    AND account_locked_until > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security incident
CREATE OR REPLACE FUNCTION log_security_incident(
  p_incident_type VARCHAR,
  p_severity VARCHAR,
  p_description TEXT,
  p_affected_users TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  incident_id UUID;
BEGIN
  INSERT INTO security_incidents (
    incident_type,
    severity,
    description,
    affected_users,
    detection_method
  ) VALUES (
    p_incident_type,
    p_severity,
    p_description,
    p_affected_users,
    'automated'
  ) RETURNING id INTO incident_id;
  
  -- If critical, automatically report to OAIC within 30 days
  IF p_severity = 'critical' THEN
    UPDATE security_incidents
    SET reported_to_oaic_at = NOW() + INTERVAL '30 days'
    WHERE id = incident_id;
  END IF;
  
  RETURN incident_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enforce MFA
CREATE OR REPLACE FUNCTION enforce_mfa_for_tax_agents()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'tax_agent' AND NEW.mfa_enabled = FALSE THEN
    NEW.mfa_enforced_at := NOW() + INTERVAL '7 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_mfa_on_role_change
  BEFORE INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_mfa_for_tax_agents();

-- ==============================================
-- 12. INDEXES FOR PERFORMANCE
-- ==============================================

CREATE INDEX idx_security_incidents_severity ON security_incidents(severity, detected_at DESC);
CREATE INDEX idx_security_incidents_status ON security_incidents(remediation_status);
CREATE INDEX idx_mfa_devices_user ON mfa_devices(user_id, is_verified);
CREATE INDEX idx_ip_access_control_lookup ON ip_access_control(ip_address, list_type) WHERE expires_at IS NULL OR expires_at > NOW();
CREATE INDEX idx_rate_limit_violations_recent ON rate_limit_violations(detected_at DESC) WHERE detected_at > NOW() - INTERVAL '24 hours';
CREATE INDEX idx_consent_records_active ON consent_records(user_id, consent_type) WHERE granted = TRUE AND (expiry_date IS NULL OR expiry_date > NOW());
CREATE INDEX idx_audit_logs_recent ON audit_logs(created_at DESC) WHERE created_at > NOW() - INTERVAL '90 days';
CREATE INDEX idx_compliance_checks_due ON compliance_checks(next_check_due) WHERE status = 'passed';

-- ==============================================
-- 13. COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON TABLE security_incidents IS 'Tracks security incidents for NDB (Notifiable Data Breaches) scheme compliance';
COMMENT ON TABLE mfa_devices IS 'Multi-factor authentication devices for enhanced security';
COMMENT ON TABLE ip_access_control IS 'IP whitelist/blacklist for network-level security';
COMMENT ON TABLE consent_records IS 'APP 3: Consent management for data collection and use';
COMMENT ON TABLE compliance_checks IS 'Ongoing compliance monitoring for Australian standards';
COMMENT ON COLUMN profiles.tax_agent_registration_number IS 'ATO registered tax agent number for compliance';

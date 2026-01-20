/**
 * Australian Compliance Utilities
 * ASIC, ATO, TPB, and Privacy Act 1988 compliance
 */

import { createClient } from '@/lib/supabase/server'

// Australian Privacy Principles (APPs)
export const CONSENT_TYPES = {
  DATA_COLLECTION: 'data_collection',
  DATA_PROCESSING: 'data_processing',
  DATA_DISCLOSURE: 'data_disclosure',
  MARKETING: 'marketing',
  THIRD_PARTY_SHARING: 'third_party_sharing',
} as const

// TPB Code of Professional Conduct
export const TPB_OBLIGATIONS = {
  HONEST_AND_INTEGRITY: 'Act honestly and with integrity',
  INDEPENDENCE: 'Act lawfully in the best interests of your client',
  CONFIDENTIALITY: 'Maintain confidentiality',
  COMPETENCE: 'Maintain professional knowledge and skills',
  PROFESSIONAL_INDEMNITY: 'Have professional indemnity insurance ($1.5M minimum)',
}

// Validate TPB Registration Number Format
export function validateTPBNumber(tpbNumber: string): boolean {
  // TPB numbers are 8 or 9 digits
  return /^\d{8,9}$/.test(tpbNumber)
}

// Validate Australian Business Number (ABN)
export function validateABN(abn: string): boolean {
  const abnDigits = abn.replace(/\s/g, '')
  if (!/^\d{11}$/.test(abnDigits)) return false

  // ABN validation algorithm
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
  let sum = 0
  
  for (let i = 0; i < 11; i++) {
    let digit = parseInt(abnDigits[i])
    if (i === 0) digit -= 1 // Subtract 1 from first digit
    sum += digit * weights[i]
  }
  
  return sum % 89 === 0
}

// Validate Tax File Number (TFN) format
export function validateTFNFormat(tfn: string): boolean {
  // TFN is 8 or 9 digits, but we don't validate the checksum for privacy
  return /^\d{8,9}$/.test(tfn.replace(/\s/g, ''))
}

// Check if user has given required consent
export async function checkConsent(
  userId: string,
  consentType: keyof typeof CONSENT_TYPES
): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('client_consents')
    .select('consent_given, withdrawal_date')
    .eq('user_id', userId)
    .eq('consent_type', CONSENT_TYPES[consentType])
    .is('withdrawal_date', null)
    .single()

  if (error || !data) return false
  return data.consent_given
}

// Record consent with IP and user agent for audit trail
export async function recordConsent(
  userId: string,
  consentType: keyof typeof CONSENT_TYPES,
  consentGiven: boolean,
  purpose: string,
  ipAddress?: string,
  userAgent?: string
) {
  const supabase = await createClient()
  
  return await supabase.from('client_consents').insert({
    user_id: userId,
    consent_type: CONSENT_TYPES[consentType],
    consent_given: consentGiven,
    consent_date: consentGiven ? new Date().toISOString() : null,
    purpose,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
}

// Withdraw consent (APP 13 - Access and correction)
export async function withdrawConsent(
  userId: string,
  consentType: keyof typeof CONSENT_TYPES
) {
  const supabase = await createClient()
  
  return await supabase
    .from('client_consents')
    .update({
      withdrawal_date: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('consent_type', CONSENT_TYPES[consentType])
    .is('withdrawal_date', null)
}

// Log sensitive data access (required for OAIC compliance)
export async function logSensitiveAccess(
  accessedUserId: string,
  dataType: 'tfn' | 'financial_data' | 'personal_info' | 'documents' | 'assessments' | 'questionnaire_responses',
  accessType: 'view' | 'create' | 'update' | 'delete' | 'download' | 'export',
  recordId?: string,
  justification?: string,
  purpose?: string
) {
  const supabase = await createClient()
  
  const { data } = await supabase.rpc('log_sensitive_access', {
    p_accessed_user_id: accessedUserId,
    p_data_type: dataType,
    p_access_type: accessType,
    p_record_id: recordId,
    p_justification: justification,
    p_purpose: purpose,
  })
  
  return data
}

// Report data breach (Notifiable Data Breaches scheme)
export async function reportDataBreach(breach: {
  breachType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  affectedUsersCount?: number
  dataTypesAffected: string[]
  description: string
  containmentActions?: string
}) {
  const supabase = await createClient()
  
  // Generate unique incident reference
  const incidentRef = `BREACH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  
  const { data, error } = await supabase.from('data_breach_incidents').insert({
    incident_reference: incidentRef,
    breach_date: new Date().toISOString(),
    discovered_date: new Date().toISOString(),
    ...breach,
    notification_required: breach.severity === 'high' || breach.severity === 'critical',
  })
  
  // If critical, this should trigger immediate notifications
  if (breach.severity === 'critical') {
    // TODO: Integrate with notification system to alert OAIC and affected users
    console.error('[CRITICAL BREACH]', incidentRef, breach)
  }
  
  return { data, error, incidentRef }
}

// Verify tax agent registration with TPB
export async function verifyTaxAgentRegistration(
  agentId: string,
  tpbNumber: string
): Promise<{ verified: boolean; message: string }> {
  if (!validateTPBNumber(tpbNumber)) {
    return { verified: false, message: 'Invalid TPB registration number format' }
  }
  
  // In production, this would call TPB's API to verify registration
  // For now, we'll store and validate format only
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tax_agent_registrations')
    .upsert({
      agent_id: agentId,
      tpb_registration_number: tpbNumber,
      registration_status: 'pending', // Manual verification required
      last_verification_check: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) {
    return { verified: false, message: error.message }
  }
  
  return {
    verified: data.registration_status === 'verified',
    message: data.registration_status === 'verified'
      ? 'Registration verified'
      : 'Registration pending verification',
  }
}

// Check professional indemnity insurance validity
export async function checkProfessionalIndemnity(
  agentId: string
): Promise<{ valid: boolean; expiryDate?: string; message: string }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('professional_indemnity')
    .select('*')
    .eq('agent_id', agentId)
    .eq('status', 'active')
    .gte('policy_end_date', new Date().toISOString())
    .order('policy_end_date', { ascending: false })
    .limit(1)
    .single()
  
  if (error || !data) {
    return {
      valid: false,
      message: 'No valid professional indemnity insurance found. TPB requires minimum $1.5M coverage.',
    }
  }
  
  // Check if expiring soon (within 30 days)
  const daysUntilExpiry = Math.floor(
    (new Date(data.policy_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysUntilExpiry <= 30) {
    return {
      valid: true,
      expiryDate: data.policy_end_date,
      message: `Insurance expires in ${daysUntilExpiry} days. Please renew.`,
    }
  }
  
  return {
    valid: true,
    expiryDate: data.policy_end_date,
    message: 'Professional indemnity insurance is current',
  }
}

// Data retention check (ATO requires 5 years)
export async function checkDataRetention() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('check_data_retention')
  
  return { data, error }
}

// Generate compliance report
export async function generateComplianceReport(agentId: string) {
  const supabase = await createClient()
  
  // Check multiple compliance factors
  const [registration, indemnity, recentAudits, activeSessions] = await Promise.all([
    supabase
      .from('tax_agent_registrations')
      .select('*')
      .eq('agent_id', agentId)
      .single(),
    supabase
      .from('professional_indemnity')
      .select('*')
      .eq('agent_id', agentId)
      .eq('status', 'active')
      .single(),
    supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', agentId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100),
    supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', agentId)
      .eq('is_active', true),
  ])
  
  return {
    registration: registration.data,
    indemnity: indemnity.data,
    recentActivity: recentAudits.data?.length || 0,
    activeSessions: activeSessions.data?.length || 0,
    generatedAt: new Date().toISOString(),
  }
}

// Encrypt sensitive data (TFN, financial info)
export function encryptSensitiveData(data: string, key: string): string {
  // In production, use proper encryption library
  // This is a placeholder - use AWS KMS, Azure Key Vault, or similar
  return Buffer.from(data).toString('base64')
}

// Decrypt sensitive data
export function decryptSensitiveData(encryptedData: string, key: string): string {
  // In production, use proper decryption library
  return Buffer.from(encryptedData, 'base64').toString('utf-8')
}

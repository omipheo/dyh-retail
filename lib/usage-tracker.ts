// Usage tracking and limit enforcement

import { createServerClient } from '@/lib/supabase/server'

const MAX_FREE_OUTPUTS = 3

export interface UsageStatus {
  outputsUsed: number
  outputsRemaining: number
  limitReached: boolean
  canGenerate: boolean
  requiresPayment: boolean
  isTaxAgent: boolean
}

export async function checkUsageLimit(userId: string): Promise<UsageStatus> {
  const supabase = await createServerClient()
  
  // Check if user is a tax agent
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  const isTaxAgent = profile?.role === 'tax_agent'
  
  // Tax agents have unlimited access
  if (isTaxAgent) {
    return {
      outputsUsed: 0,
      outputsRemaining: Infinity,
      limitReached: false,
      canGenerate: true,
      requiresPayment: false,
      isTaxAgent: true,
    }
  }
  
  // Get usage count for regular users
  const { data: usageData } = await supabase
    .from('usage_tracking')
    .select('outputs_generated')
    .eq('user_id', userId)
    .single()
  
  const outputsUsed = usageData?.outputs_generated || 0
  const outputsRemaining = Math.max(0, MAX_FREE_OUTPUTS - outputsUsed)
  const limitReached = outputsUsed >= MAX_FREE_OUTPUTS
  
  return {
    outputsUsed,
    outputsRemaining,
    limitReached,
    canGenerate: !limitReached,
    requiresPayment: limitReached,
    isTaxAgent: false,
  }
}

export async function incrementUsage(userId: string): Promise<boolean> {
  const supabase = await createServerClient()
  
  // Check if user can generate
  const status = await checkUsageLimit(userId)
  
  if (!status.canGenerate && !status.isTaxAgent) {
    return false
  }
  
  // Don't track usage for tax agents
  if (status.isTaxAgent) {
    return true
  }
  
  // Increment usage count
  const { error } = await supabase.rpc('increment_usage', {
    p_user_id: userId,
  })
  
  if (error) {
    console.error('Failed to increment usage:', error)
    return false
  }
  
  return true
}

export async function resetUsage(userId: string, adminId: string): Promise<boolean> {
  const supabase = await createServerClient()
  
  // Verify admin is a tax agent
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', adminId)
    .single()
  
  if (adminProfile?.role !== 'tax_agent') {
    return false
  }
  
  // Reset usage
  const { error } = await supabase
    .from('usage_tracking')
    .update({ outputs_generated: 0, last_reset_at: new Date().toISOString() })
    .eq('user_id', userId)
  
  if (error) {
    console.error('Failed to reset usage:', error)
    return false
  }
  
  return true
}

export async function grantExtraOutputs(
  userId: string, 
  adminId: string, 
  extraOutputs: number
): Promise<boolean> {
  const supabase = await createServerClient()
  
  // Verify admin is a tax agent
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', adminId)
    .single()
  
  if (adminProfile?.role !== 'tax_agent') {
    return false
  }
  
  // Get current usage
  const { data: usageData } = await supabase
    .from('usage_tracking')
    .select('outputs_generated')
    .eq('user_id', userId)
    .single()
  
  if (!usageData) {
    return false
  }
  
  // Reduce usage count to grant extra outputs
  const newCount = Math.max(0, usageData.outputs_generated - extraOutputs)
  
  const { error } = await supabase
    .from('usage_tracking')
    .update({ outputs_generated: newCount })
    .eq('user_id', userId)
  
  if (error) {
    console.error('Failed to grant extra outputs:', error)
    return false
  }
  
  return true
}

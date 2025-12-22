import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  verifyTaxAgentRegistration,
  checkProfessionalIndemnity,
  validateTPBNumber,
  validateABN,
} from '@/lib/australian-compliance'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tpbNumber, abn, registrationType } = body

    // Validate TPB number format
    if (!validateTPBNumber(tpbNumber)) {
      return NextResponse.json(
        { error: 'Invalid TPB registration number format' },
        { status: 400 }
      )
    }

    // Validate ABN if provided
    if (abn && !validateABN(abn)) {
      return NextResponse.json(
        { error: 'Invalid ABN format' },
        { status: 400 }
      )
    }

    // Verify registration
    const verificationResult = await verifyTaxAgentRegistration(user.id, tpbNumber)

    // Update user profile to tax agent role if verified
    if (verificationResult.verified) {
      await supabase.from('profiles').update({ role: 'tax_agent' }).eq('id', user.id)
    }

    return NextResponse.json({
      success: true,
      ...verificationResult,
    })
  } catch (error) {
    console.error('Agent verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify tax agent registration' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get registration and indemnity status
    const [registration, indemnity] = await Promise.all([
      supabase
        .from('tax_agent_registrations')
        .select('*')
        .eq('agent_id', user.id)
        .single(),
      checkProfessionalIndemnity(user.id),
    ])

    return NextResponse.json({
      registration: registration.data,
      indemnity,
    })
  } catch (error) {
    console.error('Get agent status error:', error)
    return NextResponse.json(
      { error: 'Failed to get agent status' },
      { status: 500 }
    )
  }
}

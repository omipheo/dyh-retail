import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recordConsent, withdrawConsent, checkConsent } from '@/lib/australian-compliance'

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
    const { consentType, consentGiven, purpose } = body

    // Get client IP and user agent for audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    const result = await recordConsent(
      user.id,
      consentType,
      consentGiven,
      purpose,
      ipAddress || undefined,
      userAgent || undefined
    )

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Consent error:', error)
    return NextResponse.json(
      { error: 'Failed to record consent' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const consentType = searchParams.get('type')

    if (!consentType) {
      return NextResponse.json({ error: 'Consent type required' }, { status: 400 })
    }

    const result = await withdrawConsent(user.id, consentType as any)

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Consent withdrawal error:', error)
    return NextResponse.json(
      { error: 'Failed to withdraw consent' },
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

    const { data, error } = await supabase
      .from('client_consents')
      .select('*')
      .eq('user_id', user.id)
      .is('withdrawal_date', null)

    if (error) throw error

    return NextResponse.json({ consents: data })
  } catch (error) {
    console.error('Get consents error:', error)
    return NextResponse.json(
      { error: 'Failed to get consents' },
      { status: 500 }
    )
  }
}

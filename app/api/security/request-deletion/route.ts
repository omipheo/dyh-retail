import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// User requests data deletion (GDPR compliance)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create deletion request (scheduled 30 days in future)
    const scheduledDate = new Date()
    scheduledDate.setDate(scheduledDate.getDate() + 30)

    const { data, error } = await supabase
      .from('data_deletion_requests')
      .insert({
        user_id: user.id,
        scheduled_deletion_at: scheduledDate.toISOString(),
        status: 'scheduled',
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating deletion request:', error)
      return NextResponse.json(
        { error: 'Failed to create deletion request: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Your data will be deleted on ${scheduledDate.toLocaleDateString()}. You can cancel this request before that date.`,
    })
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Cancel deletion request
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { requestId } = await request.json()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update deletion request to cancelled
    const { data, error } = await supabase
      .from('data_deletion_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Error cancelling deletion request:', error)
      return NextResponse.json(
        { error: 'Failed to cancel deletion request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Data deletion request has been cancelled.',
    })
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

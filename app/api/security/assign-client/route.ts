import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Tax agent assigns themselves to a client
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { clientId } = await request.json()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a tax agent
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'tax_agent') {
      return NextResponse.json(
        { error: 'Only tax agents can assign clients' },
        { status: 403 }
      )
    }

    // Create the client-agent relationship
    const { data, error } = await supabase
      .from('client_agent_relationships')
      .insert({
        client_id: clientId,
        agent_id: user.id,
        assigned_by: user.id,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error assigning client:', error)
      return NextResponse.json(
        { error: 'Failed to assign client: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

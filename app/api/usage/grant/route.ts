import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { grantExtraOutputs } from '@/lib/usage-tracker'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, extraOutputs } = await request.json()
    
    if (!userId || !extraOutputs) {
      return NextResponse.json({ error: 'User ID and extra outputs required' }, { status: 400 })
    }

    const success = await grantExtraOutputs(userId, user.id, extraOutputs)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to grant extra outputs' }, { status: 403 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Grant outputs error:', error)
    return NextResponse.json({ error: 'Grant failed' }, { status: 500 })
  }
}

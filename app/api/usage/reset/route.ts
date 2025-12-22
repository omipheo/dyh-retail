import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { resetUsage } from '@/lib/usage-tracker'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const success = await resetUsage(userId, user.id)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to reset usage' }, { status: 403 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Usage reset error:', error)
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 })
  }
}

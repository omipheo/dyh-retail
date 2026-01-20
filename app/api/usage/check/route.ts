import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { checkUsageLimit } from '@/lib/usage-tracker'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = await checkUsageLimit(user.id)
    
    return NextResponse.json(status)
  } catch (error) {
    console.error('Usage check error:', error)
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 })
  }
}

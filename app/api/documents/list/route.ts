import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('assessmentId')

    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by assessment if provided
    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId)
    }

    // Check user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // If not a tax agent, only show own documents
    if (profile?.role !== 'tax_agent') {
      query = query.eq('user_id', user.id)
    }

    const { data: documents, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('List error:', error)
    return NextResponse.json({ error: 'Failed to list documents' }, { status: 500 })
  }
}

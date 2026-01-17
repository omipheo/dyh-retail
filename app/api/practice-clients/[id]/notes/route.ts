import { getServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceRoleClient()

    const { data: notes, error } = await supabase
      .from("client_notes")
      .select("*")
      .eq("client_id", params.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ notes })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceRoleClient()
    const body = await request.json()
    const { note_text, note, custom_timestamp } = body
    const noteContent = note_text || note

    if (!noteContent || !noteContent.trim()) {
      return NextResponse.json({ error: "Note text is required" }, { status: 400 })
    }

    const insertData: any = {
      client_id: params.id,
      note_text: noteContent.trim(),
    }

    if (custom_timestamp) {
      insertData.created_at = custom_timestamp
    }

    const { data: noteData, error } = await supabase.from("client_notes").insert(insertData).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ note: noteData })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get("assessmentId")
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    let query = supabase
      .from("messages")
      .select(`
        *,
        sender:sender_id(full_name, email, role),
        recipient:recipient_id(full_name, email, role)
      `)
      .order("created_at", { ascending: false })

    if (assessmentId) {
      query = query.eq("assessment_id", assessmentId)
    }

    if (unreadOnly) {
      query = query.eq("is_read", false)
    }

    const { data: messages, error: messagesError } = await query

    if (messagesError) {
      console.error("[v0] Error fetching messages:", messagesError)
      return NextResponse.json({ error: messagesError.message }, { status: 500 })
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("[v0] Error in list messages API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

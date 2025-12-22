import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      assessmentId,
      recipientId,
      subject,
      messageText,
      messageType = "general",
      priority = "normal",
      attachmentUrl,
      attachmentName,
    } = body

    // Insert the message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        assessment_id: assessmentId,
        sender_id: user.id,
        recipient_id: recipientId,
        subject,
        message_text: messageText,
        message_type: messageType,
        priority,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
      })
      .select()
      .single()

    if (messageError) {
      console.error("[v0] Error sending message:", messageError)
      return NextResponse.json({ error: messageError.message }, { status: 500 })
    }

    return NextResponse.json({ message, success: true })
  } catch (error) {
    console.error("[v0] Error in send message API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

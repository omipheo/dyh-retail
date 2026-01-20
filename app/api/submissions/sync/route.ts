import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_email, client_name, questionnaire_type, questionnaire_data, completed_at, api_key } = body

    // Validate API key
    const expectedApiKey = process.env.DYH_API_KEY || "practice-mgr-secret-key"
    if (api_key !== expectedApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Validate required fields
    if (!client_email || !questionnaire_data) {
      return NextResponse.json(
        { error: "Missing required fields: client_email and questionnaire_data" },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    // Store the form submission
    const { data: submission, error } = await supabase
      .from("client_assessments")
      .insert({
        client_email,
        client_name: client_name || client_email,
        questionnaire_type: questionnaire_type || "quick_questionnaire",
        questionnaire_data,
        status: "completed",
        completed_at: completed_at || new Date().toISOString(),
        source: "dyh_explorer",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Submission sync error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Form submission synced successfully",
      submission_id: submission.id,
    })
  } catch (error: any) {
    console.error("[v0] Submission sync error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_email, client_name, phone, questionnaire_data, api_key } = body

    // Validate required fields
    if (!client_email || !questionnaire_data) {
      return NextResponse.json(
        { error: "Missing required fields: client_email and questionnaire_data" },
        { status: 400 },
      )
    }

    // Verify API key (basic security - you can enhance this)
    const expectedApiKey = process.env.DYH_API_KEY || "practice-mgr-secret-key"
    if (api_key !== expectedApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    const supabase = await createClient()

    // Check if prospect already exists
    const { data: existingProspect } = await supabase
      .from("dyh_explorer_prospects")
      .select("id")
      .eq("client_email", client_email)
      .single()

    if (existingProspect) {
      // Update existing prospect
      const { data: updatedProspect, error } = await supabase
        .from("dyh_explorer_prospects")
        .update({
          client_name,
          phone,
          questionnaire_data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProspect.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Prospect updated successfully",
        prospect: updatedProspect,
      })
    }

    // Create new prospect
    const { data: newProspect, error } = await supabase
      .from("dyh_explorer_prospects")
      .insert({
        client_email,
        client_name,
        phone,
        questionnaire_data,
        status: "pending",
        source: "dyh_explorer",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Prospect created successfully",
      prospect: newProspect,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

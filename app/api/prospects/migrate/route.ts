import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_email, purchase_data, api_key } = body

    // Validate required fields
    if (!client_email) {
      return NextResponse.json({ error: "Missing required field: client_email" }, { status: 400 })
    }

    // Verify API key
    const expectedApiKey = process.env.DYH_API_KEY || "practice-mgr-secret-key"
    if (api_key !== expectedApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    const supabase = await createClient()

    // Find prospect
    const { data: prospect, error: prospectError } = await supabase
      .from("dyh_explorer_prospects")
      .select("*")
      .eq("client_email", client_email)
      .single()

    if (prospectError || !prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 })
    }

    // Check if already migrated
    const { data: existingClient } = await supabase
      .from("dyh_practice_clients")
      .select("id")
      .eq("client_email", client_email)
      .single()

    if (existingClient) {
      return NextResponse.json(
        {
          success: true,
          message: "Client already exists",
          client: existingClient,
        },
        { status: 200 },
      )
    }

    // Create new practice client
    const { data: newClient, error: clientError } = await supabase
      .from("dyh_practice_clients")
      .insert({
        prospect_id: prospect.id,
        client_email: prospect.client_email,
        client_name: prospect.client_name,
        phone: prospect.phone,
        questionnaire_data: prospect.questionnaire_data,
        purchase_data,
        final_report_purchased_at: new Date().toISOString(),
        status: "active",
      })
      .select()
      .single()

    if (clientError) {
      return NextResponse.json({ error: clientError.message }, { status: 500 })
    }

    // Update prospect status to converted
    await supabase
      .from("dyh_explorer_prospects")
      .update({
        status: "converted",
        converted_at: new Date().toISOString(),
      })
      .eq("id", prospect.id)

    return NextResponse.json({
      success: true,
      message: "Prospect migrated to client successfully",
      client: newClient,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

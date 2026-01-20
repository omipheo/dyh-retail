import { getServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { clientType } = await request.json()
    const supabase = getServiceRoleClient()

    // Get current questionnaire_data
    const { data: client } = await supabase
      .from("dyh_practice_clients")
      .select("questionnaire_data")
      .eq("id", params.id)
      .single()

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Update questionnaire_data with new client type
    const questionnaireData = (client.questionnaire_data as any) || {}
    questionnaireData.client_type = clientType
    questionnaireData.type = clientType

    const { error } = await supabase
      .from("dyh_practice_clients")
      .update({
        questionnaire_data: questionnaireData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (error) {
      console.error("Error updating client type:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PATCH /api/practice-clients/[id]/type:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

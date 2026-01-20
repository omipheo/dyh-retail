import { getServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { client_type } = await request.json()
    const supabase = getServiceRoleClient()

    // Update client type in questionnaire_data
    const { data: client, error: fetchError } = await supabase
      .from("dyh_practice_clients")
      .select("questionnaire_data")
      .eq("id", params.id)
      .single()

    if (fetchError) throw fetchError

    const updatedData = {
      ...(client.questionnaire_data || {}),
      client_type,
    }

    const { error } = await supabase
      .from("dyh_practice_clients")
      .update({ questionnaire_data: updatedData })
      .eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating client type:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

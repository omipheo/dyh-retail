import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("dyh_practice_clients")
      .insert({
        client_name: body.client_name,
        client_email: body.client_email,
        phone: body.phone,
        client_type: body.client_type,
        questionnaire_data: body.questionnaire_data || {},
        purchase_data: body.purchase_data || null,
        final_report_purchased_at: body.final_report_purchased_at,
        status: body.status || "active",
        notes: body.notes,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, client: data })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ success: false, error: "Failed to create client" }, { status: 500 })
  }
}

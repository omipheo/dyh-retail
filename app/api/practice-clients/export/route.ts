import { NextResponse } from "next/server"
import { getServiceRoleClient } from "@/lib/supabase/service-role"

export async function GET() {
  try {
    const supabase = getServiceRoleClient()

    // Fetch all clients
    const { data: clients, error } = await supabase
      .from("dyh_practice_clients")
      .select("*")
      .order("full_name", { ascending: true })

    if (error) throw error

    // Create CSV content
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Status",
      "Client Type",
      "Industry Classification",
      "Xero Plan",
      "ABN",
      "Created Date",
    ]
    const rows = clients.map((client) => {
      const questionnaireData = client.questionnaire_data || {}
      return [
        client.full_name || "",
        client.email || "",
        client.phone_number || "",
        client.status || "",
        questionnaireData.client_type || "",
        questionnaireData.industry_classification || "",
        questionnaireData.xero_plan || "",
        questionnaireData.abn || "",
        client.created_at ? new Date(client.created_at).toLocaleDateString() : "",
      ]
    })

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="clients-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    console.error("[v0] Export error:", error)
    return NextResponse.json({ error: "Failed to export clients", details: error.message }, { status: 500 })
  }
}

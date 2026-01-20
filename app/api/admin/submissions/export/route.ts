import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if tax agent
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "tax_agent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Get all assessments
  const { data: assessments, error } = await supabase
    .from("client_assessments")
    .select(
      `
      *,
      profiles!client_assessments_client_id_fkey(id, full_name, email)
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Convert to CSV
  const headers = [
    "Submission ID",
    "Client Name",
    "Client Email",
    "Status",
    "Submitted Date",
    "Last Updated",
    "Marital Status",
    "Annual Income",
    "Partner Income",
    "Children Count",
    "Employment Status",
    "Home Value",
    "Total Floor Space (sqm)",
    "Business Floor Space (sqm)",
    "GST Registered",
    "Has Strategy Selector",
    "Plant & Equipment",
    "Goodwill",
    "IP/Patents",
    "Real Property",
    "Liabilities",
  ]

  const rows = assessments.map((assessment) => {
    const profile = assessment.profiles as any
    const data = assessment.questionnaire_data as any

    return [
      assessment.id,
      profile?.full_name || assessment.client_name || "",
      profile?.email || "",
      assessment.status,
      new Date(assessment.created_at).toISOString(),
      new Date(assessment.updated_at).toISOString(),
      data.q1_marital_status || "",
      data.q2_annual_income || "",
      data.q3_partner_income || "",
      data.q4_num_children || "",
      data.q7_employment_status || "",
      data.q11_home_value || "",
      data.q16_total_floor_space || "",
      data.q17_business_floor_space || "",
      data.q28_gst_registered || "",
      data.ss_q1_plant_equipment !== undefined ? "Yes" : "No",
      data.ss_q1_plant_equipment || "",
      data.ss_q1_goodwill || "",
      data.ss_q1_ip_patents || "",
      data.ss_q1_real_property || "",
      data.ss_q2_liabilities || "",
    ]
  })

  // Generate CSV content
  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n")

  // Return CSV file
  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="questionnaire-submissions-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}

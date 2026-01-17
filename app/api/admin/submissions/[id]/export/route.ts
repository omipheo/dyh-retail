import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

  // Get the specific assessment
  const { data: assessment, error } = await supabase
    .from("client_assessments")
    .select(
      `
      *,
      profiles!client_assessments_client_id_fkey(id, full_name, email)
    `,
    )
    .eq("id", params.id)
    .single()

  if (error || !assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
  }

  const clientProfile = assessment.profiles as any
  const data = assessment.questionnaire_data as any

  // Create detailed text export
  let content = `QUESTIONNAIRE SUBMISSION EXPORT\n`
  content += `${"=".repeat(80)}\n\n`

  content += `CLIENT INFORMATION\n`
  content += `${"-".repeat(80)}\n`
  content += `Name: ${clientProfile?.full_name || assessment.client_name || "Unknown"}\n`
  content += `Email: ${clientProfile?.email || "No email"}\n`
  content += `Status: ${assessment.status.toUpperCase()}\n`
  content += `Submitted: ${new Date(assessment.created_at).toLocaleString()}\n`
  content += `Last Updated: ${new Date(assessment.updated_at).toLocaleString()}\n\n`

  content += `QUICK QUESTIONNAIRE (29 QUESTIONS)\n`
  content += `${"-".repeat(80)}\n`
  content += `Q1. Marital Status: ${data.q1_marital_status || "N/A"}\n`
  content += `Q2. Annual Income: $${data.q2_annual_income || "N/A"}\n`
  content += `Q3. Partner Income: $${data.q3_partner_income || "N/A"}\n`
  content += `Q4. Number of Children: ${data.q4_num_children || "N/A"}\n`
  content += `Q5. Ages of Children: ${data.q5_ages_children || "N/A"}\n`
  content += `Q6. Children Incomes: $${data.q6_children_incomes || "N/A"}\n`
  content += `Q7. Employment Status: ${data.q7_employment_status || "N/A"}\n`
  content += `Q8. Partner Employment: ${data.q8_partner_employment || "N/A"}\n`
  content += `Q9. Renting: ${data.q9_renting || "N/A"}\n`
  content += `Q10. Home Status: ${data.q10_home_status || "N/A"}\n`
  content += `Q11. Home Value: $${data.q11_home_value || "N/A"}\n`
  content += `Q12. Personal Debts: $${data.q12_personal_debts || "N/A"}\n`
  content += `Q13. Partner Debts: $${data.q13_partner_debts || "N/A"}\n`
  content += `Q16. Total Floor Space: ${data.q16_total_floor_space || "N/A"} sqm\n`
  content += `Q17. Business Floor Space: ${data.q17_business_floor_space || "N/A"} sqm\n`
  content += `Q20. Years Operating: ${data.q20_years_operated || "N/A"}\n`
  content += `Q28. GST Registered: ${data.q28_gst_registered || "N/A"}\n\n`

  if (data.comment1 || data.comment2 || data.comment3) {
    content += `ADDITIONAL COMMENTS\n`
    content += `${"-".repeat(80)}\n`
    if (data.comment1) content += `Comment 1: ${data.comment1}\n`
    if (data.comment2) content += `Comment 2: ${data.comment2}\n`
    if (data.comment3) content += `Comment 3: ${data.comment3}\n`
    content += `\n`
  }

  if (data.ss_q1_plant_equipment !== undefined) {
    content += `STRATEGY SELECTOR - ASSETS & LIABILITIES\n`
    content += `${"-".repeat(80)}\n`
    content += `Plant & Equipment: $${data.ss_q1_plant_equipment || "N/A"}\n`
    content += `Goodwill: $${data.ss_q1_goodwill || "N/A"}\n`
    content += `IP/Patents: $${data.ss_q1_ip_patents || "N/A"}\n`
    content += `Real Property: $${data.ss_q1_real_property || "N/A"}\n`
    content += `Liabilities: $${data.ss_q2_liabilities || "N/A"}\n\n`

    content += `STRATEGY SELECTOR - BUSINESS PROFILE (65 QUESTIONS)\n`
    content += `${"-".repeat(80)}\n`
    Object.keys(data)
      .filter((key) => key.startsWith("ss_q") && key >= "ss_q3")
      .sort()
      .forEach((key) => {
        const qNum = key.replace("ss_q", "")
        const value = data[key]
        if (value) content += `Q${qNum}: ${value}\n`
      })
    content += `\n`
  }

  content += `${"-".repeat(80)}\n`
  content += `END OF SUBMISSION EXPORT\n`
  content += `Generated: ${new Date().toLocaleString()}\n`

  // Return as downloadable text file
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="submission-${params.id}-${new Date().toISOString().split("T")[0]}.txt"`,
    },
  })
}

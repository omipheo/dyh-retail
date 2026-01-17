import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type") || "practice_clients"
  const groupId = searchParams.get("group")
  const clientType = searchParams.get("client_type")
  const status = searchParams.get("status")
  const includeQuestionnaire = searchParams.get("include_questionnaire") === "true"
  const includePurchase = searchParams.get("include_purchase") === "true"

  const supabase = await createClient()

  // Build query based on type
  let query = supabase.from(type === "prospects" ? "dyh_explorer_prospects" : "dyh_practice_clients")

  if (type === "practice_clients") {
    query = query.select(`
      *,
      client_group_members(
        group_id,
        role_in_group,
        client_groups(group_name, group_type)
      )
    `)
  } else {
    query = query.select("*")
  }

  // Apply filters
  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  if (clientType && clientType !== "all" && type === "practice_clients") {
    query = query.eq("client_type", clientType)
  }

  query = query.order("created_at", { ascending: false })

  const { data: clients, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Filter by group if specified
  let filteredClients = clients || []
  if (groupId && groupId !== "all" && type === "practice_clients") {
    filteredClients = filteredClients.filter((c: any) =>
      c.client_group_members?.some((m: any) => m.group_id === groupId),
    )
  }

  // Build CSV headers
  const headers = ["ClientName", "FirstName", "Email", "Phone", "ClientType", "Status", "ClientSince"]

  if (includeQuestionnaire) {
    headers.push(
      "MaritalStatus",
      "AnnualIncome",
      "PartnerIncome",
      "NumChildren",
      "EmploymentStatus",
      "HomeValue",
      "TotalFloorSpace",
      "BusinessFloorSpace",
      "GSTRegistered",
    )
  }

  if (includePurchase && type === "practice_clients") {
    headers.push("PurchaseDate", "PurchaseAmount", "ReportType")
  }

  if (type === "practice_clients") {
    headers.push("ClientGroups", "GroupRoles")
  }

  // Build CSV rows
  const rows = filteredClients.map((client: any) => {
    const firstName = extractFirstName(client.client_name || client.full_name || "")

    const row: string[] = [
      client.client_name || client.full_name || "",
      firstName,
      client.client_email || client.email || "",
      client.phone || client.phone_number || "",
      formatClientType(client.client_type),
      client.status || "",
      new Date(client.created_at).toLocaleDateString("en-AU"),
    ]

    if (includeQuestionnaire) {
      const data = client.questionnaire_data || {}
      row.push(
        data.q1_marital_status || "",
        data.q2_annual_income || "",
        data.q3_partner_income || "",
        data.q4_num_children || "",
        data.q7_employment_status || "",
        data.q11_home_value || "",
        data.q16_total_floor_space || "",
        data.q17_business_floor_space || "",
        data.q28_gst_registered || "",
      )
    }

    if (includePurchase && type === "practice_clients") {
      const purchaseData = client.purchase_data || {}
      row.push(
        client.final_report_purchased_at ? new Date(client.final_report_purchased_at).toLocaleDateString("en-AU") : "",
        purchaseData.amount ? `$${purchaseData.amount}` : "",
        purchaseData.report_type || "Final Report",
      )
    }

    if (type === "practice_clients") {
      const groups = client.client_group_members || []
      const groupNames = groups
        .map((m: any) => m.client_groups?.group_name)
        .filter(Boolean)
        .join("; ")
      const groupRoles = groups
        .map((m: any) => m.role_in_group)
        .filter(Boolean)
        .join("; ")
      row.push(groupNames, groupRoles)
    }

    return row
  })

  // Generate CSV
  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n")

  // Add UTF-8 BOM for Excel compatibility
  const bom = "\uFEFF"
  const csvWithBom = bom + csvContent

  return new NextResponse(csvWithBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mail-merge-${type}-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}

function extractFirstName(fullName: string): string {
  if (!fullName) return ""

  // Check if it's a company name (contains business indicators)
  const companyIndicators = ["Pty", "Ltd", "Trust", "SMSF", "Group", "Holdings", "Partners", "Services", "Solutions"]
  const isCompany = companyIndicators.some((indicator) => fullName.includes(indicator))

  if (isCompany) {
    // For companies, return the full name as the "first name"
    return fullName
  }

  // For individuals in "Last, First" format
  if (fullName.includes(",")) {
    const parts = fullName.split(",").map((p) => p.trim())
    return parts[1] || parts[0] // Return first name (second part) or fallback to first part
  }

  // For names without comma, return first word
  return fullName.split(" ")[0]
}

function formatClientType(type: string | null): string {
  if (!type) return ""
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

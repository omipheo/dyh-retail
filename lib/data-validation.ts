import { createServerClient } from "@/lib/supabase/server"

export interface DataValidationIssue {
  field: string
  issue: string
  severity: "warning" | "error" | "critical"
  requiresManualReview: boolean
}

export async function validateClientData(clientData: any, assessmentId: string): Promise<DataValidationIssue[]> {
  const issues: DataValidationIssue[] = []

  // Required fields validation
  const requiredFields = [
    { field: "full_name", label: "Full Name" },
    { field: "email", label: "Email Address" },
    { field: "legal_structure", label: "Business Legal Structure" },
    { field: "home_size_sqm", label: "Total Home Size" },
    { field: "office_size_sqm", label: "Home Office Size" },
    { field: "office_hours_per_week", label: "Office Hours per Week" },
  ]

  for (const { field, label } of requiredFields) {
    if (!clientData[field] || clientData[field] === "" || clientData[field] === "0") {
      issues.push({
        field,
        issue: `${label} is missing or invalid`,
        severity: "error",
        requiresManualReview: true,
      })
    }
  }

  // Calculation-critical fields
  if (!clientData.building_value || Number.parseFloat(clientData.building_value) <= 0) {
    issues.push({
      field: "building_value",
      issue: "Building value is required for depreciation calculation (2.5% p.a.)",
      severity: "critical",
      requiresManualReview: true,
    })
  }

  // Property expenses validation
  const propertyExpenseFields = [
    { field: "home_loan_interest_annual", label: "Home Loan Interest" },
    { field: "council_rates_annual", label: "Council Rates" },
    { field: "water_rates_annual", label: "Water Rates" },
    { field: "building_insurance_annual", label: "Building Insurance" },
  ]

  for (const { field, label } of propertyExpenseFields) {
    if (!clientData[field]) {
      issues.push({
        field,
        issue: `${label} not provided - cannot calculate accurate property expense deductions`,
        severity: "warning",
        requiresManualReview: true,
      })
    }
  }

  // Internet/phone business use percentage validation
  if (!clientData.internet_business_use_percentage) {
    issues.push({
      field: "internet_business_use_percentage",
      issue:
        "Internet business use percentage not provided - client must analyze 30-day bill to determine actual business usage",
      severity: "warning",
      requiresManualReview: true,
    })
  }

  if (!clientData.phone_business_use_percentage) {
    issues.push({
      field: "phone_business_use_percentage",
      issue:
        "Phone business use percentage not provided - client must analyze 30-day bill to determine actual business usage",
      severity: "warning",
      requiresManualReview: true,
    })
  }

  // Office size validation
  const homeSize = Number.parseFloat(clientData.home_size_sqm || "0")
  const officeSize = Number.parseFloat(clientData.office_size_sqm || "0")

  if (officeSize > homeSize) {
    issues.push({
      field: "office_size_sqm",
      issue: "Office size exceeds total home size - this is logically impossible and requires verification",
      severity: "critical",
      requiresManualReview: true,
    })
  }

  if (officeSize > homeSize * 0.5) {
    issues.push({
      field: "office_size_sqm",
      issue: "Office size exceeds 50% of home - may trigger ATO scrutiny, requires manual review",
      severity: "warning",
      requiresManualReview: true,
    })
  }

  // Strategy Selector validation
  if (!clientData.strategy_selector_responses || Object.keys(clientData.strategy_selector_responses).length === 0) {
    issues.push({
      field: "strategy_selector_responses",
      issue: "DYH Strategy Selector questionnaire not completed - cannot determine appropriate DYH procedure",
      severity: "critical",
      requiresManualReview: true,
    })
  }

  // Document uploads validation
  if (!clientData.documents_uploaded || clientData.documents_uploaded === 0) {
    issues.push({
      field: "documents_uploaded",
      issue: "No supporting documents uploaded - manual review required to verify client claims",
      severity: "warning",
      requiresManualReview: true,
    })
  }

  // Send messages to tax agent for issues requiring manual review
  if (issues.length > 0) {
    await notifyTaxAgentOfIssues(assessmentId, issues)
  }

  return issues
}

async function notifyTaxAgentOfIssues(assessmentId: string, issues: DataValidationIssue[]): Promise<void> {
  try {
    const supabase = await createServerClient()

    // Get the assessment to find the client and tax agent
    const { data: assessment } = await supabase
      .from("client_assessments")
      .select("client_id, profiles!client_assessments_client_id_fkey(id, full_name, email)")
      .eq("id", assessmentId)
      .single()

    if (!assessment) {
      console.error("[v0] Assessment not found for notification")
      return
    }

    // Get tax agent (anyone with role 'tax_agent')
    const { data: taxAgents } = await supabase.from("profiles").select("id").eq("role", "tax_agent").limit(1)

    if (!taxAgents || taxAgents.length === 0) {
      console.error("[v0] No tax agent found for notification")
      return
    }

    const taxAgentId = taxAgents[0].id
    const clientInfo = assessment.profiles as any

    // Group issues by severity
    const criticalIssues = issues.filter((i) => i.severity === "critical")
    const errorIssues = issues.filter((i) => i.severity === "error")
    const warningIssues = issues.filter((i) => i.severity === "warning")

    // Construct detailed message
    let messageText = `**AUTOMATED SYSTEM ALERT: Manual Review Required**\n\n`
    messageText += `**Client:** ${clientInfo?.full_name || "Unknown"} (${clientInfo?.email || "No email"})\n`
    messageText += `**Assessment ID:** ${assessmentId}\n\n`

    if (criticalIssues.length > 0) {
      messageText += `**CRITICAL ISSUES (${criticalIssues.length}):**\n`
      criticalIssues.forEach((issue, index) => {
        messageText += `${index + 1}. **${issue.field}**: ${issue.issue}\n`
      })
      messageText += `\n`
    }

    if (errorIssues.length > 0) {
      messageText += `**ERRORS (${errorIssues.length}):**\n`
      errorIssues.forEach((issue, index) => {
        messageText += `${index + 1}. **${issue.field}**: ${issue.issue}\n`
      })
      messageText += `\n`
    }

    if (warningIssues.length > 0) {
      messageText += `**WARNINGS (${warningIssues.length}):**\n`
      warningIssues.forEach((issue, index) => {
        messageText += `${index + 1}. **${issue.field}**: ${issue.issue}\n`
      })
      messageText += `\n`
    }

    messageText += `\n**ACTION REQUIRED:**\n`
    messageText += `Please review this assessment manually and contact the client to obtain missing information or clarify discrepancies before proceeding with final report generation.`

    // Determine priority based on severity
    const priority = criticalIssues.length > 0 ? "urgent" : errorIssues.length > 0 ? "high" : "normal"

    // Send message
    const { error: messageError } = await supabase.from("messages").insert({
      assessment_id: assessmentId,
      sender_id: "00000000-0000-0000-0000-000000000000", // System user ID
      recipient_id: taxAgentId,
      subject: `Manual Review Required: ${issues.length} Issue${issues.length > 1 ? "s" : ""} Detected`,
      message_text: messageText,
      message_type: "system_alert",
      priority,
      is_read: false,
    })

    if (messageError) {
      console.error("[v0] Error sending notification:", messageError)
    } else {
      console.log(`[v0] Notification sent to tax agent for assessment ${assessmentId}`)
    }
  } catch (error) {
    console.error("[v0] Error in notifyTaxAgentOfIssues:", error)
  }
}

export async function validateCalculations(
  clientData: any,
  calculations: any,
  assessmentId: string,
): Promise<DataValidationIssue[]> {
  const issues: DataValidationIssue[] = []

  // Check if calculations produced valid results
  if (!calculations || typeof calculations !== "object") {
    issues.push({
      field: "calculations",
      issue: "System failed to generate calculations - manual calculation required",
      severity: "critical",
      requiresManualReview: true,
    })
  }

  // Validate calculation results
  if (calculations.totalDeductionActual < 0 || calculations.totalDeductionFixed < 0) {
    issues.push({
      field: "deduction_amounts",
      issue: "Calculated deductions are negative - indicates data error or calculation issue",
      severity: "critical",
      requiresManualReview: true,
    })
  }

  // Check for unrealistic deductions (exceeding income)
  if (clientData.annual_income && calculations.totalDeductionActual > Number.parseFloat(clientData.annual_income)) {
    issues.push({
      field: "deduction_amounts",
      issue: "Calculated deductions exceed annual income - requires verification and ATO compliance review",
      severity: "critical",
      requiresManualReview: true,
    })
  }

  // Notify if issues found
  if (issues.length > 0) {
    await notifyTaxAgentOfIssues(assessmentId, issues)
  }

  return issues
}

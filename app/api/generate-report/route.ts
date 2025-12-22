import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
import { type NextRequest, NextResponse } from "next/server"
import { readFileSync, writeFileSync, unlinkSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

// Try final_report.docx first, fallback to word_corrected.docx
const TEMPLATE_PATH_FINAL = join(process.cwd(), "public", "templates", "final_report.docx")
const TEMPLATE_PATH_FALLBACK = join(process.cwd(), "public", "templates", "word_corrected.docx")

function getTemplatePath(): string {
  const fs = require("fs")
  if (fs.existsSync(TEMPLATE_PATH_FINAL)) {
    return TEMPLATE_PATH_FINAL
  }
  return TEMPLATE_PATH_FALLBACK
}

/**
 * Convert DOCX buffer to PDF buffer
 * For Vercel serverless, we'll try multiple approaches:
 * 1. Use docx-pdf if LibreOffice is available (local dev or Docker)
 * 2. Use a cloud conversion service if configured
 * 3. Fall back to DOCX if conversion fails
 */
async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
  const fs = require("fs")
  const path = require("path")

  // Try using docx-pdf library (requires LibreOffice)
  try {
    // Dynamic import to avoid errors if library is not installed
    const docxPdf = require("docx-pdf")
    const tmpDocx = path.join(tmpdir(), `temp_${Date.now()}_${Math.random().toString(36).substring(7)}.docx`)
    const tmpPdf = path.join(tmpdir(), `temp_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`)

    try {
      writeFileSync(tmpDocx, docxBuffer)
      console.log("[v0] 📝 Temporary DOCX created:", tmpDocx)

      await new Promise<void>((resolve, reject) => {
        docxPdf(tmpDocx, tmpPdf, (err: Error | null) => {
          if (err) {
            console.error("[v0] ❌ docx-pdf conversion error:", err)
            reject(err)
          } else {
            resolve()
          }
        })
      })

      const pdfBuffer = readFileSync(tmpPdf)
      console.log("[v0] ✅ PDF generated successfully")

      // Cleanup
      try {
        unlinkSync(tmpDocx)
        unlinkSync(tmpPdf)
      } catch (cleanupErr) {
        console.warn("[v0] ⚠️  Cleanup warning:", cleanupErr)
      }

      return pdfBuffer
    } catch (fileError: any) {
      // Cleanup on error
      try {
        if (fs.existsSync(tmpDocx)) unlinkSync(tmpDocx)
        if (fs.existsSync(tmpPdf)) unlinkSync(tmpPdf)
      } catch {}
      throw fileError
    }
  } catch (error: any) {
    // If docx-pdf is not available or LibreOffice is not installed, try alternative
    console.warn("[v0] ⚠️  docx-pdf not available, trying alternative methods...")

    // Option: Use CloudConvert API if configured
    if (process.env.CLOUDCONVERT_API_KEY) {
      try {
        return await convertViaCloudConvert(docxBuffer)
      } catch (cloudError: any) {
        console.warn("[v0] ⚠️  CloudConvert failed:", cloudError.message)
      }
    }

    // If all methods fail, throw error to trigger DOCX fallback
    throw new Error(
      `PDF conversion failed: ${error.message}. Install LibreOffice and docx-pdf package, or configure CLOUDCONVERT_API_KEY for cloud conversion.`,
    )
  }
}

/**
 * Convert DOCX to PDF using CloudConvert API
 * Requires CLOUDCONVERT_API_KEY environment variable
 */
async function convertViaCloudConvert(docxBuffer: Buffer): Promise<Buffer> {
  const apiKey = process.env.CLOUDCONVERT_API_KEY
  if (!apiKey) {
    throw new Error("CLOUDCONVERT_API_KEY not configured")
  }

  // Create a job with proper CloudConvert v2 API structure
  const jobResponse = await fetch("https://api.cloudconvert.com/v2/jobs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tasks: {
        "import-1": {
          operation: "import/upload",
        },
        "convert-1": {
          operation: "convert",
          input: "import-1",
          output_format: "pdf",
          engine: "office",
        },
        "export-1": {
          operation: "export/url",
          input: "convert-1",
        },
      },
    }),
  })

  if (!jobResponse.ok) {
    const errorData = await jobResponse.json().catch(() => ({}))
    throw new Error(`CloudConvert job creation failed: ${errorData.message || jobResponse.statusText}`)
  }

  const jobData = await jobResponse.json()
  const jobId = jobData.data.id

  // Upload the file using the upload URL from the job
  const importTask = jobData.data.tasks.find((t: any) => t.operation === "import/upload")
  const uploadUrl = importTask?.result?.form?.url
  const uploadFields = importTask?.result?.form?.parameters

  if (!uploadUrl || !uploadFields) {
    throw new Error("CloudConvert upload URL or fields not found")
  }

  // Create form data for upload
  const FormData = require("form-data")
  const form = new FormData()
  Object.entries(uploadFields).forEach(([key, value]) => {
    form.append(key, value as string)
  })
  form.append("file", docxBuffer, { filename: "document.docx", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    body: form,
  })

  if (!uploadResponse.ok) {
    throw new Error(`CloudConvert upload failed: ${uploadResponse.statusText}`)
  }

  // Wait for conversion to complete
  let status = "waiting"
  let attempts = 0
  const maxAttempts = 60 // 60 seconds timeout

  while (status !== "finished" && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!statusResponse.ok) {
      throw new Error(`CloudConvert status check failed: ${statusResponse.statusText}`)
    }

    const statusData = await statusResponse.json()
    status = statusData.data.status

    if (status === "error") {
      throw new Error(`CloudConvert conversion failed: ${statusData.data.message || "Unknown error"}`)
    }

    attempts++
  }

  if (status !== "finished") {
    throw new Error(`CloudConvert conversion timeout after ${maxAttempts} seconds`)
  }

  // Get the final job status to find export URL
  const finalStatusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
  const finalStatusData = await finalStatusResponse.json()
  const exportTask = finalStatusData.data.tasks.find((t: any) => t.operation === "export/url")
  const exportUrl = exportTask?.result?.files?.[0]?.url

  if (!exportUrl) {
    throw new Error("CloudConvert export URL not found")
  }

  // Download the PDF
  const pdfResponse = await fetch(exportUrl)
  if (!pdfResponse.ok) {
    throw new Error(`CloudConvert PDF download failed: ${pdfResponse.statusText}`)
  }

  const arrayBuffer = await pdfResponse.arrayBuffer()
  const pdfBuffer = Buffer.from(arrayBuffer)

  return pdfBuffer
}

function cleanFragmentedPlaceholders(zip: PizZip): PizZip {
  console.log("[v0] 🧹 Starting comprehensive XML placeholder healing...")

  const documentXml = zip.files["word/document.xml"]
  if (!documentXml) {
    console.warn("[v0] ⚠️  No document.xml found to clean")
    return zip
  }

  let xmlContent = documentXml.asText()
  console.log("[v0] 📄 Original XML length:", xmlContent.length)

  // Count placeholders before cleaning
  const beforeMatches = xmlContent.match(/\{[^{}]*\}/g) || []
  console.log("[v0] 📊 Placeholders before cleaning:", beforeMatches.length)

  let totalReplacements = 0

  // Strategy: Find all text between { and }, remove ALL internal XML tags
  // This regex finds { followed by any characters and XML tags, ending with }
  const comprehensivePattern = /\{([^{}]*(?:<[^>]+>[^{}]*)*)\}/g

  xmlContent = xmlContent.replace(comprehensivePattern, (match) => {
    // Check if this match contains XML tags
    if (match.includes("<")) {
      totalReplacements++

      // Extract just the text content, removing all XML tags
      // Match opening brace
      let cleaned = match.replace(/\{/, "{")

      // Remove all XML tags between the braces: </w:t>, <w:r>, <w:t>, etc.
      cleaned = cleaned.replace(/<\/w:t>/g, "")
      cleaned = cleaned.replace(/<w:r[^>]*>/g, "")
      cleaned = cleaned.replace(/<w:t[^>]*>/g, "")
      cleaned = cleaned.replace(/<w:rPr[^>]*>/g, "")
      cleaned = cleaned.replace(/<\/w:rPr>/g, "")
      cleaned = cleaned.replace(/<\/w:r>/g, "")
      cleaned = cleaned.replace(/<w:rFonts[^>]*\/>/g, "")
      cleaned = cleaned.replace(/<w:b[^>]*\/>/g, "")
      cleaned = cleaned.replace(/<w:bCs[^>]*\/>/g, "")
      cleaned = cleaned.replace(/<w:i[^>]*\/>/g, "")
      cleaned = cleaned.replace(/<w:color[^>]*\/>/g, "")
      cleaned = cleaned.replace(/<w:sz[^>]*\/>/g, "")
      cleaned = cleaned.replace(/<w:szCs[^>]*\/>/g, "")
      cleaned = cleaned.replace(/<w:u[^>]*\/>/g, "")

      // Log the transformation for first 20 replacements
      if (totalReplacements <= 20) {
        console.log(`[v0] 🔧 Healed placeholder ${totalReplacements}:`)
        console.log(`     FROM: ${match.substring(0, 80)}${match.length > 80 ? "..." : ""}`)
        console.log(`     TO:   ${cleaned}`)
      }

      return cleaned
    }
    return match
  })

  // Additional pass: handle any remaining split braces
  // Pattern: <w:t>{</w:t> ... <w:t>CONTENT}</w:t>
  const splitOpeningBrace = /<w:t[^>]*>\{<\/w:t>(?:<[^>]+>)*<w:t[^>]*>([^<]+)\}/g
  xmlContent = xmlContent.replace(splitOpeningBrace, (match, content) => {
    totalReplacements++
    const cleaned = `{${content}}`
    if (totalReplacements <= 20) {
      console.log(`[v0] 🔧 Fixed split opening brace: ${cleaned}`)
    }
    return `<w:t>${cleaned}</w:t>`
  })

  // Pattern: {CONTENT<w:t>}</w:t>
  const splitClosingBrace = /\{([^<]+)<\/w:t>(?:<[^>]+>)*<w:t[^>]*>\}/g
  xmlContent = xmlContent.replace(splitClosingBrace, (match, content) => {
    totalReplacements++
    const cleaned = `{${content}}`
    if (totalReplacements <= 20) {
      console.log(`[v0] 🔧 Fixed split closing brace: ${cleaned}`)
    }
    return `<w:t>${cleaned}</w:t>`
  })

  // Count placeholders after cleaning
  const afterMatches = xmlContent.match(/\{[^{}]*\}/g) || []
  console.log("[v0] 📊 Placeholders after cleaning:", afterMatches.length)
  console.log("[v0] ✅ Total XML fragments healed:", totalReplacements)
  console.log("[v0] 📄 Cleaned XML length:", xmlContent.length)

  // Update the document.xml with cleaned content
  zip.file("word/document.xml", xmlContent)

  return zip
}

function mapQuestionnairesToTemplateData(questionnaire1: any, questionnaire2?: any): Record<string, any> {
  // Merge both questionnaires if provided
  const merged = { ...questionnaire1, ...(questionnaire2 || {}) }

  // Helper function to safely convert to number and format
  const toNumber = (value: any): number => {
    if (typeof value === "number") return value
    if (typeof value === "string") {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""))
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  const formatCurrency = (value: any): string => {
    const num = toNumber(value)
    return num > 0 ? num.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""
  }

  // Map all fields from both questionnaires to template placeholders
  return {
    // Client Information
    CLIENT_NAME: merged.client_name || merged.CLIENT_NAME || merged.q1_marital_status || "",
    CLIENT_FULL_NAME: merged.client_full_name || merged.CLIENT_FULL_NAME || merged.client_name || "",
    CLIENT_ADDRESS: merged.property_address || merged.CLIENT_ADDRESS || "",
    CLIENT_BUSINESS_NAME: merged.business_name || merged.CLIENT_BUSINESS_NAME || merged.industry_description || "",
    CLIENT_BUSINESS_TYPE: merged.business_type || merged.CLIENT_BUSINESS_TYPE || merged.legal_structure || "",
    CLIENT_ABN: merged.abn || merged.CLIENT_ABN || "",
    CLIENT_BUSINESS_START_DATE: merged.business_start_date || merged.CLIENT_BUSINESS_START_DATE || "",

    // Financial Data - Quick Questionnaire
    TAXABLE_INCOME: formatCurrency(merged.taxable_income || merged.q2_annual_income || merged.annual_income) || "",
    PARTNER_INCOME: formatCurrency(merged.q3_partner_income || merged.partner_income) || "",
    MORTGAGE_BALANCE: formatCurrency(merged.mortgage_balance) || "",
    PROPERTY_VALUE: formatCurrency(merged.property_value || merged.q11_home_value || merged.home_value) || "",
    BUILDING_VALUE: formatCurrency(merged.building_value) || "",
    BUP_PERCENTAGE: merged.bup_percentage?.toString() || "",
    PERSONAL_DEBTS: formatCurrency(merged.q12_personal_debts || merged.personal_debts) || "",
    PARTNER_DEBTS: formatCurrency(merged.q13_partner_debts || merged.partner_debts) || "",

    // Family Information
    MARITAL_STATUS: merged.q1_marital_status || merged.marital_status || "",
    NUM_CHILDREN: merged.q4_num_children || merged.num_children || "",
    CHILDREN_AGES: merged.q5_ages_children || merged.children_ages || "",
    CHILDREN_INCOMES: formatCurrency(merged.q6_children_incomes || merged.children_incomes) || "",
    EMPLOYMENT_STATUS: merged.q7_employment_status || merged.employment_status || "",
    PARTNER_EMPLOYMENT: merged.q8_partner_employment || merged.partner_employment_status || "",

    // Property Information
    IS_RENTING: merged.q9_renting || merged.is_renting || "",
    HOME_STATUS: merged.q10_home_status || merged.home_paid_off_or_owing || "",
    HOME_SUITABLE: merged.q14_home_status || merged.home_suitable_for_business || "",
    PREFER_MOVE_EXTEND: merged.q15_prefer_move_extend || merged.prefer_move_or_extend || "",
    TOTAL_FLOOR_SPACE: merged.q16_total_floor_space || merged.total_floor_space_sqm || "",
    BUSINESS_FLOOR_SPACE: merged.q17_business_floor_space || merged.business_floor_space_sqm || "",

    // Property Expenses - Quick Questionnaire (Q29)
    MORTGAGE_INTEREST: formatCurrency(
      merged.questionnaire_data?.mortgage_interest ||
        merged.mortgage_interest ||
        merged.q29_loan_interest ||
        merged.ss_q44_rent,
    ) || "",
    COUNCIL_RATES: formatCurrency(
      merged.questionnaire_data?.council_rates || merged.council_rates || merged.q29_council_rates || merged.ss_q44_council,
    ) || "",
    WATER_RATES: formatCurrency(
      merged.questionnaire_data?.water_rates || merged.water_rates || merged.q29_water_rates || merged.ss_q44_water,
    ) || "",
    BUILDING_INSURANCE: formatCurrency(merged.questionnaire_data?.building_insurance || merged.building_insurance) || "",
    INSURANCE: formatCurrency(merged.questionnaire_data?.building_insurance || merged.building_insurance) || "",
    REPAIRS_MAINTENANCE: formatCurrency(merged.questionnaire_data?.repairs_maintenance || merged.repairs_maintenance) || "",
    REPAIRS: formatCurrency(merged.questionnaire_data?.repairs_maintenance || merged.repairs_maintenance) || "",
    ELECTRICITY: formatCurrency(merged.questionnaire_data?.electricity_annual || merged.electricity_annual) || "",
    GAS: formatCurrency(merged.questionnaire_data?.gas_annual || merged.gas_annual) || "",
    CLEANING: formatCurrency(merged.questionnaire_data?.cleaning_annual || merged.cleaning_annual) || "",
    DEPRECIATION: formatCurrency(
      merged.questionnaire_data?.depreciation || merged.depreciation || merged.q29_equipment_depreciation || merged.ss_q44_equipment_depreciation,
    ) || "",
    LAND_TAX: formatCurrency(merged.q29_land_tax || merged.ss_q44_land_tax) || "",
    ADVERTISING: formatCurrency(merged.q29_advertising || merged.ss_q44_advertising) || "",
    EQUIPMENT_LEASE: formatCurrency(merged.q29_equipment_lease || merged.ss_q44_equipment_lease) || "",
    VEHICLE_EXPENSES: formatCurrency(merged.q29_vehicle_expenses || merged.ss_q44_vehicle) || "",
    STAFF_COST: formatCurrency(merged.q29_staff_cost || merged.ss_q44_staff) || "",
    STAFF_SUPER: formatCurrency(merged.q29_staff_super || merged.ss_q44_super) || "",
    STAFF_NUM: merged.q29_staff_num || merged.ss_q44_staff_num || "",
    POWER_BUSINESS_PCT: merged.q29_power_business_pct || merged.ss_q44_power || "",
    PHONE_BUSINESS_PCT: merged.q29_phone_business_pct || merged.ss_q44_phone || "",
    RENT_ANNUAL: formatCurrency(merged.q29_rent_annual || merged.ss_q44_rent || merged.annual_premises_cost) || "",

    // Deductible Amounts (calculated based on BUP percentage)
    MORTGAGE_INTEREST_DEDUCTIBLE: merged.bup_percentage
      ? formatCurrency(
          toNumber(merged.questionnaire_data?.mortgage_interest || merged.mortgage_interest || merged.q29_loan_interest) *
            (toNumber(merged.bup_percentage) / 100),
        )
      : "",
    RATES_DEDUCTIBLE: merged.bup_percentage
      ? formatCurrency(
          toNumber(merged.questionnaire_data?.council_rates || merged.council_rates || merged.q29_council_rates) *
            (toNumber(merged.bup_percentage) / 100),
        )
      : "",
    WATER_DEDUCTIBLE: merged.bup_percentage
      ? formatCurrency(
          toNumber(merged.questionnaire_data?.water_rates || merged.water_rates || merged.q29_water_rates) *
            (toNumber(merged.bup_percentage) / 100),
        )
      : "",
    INSURANCE_DEDUCTIBLE: merged.bup_percentage
      ? formatCurrency(
          toNumber(merged.questionnaire_data?.building_insurance || merged.building_insurance) *
            (toNumber(merged.bup_percentage) / 100),
        )
      : "",
    REPAIRS_DEDUCTIBLE: merged.bup_percentage
      ? formatCurrency(
          toNumber(merged.questionnaire_data?.repairs_maintenance || merged.repairs_maintenance) *
            (toNumber(merged.bup_percentage) / 100),
        )
      : "",
    ELECTRICITY_DEDUCTIBLE: merged.bup_percentage
      ? formatCurrency(
          toNumber(merged.questionnaire_data?.electricity_annual || merged.electricity_annual) *
            (toNumber(merged.bup_percentage) / 100),
        )
      : "",
    GAS_DEDUCTIBLE: merged.bup_percentage
      ? formatCurrency(
          toNumber(merged.questionnaire_data?.gas_annual || merged.gas_annual) * (toNumber(merged.bup_percentage) / 100),
        )
      : "",
    CLEANING_DEDUCTIBLE: merged.bup_percentage
      ? formatCurrency(
          toNumber(merged.questionnaire_data?.cleaning_annual || merged.cleaning_annual) *
            (toNumber(merged.bup_percentage) / 100),
        )
      : "",
    DEPRECIATION_DEDUCTIBLE: merged.bup_percentage
      ? formatCurrency(
          toNumber(merged.questionnaire_data?.depreciation || merged.depreciation || merged.q29_equipment_depreciation) *
            (toNumber(merged.bup_percentage) / 100),
        )
      : "",

    // Strategy Information
    RECOMMENDED_STRATEGY: merged.strategy_name || merged.strategy || "",
    RECOMMENDATION_TEXT: merged.strategy_description || merged.strategy_name || merged.strategy || "",
    STRATEGY_CODE: merged.strategy || "",

    // Business Use Calculation
    HOURS_PER_WEEK: merged.hours_per_week?.toString() || merged.ss_q48_time?.match(/\d+/)?.[0] || "",
    WEEKS_PER_YEAR: merged.weeks_per_year?.toString() || "52",
    TOTAL_HOURS:
      merged.hours_per_week && merged.weeks_per_year
        ? (toNumber(merged.hours_per_week) * toNumber(merged.weeks_per_year)).toString()
        : "",

    // Years Operating
    YEARS_OPERATED: merged.q20_years_operated || merged.years_operating_from_home || "",
    PAST_BUSINESS_SQM: merged.q21_past_business_sqm || merged.past_exclusive_use_sqm || "",
    YEARS_CLAIMED_DEDUCTIONS: merged.q22_years_claimed_deductions || merged.years_claimed_mortgage_interest || "",

    // Accountant & GST
    HAS_ACCOUNTANT: merged.q23_has_accountant || merged.used_accountant || "",
    KNOWS_INSURANCE: merged.q24_knows_insurance || merged.knows_professional_indemnity || "",
    ACCOUNTANT_RATING: merged.q25_accountant_rating || merged.attachment_to_accountant || "",
    HAS_RENTED_PREMISES: merged.q26_has_rented_premises || merged.has_rented_premises || "",
    RENTAL_COST: formatCurrency(merged.q27_rental_cost || merged.annual_premises_cost) || "",
    GST_REGISTERED: merged.q28_gst_registered || merged.is_gst_registered || "",

    // Additional Spaces (Q18-Q19)
    SHEDS_NUM: merged.q18_sheds_num || merged.sheds_count || "",
    SHEDS_SIZES: merged.q18_sheds_sizes || merged.sheds_sizes || "",
    DRIVEWAYS_NUM: merged.q18_driveways_num || merged.driveways_count || "",
    DRIVEWAYS_TYPE: merged.q18_driveways_type || "",
    CARPORTS_NUM: merged.q18_carports_num || merged.carports_count || "",
    CARPORTS_TYPE: merged.q18_carports_type || "",
    GARAGES_NUM: merged.q18_garages_num || merged.garages_count || "",
    GARAGES_TYPE: merged.q18_garages_type || "",
    PATIOS_NUM: merged.q18_patios_num || merged.patios_count || "",
    PATIOS_SIZES: merged.q18_patios_sizes || merged.patios_sizes || "",
    UNCOVERED_NUM: merged.q18_uncovered_num || merged.uncovered_count || "",
    UNCOVERED_SIZES: merged.q18_uncovered_sizes || merged.uncovered_sizes || "",
    VEHICLES_BUSINESS: merged.q18_vehicles_business || "",
    VEHICLES_PERSONAL: merged.q18_vehicles_personal || "",

    // Business Space Calculations (Q19)
    SHEDS_BUSINESS_SQM: merged.q19_sheds_business_sqm || merged.sheds_business_sqm || "",
    DRIVEWAYS_BUSINESS_SQM: merged.q19_driveways_business_sqm || merged.driveways_business_sqm || "",
    CARPORTS_BUSINESS_SQM: merged.q19_carports_business_sqm || merged.carports_business_sqm || "",
    GARAGES_BUSINESS_SQM: merged.q19_garages_business_sqm || merged.garages_business_sqm || "",
    PATIOS_BUSINESS_SQM: merged.q19_patios_business_sqm || merged.patios_business_sqm || "",
    UNCOVERED_BUSINESS_SQM: merged.q19_uncovered_business_sqm || merged.uncovered_business_sqm || "",

    // Other Expenses (Q29)
    OTHER1_DESC: merged.q29_other1_desc || merged.ss_q44_other1 || "",
    OTHER1_AMT: formatCurrency(merged.q29_other1_amt || merged.ss_q44_other1) || "",
    OTHER2_DESC: merged.q29_other2_desc || merged.ss_q44_other2 || "",
    OTHER2_AMT: formatCurrency(merged.q29_other2_amt || merged.ss_q44_other2) || "",
    OTHER3_DESC: merged.q29_other3_desc || merged.ss_q44_other3 || "",
    OTHER3_AMT: formatCurrency(merged.q29_other3_amt || merged.ss_q44_other3) || "",
    OTHER4_DESC: merged.q29_other4_desc || merged.ss_q44_other4 || "",
    OTHER4_AMT: formatCurrency(merged.q29_other4_amt || merged.ss_q44_other4) || "",

    // Comments
    COMMENT1: merged.comment1 || merged.comment_1 || "",
    COMMENT2: merged.comment2 || merged.comment_2 || "",
    COMMENT3: merged.comment3 || merged.comment_3 || "",

    // Strategy Selector Fields (if present)
    SS_PLANT_EQUIPMENT: formatCurrency(merged.ss_q1_plant_equipment) || "",
    SS_GOODWILL: formatCurrency(merged.ss_q1_goodwill) || "",
    SS_IP_PATENTS: formatCurrency(merged.ss_q1_ip_patents) || "",
    SS_REAL_PROPERTY: formatCurrency(merged.ss_q1_real_property) || "",
    SS_LIABILITIES: formatCurrency(merged.ss_q2_liabilities) || "",
    SS_EXPERIENCE: merged.ss_q22_experience || "",
    SS_LEARNED: merged.ss_q23_learned || "",
    SS_ATTITUDE: merged.ss_q36_attitude || "",
    SS_SMSF: merged.ss_q37_smsf || "",
    SS_PRE_RETIREMENT: merged.ss_q38_pre_retirement || "",
    SS_POST_RETIREMENT: merged.ss_q38_post_retirement || "",
    SS_LIKES: merged.ss_q39_likes || "",
    SS_DISLIKES: merged.ss_q40_dislikes || "",
    SS_DROP: merged.ss_q42_drop || "",
    SS_AMOUNT: formatCurrency(merged.ss_q43_amount) || "",
    SS_SKILLS: merged.ss_q47_skills || "",
    SS_WHY: merged.ss_q52_why || "",
    SS_PURSUIT1: merged.ss_q53_pursuit1 || "",
    SS_PURSUIT2: merged.ss_q53_pursuit2 || "",
    SS_PURSUIT3: merged.ss_q53_pursuit3 || "",
    SS_PRIORITY1: merged.ss_q56_priority1 || "",
    SS_PRIORITY2: merged.ss_q56_priority2 || "",
    SS_PRIORITY3: merged.ss_q56_priority3 || "",
    SS_DESC: merged.ss_q63_desc || "",

    // Total Claims
    TOTAL_CLAIM_PER_THE_RUNNING_COST_METHOD: "", // This will be calculated if needed

    // Pass through any additional fields (flatten nested objects)
    ...Object.fromEntries(
      Object.entries(merged).map(([key, value]) => [
        key.toUpperCase(),
        typeof value === "object" && value !== null ? JSON.stringify(value) : value,
      ]),
    ),
    ...merged,
  }
}

export async function POST(request: NextRequest) {
  console.log("[v0] 🚀 Starting report generation...")

  try {
    console.log("[v0] 📖 Reading request body...")
    const body = await request.json()
    console.log("[v0] ✅ Request body parsed successfully")

    const { questionnaire1, questionnaire2, clientName } = body

    if (!questionnaire1 && !questionnaire2) {
      console.log("[v0] ❌ No questionnaire data provided")
      return NextResponse.json({ error: "At least one questionnaire is required" }, { status: 400 })
    }

    const templatePath = getTemplatePath()
    console.log("[v0] 📁 Loading template from:", templatePath)

    const fs = require("fs")
    if (!fs.existsSync(templatePath)) {
      console.error("[v0] ❌ Template file not found at:", templatePath)
      return NextResponse.json({ error: `Template file not found at ${templatePath}` }, { status: 500 })
    }

    const templateBuffer = readFileSync(templatePath)
    console.log("[v0] ✅ Template loaded, size:", templateBuffer.length, "bytes")

    if (templateBuffer.length === 0) {
      console.error("[v0] ❌ Template file is empty")
      return NextResponse.json({ error: "Template file is empty or corrupted" }, { status: 500 })
    }

    console.log("[v0] 📦 Creating PizZip from template buffer...")
    const zip = new PizZip(templateBuffer)
    console.log("[v0] ✅ PizZip created successfully")

    console.log("[v0] 🧹 Cleaning fragmented XML placeholders...")
    const cleanedZip = cleanFragmentedPlaceholders(zip)
    console.log("[v0] ✅ XML cleaning complete")

    console.log("[v0] 🔧 Mapping questionnaire data...")
    const questionnaireData = mapQuestionnairesToTemplateData(questionnaire1, questionnaire2)
    console.log("[v0] ✅ Data mapping complete, fields:", Object.keys(questionnaireData).length)

    console.log("[v0] 📝 Initializing Docxtemplater...")
    const doc = new Docxtemplater(cleanedZip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: (part: any) => {
        console.log("[v0] ⚠️  Missing placeholder:", part.value)
        return ""
      },
    })
    console.log("[v0] ✅ Docxtemplater initialized")

    console.log("[v0] 🎨 Rendering document with data...")
    doc.render(questionnaireData)
    console.log("[v0] ✅ Document rendered successfully")

    console.log("[v0] 📦 Generating DOCX buffer...")
    const docxBuffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    })
    console.log("[v0] ✅ DOCX buffer generated, size:", docxBuffer.length, "bytes")

    // Convert DOCX to PDF
    console.log("[v0] 🔄 Converting DOCX to PDF...")
    let pdfBuffer: Buffer
    let filename: string
    let contentType: string

    try {
      // Try to convert to PDF using docx-pdf or alternative method
      pdfBuffer = await convertDocxToPdf(docxBuffer)
      filename = `Tax_Report_${clientName || "Client"}_${new Date().toISOString().split("T")[0]}.pdf`
      contentType = "application/pdf"
      console.log("[v0] ✅ PDF conversion successful, size:", pdfBuffer.length, "bytes")
    } catch (pdfError: any) {
      console.warn("[v0] ⚠️  PDF conversion failed, falling back to DOCX:", pdfError.message)
      // Fallback to DOCX if PDF conversion fails
      pdfBuffer = docxBuffer
      filename = `Tax_Report_${clientName || "Client"}_${new Date().toISOString().split("T")[0]}.docx`
      contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }

    console.log("[v0] ✨ Report generation complete! File:", filename)

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error("[v0] ❌ Report generation error:", error)
    console.error("[v0] ❌ Error stack:", error.stack)

    let errorMessage = "Internal server error"
    if (error.message?.includes("Multi error")) {
      errorMessage =
        "Template has broken placeholders. Please fix the Word template by retyping all {placeholders} as continuous text."
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

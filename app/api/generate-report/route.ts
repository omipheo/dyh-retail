import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
import { type NextRequest, NextResponse } from "next/server"
import { readFileSync, writeFileSync, unlinkSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

// Use the final_report.docx template (required)
const TEMPLATE_PATH = join(process.cwd(), "public", "templates", "final_report.docx")

function getTemplatePath(): string {
  const fs = require("fs")
  return TEMPLATE_PATH
}

/**
 * Convert DOCX buffer to PDF buffer with timeout
 * For Vercel serverless, we'll try multiple approaches:
 * 1. Use docx-pdf if LibreOffice is available (local dev or Docker)
 * 2. Use a cloud conversion service if configured
 * 3. Fall back to DOCX if conversion fails
 */
async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
  const fs = require("fs")
  const path = require("path")

  // Add timeout wrapper
  const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`${errorMessage} (timeout after ${timeoutMs}ms)`)), timeoutMs),
      ),
    ])
  }

  // Skip docx-pdf entirely - it tries to use html-pdf/PhantomJS which crashes the server
  // Go straight to CloudConvert or DOCX fallback
  console.log("[v0] ℹ️  Skipping docx-pdf (may cause crashes with html-pdf/PhantomJS)")
  
  // Try CloudConvert API if configured (with 30 second timeout)
  if (process.env.CLOUDCONVERT_API_KEY) {
    try {
      return await withTimeout(
        convertViaCloudConvert(docxBuffer),
        30000, // 30 second timeout for cloud conversion
        "CloudConvert API timeout",
      )
    } catch (cloudError: any) {
      console.warn("[v0] ⚠️  CloudConvert failed:", cloudError.message)
    }
    // console.log(process.env.CLOUDCONVERT_API_KEY)
  }

  // If all methods fail, throw error to trigger DOCX fallback
  throw new Error(
    `PDF conversion not available. LibreOffice not installed or CloudConvert not configured. Falling back to DOCX.`,
  )
}

/**
 * Convert DOCX to PDF using CloudConvert API
 * Requires CLOUDCONVERT_API_KEY environment variable
 */
async function convertViaCloudConvert(docxBuffer: Buffer): Promise<Buffer> {
  const apiKey = process.env.CLOUDCONVERT_API_KEY
  // const isSandbox = process.env.CLOUDCONVERT_SANDBOX === "true"
  // const baseUrl = isSandbox ? "https://api.sandbox.cloudconvert.com/v2" : "https://api.cloudconvert.com/v2"
  const baseUrl = "https://api.cloudconvert.com/v2"

  if (!apiKey) {
    throw new Error("CLOUDCONVERT_API_KEY not configured")
  }

  // Create a job with proper CloudConvert v2 API structure
  const jobResponse = await fetch(`${baseUrl}/jobs`, {
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
    const errorText = await jobResponse.text().catch(() => "")
    let errorMessage = jobResponse.statusText
    try {
      const errorData = JSON.parse(errorText)
      errorMessage = errorData?.message || errorMessage
    } catch {}
    throw new Error(`CloudConvert job creation failed: ${jobResponse.status} ${errorMessage} ${errorText}`)
  }

  const jobData = await jobResponse.json()
  const jobId = jobData.data.id

  // Wait for import task to be ready (status: "waiting")
  let importTaskReady = false
  let importTask = jobData.data.tasks.find((t: any) => t.operation === "import/upload")
  let waitAttempts = 0
  const maxWaitAttempts = 10

  while (!importTaskReady && waitAttempts < maxWaitAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const statusResponse = await fetch(`${baseUrl}/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
    const statusData = await statusResponse.json()
    importTask = statusData.data.tasks.find((t: any) => t.operation === "import/upload")
    
    if (importTask?.status === "waiting" && importTask?.result?.form) {
      importTaskReady = true
    }
    waitAttempts++
  }

  if (!importTaskReady || !importTask?.result?.form) {
    throw new Error("CloudConvert import task not ready or upload form not available")
  }

  const uploadUrl = importTask.result.form.url
  const uploadFields = importTask.result.form.parameters

  if (!uploadUrl || !uploadFields) {
    throw new Error("CloudConvert upload URL or fields not found")
  }

  // Use form-data library for proper multipart/form-data encoding
  const FormDataNode = require("form-data")
  const form = new FormDataNode()
  
  // Add all form fields from CloudConvert
  Object.entries(uploadFields).forEach(([key, value]) => {
    form.append(key, String(value))
  })
  
  // Add the file with proper metadata
  form.append("file", docxBuffer, {
    filename: "document.docx",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  })

  // Use native Node.js http/https for form-data upload (fetch doesn't handle streams well)
  const https = require("https")
  const http = require("http")
  
  // Upload the file with timeout and proper cleanup
  await new Promise<void>((resolve, reject) => {
    const parsedUrl = new URL(uploadUrl)
    const isHttps = parsedUrl.protocol === "https:"
    const client = isHttps ? https : http
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: "POST",
      headers: form.getHeaders(),
      timeout: 30000, // 30 second timeout
    }

    let isResolved = false
    let req: any = null
    
    const cleanup = () => {
      try {
        if (req && !req.destroyed) req.destroy()
        if (form && typeof form.destroy === "function") form.destroy()
      } catch {}
    }
    
    const safeResolve = () => {
      if (!isResolved) {
        isResolved = true
        cleanup()
        resolve()
      }
    }
    
    const safeReject = (err: any) => {
      if (!isResolved) {
        isResolved = true
        cleanup()
        reject(err)
      }
    }

    req = client.request(options, (res: any) => {
      let responseData = ""
      res.on("data", (chunk: Buffer) => {
        responseData += chunk.toString()
      })
      res.on("end", () => {
        res.destroy()
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          safeResolve()
        } else {
          safeReject(new Error(`CloudConvert upload failed: ${res.statusCode} ${res.statusMessage} ${responseData}`))
        }
      })
    })

    // Set timeout
    req.setTimeout(30000, () => {
      safeReject(new Error("CloudConvert upload timeout"))
    })

    req.on("error", (err: Error) => {
      safeReject(new Error(`CloudConvert upload request failed: ${err.message}`))
    })

    // Handle form stream errors
    form.on("error", (err: Error) => {
      safeReject(new Error(`CloudConvert form stream error: ${err.message}`))
    })

    form.pipe(req)
  })

  // Wait for conversion to complete with timeout and proper cleanup
  let status = "waiting"
  let attempts = 0
  const maxAttempts = 60 // 60 seconds timeout
  const pollInterval = 1000 // 1 second between polls

  while (status !== "finished" && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval))
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout per request
      
      const statusResponse = await fetch(`${baseUrl}/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      if (!statusResponse.ok) {
        throw new Error(`CloudConvert status check failed: ${statusResponse.statusText}`)
      }

      const statusData = await statusResponse.json()
      status = statusData.data.status

      if (status === "error") {
        throw new Error(`CloudConvert conversion failed: ${statusData.data.message || "Unknown error"}`)
      }

      attempts++
    } catch (fetchError: any) {
      if (fetchError.name === "AbortError") {
        throw new Error("CloudConvert status check timeout")
      }
      throw fetchError
    }
  }

  if (status !== "finished") {
    throw new Error(`CloudConvert conversion timeout after ${maxAttempts} seconds`)
  }

  // Get the final job status to find export URL with timeout
  const controller1 = new AbortController()
  const timeoutId1 = setTimeout(() => controller1.abort(), 10000)
  
  const finalStatusResponse = await fetch(`${baseUrl}/jobs/${jobId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    signal: controller1.signal,
  })
  
  clearTimeout(timeoutId1)
  
  if (!finalStatusResponse.ok) {
    throw new Error(`CloudConvert final status check failed: ${finalStatusResponse.statusText}`)
  }
  
  const finalStatusData = await finalStatusResponse.json()
  const exportTask = finalStatusData.data.tasks.find((t: any) => t.operation === "export/url")
  const exportUrl = exportTask?.result?.files?.[0]?.url

  if (!exportUrl) {
    throw new Error("CloudConvert export URL not found")
  }

  // Download the PDF with timeout
  const controller2 = new AbortController()
  const timeoutId2 = setTimeout(() => controller2.abort(), 30000) // 30 second timeout for download
  
  const pdfResponse = await fetch(exportUrl, {
    signal: controller2.signal,
  })
  
  clearTimeout(timeoutId2)
  
  if (!pdfResponse.ok) {
    throw new Error(`CloudConvert PDF download failed: ${pdfResponse.statusText}`)
  }

  const arrayBuffer = await pdfResponse.arrayBuffer()
  const pdfBuffer = Buffer.from(arrayBuffer)

  return pdfBuffer
}

function cleanFragmentedPlaceholders(zip: PizZip): PizZip {
  console.log("[v0] 🧹 Starting conservative XML placeholder healing...")

  const documentXml = zip.files["word/document.xml"]
  if (!documentXml) {
    console.warn("[v0] ⚠️  No document.xml found to clean")
    return zip
  }

  let xmlContent = documentXml.asText()
  console.log("[v0] 📄 Original XML length:", xmlContent.length)

  // Count placeholders before cleaning (using double braces {{ }})
  const beforeMatches = xmlContent.match(/\{\{[^{}]*\}\}/g) || []
  console.log("[v0] 📊 Placeholders before cleaning:", beforeMatches.length)

  let totalReplacements = 0

  // Conservative approach: Only fix placeholders that are split across <w:t> tags
  // Template uses {{ }} delimiters, so we need to fix double braces
  
  // Pattern 1: <w:t>{{</w:t>...<w:t>PLACEHOLDER_NAME}}</w:t>
  const splitOpeningPattern = /<w:t[^>]*>\{\{<\/w:t>(?:<[^>]+>)*<w:t[^>]*>([A-Z_]+)\}\}<\/w:t>/g
  xmlContent = xmlContent.replace(splitOpeningPattern, (match, placeholder) => {
      totalReplacements++
    const cleaned = `<w:t>{{${placeholder}}}</w:t>`
    if (totalReplacements <= 10) {
      console.log(`[v0] 🔧 Fixed split opening: {{${placeholder}}}`)
    }
    return cleaned
  })

  // Pattern 2: <w:t>{{PLACEHOLDER_NAME</w:t>...<w:t>}}</w:t>
  const splitClosingPattern = /<w:t[^>]*>\{\{([A-Z_]+)<\/w:t>(?:<[^>]+>)*<w:t[^>]*>\}\}<\/w:t>/g
  xmlContent = xmlContent.replace(splitClosingPattern, (match, placeholder) => {
    totalReplacements++
    const cleaned = `<w:t>{{${placeholder}}}</w:t>`
    if (totalReplacements <= 10) {
      console.log(`[v0] 🔧 Fixed split closing: {{${placeholder}}}`)
    }
    return cleaned
  })

  // Pattern 3: More complex splits - {{PLACEHOLDER</w:t>...<w:t>_NAME}}
  const complexSplitPattern = /<w:t[^>]*>\{\{([A-Z_]*?)<\/w:t>(?:<[^>]+>)*<w:t[^>]*>([A-Z_]+)\}\}<\/w:t>/g
  xmlContent = xmlContent.replace(complexSplitPattern, (match, part1, part2) => {
    totalReplacements++
    const cleaned = `<w:t>{{${part1}${part2}}}</w:t>`
    if (totalReplacements <= 10) {
      console.log(`[v0] 🔧 Fixed complex split: {{${part1}${part2}}}`)
    }
    return cleaned
  })

  // Pattern 4: Handle cases where {{ is split: <w:t>{{</w:t><w:t>PLACEHOLDER</w:t><w:t>}}</w:t>
  const splitBothPattern = /<w:t[^>]*>\{\{<\/w:t>(?:<[^>]+>)*<w:t[^>]*>([A-Z_]+)<\/w:t>(?:<[^>]+>)*<w:t[^>]*>\}\}<\/w:t>/g
  xmlContent = xmlContent.replace(splitBothPattern, (match, placeholder) => {
    totalReplacements++
    const cleaned = `<w:t>{{${placeholder}}}</w:t>`
    if (totalReplacements <= 10) {
      console.log(`[v0] 🔧 Fixed split both sides: {{${placeholder}}}`)
    }
    return cleaned
  })

  // Count placeholders after cleaning
  const afterMatches = xmlContent.match(/\{\{[^{}]*\}\}/g) || []
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

  const totalHours =
    merged.hours_per_week && merged.weeks_per_year
      ? (toNumber(merged.hours_per_week) * toNumber(merged.weeks_per_year)).toString()
      : ""

  const reportDate =
    merged.report_date ||
    merged.REPORT_DATE ||
    (merged.tax_year ? `${merged.tax_year}-06-30` : new Date().toISOString().split("T")[0])

  const startDateOfHomeBusiness =
    merged.start_date_of_home_business ||
    merged.START_DATE_OF_HOME_BUSINESS ||
    merged.business_start_date ||
    merged.CLIENT_BUSINESS_START_DATE ||
    ""

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
    TOTAL_HOURS: totalHours,

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

    // Aliases for template placeholders (the template uses spaces / different names)
    "CLIENT ADDRESS": merged.property_address || merged.CLIENT_ADDRESS || "",
    "CLIENT_ NAME": merged.client_name || merged.CLIENT_NAME || "",
    REPORT_DATE: reportDate,
    CLIENT_FIRST_NAME: merged.client_first_name || merged.CLIENT_FIRST_NAME || (merged.client_name || "").split(" ")[0] || "",
    CLIENT_LOCAL_COUNCIL: merged.client_local_council || merged.local_council || merged.council || "",
    TOTAL_FLOOR_AREA_M2: merged.q16_total_floor_space || merged.total_floor_space_sqm || "",
    BUILDING_DEPRECIATION_VALUE: merged.depreciation || merged.q29_equipment_depreciation || "",
    DEDICATED_OFFICE_AREA_M2: merged.dedicated_office_area_m2 || merged.business_floor_space_sqm || merged.q17_business_floor_space || "",
    DEDICATED_MEETING_AREA_M2: merged.dedicated_meeting_area_m2 || "",
    DEDICATED_ARCHIVE_AREA_M2: merged.dedicated_archive_area_m2 || "",
    TOTAL_BUSINESS_USE_AREA_M2: merged.business_floor_space_sqm || merged.q17_business_floor_space || "",
    MORTGAGE: merged.mortgage_balance || merged.mortgage || "",
    BUP: merged.bup_percentage?.toString() || "",
    MORTGAGE_DEDUCTIBLE: merged.mortgage_interest_deductible || "",
    RATES: merged.council_rates || merged.q29_council_rates || "",
    WATER: merged.water_rates || merged.q29_water_rates || "",
    TOTAL_PROPERTY_EXPENSES: merged.total_property_expenses || "",
    TOTAL_DEDUCTIBLE: merged.total_deductible || "",
    TOTAL_RUNNING_EXPENSES: merged.total_running_expenses || "",
    TOTAL_HABITABLE_FLOOR_AREA: merged.total_habitable_floor_area || merged.total_floor_space_sqm || "",
    HOME_OFFICE_FLOOR_AREA: merged.home_office_floor_area || merged.business_floor_space_sqm || merged.q17_business_floor_space || "",
    MEETING_AREA_FLOOR_AREA: merged.meeting_area_floor_area || "",
    ARCHIVE_ROOM_FLOOR_AREA: merged.archive_room_floor_area || "",
    TOTAL_BUSINESS_USE_FLOOR_AREA: merged.total_business_use_floor_area || merged.business_floor_space_sqm || "",
    BUSINESS_USE_PERCENTAGE: merged.bup_percentage?.toString() || "",
    TOTAL_RUNNING_COSTS_DEDUCTIBLE: merged.total_running_costs_deductible || "",
    TOTAL_WEEKLY_HOURS_WORKED: merged.hours_per_week?.toString() || "",
    TOTAL_NUMBER_OF_WEEKS_WORKED: merged.weeks_per_year?.toString() || "52",
    TOTAL_NUMBER_OF_HOURS_WORKED: totalHours,
    TOTAL_FIXED_RATE_METHOD_CLAIM: merged.total_fixed_rate_method_claim || "",
    "TOTAL_CLAIM_ PER_ THE_RUNNING_COST_METHOD": merged.total_claim_per_running_cost_method || "",
    "TOTAL_CLAIM_ PER_ THE_FIXED_COST_METHOD": merged.total_claim_per_fixed_cost_method || "",
    BEST_METHOD_COMPARISON: merged.best_method_comparison || "",
    RECOMMENDED_METHOD: merged.recommended_method || merged.strategy_name || merged.strategy || "",
    TOTAL_PROPERTY_DEDUCTIBLE: merged.total_property_deductible || "",
    RUNNING_METHOD: merged.running_method || "",
    TOTAL_ANNUAL_DEDUCTION: merged.total_annual_deduction || "",
    START_DATE_OF_HOME_BUSINESS: startDateOfHomeBusiness,

    // Additional aliases to satisfy template placeholders without editing the DOCX
    "Local Council": merged.client_local_council || merged.local_council || merged.council || "",
    LOCAL_COUNCIL: merged.client_local_council || merged.local_council || merged.council || "",
    ABN: merged.abn || merged.CLIENT_ABN || "",
    BUSINESS_START_DATE: merged.business_start_date || merged.CLIENT_BUSINESS_START_DATE || startDateOfHomeBusiness || "",
    "Business Start Date": merged.business_start_date || merged.CLIENT_BUSINESS_START_DATE || startDateOfHomeBusiness || "",
    TOTAL_FLOOR_AREA: merged.q16_total_floor_space || merged.total_floor_space_sqm || "",
    "Total Floor Area": merged.q16_total_floor_space || merged.total_floor_space_sqm || "",
    BUILDING_DEPRECIATION: merged.depreciation || merged.q29_equipment_depreciation || "",
    "Building Depreciation (2.5% p.a.)": merged.depreciation || merged.q29_equipment_depreciation || "",
    HOME_OFFICE: merged.home_office_floor_area || merged.business_floor_space_sqm || merged.q17_business_floor_space || "",
    "Home Office": merged.home_office_floor_area || merged.business_floor_space_sqm || merged.q17_business_floor_space || "",
    MEETING_AREA: merged.meeting_area_floor_area || merged.dedicated_meeting_area_m2 || "",
    "Meeting Area": merged.meeting_area_floor_area || merged.dedicated_meeting_area_m2 || "",
    ARCHIVE_ROOM: merged.archive_room_floor_area || merged.dedicated_archive_area_m2 || "",
    "Archive Room": merged.archive_room_floor_area || merged.dedicated_archive_area_m2 || "",
    TOTAL_BUSINESS_USE_AREA: merged.total_business_use_area_m2 || merged.business_floor_space_sqm || merged.q17_business_floor_space || "",
    "Total Business Use Area": merged.total_business_use_area_m2 || merged.business_floor_space_sqm || merged.q17_business_floor_space || "",
    "Council Rates": merged.council_rates || merged.q29_council_rates || "",
    "Water Rates": merged.water_rates || merged.q29_water_rates || "",
    "Total Property Expenses": merged.total_property_expenses || "",
    TOTAL_PROPERTY_EXPENSES_ALIAS: merged.total_property_expenses || "",
    TOTAL_DEDUCTIBLE_ALIAS: merged.total_deductible || "",
    TOTAL_RUNNING_EXPENSES_ALIAS: merged.total_running_expenses || "",
    TOTAL_BUSINESS_USE_FLOOR_AREA_ALIAS: merged.total_business_use_floor_area || merged.business_floor_space_sqm || "",
    TOTAL_HABITABLE_FLOOR_AREA_ALIAS: merged.total_habitable_floor_area || merged.total_floor_space_sqm || "",
    BUSINESS_USE_PERCENTAGE_ALIAS: merged.bup_percentage?.toString() || "",
    "TOTAL_CLAIM_ PER_ THE_RUNNING_COST_METHOD_ALIAS": merged.total_claim_per_running_cost_method || "",
    "TOTAL_CLAIM_ PER_ THE_FIXED_COST_METHOD_ALIAS": merged.total_claim_per_fixed_cost_method || "",
    BEST_METHOD_COMPARISON_ALIAS: merged.best_method_comparison || "",
    TOTAL_PROPERTY_DEDUCTIBLE_ALIAS: merged.total_property_deductible || "",
    RUNNING_METHOD_ALIAS: merged.running_method || "",
    TOTAL_ANNUAL_DEDUCTION_ALIAS: merged.total_annual_deduction || "",
    START_DATE_OF_HOME_BUSINESS_ALIAS: startDateOfHomeBusiness,

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

    console.log("[v0] 🔧 Mapping questionnaire data...")
    const questionnaireData = mapQuestionnairesToTemplateData(questionnaire1, questionnaire2)
    console.log("[v0] ✅ Data mapping complete, fields:", Object.keys(questionnaireData).length)

    console.log("[v0] 📝 Initializing Docxtemplater...")
    let doc: Docxtemplater
    let useCleanedZip = false

    // Template uses {{ }} delimiters (double braces), not single braces
    const docxtemplaterOptions = {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: "{{",
        end: "}}",
      },
      nullGetter: (part: any) => {
        console.log("[v0] ⚠️  Missing placeholder:", part.value)
        return ""
      },
    }

    try {
      // Try without cleaning first - docxtemplater can handle most cases
      doc = new Docxtemplater(zip, docxtemplaterOptions)
      console.log("[v0] ✅ Docxtemplater initialized without cleaning")
    } catch (initError: any) {
      // If initialization fails, try with cleaned XML
      if (initError.message?.includes("Malformed xml") || initError.message?.includes("xml") || initError.message?.includes("Duplicate")) {
        console.log("[v0] ⚠️  Initial initialization failed, trying with XML cleaning...")
        console.log("[v0] 🧹 Cleaning fragmented XML placeholders...")
        const cleanedZip = cleanFragmentedPlaceholders(zip)
        console.log("[v0] ✅ XML cleaning complete")
        useCleanedZip = true

        doc = new Docxtemplater(cleanedZip, docxtemplaterOptions)
        console.log("[v0] ✅ Docxtemplater initialized with cleaned XML")
      } else {
        throw initError
      }
    }

    console.log("[v0] 🎨 Rendering document with data...")
    doc.render(questionnaireData)
    console.log("[v0] ✅ Document rendered successfully")

    console.log("[v0] 📦 Generating DOCX buffer...")
    const docxBuffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    })
    console.log("[v0] ✅ DOCX buffer generated, size:", docxBuffer.length, "bytes")

    // Convert DOCX to PDF (with fast fallback to DOCX)
    console.log("[v0] 🔄 Attempting PDF conversion (will fallback to DOCX if unavailable)...")
    let pdfBuffer: Buffer
    let filename: string
    let contentType: string

    try {
      // Try to convert to PDF using docx-pdf or alternative method
      // This will timeout quickly if LibreOffice is not available
      // Wrap in Promise to catch any unhandled errors
      pdfBuffer = await Promise.resolve(convertDocxToPdf(docxBuffer)).catch((err: any) => {
        console.log("[v0] ⚠️  PDF conversion error caught:", err.message || String(err))
        throw err
      })
      filename = `Tax_Report_${clientName || "Client"}_${new Date().toISOString().split("T")[0]}.pdf`
      contentType = "application/pdf"
      console.log("[v0] ✅ PDF conversion successful, size:", pdfBuffer.length, "bytes")
    } catch (pdfError: any) {
      // Catch any error (including unhandled assertion errors) and fallback to DOCX
      const errorMsg = pdfError?.message || pdfError?.toString() || "Unknown error"
      console.log("[v0] ℹ️  PDF conversion not available, using DOCX format:", errorMsg)
      // Fallback to DOCX immediately - this is faster and works everywhere
      pdfBuffer = docxBuffer
      filename = `Tax_Report_${clientName || "Client"}_${new Date().toISOString().split("T")[0]}.docx`
      contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      console.log("[v0] ✅ DOCX file ready, size:", pdfBuffer.length, "bytes")
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

import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
import { type NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import { list } from "@vercel/blob"

const LOCAL_TEMPLATE_PATH = join(process.cwd(), "public", "templates", "final_report.docx")

async function getTemplatePath(templateType: "interim" | "final" = "final"): Promise<Buffer> {
  try {
    console.log(`[v0] 📥 Searching for ${templateType} template in Vercel Blob`)
    const { blobs } = await list({ prefix: "templates/" })

    console.log("[v0] 📋 All templates in Blob storage:")
    blobs.forEach((blob) => {
      console.log(`[v0]    - ${blob.pathname} (${blob.url})`)
    })

    const templateFilename = templateType === "interim" ? "interim_report.docx" : "final_report.docx"
    const templateBlob = blobs.find((blob) => blob.pathname.includes(templateFilename))

    if (templateBlob) {
      console.log(`[v0] ✅ Found ${templateType} template in Blob:`, templateBlob.url)
      const response = await fetch(templateBlob.url)
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer()
        return Buffer.from(arrayBuffer)
      }
    }

    console.log(`[v0] ⚠️  ${templateType} template not found in Blob, trying final_report fallback`)
    if (templateType === "interim") {
      const fallbackBlob = blobs.find((blob) => blob.pathname.includes("final_report.docx"))
      if (fallbackBlob) {
        console.log("[v0] ✅ Using final_report as fallback")
        const response = await fetch(fallbackBlob.url)
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          return Buffer.from(arrayBuffer)
        }
      }
    }
  } catch (error) {
    console.log("[v0] ⚠️  Blob fetch failed, trying local file:", error)
  }

  // Fallback to local file system
  try {
    console.log("[v0] 📁 Loading template from local file system")
    return readFileSync(LOCAL_TEMPLATE_PATH)
  } catch (error) {
    throw new Error(
      "Template file not found in Blob storage or local file system. Please upload via /admin/upload-template",
    )
  }
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

  const beforePattern = /\{\{[^{}]*\}\}/g
  const beforeMatches = xmlContent.match(beforePattern) || []
  console.log("[v0] 📊 Placeholders before cleaning:", beforeMatches.length)

  let totalReplacements = 0

  // Pattern 1: Fix split opening - <w:t>{{</w:t>...<w:t>PLACEHOLDER_NAME}}</w:t>
  const splitOpeningPattern = /<w:t[^>]*>\{\{<\/w:t>(?:<[^>]+>)*<w:t[^>]*>([A-Z_]+)\}<\/w:t>/g
  xmlContent = xmlContent.replace(splitOpeningPattern, (match, placeholder) => {
    totalReplacements++
    const cleaned = `<w:t>{{${placeholder}}}</w:t>`
    if (totalReplacements <= 10) {
      console.log(`[v0] 🔧 Fixed split opening: {{${placeholder}}}`)
    }
    return cleaned
  })

  // Pattern 2: Fix split closing - <w:t>{{PLACEHOLDER_NAME</w:t>...<w:t>}}</w:t>
  const splitClosingPattern = /<w:t[^>]*>\{\{([A-Z_]+)<\/w:t>(?:<[^>]+>)*<w:t[^>]*>\}\}<\/w:t>/g
  xmlContent = xmlContent.replace(splitClosingPattern, (match, placeholder) => {
    totalReplacements++
    const cleaned = `<w:t>{{${placeholder}}}</w:t>`
    if (totalReplacements <= 10) {
      console.log(`[v0] 🔧 Fixed split closing: {{${placeholder}}}`)
    }
    return cleaned
  })

  // Pattern 3: Fix complex splits - {{PLACEHOLDER</w:t>...<w:t>_NAME}}
  const complexSplitPattern = /<w:t[^>]*>\{\{([A-Z_]*?)<\/w:t>(?:<[^>]+>)*<w:t[^>]*>([A-Z_]+)\}<\/w:t>/g
  xmlContent = xmlContent.replace(complexSplitPattern, (match, part1, part2) => {
    totalReplacements++
    const cleaned = `<w:t>{{${part1}${part2}}}</w:t>`
    if (totalReplacements <= 10) {
      console.log(`[v0] 🔧 Fixed complex split: {{${part1}${part2}}}`)
    }
    return cleaned
  })

  // Pattern 4: Fix cases where both braces are split - <w:t>{{</w:t><w:t>PLACEHOLDER</w:t><w:t>}}</w:t>
  const splitBothPattern =
    /<w:t[^>]*>\{\{<\/w:t>(?:<[^>]+>)*<w:t[^>]*>([A-Z_]+)<\/w:t>(?:<[^>]+>)*<w:t[^>]*>\}\}<\/w:t>/g
  xmlContent = xmlContent.replace(splitBothPattern, (match, placeholder) => {
    totalReplacements++
    const cleaned = `<w:t>{{${placeholder}}}</w:t>`
    if (totalReplacements <= 10) {
      console.log(`[v0] 🔧 Fixed split both sides: {{${placeholder}}}`)
    }
    return cleaned
  })

  const afterMatches = xmlContent.match(beforePattern) || []
  console.log("[v0] 📊 Placeholders after cleaning:", afterMatches.length)
  console.log("[v0] ✅ Total XML fragments healed:", totalReplacements)

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
      const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""))
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  const formatCurrency = (value: any): string => {
    const num = toNumber(value)
    return num > 0 ? `$${num.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""
  }

  // Format as plain rounded number without commas or decimals
  const formatPlainAmount = (value: any, withDollar = false): string => {
    const num = Math.round(toNumber(value))
    if (!num) return ""
    return withDollar ? `$${num}` : `${num}`
  }

  // Format date to Australian format (DD/MM/YYYY)
  const formatDateAU = (dateValue: any): string => {
    if (!dateValue) return ""

    // If already in DD/MM/YYYY format, return as is
    if (typeof dateValue === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
      return dateValue
    }

    let date: Date | null = null

    // Try to parse the date
    if (typeof dateValue === "string") {
      // Try ISO format (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
        date = new Date(dateValue)
      } else {
        date = new Date(dateValue)
      }
    } else if (dateValue instanceof Date) {
      date = dateValue
    }

    if (!date || isNaN(date.getTime())) {
      // If parsing fails, try to extract date parts from string
      const match = String(dateValue).match(/(\d{4})-(\d{2})-(\d{2})/)
      if (match) {
        const [, year, month, day] = match
        return `${day}/${month}/${year}`
      }
      return ""
    }

    // Format as DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Format address: put city/state/postcode on the next line and keep state+postcode together
  const formatAddress = (address: string): string => {
    if (!address) return ""

    // Split on the first comma into street and the rest (city/state/postcode)
    const [line1Raw, ...restParts] = address.split(",")
    const line1 = line1Raw?.trim() || ""
    const rest = restParts.join(",").trim()

    if (!rest) {
      return line1
    }

    // Keep state and postcode together with a non-breaking space
    const restFormatted = rest.replace(/\b([A-Z]{2,3})\s+(\d{4})\b/g, "$1\u00A0$2")

    // Return with an explicit line break between street and city/state/postcode
    return `${line1},\n${restFormatted}`
  }

  const hoursPerWeek = toNumber(
    merged.hours_per_week ||
      merged.HOURS_PER_WEEK ||
      merged.office_hours_per_week ||
      merged.OFFICE_HOURS_PER_WEEK ||
      (typeof merged.ss_q48_time === "string" ? merged.ss_q48_time.match(/\d+/)?.[0] : undefined),
  )
  const weeksPerYear = toNumber(merged.weeks_per_year || merged.WEEKS_PER_YEAR || 50)

  // Accept incoming total hours if provided by template data (e.g., scenario fixtures)
  const totalHoursProvided = toNumber(
    merged.total_hours ||
      merged.TOTAL_HOURS ||
      merged.total_hours_worked ||
      merged.TOTAL_HOURS_WORKED ||
      merged.total_number_of_hours_worked ||
      merged.TOTAL_NUMBER_OF_HOURS_WORKED ||
      merged.HOURS_PER_YEAR,
  )

  const totalHoursNum =
    totalHoursProvided > 0 ? totalHoursProvided : hoursPerWeek && weeksPerYear ? hoursPerWeek * weeksPerYear : 0

  // Fixed rate method (ATO rate $0.70/hour as per template)
  const FIXED_RATE_PER_HOUR = 0.7
  const fixedRateDeductionNumBase = totalHoursNum ? totalHoursNum * FIXED_RATE_PER_HOUR : 0
  const fixedRateDeductionNum =
    fixedRateDeductionNumBase || toNumber(merged.DEDUCTION_FIXED_RATE || merged.FIXED_RATE_DEDUCTION)
  const fixedRateDeductionSentence =
    totalHoursNum && fixedRateDeductionNum
      ? `${totalHoursNum} hours × $0.70 = ${formatPlainAmount(fixedRateDeductionNum, true)}`
      : ""
  // Get BUP percentage and round to nearest whole number (as per business rule)
  const bupPercentageRaw = toNumber(merged.bup_percentage || merged.business_use_percentage || merged.BUP || 0)
  const bupPercentageNum = bupPercentageRaw > 0 ? Math.round(bupPercentageRaw) : 0

  // Derive running expenses: prefer provided total, else auto-sum common running expense fields
  const electricityAmount = toNumber(
    merged.q31_power_electricity_amount ||
      merged.questionnaire_data?.electricity_annual ||
      merged.electricity_annual ||
      merged.ELECTRICITY ||
      merged.electricity ||
      0,
  )
  const gasAmount = toNumber(
    merged.questionnaire_data?.gas_annual || merged.gas_annual || merged.GAS || merged.gas || 0,
  )
  const cleaningAmount = toNumber(
    merged.questionnaire_data?.cleaning_annual || merged.cleaning_annual || merged.CLEANING || merged.cleaning || 0,
  )

  const phoneInternetAmount = toNumber(
    merged.q33_phone_internet_amount ||
      merged.phone_annual ||
      merged.questionnaire_data?.phone_annual ||
      merged.PHONE ||
      merged.phone ||
      0,
  )

  const otherExpensesAmount = Object.keys(merged)
    .filter((key) => key.startsWith("q29_other_") && key.endsWith("_amount"))
    .reduce((sum, key) => sum + toNumber(merged[key] || 0), 0)

  // Total running expenses for table = ELECTRICITY + GAS + CLEANING + PHONE/INTERNET + OTHER
  const totalRunningExpensesForTable =
    electricityAmount + gasAmount + cleaningAmount + phoneInternetAmount + otherExpensesAmount

  // Property expenses (occupancy) and depreciation
  const mortgageInterest = toNumber(
    merged.questionnaire_data?.mortgage_interest ||
      merged.mortgage_interest ||
      merged.q29_loan_interest ||
      merged.HOME_LOAN_INTEREST ||
      0,
  )
  const councilRates = toNumber(
    merged.questionnaire_data?.council_rates ||
      merged.council_rates ||
      merged.q29_council_rates ||
      merged.ss_q44_council,
  )
  const waterRates = toNumber(
    merged.questionnaire_data?.water_rates || merged.water_rates || merged.q29_water_rates || merged.ss_q44_water,
  )
  const buildingInsurance = toNumber(
    merged.questionnaire_data?.building_insurance ||
      merged.building_insurance ||
      merged.q29_building_insurance ||
      merged.q29_insurance ||
      merged.BUILDING_INSURANCE ||
      merged.INSURANCE ||
      0,
  )
  const repairsMaintenance = toNumber(
    merged.questionnaire_data?.repairs_maintenance ||
      merged.repairs_maintenance ||
      merged.REPAIRS_MAINTENANCE ||
      merged.q29_repairs_maintenance ||
      0,
  )
  const buildingValue = toNumber(merged.building_value || merged.BUILDING_VALUE || 0)
  const buildingDepreciation = buildingValue
    ? buildingValue * 0.025
    : toNumber(
        merged.questionnaire_data?.depreciation ||
          merged.building_depreciation ||
          merged.BUILDING_DEPRECIATION ||
          merged.q29_equipment_depreciation ||
          0,
      )

  const propertyExpensesTotal =
    mortgageInterest + councilRates + waterRates + buildingInsurance + repairsMaintenance + buildingDepreciation

  const totalPropertyDeductibleNum =
    propertyExpensesTotal && bupPercentageNum ? propertyExpensesTotal * (bupPercentageNum / 100) : 0

  // Calculate individual deductibles
  const mortgageDeductibleNum = mortgageInterest && bupPercentageNum ? mortgageInterest * (bupPercentageNum / 100) : 0
  const ratesDeductibleNum = councilRates && bupPercentageNum ? councilRates * (bupPercentageNum / 100) : 0
  const waterDeductibleNum = waterRates && bupPercentageNum ? waterRates * (bupPercentageNum / 100) : 0
  const insuranceDeductibleNum =
    buildingInsurance && bupPercentageNum ? buildingInsurance * (bupPercentageNum / 100) : 0
  const repairsDeductibleNum =
    repairsMaintenance && bupPercentageNum ? repairsMaintenance * (bupPercentageNum / 100) : 0
  const depreciationDeductibleNum =
    buildingDepreciation && bupPercentageNum ? buildingDepreciation * (bupPercentageNum / 100) : 0

  // Calculate individual running expense amounts (for table)
  const electricityDeductibleNum =
    electricityAmount && bupPercentageNum ? electricityAmount * (bupPercentageNum / 100) : 0
  const gasDeductibleNum = gasAmount && bupPercentageNum ? gasAmount * (bupPercentageNum / 100) : 0
  const cleaningDeductibleNum = cleaningAmount && bupPercentageNum ? cleaningAmount * (bupPercentageNum / 100) : 0

  const phoneInternetDeductibleNum =
    phoneInternetAmount && bupPercentageNum ? phoneInternetAmount * (bupPercentageNum / 100) : 0

  const otherExpensesDeductibleNum =
    otherExpensesAmount && bupPercentageNum ? otherExpensesAmount * (bupPercentageNum / 100) : 0

  // Total running expenses deductible for table = sum of all deductibles
  const totalRunningExpensesDeductibleForTable =
    totalRunningExpensesForTable && bupPercentageNum
      ? totalRunningExpensesForTable * (bupPercentageNum / 100)
      : electricityDeductibleNum +
        gasDeductibleNum +
        cleaningDeductibleNum +
        phoneInternetDeductibleNum +
        otherExpensesDeductibleNum

  // Recalculate running costs deductible actual here, now that all values are available
  const runningCostsDeductibleActual =
    totalRunningExpensesForTable && bupPercentageNum ? totalRunningExpensesForTable * (bupPercentageNum / 100) : 0

  // Total deductible = property deductible + running costs deductible (overall total)
  const totalDeductibleNum = totalPropertyDeductibleNum + runningCostsDeductibleActual

  // Determine which running method is better (using table running expenses)
  let runningMethod = merged.running_method || merged.RUNNING_METHOD || ""
  if (!runningMethod && totalRunningExpensesDeductibleForTable > 0 && fixedRateDeductionNum > 0) {
    runningMethod =
      totalRunningExpensesDeductibleForTable > fixedRateDeductionNum ? "Actual Cost Method" : "Fixed Rate Method"
  }

  // Calculate running method deductible (numeric value for calculation)
  const runningMethodDeductibleNum =
    runningMethod === "Actual Cost Method"
      ? totalRunningExpensesDeductibleForTable
      : runningMethod === "Fixed Rate Method"
        ? fixedRateDeductionNum
        : totalRunningExpensesDeductibleForTable || fixedRateDeductionNum

  // Total annual deduction = TOTAL_PROPERTY_DEDUCTIBLE + RUNNING_METHOD_DEDUCTIBLE
  const totalAnnualDeductionNum = toNumber(
    merged.total_annual_deduction ||
      merged.TOTAL_ANNUAL_DEDUCTION ||
      totalPropertyDeductibleNum + runningMethodDeductibleNum,
  )

  // Actual cost method sentence (e.g., "$1200 × 30% = $360")
  const actualCostDeductionSentence =
    totalRunningExpensesForTable && bupPercentageNum && totalRunningExpensesDeductibleForTable
      ? `${formatPlainAmount(totalRunningExpensesForTable, true)} × ${bupPercentageNum}% = ${formatPlainAmount(totalRunningExpensesDeductibleForTable, true)}`
      : ""

  // Calculate best method comparison: TOTAL_CLAIM_PER_THE_RUNNING_COST_METHOD - TOTAL_CLAIM_PER_THE_FIXED_COST_METHOD
  let bestMethodComparison = ""
  if (totalRunningExpensesDeductibleForTable > 0 && fixedRateDeductionNum > 0) {
    const difference = totalRunningExpensesDeductibleForTable - fixedRateDeductionNum
    const absDifference = Math.abs(difference)
    if (difference > 0) {
      bestMethodComparison = `Actual Cost Method is ${formatPlainAmount(absDifference, true)} better`
    } else if (difference < 0) {
      bestMethodComparison = `Fixed Rate Method is ${formatPlainAmount(absDifference, true)} better`
    } else {
      bestMethodComparison = "Both methods result in the same deduction"
    }
  }

  const reportDate = formatDateAU(
    merged.report_date || merged.REPORT_DATE || (merged.tax_year ? `${merged.tax_year}-06-30` : new Date()),
  )

  const startDateOfHomeBusiness = formatDateAU(
    merged.start_date_of_home_business ||
      merged.START_DATE_OF_HOME_BUSINESS ||
      merged.business_start_date ||
      merged.CLIENT_BUSINESS_START_DATE ||
      "",
  )

  // Calculate floor areas and business use percentage
  const totalHabitableFloorAreaNum = toNumber(
    merged.total_habitable_floor_area ||
      merged.questionnaire_data?.total_habitable_floor_area ||
      merged.total_floor_space_sqm ||
      merged.questionnaire_data?.total_floor_space_sqm ||
      merged.q16_total_floor_space ||
      merged.TOTAL_HABITABLE_FLOOR_AREA ||
      merged.TOTAL_FLOOR_AREA_M2 ||
      0,
  )

  const homeOfficeAreaNum = toNumber(
    merged.home_office_floor_area ||
      merged.questionnaire_data?.home_office_floor_area ||
      merged.business_floor_space_sqm ||
      merged.questionnaire_data?.business_floor_space_sqm ||
      merged.q17_business_floor_space ||
      merged.dedicated_office_area_m2 ||
      merged.DEDICATED_OFFICE_AREA_M2 ||
      merged.HOME_OFFICE_FLOOR_AREA ||
      0,
  )

  const meetingAreaNum = toNumber(
    merged.meeting_area_floor_area ||
      merged.dedicated_meeting_area_m2 ||
      merged.DEDICATED_MEETING_AREA_M2 ||
      merged.MEETING_AREA_FLOOR_AREA ||
      0,
  )

  const archiveAreaNum = toNumber(
    merged.archive_room_floor_area ||
      merged.dedicated_archive_area_m2 ||
      merged.DEDICATED_ARCHIVE_AREA_M2 ||
      merged.ARCHIVE_ROOM_FLOOR_AREA ||
      0,
  )

  const totalBusinessUseFloorAreaNum =
    toNumber(
      merged.total_business_use_floor_area ||
        merged.business_floor_space_sqm ||
        merged.TOTAL_BUSINESS_USE_FLOOR_AREA ||
        0,
    ) || homeOfficeAreaNum + meetingAreaNum + archiveAreaNum

  // Calculate business use percentage if not provided (rounded to nearest whole number)
  const calculatedBUP =
    totalHabitableFloorAreaNum > 0 && totalBusinessUseFloorAreaNum > 0
      ? Math.round((totalBusinessUseFloorAreaNum / totalHabitableFloorAreaNum) * 100)
      : 0

  // Use provided BUP (already rounded) or calculated BUP (already rounded), then ensure final value is rounded
  const businessUsePercentageNum = Math.round(bupPercentageNum || calculatedBUP)
  const businessUsePercentageDisplay = businessUsePercentageNum > 0 ? `${businessUsePercentageNum}%` : ""

  // Map all fields from both questionnaires to template placeholders
  return {
    LIMITATIONS_SECTION: `
LIMITATIONS

This report provides a comprehensive analysis based on your responses to the DYH Strategy Selector questionnaire. However, the implementation of "Deduct Your Home" strategies involves numerous nuances that cannot be fully addressed in a templated report and require careful consideration of your specific circumstances.

What This Report Does Not Cover:

The DYH methodology encompasses multiple strategies (SBRB, HBRS, TERS, SBLB, COWB) with various implementation approaches. This report provides general guidance but does not address specific nuances that depend on:

• Property type variations (apartments, houses, acreage, dual occupancy, strata regulations)
• Business-specific operational requirements (space allocation, client access, equipment storage)
• Life stage considerations (family growth, downsizing plans, retirement timing)
• Risk tolerance and financial capacity (conservative vs. aggressive implementation)
• Geographic and regulatory variations (council zoning, state-specific stamp duty, heritage overlays)
• Existing business structure transitions and timing strategies
• Co-ownership arrangements and family succession planning
• Cashflow optimization and tax payment timing strategies
• Interaction with other tax concessions and government benefits
• Accountant relationship and professional coordination requirements

Your Registered Tax Agent Will Address:

As part of your service, your dedicated Registered Tax Agent will directly address all nuances specific to your situation, including:

• Review and validation of all calculations and recommendations in this report
• Specific implementation guidance tailored to your property, business type, and personal circumstances
• ATO compliance verification with current legislation and private binding rulings
• Timing strategy optimization for maximum tax benefit and cashflow management
• Professional coordination with solicitors, financial planners, mortgage brokers as needed
• Documentation requirements for audit protection and ongoing record-keeping
• Legislative monitoring for changes that may affect your strategy
• Ongoing support throughout implementation and beyond

Professional Indemnity Protection:

All advice provided by your Registered Tax Agent is covered by professional indemnity insurance. The strategies in this report are based on intellectual property formally acknowledged by the Australian Taxation Office and protected under ATO Law Administration Practice Statement PSLA 2008/4 Step 4.

Important Advisory:

This report should not be acted upon without direct consultation with your Registered Tax Agent. Tax law is complex and ever-changing. What appears optimal in principle may require adjustment based on factors not fully captured in the questionnaire process or that have changed since the report was generated.

Your Success is Our Priority:

The combination of this detailed report and your Registered Tax Agent's personalised guidance ensures you receive both the strategic vision and the tactical execution support necessary for successful implementation of your "Deduct Your Home" strategy.
`,

    // Client Information
    CLIENT_NAME: merged.client_name || merged.CLIENT_NAME || "",
    CLIENT_FULL_NAME: merged.client_full_name || merged.CLIENT_FULL_NAME || merged.client_name || "",
    CLIENT_ADDRESS: formatAddress(merged.property_address || merged.CLIENT_ADDRESS || ""),
    CLIENT_BUSINESS_NAME: merged.business_name || merged.CLIENT_BUSINESS_NAME || merged.industry_description || "",
    CLIENT_BUSINESS_TYPE: merged.business_type || merged.CLIENT_BUSINESS_TYPE || merged.legal_structure || "",
    CLIENT_ABN: merged.abn || merged.questionnaire_data?.abn || merged.CLIENT_ABN || merged.ABN || "",
    CLIENT_BUSINESS_START_DATE:
      startDateOfHomeBusiness || formatDateAU(merged.business_start_date || merged.CLIENT_BUSINESS_START_DATE || ""),

    // Fixed rate method display fields
    FIXED_RATE_HOURS_PER_WEEK: hoursPerWeek ? hoursPerWeek.toString() : "",
    FIXED_RATE_WEEKS_PER_YEAR: weeksPerYear ? weeksPerYear.toString() : "",
    FIXED_RATE_TOTAL_HOURS: totalHoursNum,
    HOURS_PER_YEAR: totalHoursNum,
    FIXED_RATE_HOURLY_RATE: "$0.70",
    FIXED_RATE_DEDUCTION: formatPlainAmount(fixedRateDeductionNum, true) || "",
    RUNNING_COSTS_DEDUCTION_FIXED: formatCurrency(fixedRateDeductionNum) || "",
    RUNNING_COSTS_DEDUCTION: formatCurrency(fixedRateDeductionNum) || "",
    RUNNING_COSTS_DEDUCTION_FIXED_METHOD: formatCurrency(fixedRateDeductionNum) || "",
    DEDUCTION_FIXED_RATE: formatCurrency(fixedRateDeductionNum) || "",
    DEDUCTION_FIXED_METHOD: formatCurrency(fixedRateDeductionNum) || "",
    DEDUCTION_RESULT: formatCurrency(fixedRateDeductionNum) || "",
    FIXED_RATE_DEDUCTION_DISPLAY: formatCurrency(fixedRateDeductionNum) || "",
    "DEDUCTION FIXED RATE": formatCurrency(fixedRateDeductionNum) || "",
    "DEDUCTION FIXED METHOD": formatCurrency(fixedRateDeductionNum) || "",
    FIXED_RATE_DEDUCTION_SENTENCE: fixedRateDeductionSentence || "",
    DEDUCTION_SENTENCE: fixedRateDeductionSentence || "",

    // Financial Data - Quick Questionnaire
    TAXABLE_INCOME: formatCurrency(merged.taxable_income || merged.q2_annual_income || merged.annual_income) || "",
    PARTNER_INCOME: formatCurrency(merged.q3_partner_income || merged.partner_income) || "",
    MORTGAGE_BALANCE: formatCurrency(merged.mortgage_balance) || "",
    PROPERTY_VALUE: formatCurrency(merged.property_value || merged.q11_home_value || merged.home_value) || "",
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
    MORTGAGE_INTEREST:
      formatCurrency(
        merged.questionnaire_data?.mortgage_interest ||
          merged.mortgage_interest ||
          merged.q29_loan_interest ||
          merged.ss_q44_rent,
      ) || "",
    COUNCIL_RATES:
      formatCurrency(
        merged.questionnaire_data?.council_rates ||
          merged.council_rates ||
          merged.q29_council_rates ||
          merged.ss_q44_council,
      ) || "",
    WATER_RATES:
      formatCurrency(
        merged.questionnaire_data?.water_rates || merged.water_rates || merged.q29_water_rates || merged.ss_q44_water,
      ) || "",
    BUILDING_INSURANCE: formatCurrency(buildingInsurance) || "",
    INSURANCE: formatCurrency(buildingInsurance) || "",
    REPAIRS_MAINTENANCE: formatCurrency(repairsMaintenance) || "",
    REPAIRS: formatCurrency(repairsMaintenance) || "",
    ELECTRICITY: formatCurrency(electricityAmount) || "",
    GAS: formatCurrency(merged.questionnaire_data?.gas_annual || merged.gas_annual) || "",
    CLEANING: formatCurrency(merged.questionnaire_data?.cleaning_annual || merged.cleaning_annual) || "",
    PHONE_INTERNET: formatCurrency(phoneInternetAmount) || "",
    OTHER_EXPENSES: formatCurrency(otherExpensesAmount) || "",
    DEPRECIATION: formatCurrency(buildingDepreciation) || "",
    LAND_TAX: formatCurrency(merged.q29_land_tax || merged.ss_q44_land_tax) || "",
    ADVERTISING: formatCurrency(merged.q29_advertising || merged.ss_q44_advertising) || "",
    EQUIPMENT_LEASE: formatCurrency(merged.q29_equipment_lease || merged.ss_q44_equipment_lease) || "",
    VEHICLE_EXPENSES: formatCurrency(merged.q29_vehicle_expenses || merged.ss_q44_vehicle) || "",
    STAFF_COST: formatCurrency(merged.q29_staff_cost || merged.ss_q44_staff) || "",
    STAFF_SUPER: formatCurrency(merged.q29_staff_super || merged.ss_q44_super) || "",
    STAFF_NUM: merged.q29_staff_num || merged.ss_q44_staff_num || "",
    POWER_BUSINESS_PCT: merged.q29_power_business_pct || merged.ss_q44_power || "",
    POWER_ELECTRICITY_PCT:
      merged.q30_power_electricity_pct || merged.q29_power_electricity_pct || merged.ss_q44_power || "",
    PHONE_BUSINESS_PCT: merged.q29_phone_business_pct || merged.ss_q44_phone || "",
    PHONE_INTERNET_PCT:
      merged.q32_phone_internet_pct ||
      merged.q31_phone_internet_pct ||
      merged.q29_phone_internet_pct ||
      merged.ss_q44_phone ||
      "",
    RENT_ANNUAL: formatCurrency(merged.q29_rent_annual || merged.ss_q44_rent || merged.annual_premises_cost) || "",

    // Deductible Amounts (calculated based on BUP percentage)
    MORTGAGE_DEDUCTIBLE: formatCurrency(mortgageDeductibleNum) || "",
    RATES_DEDUCTIBLE: formatCurrency(ratesDeductibleNum) || "",
    WATER_DEDUCTIBLE: formatCurrency(waterDeductibleNum) || "",
    INSURANCE_DEDUCTIBLE: formatCurrency(insuranceDeductibleNum) || "",
    REPAIRS_DEDUCTIBLE: formatCurrency(repairsDeductibleNum) || "",
    ELECTRICITY_DEDUCTIBLE: formatCurrency(electricityDeductibleNum) || "",
    GAS_DEDUCTIBLE: formatCurrency(gasDeductibleNum) || "",
    CLEANING_DEDUCTIBLE: formatCurrency(cleaningDeductibleNum) || "",
    PHONE_INTERNET_DEDUCTIBLE: formatCurrency(phoneInternetDeductibleNum) || "",
    OTHER_EXPENSES_DEDUCTIBLE: formatCurrency(otherExpensesDeductibleNum) || "",
    DEPRECIATION_DEDUCTIBLE: formatCurrency(depreciationDeductibleNum) || "",

    // Strategy Information
    RECOMMENDED_STRATEGY: merged.strategy_name || merged.strategy || "",
    RECOMMENDATION_TEXT: merged.strategy_description || merged.strategy_name || merged.strategy || "",
    STRATEGY_CODE: merged.strategy || "",

    // Business Use Calculation
    HOURS_PER_WEEK: merged.hours_per_week?.toString() || merged.ss_q48_time?.match(/\d+/)?.[0] || "",
    WEEKS_PER_YEAR: merged.weeks_per_year?.toString() || "52",
    TOTAL_HOURS: totalHoursNum,

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
    TOTAL_CLAIM_PER_THE_RUNNING_COST_METHOD: formatPlainAmount(totalRunningExpensesDeductibleForTable, true) || "", // Same as TOTAL_RUNNING_COSTS_DEDUCTIBLE
    TOTAL_RUNNING_COSTS_DEDUCTIBLE: formatPlainAmount(totalRunningExpensesDeductibleForTable, true) || "",

    // Aliases for template placeholders (the template uses spaces / different names)
    "CLIENT ADDRESS": formatAddress(merged.property_address || merged.CLIENT_ADDRESS || ""),
    "CLIENT_ NAME": merged.client_name || merged.CLIENT_NAME || "",
    REPORT_DATE: reportDate,
    CLIENT_FIRST_NAME:
      merged.client_first_name || merged.CLIENT_FIRST_NAME || (merged.client_name || "").split(" ")[0] || "",
    CLIENT_LOCAL_COUNCIL:
      merged.client_local_council ||
      merged.questionnaire_data?.client_local_council ||
      merged.local_council ||
      merged.council ||
      merged.CLIENT_LOCAL_COUNCIL ||
      "",
    TOTAL_FLOOR_AREA_M2: totalHabitableFloorAreaNum > 0 ? `${totalHabitableFloorAreaNum} m²` : "",
    BUILDING_DEPRECIATION_VALUE: formatCurrency(buildingDepreciation) || "",
    DEDICATED_OFFICE_AREA_M2: homeOfficeAreaNum > 0 ? `${homeOfficeAreaNum} m²` : "",
    DEDICATED_MEETING_AREA_M2: meetingAreaNum > 0 ? `${meetingAreaNum} m²` : "",
    DEDICATED_ARCHIVE_AREA_M2: archiveAreaNum > 0 ? `${archiveAreaNum} m²` : "",
    TOTAL_BUSINESS_USE_AREA_M2: totalBusinessUseFloorAreaNum > 0 ? `${totalBusinessUseFloorAreaNum} m²` : "",
    MORTGAGE: formatCurrency(mortgageInterest) || "",
    BUP: businessUsePercentageNum > 0 ? businessUsePercentageNum.toString() : "", // Without % sign (template adds it)
    BUP_WITH_PERCENT: businessUsePercentageDisplay || "", // With % for templates that don't add it
    MORTGAGE_DEDUCTIBLE: formatCurrency(mortgageDeductibleNum) || "",
    RATES: formatCurrency(councilRates) || "",
    WATER: formatCurrency(waterRates) || "",
    TOTAL_PROPERTY_EXPENSES: formatCurrency(propertyExpensesTotal) || "",
    TOTAL_DEDUCTIBLE: formatCurrency(totalDeductibleNum) || "",
    TOTAL_RUNNING_EXPENSES: formatCurrency(totalRunningExpensesForTable) || "", // Sum of only ELECTRICITY + GAS + CLEANING for table
    TOTAL_RUNNING_EXPENSES_DEDUCTIBLE: formatCurrency(totalRunningExpensesDeductibleForTable) || "", // Sum of only ELECTRICITY_DEDUCTIBLE + GAS_DEDUCTIBLE + CLEANING_DEDUCTIBLE for table
    TOTAL_HABITABLE_FLOOR_AREA: totalHabitableFloorAreaNum > 0 ? `${totalHabitableFloorAreaNum} m²` : "",
    HOME_OFFICE_FLOOR_AREA: homeOfficeAreaNum > 0 ? `${homeOfficeAreaNum} m²` : "",
    MEETING_AREA_FLOOR_AREA: meetingAreaNum > 0 ? `${meetingAreaNum} m²` : "",
    ARCHIVE_ROOM_FLOOR_AREA: archiveAreaNum > 0 ? `${archiveAreaNum} m²` : "",
    TOTAL_BUSINESS_USE_FLOOR_AREA: totalBusinessUseFloorAreaNum > 0 ? `${totalBusinessUseFloorAreaNum} m²` : "",
    BUSINESS_USE_PERCENTAGE: businessUsePercentageDisplay || "",
    TOTAL_RUNNING_COSTS_DEDUCTIBLE: formatPlainAmount(totalRunningExpensesDeductibleForTable, true) || "", // Calculated as TOTAL_RUNNING_EXPENSES × BUSINESS_USE_PERCENTAGE
    ACTUAL_COST_METHOD_DEDUCTION: formatCurrency(runningCostsDeductibleActual) || "",
    RUNNING_COSTS_DEDUCTION_ACTUAL: formatCurrency(runningCostsDeductibleActual) || "",
    ACTUAL_COST_METHOD_DEDUCTION_DISPLAY: formatCurrency(runningCostsDeductibleActual) || "",
    RUNNING_COSTS_DEDUCTION_ACTUAL_METHOD: formatCurrency(runningCostsDeductibleActual) || "",
    ACTUAL_COST_DEDUCTION_SENTENCE: actualCostDeductionSentence || "",
    RUNNING_COSTS_DEDUCTION_SENTENCE_ACTUAL: actualCostDeductionSentence || "",
    TOTAL_WEEKLY_HOURS_WORKED: merged.hours_per_week?.toString() || "",
    TOTAL_NUMBER_OF_WEEKS_WORKED: merged.weeks_per_year?.toString() || "52",
    TOTAL_NUMBER_OF_HOURS_WORKED: totalHoursNum,
    TOTAL_FIXED_RATE_METHOD_CLAIM:
      formatPlainAmount(
        merged.total_fixed_rate_method_claim || merged.TOTAL_FIXED_RATE_METHOD_CLAIM || fixedRateDeductionNum,
        true,
      ) || "",
    "TOTAL_CLAIM_ PER_ THE_RUNNING_COST_METHOD": formatPlainAmount(totalRunningExpensesDeductibleForTable, true) || "", // Same as TOTAL_RUNNING_COSTS_DEDUCTIBLE
    "TOTAL_CLAIM_ PER_ THE_FIXED_COST_METHOD":
      formatPlainAmount(
        merged.total_claim_per_fixed_cost_method || merged.TOTAL_CLAIM_PER_FIXED_COST_METHOD || fixedRateDeductionNum,
        true,
      ) || "",
    BEST_METHOD_COMPARISON:
      merged.best_method_comparison || merged.BEST_METHOD_COMPARISON || bestMethodComparison || "",
    RECOMMENDED_METHOD: merged.recommended_method || merged.strategy_name || merged.strategy || "",
    TOTAL_PROPERTY_DEDUCTIBLE: formatCurrency(totalPropertyDeductibleNum) || "", // Sum of MORTGAGE_DEDUCTIBLE + RATES_DEDUCTIBLE + WATER_DEDUCTIBLE + INSURANCE_DEDUCTIBLE + REPAIRS_DEDUCTIBLE + DEPRECIATION_DEDUCTIBLE
    RUNNING_METHOD: runningMethod || "",
    RUNNING_METHOD_DEDUCTIBLE:
      runningMethod === "Actual Cost Method"
        ? formatCurrency(totalRunningExpensesDeductibleForTable) || "" // Use TOTAL_CLAIM_PER_THE_RUNNING_COST_METHOD
        : runningMethod === "Fixed Rate Method"
          ? formatCurrency(fixedRateDeductionNum) || "" // Use TOTAL_CLAIM_PER_THE_FIXED_COST_METHOD
          : formatCurrency(totalRunningExpensesDeductibleForTable || fixedRateDeductionNum) || "", // Default to whichever is available
    RUNNING_EXPENSES_DEDUCTION: formatCurrency(runningCostsDeductibleActual) || "", // Deduction amount for running expenses in summary table
    TOTAL_ANNUAL_DEDUCTION: formatCurrency(totalAnnualDeductionNum) || "",
    START_DATE_OF_HOME_BUSINESS: startDateOfHomeBusiness,

    // Additional aliases to satisfy template placeholders without editing the DOCX
    "Local Council": merged.client_local_council || merged.local_council || merged.council || "",
    LOCAL_COUNCIL: merged.client_local_council || merged.local_council || merged.council || "",
    ABN: merged.abn || merged.CLIENT_ABN || "",
    BUSINESS_START_DATE: formatDateAU(
      merged.business_start_date || merged.CLIENT_BUSINESS_START_DATE || startDateOfHomeBusiness || "",
    ),
    "Business Start Date": formatDateAU(
      merged.business_start_date || merged.CLIENT_BUSINESS_START_DATE || startDateOfHomeBusiness || "",
    ),
    TOTAL_FLOOR_AREA: merged.q16_total_floor_space || merged.total_floor_space_sqm || "",
    "Total Floor Area": merged.q16_total_floor_space || merged.total_floor_space_sqm || "",
    BUILDING_DEPRECIATION:
      formatCurrency(toNumber(merged.depreciation || merged.q29_equipment_depreciation || buildingDepreciation)) || "",
    "Building Depreciation (2.5% p.a.)":
      formatCurrency(toNumber(merged.depreciation || merged.q29_equipment_depreciation || buildingDepreciation)) || "",
    HOME_OFFICE:
      merged.home_office_floor_area || merged.business_floor_space_sqm || merged.q17_business_floor_space || "",
    "Home Office":
      merged.home_office_floor_area || merged.business_floor_space_sqm || merged.q17_business_floor_space || "",
    MEETING_AREA: merged.meeting_area_floor_area || merged.dedicated_meeting_area_m2 || "",
    "Meeting Area": merged.meeting_area_floor_area || merged.dedicated_meeting_area_m2 || "",
    ARCHIVE_ROOM: merged.archive_room_floor_area || merged.dedicated_archive_area_m2 || "",
    "Archive Room": merged.archive_room_floor_area || merged.dedicated_archive_area_m2 || "",
    TOTAL_BUSINESS_USE_AREA:
      merged.total_business_use_area_m2 || merged.business_floor_space_sqm || merged.q17_business_floor_space || "",
    "Total Business Use Area":
      merged.total_business_use_area_m2 || merged.business_floor_space_sqm || merged.q17_business_floor_space || "",
    "Council Rates": formatCurrency(toNumber(merged.council_rates || merged.q29_council_rates || councilRates)) || "",
    "Water Rates": formatCurrency(toNumber(merged.water_rates || merged.q29_water_rates || waterRates)) || "",
    "Total Property Expenses": formatCurrency(toNumber(merged.total_property_expenses || propertyExpensesTotal)) || "",
    TOTAL_PROPERTY_EXPENSES_ALIAS:
      formatCurrency(toNumber(merged.total_property_expenses || propertyExpensesTotal)) || "",
    TOTAL_DEDUCTIBLE_ALIAS: formatCurrency(toNumber(merged.total_deductible || totalDeductibleNum)) || "",
    TOTAL_RUNNING_EXPENSES_ALIAS:
      formatCurrency(toNumber(merged.total_running_expenses || totalRunningExpensesForTable)) || "",
    TOTAL_BUSINESS_USE_FLOOR_AREA_ALIAS: totalBusinessUseFloorAreaNum > 0 ? `${totalBusinessUseFloorAreaNum} m²` : "",
    TOTAL_HABITABLE_FLOOR_AREA_ALIAS: totalHabitableFloorAreaNum > 0 ? `${totalHabitableFloorAreaNum} m²` : "",
    BUSINESS_USE_PERCENTAGE_ALIAS: businessUsePercentageDisplay || "",
    "TOTAL_CLAIM_ PER_ THE_RUNNING_COST_METHOD_ALIAS":
      formatPlainAmount(totalRunningExpensesDeductibleForTable, true) || "", // Same as TOTAL_RUNNING_COSTS_DEDUCTIBLE
    "TOTAL_CLAIM_ PER_ THE_FIXED_COST_METHOD_ALIAS":
      formatPlainAmount(
        merged.total_claim_per_fixed_cost_method || merged.TOTAL_CLAIM_PER_FIXED_COST_METHOD || fixedRateDeductionNum,
        true,
      ) || "",
    BEST_METHOD_COMPARISON_ALIAS:
      merged.best_method_comparison || merged.BEST_METHOD_COMPARISON || bestMethodComparison || "",
    TOTAL_PROPERTY_DEDUCTIBLE_ALIAS: formatCurrency(totalPropertyDeductibleNum) || "",
    RUNNING_METHOD_ALIAS: runningMethod || "",
    TOTAL_ANNUAL_DEDUCTION_ALIAS: formatCurrency(totalAnnualDeductionNum) || "",
    START_DATE_OF_HOME_BUSINESS_ALIAS: startDateOfHomeBusiness,

    // Pass through any additional fields (flatten nested objects)
    ...Object.fromEntries(
      Object.entries(merged).map(([key, value]) => [
        key.toUpperCase(),
        typeof value === "object" && value !== null ? JSON.stringify(value) : value,
      ]),
    ),
    ...merged,

    // Override with formatted values to ensure proper formatting (these come last so they override any raw values from merged)
    BUILDING_VALUE: formatCurrency(buildingValue) || "",
    BUSINESS_TYPE: (() => {
      const businessType = merged.business_type || merged.CLIENT_BUSINESS_TYPE || merged.BUSINESS_TYPE || ""
      if (!businessType) return ""
      // Add "business" at the end if not already present
      const lowerType = businessType.toLowerCase().trim()
      if (lowerType.endsWith("business")) {
        return businessType
      }
      return `${businessType} business`
    })(),
  }
}

export async function POST(request: NextRequest) {
  console.log("[v0] 🚀 Starting report generation...")

  try {
    console.log("[v0] 📖 Reading request body...")
    const body = await request.json()
    console.log("[v0] ✅ Request body parsed successfully")

    const { questionnaire1, questionnaire2, clientName, templateType = "final" } = body // Destructure templateType from body, default to "final"

    if (!questionnaire1 && !questionnaire2) {
      console.log("[v0] ❌ No questionnaire data provided")
      return NextResponse.json({ error: "At least one questionnaire is required" }, { status: 400 })
    }

    console.log("[v0] 📁 Loading template from Vercel Blob or local fallback")

    const templateBuffer = await getTemplatePath(templateType) // Pass templateType to getTemplatePath
    console.log("[v0] ✅ Template loaded, size:", templateBuffer.length, "bytes")

    if (templateBuffer.length === 0) {
      console.error("[v0] ❌ Template file is empty")
      return NextResponse.json({ error: "Template file is empty or corrupted" }, { status: 500 })
    }

    console.log("[v0] 📦 Creating PizZip from template buffer...")
    const zip = new PizZip(templateBuffer)
    console.log("[v0] ✅ PizZip created successfully")

    console.log("[v0] 📝 Initializing Docxtemplater...")

    // Template uses {{ }} delimiters (double braces)
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

    let doc: Docxtemplater

    try {
      // Try without cleaning first
      doc = new Docxtemplater(zip, docxtemplaterOptions)
      console.log("[v0] ✅ Docxtemplater initialized without cleaning")
    } catch (initError: any) {
      // If initialization fails, try with cleaned XML
      if (
        initError.message?.includes("Multi error") ||
        initError.message?.includes("Malformed xml") ||
        initError.message?.includes("xml") ||
        initError.message?.includes("Duplicate")
      ) {
        console.log("[v0] ⚠️  Initial initialization failed, trying with XML cleaning...")
        const cleanedZip = cleanFragmentedPlaceholders(zip)
        console.log("[v0] ✅ XML cleaning complete")

        doc = new Docxtemplater(cleanedZip, docxtemplaterOptions)
        console.log("[v0] ✅ Docxtemplater initialized with cleaned XML")
      } else {
        throw initError
      }
    }

    console.log("[v0] 🎨 Rendering document with data...")
    const questionnaireData = mapQuestionnairesToTemplateData(questionnaire1, questionnaire2)
    console.log("[v0] ✅ Data mapping complete, fields:", Object.keys(questionnaireData).length)
    doc.render(questionnaireData)
    console.log("[v0] ✅ Document rendered successfully")

    console.log("[v0] 📦 Generating DOCX buffer...")
    const docxBuffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    })
    console.log("[v0] ✅ DOCX buffer generated, size:", docxBuffer.length, "bytes")

    const filename = `Tax_Report_${clientName || "Client"}_${new Date().toISOString().split("T")[0]}.docx`
    const contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    console.log("[v0] ✨ Report generation complete! File:", filename)

    return new NextResponse(Buffer.from(docxBuffer), {
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

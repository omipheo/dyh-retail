import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
import { type NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

const TEMPLATE_PATH = join(process.cwd(), "public", "templates", "word_corrected.docx")

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

  // Map common fields to template placeholders
  return {
    // Client Information
    CLIENT_NAME: merged.client_name || merged.CLIENT_NAME || "",
    CLIENT_FULL_NAME: merged.client_full_name || merged.CLIENT_FULL_NAME || merged.client_name || "",
    CLIENT_ADDRESS: merged.property_address || merged.CLIENT_ADDRESS || "",
    CLIENT_BUSINESS_NAME: merged.business_name || merged.CLIENT_BUSINESS_NAME || "",
    CLIENT_BUSINESS_TYPE: merged.business_type || merged.CLIENT_BUSINESS_TYPE || "",
    CLIENT_ABN: merged.abn || merged.CLIENT_ABN || "",
    CLIENT_BUSINESS_START_DATE: merged.business_start_date || merged.CLIENT_BUSINESS_START_DATE || "",

    // Financial Data
    TAXABLE_INCOME: merged.taxable_income?.toLocaleString() || "",
    MORTGAGE_BALANCE: merged.mortgage_balance?.toLocaleString() || "",
    PROPERTY_VALUE: merged.property_value?.toLocaleString() || "",
    BUILDING_VALUE: merged.building_value?.toLocaleString() || "",
    BUP_PERCENTAGE: merged.bup_percentage?.toString() || "",

    // Property Expenses
    MORTGAGE_INTEREST:
      merged.questionnaire_data?.mortgage_interest?.toLocaleString() ||
      merged.mortgage_interest?.toLocaleString() ||
      "",
    COUNCIL_RATES:
      merged.questionnaire_data?.council_rates?.toLocaleString() || merged.council_rates?.toLocaleString() || "",
    WATER_RATES: merged.questionnaire_data?.water_rates?.toLocaleString() || merged.water_rates?.toLocaleString() || "",
    BUILDING_INSURANCE:
      merged.questionnaire_data?.building_insurance?.toLocaleString() ||
      merged.building_insurance?.toLocaleString() ||
      "",
    INSURANCE:
      merged.questionnaire_data?.building_insurance?.toLocaleString() ||
      merged.building_insurance?.toLocaleString() ||
      "",
    REPAIRS_MAINTENANCE:
      merged.questionnaire_data?.repairs_maintenance?.toLocaleString() ||
      merged.repairs_maintenance?.toLocaleString() ||
      "",
    REPAIRS:
      merged.questionnaire_data?.repairs_maintenance?.toLocaleString() ||
      merged.repairs_maintenance?.toLocaleString() ||
      "",
    ELECTRICITY:
      merged.questionnaire_data?.electricity_annual?.toLocaleString() ||
      merged.electricity_annual?.toLocaleString() ||
      "",
    GAS: merged.questionnaire_data?.gas_annual?.toLocaleString() || merged.gas_annual?.toLocaleString() || "",
    CLEANING:
      merged.questionnaire_data?.cleaning_annual?.toLocaleString() || merged.cleaning_annual?.toLocaleString() || "",
    DEPRECIATION:
      merged.questionnaire_data?.depreciation?.toLocaleString() || merged.depreciation?.toLocaleString() || "",

    // Deductible Amounts (calculated based on BUP percentage)
    MORTGAGE_INTEREST_DEDUCTIBLE: merged.bup_percentage
      ? Math.round((merged.questionnaire_data?.mortgage_interest || 0) * (merged.bup_percentage / 100)).toLocaleString()
      : "",
    RATES_DEDUCTIBLE: merged.bup_percentage
      ? Math.round((merged.questionnaire_data?.council_rates || 0) * (merged.bup_percentage / 100)).toLocaleString()
      : "",
    WATER_DEDUCTIBLE: merged.bup_percentage
      ? Math.round((merged.questionnaire_data?.water_rates || 0) * (merged.bup_percentage / 100)).toLocaleString()
      : "",
    INSURANCE_DEDUCTIBLE: merged.bup_percentage
      ? Math.round(
          (merged.questionnaire_data?.building_insurance || 0) * (merged.bup_percentage / 100),
        ).toLocaleString()
      : "",
    REPAIRS_DEDUCTIBLE: merged.bup_percentage
      ? Math.round(
          (merged.questionnaire_data?.repairs_maintenance || 0) * (merged.bup_percentage / 100),
        ).toLocaleString()
      : "",
    ELECTRICITY_DEDUCTIBLE: merged.bup_percentage
      ? Math.round(
          (merged.questionnaire_data?.electricity_annual || 0) * (merged.bup_percentage / 100),
        ).toLocaleString()
      : "",
    GAS_DEDUCTIBLE: merged.bup_percentage
      ? Math.round((merged.questionnaire_data?.gas_annual || 0) * (merged.bup_percentage / 100)).toLocaleString()
      : "",
    CLEANING_DEDUCTIBLE: merged.bup_percentage
      ? Math.round((merged.questionnaire_data?.cleaning_annual || 0) * (merged.bup_percentage / 100)).toLocaleString()
      : "",
    DEPRECIATION_DEDUCTIBLE: merged.bup_percentage
      ? Math.round((merged.questionnaire_data?.depreciation || 0) * (merged.bup_percentage / 100)).toLocaleString()
      : "",

    // Strategy Information
    RECOMMENDED_STRATEGY: merged.strategy_name || merged.strategy || "",
    RECOMMENDATION_TEXT: merged.strategy_description || merged.strategy_name || merged.strategy || "",
    STRATEGY_CODE: merged.strategy || "",

    // Business Use Calculation
    HOURS_PER_WEEK: merged.hours_per_week?.toString() || "",
    WEEKS_PER_YEAR: merged.weeks_per_year?.toString() || "",
    TOTAL_HOURS:
      merged.hours_per_week && merged.weeks_per_year ? (merged.hours_per_week * merged.weeks_per_year).toString() : "",

    // Total Claims
    TOTAL_CLAIM_PER_THE_RUNNING_COST_METHOD: "", // This will be calculated if needed

    // Pass through any additional fields
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

    console.log("[v0] 📁 Loading template from:", TEMPLATE_PATH)

    const fs = require("fs")
    if (!fs.existsSync(TEMPLATE_PATH)) {
      console.error("[v0] ❌ Template file not found at:", TEMPLATE_PATH)
      return NextResponse.json({ error: `Template file not found at ${TEMPLATE_PATH}` }, { status: 500 })
    }

    const templateBuffer = readFileSync(TEMPLATE_PATH)
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

    console.log("[v0] 📦 Generating final buffer...")
    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    })
    console.log("[v0] ✅ Buffer generated, size:", buffer.length, "bytes")

    const filename = `Tax_Report_${clientName || "Client"}_${new Date().toISOString().split("T")[0]}.docx`

    console.log("[v0] ✨ Report generation complete! File:", filename)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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

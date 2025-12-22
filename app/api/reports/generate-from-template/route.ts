import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
import { type NextRequest, NextResponse } from "next/server"

const TEMPLATE_URL = "/templates/word_corrected.docx"

const DEMO_SCENARIOS = {
  sarah: {
    // Client Information
    CLIENT_FULL_NAME: "Sarah Chen",
    CLIENT_FIRST_NAME: "Sarah",
    CLIENT_ADDRESS: "123 Tech Street, Sydney NSW 2000",
    "CLIENT ADDRESS": "123 Tech Street, Sydney NSW 2000",
    "CLIENT_ NAME": "Sarah Chen",
    CLIENT_LOCAL_COUNCIL: "City of Sydney",
    REPORT_DATE: new Date().toLocaleDateString("en-AU"),

    // Business Information
    CLIENT_BUSINESS_NAME: "Chen IT Consulting",
    CLIENT_ABN: "12 345 678 901",
    CLIENT_BUSINESS_TYPE: "IT Consulting & Web Development",
    CLIENT_BUSINESS_START_DATE: "01/07/2020",
    BUSINESS_TYPE: "IT Consulting & Web Development",

    // Property Areas
    TOTAL_FLOOR_AREA_M2: 200,
    TOTAL_HABITABLE_FLOOR_AREA: 200,
    DEDICATED_OFFICE_AREA_M2: 54,
    HOME_OFFICE_FLOOR_AREA: 54,
    DEDICATED_MEETING_AREA_M2: 0,
    MEETING_AREA_FLOOR_AREA: 0,
    DEDICATED_ARCHIVE_AREA_M2: 0,
    ARCHIVE_ROOM_FLOOR_AREA: 0,
    TOTAL_BUSINESS_USE_AREA_M2: 54,
    TOTAL_BUSINESS_USE_FLOOR_AREA: 54,
    BUSINESS_USE_PERCENTAGE: 27,
    BUP: 27,

    // Property Values & Expenses
    BUILDING_VALUE: 540000,
    BUILDING_DEPRECIATION_VALUE: 13500,
    MORTGAGE: 38250,
    RATES: 4365,
    WATER: 2052,
    INSURANCE: 3285,
    REPAIRS: 2520,
    DEPRECIATION: 13500,
    SECURITY: 648,
    ELECTRICITY: 3528,
    GAS: 1665,
    CLEANING: 2106,
    TOTAL_PROPERTY_EXPENSES: 64620,
    TOTAL_RUNNING_EXPENSES: 7299,

    // Property Deductibles
    MORTGAGE_DEDUCTIBLE: 10328,
    RATES_DEDUCTIBLE: 1179,
    WATER_DEDUCTIBLE: 554,
    INSURANCE_DEDUCTIBLE: 887,
    REPAIRS_DEDUCTIBLE: 680,
    DEPRECIATION_DEDUCTIBLE: 3645,
    SECURITY_DEDUCTIBLE: 175,
    ELECTRICITY_DEDUCTIBLE: 952,
    GAS_DEDUCTIBLE: 450,
    CLEANING_DEDUCTIBLE: 569,
    TOTAL_PROPERTY_DEDUCTIBLE: 17448,
    TOTAL_RUNNING_COSTS_DEDUCTIBLE: 1971,
    TOTAL_DEDUCTIBLE: 19419,
    TOTAL_ANNUAL_DEDUCTION: 19419,

    // Hours Worked
    TOTAL_WEEKLY_HOURS_WORKED: 40,
    TOTAL_NUMBER_OF_WEEKS_WORKED: 48,
    TOTAL_NUMBER_OF_HOURS_WORKED: 1920,

    // Method Claims
    TOTAL_FIXED_RATE_METHOD_CLAIM: 1344,
    "TOTAL_CLAIM_ PER_ THE_FIXED_COST_METHOD": 1344,
    "TOTAL_CLAIM_ PER_ THE_RUNNING_COST_METHOD": 1971,

    // Recommendation
    RUNNING_METHOD: "Actual Cost Method",
    RECOMMENDED_METHOD: "Actual Cost Method",
    BEST_METHOD_COMPARISON:
      "The Actual Cost Method provides $19,419 in deductions compared to only $1,344 from the Fixed Rate Method, resulting in $18,075 more in tax deductions.",
    RECOMMENDATION_TEXT: "SBLB(iii)",

    // Tax & Service Calculations
    MARGINAL_TAX_RATE: 47,
    ESTIMATED_TAX_SAVINGS: 9127,
  },

  marcus: {
    // Client Information
    CLIENT_FULL_NAME: "Marcus Thompson",
    CLIENT_FIRST_NAME: "Marcus",
    CLIENT_ADDRESS: "456 Creative Ave, Melbourne VIC 3000",
    "CLIENT ADDRESS": "456 Creative Ave, Melbourne VIC 3000",
    "CLIENT_ NAME": "Marcus Thompson",
    CLIENT_LOCAL_COUNCIL: "City of Melbourne",
    REPORT_DATE: new Date().toLocaleDateString("en-AU"),

    // Business Information
    CLIENT_BUSINESS_NAME: "Thompson Architecture",
    CLIENT_ABN: "23 456 789 012",
    CLIENT_BUSINESS_TYPE: "Architecture & Design Studio",
    CLIENT_BUSINESS_START_DATE: "01/01/2019",
    BUSINESS_TYPE: "Architecture & Design Studio",

    // Property Areas
    TOTAL_FLOOR_AREA_M2: 200,
    TOTAL_HABITABLE_FLOOR_AREA: 200,
    DEDICATED_OFFICE_AREA_M2: 60,
    HOME_OFFICE_FLOOR_AREA: 60,
    DEDICATED_MEETING_AREA_M2: 0,
    MEETING_AREA_FLOOR_AREA: 0,
    DEDICATED_ARCHIVE_AREA_M2: 0,
    ARCHIVE_ROOM_FLOOR_AREA: 0,
    TOTAL_BUSINESS_USE_AREA_M2: 60,
    TOTAL_BUSINESS_USE_FLOOR_AREA: 60,
    BUSINESS_USE_PERCENTAGE: 30,
    BUP: 30,

    // Property Values & Expenses
    BUILDING_VALUE: 600000,
    BUILDING_DEPRECIATION_VALUE: 15000,
    MORTGAGE: 42500,
    RATES: 4850,
    WATER: 2280,
    INSURANCE: 3650,
    REPAIRS: 2800,
    DEPRECIATION: 15000,
    SECURITY: 720,
    ELECTRICITY: 3920,
    GAS: 1850,
    CLEANING: 2340,
    TOTAL_PROPERTY_EXPENSES: 71800,
    TOTAL_RUNNING_EXPENSES: 8110,

    // Property Deductibles
    MORTGAGE_DEDUCTIBLE: 12750,
    RATES_DEDUCTIBLE: 1455,
    WATER_DEDUCTIBLE: 684,
    INSURANCE_DEDUCTIBLE: 1095,
    REPAIRS_DEDUCTIBLE: 840,
    DEPRECIATION_DEDUCTIBLE: 4500,
    SECURITY_DEDUCTIBLE: 216,
    ELECTRICITY_DEDUCTIBLE: 1176,
    GAS_DEDUCTIBLE: 555,
    CLEANING_DEDUCTIBLE: 702,
    TOTAL_PROPERTY_DEDUCTIBLE: 21540,
    TOTAL_RUNNING_COSTS_DEDUCTIBLE: 2433,
    TOTAL_DEDUCTIBLE: 23973,
    TOTAL_ANNUAL_DEDUCTION: 23973,

    // Hours Worked
    TOTAL_WEEKLY_HOURS_WORKED: 45,
    TOTAL_NUMBER_OF_WEEKS_WORKED: 48,
    TOTAL_NUMBER_OF_HOURS_WORKED: 2160,

    // Method Claims
    TOTAL_FIXED_RATE_METHOD_CLAIM: 1512,
    "TOTAL_CLAIM_ PER_ THE_FIXED_COST_METHOD": 1512,
    "TOTAL_CLAIM_ PER_ THE_RUNNING_COST_METHOD": 2433,

    // Recommendation
    RUNNING_METHOD: "Actual Cost Method",
    RECOMMENDED_METHOD: "Actual Cost Method",
    BEST_METHOD_COMPARISON:
      "The Actual Cost Method provides $23,973 in deductions compared to only $1,512 from the Fixed Rate Method, resulting in $22,461 more in tax deductions.",
    RECOMMENDATION_TEXT:
      "HBRS (ii) - Home Business Re-Structure: Stay & Start - Home owner starting a business from existing purchased home",

    // Tax & Service Calculations
    MARGINAL_TAX_RATE: 47,
    ESTIMATED_TAX_SAVINGS: 11267,
  },

  jennifer: {
    // Client Information
    CLIENT_FULL_NAME: "Jennifer Ormond",
    CLIENT_FIRST_NAME: "Jennifer",
    CLIENT_ADDRESS: "789 Wealth Street, Brisbane QLD 4000",
    "CLIENT ADDRESS": "789 Wealth Street, Brisbane QLD 4000",
    "CLIENT_ NAME": "Jennifer Ormond",
    CLIENT_LOCAL_COUNCIL: "Brisbane City Council",
    REPORT_DATE: new Date().toLocaleDateString("en-AU"),

    // Business Information
    CLIENT_BUSINESS_NAME: "Ormond Financial Planning",
    CLIENT_ABN: "34 567 890 123",
    CLIENT_BUSINESS_TYPE: "Financial Planning & Wealth Management",
    CLIENT_BUSINESS_START_DATE: "15/03/2021",
    BUSINESS_TYPE: "Financial Planning & Wealth Management",

    // Property Areas
    TOTAL_FLOOR_AREA_M2: 200,
    TOTAL_HABITABLE_FLOOR_AREA: 200,
    DEDICATED_OFFICE_AREA_M2: 70,
    HOME_OFFICE_FLOOR_AREA: 70,
    DEDICATED_MEETING_AREA_M2: 0,
    MEETING_AREA_FLOOR_AREA: 0,
    DEDICATED_ARCHIVE_AREA_M2: 0,
    ARCHIVE_ROOM_FLOOR_AREA: 0,
    TOTAL_BUSINESS_USE_AREA_M2: 70,
    TOTAL_BUSINESS_USE_FLOOR_AREA: 70,
    BUSINESS_USE_PERCENTAGE: 35,
    BUP: 35,

    // Property Values & Expenses
    BUILDING_VALUE: 850000,
    BUILDING_DEPRECIATION_VALUE: 21250,
    MORTGAGE: 52000,
    RATES: 5280,
    WATER: 1980,
    INSURANCE: 4200,
    REPAIRS: 3500,
    DEPRECIATION: 21250,
    SECURITY: 1560,
    ELECTRICITY: 4680,
    GAS: 2100,
    CLEANING: 3120,
    TOTAL_PROPERTY_EXPENSES: 89770,
    TOTAL_RUNNING_EXPENSES: 9900,

    // Property Deductibles
    MORTGAGE_DEDUCTIBLE: 18200,
    RATES_DEDUCTIBLE: 1848,
    WATER_DEDUCTIBLE: 693,
    INSURANCE_DEDUCTIBLE: 1470,
    REPAIRS_DEDUCTIBLE: 1225,
    DEPRECIATION_DEDUCTIBLE: 7438,
    SECURITY_DEDUCTIBLE: 546,
    ELECTRICITY_DEDUCTIBLE: 1638,
    GAS_DEDUCTIBLE: 735,
    CLEANING_DEDUCTIBLE: 1092,
    TOTAL_PROPERTY_DEDUCTIBLE: 31420,
    TOTAL_RUNNING_COSTS_DEDUCTIBLE: 3465,
    TOTAL_DEDUCTIBLE: 34885,
    TOTAL_ANNUAL_DEDUCTION: 34885,

    // Hours Worked
    TOTAL_WEEKLY_HOURS_WORKED: 50,
    TOTAL_NUMBER_OF_WEEKS_WORKED: 50,
    TOTAL_NUMBER_OF_HOURS_WORKED: 2500,

    // Method Claims
    TOTAL_FIXED_RATE_METHOD_CLAIM: 1750,
    "TOTAL_CLAIM_ PER_ THE_FIXED_COST_METHOD": 1750,
    "TOTAL_CLAIM_ PER_ THE_RUNNING_COST_METHOD": 3465,

    // Recommendation
    RUNNING_METHOD: "Actual Cost Method",
    RECOMMENDED_METHOD: "Actual Cost Method",
    BEST_METHOD_COMPARISON:
      "The Actual Cost Method provides $34,885 in deductions compared to only $1,750 from the Fixed Rate Method, resulting in $33,135 more in tax deductions.",
    RECOMMENDATION_TEXT: "HBRS(iii) - Home Business Re-Structure: Extend & Start",

    // Tax & Service Calculations
    MARGINAL_TAX_RATE: 47,
    ESTIMATED_TAX_SAVINGS: 16396,
  },
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const scenario = searchParams.get("scenario") || "sarah"

    console.log("[v0] Generating report for scenario:", scenario)

    if (!["sarah", "marcus", "jennifer"].includes(scenario)) {
      return NextResponse.json({ error: "Invalid scenario. Must be 'sarah', 'marcus', or 'jennifer'" }, { status: 400 })
    }

    const renderData = DEMO_SCENARIOS[scenario as keyof typeof DEMO_SCENARIOS]

    console.log("[v0] Render data keys:", Object.keys(renderData))

    console.log("[v0] Fetching template from:", TEMPLATE_URL)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(TEMPLATE_URL, { signal: controller.signal })

      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`)
      }

      const templateBuffer = await response.arrayBuffer()
      console.log("[v0] Template fetched, size:", templateBuffer.byteLength)

      const zip = new PizZip(templateBuffer)

      // Read document.xml to find all placeholders
      const documentXml = zip.files["word/document.xml"]?.asText()
      if (documentXml) {
        const tagMatches = documentXml.match(/\{\{[^}]+\}\}/g) || []
        const uniqueTags = [...new Set(tagMatches)].map((tag) => tag.replace(/\{\{|\}\}/g, ""))
        console.log("[v0] Found", uniqueTags.length, "unique placeholders in template")
        console.log("[v0] Template placeholders:", uniqueTags.sort().join(", "))

        // Compare with renderData keys
        const renderDataKeys = Object.keys(renderData)
        const missingInData = uniqueTags.filter((tag) => !renderDataKeys.includes(tag))
        const extraInData = renderDataKeys.filter((key) => !uniqueTags.includes(key))

        if (missingInData.length > 0) {
          console.error("[v0] ❌ Placeholders in template but MISSING in data:", missingInData.join(", "))
        }
        if (extraInData.length > 0) {
          console.log("[v0] ℹ️ Keys in data but NOT in template:", extraInData.join(", "))
        }
      }

      // Now create Docxtemplater and render
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: () => "",
      })

      // Set options after initialization to fix Word formatting corruption
      doc.setOptions({
        paragraphLoop: true,
        linebreaks: true,
      })

      // Manually compile before rendering to catch errors early
      doc.compile()

      console.log("[v0] Rendering template with data...")

      try {
        doc.render(renderData)
      } catch (renderError: any) {
        console.error("[v0] Docxtemplater render error:", renderError)
        console.error("[v0] Error name:", renderError.name)
        console.error("[v0] Error message:", renderError.message)

        if (renderError.properties) {
          console.error("[v0] Full error properties object:", JSON.stringify(renderError.properties, null, 2))

          // Check for id property which tells us the error type
          if (renderError.properties.id) {
            console.error("[v0] Error ID:", renderError.properties.id)
          }

          // Check for errors array
          if (renderError.properties.errors && Array.isArray(renderError.properties.errors)) {
            console.error("[v0] Total number of placeholder errors:", renderError.properties.errors.length)
            renderError.properties.errors.forEach((e: any, index: number) => {
              console.error(`[v0] ========== Error ${index + 1} ==========`)
              console.error(`[v0] Error details:`, JSON.stringify(e, null, 2))
              if (e.properties) {
                console.error(`[v0] Error properties:`, JSON.stringify(e.properties, null, 2))
                if (e.properties.explanation) {
                  console.error(`[v0] Explanation:`, e.properties.explanation)
                }
                if (e.properties.id) {
                  console.error(`[v0] Sub-error ID:`, e.properties.id)
                }
                if (e.properties.tag) {
                  console.error(`[v0] Problematic tag:`, e.properties.tag)
                }
              }
            })
          } else {
            console.error("[v0] No errors array found in properties")
          }
        } else {
          console.error("[v0] No properties object found in error")
        }

        // Log all available keys we're trying to render
        console.error("[v0] Available render data keys:", Object.keys(renderData).sort().join(", "))

        return NextResponse.json(
          {
            error: "Failed to generate report from template",
            details: renderError.message || "Multi error",
            errorName: renderError.name,
            errorProperties: renderError.properties,
            renderDataKeys: Object.keys(renderData).sort(),
            message:
              "Check server logs for detailed placeholder mismatch information. Look for 'Error 1', 'Error 2', etc.",
          },
          { status: 500 },
        )
      }

      const buffer = doc.getZip().generate({ type: "nodebuffer" })
      console.log("[v0] Document generated successfully, size:", buffer.byteLength)

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="HOME_BASED_BUSINESS_TAXATION_ADVICE_${renderData.CLIENT_FULL_NAME.replace(" ", "_")}.docx"`,
        },
      })
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error: any) {
    console.error("[v0] Report generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate report from template",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

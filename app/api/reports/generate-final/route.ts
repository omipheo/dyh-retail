import { type NextRequest, NextResponse } from "next/server"
import { generateFinalClientReport } from "@/lib/report-generator"
import { put, list } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessmentId, interimReportData, clientName, selectedVersionNumber } = body

    console.log("[v0] Generating final client report for:", assessmentId)
    console.log("[v0] Selected version:", selectedVersionNumber)

    let templateContent = ""
    try {
      const templates = await list({
        prefix: "reference-docs/",
      })

      const adviceTemplate = templates.blobs.find((blob) => {
        const path = blob.pathname.toLowerCase()
        return path.includes("home_business_tax_advice") || path.includes("home_based")
      })

      if (adviceTemplate) {
        console.log("[v0] Found HOME BASED, BUSINESS & TAXATION ADVICE template:", adviceTemplate.pathname)
        const templateResponse = await fetch(adviceTemplate.url)
        templateContent = await templateResponse.text()
        console.log("[v0] Template loaded, length:", templateContent.length)
      } else {
        console.log("[v0] No HOME BASED, BUSINESS & TAXATION ADVICE template found, using default structure")
      }
    } catch (error) {
      console.error("[v0] Error loading template:", error)
    }

    // Generate the final report
    const finalReport = await generateFinalClientReport(interimReportData, templateContent)

    console.log("[v0] Final report generated, length:", finalReport.length)

    const timestamp = Date.now()
    const fileName = `final-reports/${assessmentId}/v${selectedVersionNumber}-${timestamp}-final-advice.pdf`

    const blob = await put(fileName, finalReport, {
      access: "public",
      contentType: "text/plain",
    })

    console.log("[v0] Final report saved to Blob:", blob.url)

    return NextResponse.json({
      success: true,
      reportUrl: blob.url,
      reportContent: finalReport,
      templateUsed: !!templateContent,
      selectedVersion: selectedVersionNumber,
    })
  } catch (error: any) {
    console.error("[v0] Final report generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate final report" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { analyzeClientDocument, generateInterimReportForClientData } from "@/lib/document-analyzer"
import { list } from "@vercel/blob"
import { validateClientData, validateCalculations } from "@/lib/data-validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessmentId, clientId, clientDataVariations } = body // Expect array of client data variations

    console.log("[v0] Starting strategy generation for assessment:", assessmentId)

    // 1. Fetch client documents from Blob storage
    const clientDocs = await list({
      prefix: `documents/${clientId}/`,
    })

    // 2. Fetch reference documents (DYH book, ATO PBRs, etc.)
    const referenceDocs = await list({
      prefix: "reference-docs/",
    })

    // Filter out template documents - we only want DYH book, ATO PBRs, strategy selectors for analysis
    const analysisReferenceDocs = referenceDocs.blobs.filter((blob) => {
      const path = blob.pathname.toLowerCase()
      return !path.includes("home_business_tax_advice") && !path.includes("quick_questionnaire")
    })

    console.log("[v0] Found client docs:", clientDocs.blobs.length)
    console.log("[v0] Found reference docs for analysis:", analysisReferenceDocs.length)

    const validationResults = await Promise.all(
      (clientDataVariations || []).map((data: any) => validateClientData(data, assessmentId)),
    )

    const hasValidationIssues = validationResults.some((issues) => issues.length > 0)
    if (hasValidationIssues) {
      console.log("[v0] Validation issues detected, tax agent has been notified")
    }

    // 3. Analyze each client document
    const documentAnalyses = await Promise.all(
      clientDocs.blobs.slice(0, 5).map((blob) => analyzeClientDocument(blob.url, blob.pathname)),
    )

    // If no variations provided, use default single variation
    const dataVariations = clientDataVariations || [
      {
        name: "Client Name",
        hoursWorked: 2000,
        homeOfficeArea: 15,
        totalHomeArea: 150,
        businessExpenses: 5000,
      },
    ]

    const referenceDocNames = analysisReferenceDocs.map((b) => b.pathname)

    const versions = await Promise.all(
      dataVariations.slice(0, 3).map(async (dataVariation: any, index: number) => {
        const version = await generateInterimReportForClientData(
          dataVariation,
          (index + 1) as 1 | 2 | 3,
          referenceDocNames,
          documentAnalyses,
        )

        await validateCalculations(dataVariation, version.calculations, assessmentId)

        return version
      }),
    )

    console.log("[v0] Generated", versions.length, "interim report versions from client data variations")

    // 8. Store results (would save to database)
    const result = {
      assessmentId,
      versions, // Return all versions based on client's input variations
      documentAnalyses,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: result,
      validationIssues: hasValidationIssues, // Include validation status
    })
  } catch (error) {
    console.error("[v0] Strategy generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate strategy",
      },
      { status: 500 },
    )
  }
}

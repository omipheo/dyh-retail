import { NextResponse } from "next/server"
import PizZip from "pizzip"

export async function GET() {
  try {
    const templateUrl = "/templates/word_corrected.docx"

    // Fetch the template
    const response = await fetch(templateUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const zip = new PizZip(arrayBuffer)

    const content = zip.files["word/document.xml"].asText()

    // Extract all text from w:t tags
    const textMatches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || []
    const allText = textMatches
      .map((match) => {
        const textMatch = match.match(/<w:t[^>]*>([^<]*)<\/w:t>/)
        return textMatch ? textMatch[1] : ""
      })
      .join("")

    // Find potential placeholders (even broken ones)
    const placeholderPattern = /\{[^{}]*\}|\{[^{}]*$|^[^{}]*\}/g
    const placeholders = allText.match(placeholderPattern) || []
    const uniquePlaceholders = [...new Set(placeholders)].sort()

    // Extract headings
    const headingMatches = content.match(/<w:pStyle w:val="Heading[^"]*"\/>[^<]*<w:t[^>]*>([^<]+)<\/w:t>/g) || []
    const headings = headingMatches
      .map((match) => {
        const textMatch = match.match(/<w:t[^>]*>([^<]+)<\/w:t>/)
        return textMatch ? textMatch[1] : ""
      })
      .filter(Boolean)

    // Extract tables
    const tableCount = (content.match(/<w:tbl>/g) || []).length

    // Find broken placeholders (incomplete or split)
    const brokenPlaceholders = placeholders.filter((p) => !p.match(/^\{[A-Z_]+\}$/) || p.includes(" "))

    return NextResponse.json({
      success: true,
      structure: {
        totalCharacters: allText.length,
        estimatedPages: Math.ceil(allText.length / 3000),
        placeholders: uniquePlaceholders,
        placeholderCount: uniquePlaceholders.length,
        brokenPlaceholders,
        brokenPlaceholderCount: brokenPlaceholders.length,
        headings,
        headingCount: headings.length,
        tableCount,
        preview: allText.substring(0, 2000) + (allText.length > 2000 ? "\n\n... (truncated)" : ""),
      },
    })
  } catch (error: any) {
    console.error("[v0] Template extraction error:", error)
    return NextResponse.json({ error: error.message || "Failed to extract template structure" }, { status: 500 })
  }
}

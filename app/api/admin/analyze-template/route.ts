import { NextResponse } from "next/server"
import PizZip from "pizzip"

const TEMPLATE_URL = "/templates/word_corrected.docx"

export async function GET() {
  try {
    // Fetch the template
    const response = await fetch(TEMPLATE_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const zip = new PizZip(arrayBuffer)

    // Extract document.xml
    const documentXml = zip.file("word/document.xml")?.asText()
    if (!documentXml) {
      throw new Error("Could not extract document.xml from template")
    }

    // Find all placeholders using regex
    // Matches {{PLACEHOLDER}} patterns
    const placeholderRegex = /\{\{([^}]+)\}\}/g
    const matches = documentXml.matchAll(placeholderRegex)

    const placeholders = new Set<string>()
    for (const match of matches) {
      placeholders.add(match[1].trim())
    }

    // Also check for placeholders that might be split across XML tags
    // This regex finds text between {{ and }} even if interrupted by XML
    const splitRegex = /\{\{[^}]*?\}\}/g
    const contentWithoutTags = documentXml.replace(/<[^>]+>/g, "")
    const splitMatches = contentWithoutTags.matchAll(/\{\{([^}]+)\}\}/g)

    for (const match of splitMatches) {
      placeholders.add(match[1].trim())
    }

    return NextResponse.json({
      placeholders: Array.from(placeholders).sort(),
      count: placeholders.size,
    })
  } catch (error) {
    console.error("[v0] Template analysis error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Template analysis failed" },
      { status: 500 },
    )
  }
}

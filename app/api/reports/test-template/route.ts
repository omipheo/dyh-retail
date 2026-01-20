export async function GET() {
  try {
    const PizZip = (await import("pizzip")).default
    const Docxtemplater = (await import("docxtemplater")).default

    const TEMPLATE_URL = "/templates/word_corrected.docx"

    // Fetch template
    const response = await fetch(TEMPLATE_URL)
    const arrayBuffer = await response.arrayBuffer()
    const zip = new PizZip(arrayBuffer)

    // Try with absolutely minimal data
    const minimalData = {
      CLIENT_FULL_NAME: "Test Client",
      CLIENT_FIRST_NAME: "Test",
      REPORT_DATE: "2024-01-01",
    }

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    })

    doc.render(minimalData)

    return Response.json({
      success: true,
      message: "Template renders with minimal data",
      dataUsed: minimalData,
    })
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message,
        errorName: error.name,
        errorProperties: error.properties || null,
        errorStack: error.stack,
      },
      { status: 500 },
    )
  }
}

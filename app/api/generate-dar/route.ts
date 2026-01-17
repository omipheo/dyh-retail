import { type NextRequest, NextResponse } from "next/server"
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableCell,
  TableRow,
  WidthType,
  AlignmentType,
  HeadingLevel,
} from "docx"
import { createClient } from "@/lib/supabase/server"
import { RTA_NUANCES_DISCLOSURE_DAR } from "@/lib/report-sections/rta-nuances-disclosure"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = user.user_metadata?.is_admin === true

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const data = await req.json()

    const totalDeductions = data.total_deductions || 23238
    const taxRate = 0.47
    const taxSavings = Math.round(totalDeductions * taxRate)
    const withoutStrategy = data.without_strategy || 1512

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "DECISIVE ACTION REPORT",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: data.client_name || "Client Name",
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: data.business_name || "Business Type",
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "This report provides you with crucial information about your potential home business deductions. The data contained herein has been calculated based on the information you provided, and represents our analysis of your current situation compared to your optimised position.",
                }),
              ],
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: "YOUR RECOMMENDED STRATEGY",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 300 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `${data.recommended_strategy_code || "HBRS(ii)"}: ${data.recommended_strategy || "Home Business Re-Structure: Stay & Start"}`,
                  bold: true,
                  color: "008000",
                }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: data.strategy_description || "Home owner starting a business from existing purchased home",
              italics: true,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text:
                data.strategy_details ||
                "The second Home Business Re-Structure Strategy is for individuals who already own their home and want to commence a home-based business from their existing property without making any physical changes. By starting a business from your existing home, you immediately create tax deductions for the business use portion of your property. This includes a portion of loan interest, rates, insurance, repairs, utilities, and depreciation on the building's structure area.",
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: "YOUR DEDUCTIONS SUMMARY",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 300 },
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: "TOTAL ANNUAL DEDUCTIONS", bold: true })],
                      shading: { fill: "E8F5E9" },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: `$${totalDeductions.toLocaleString()}`,
                          bold: true,
                          alignment: AlignmentType.RIGHT,
                        }),
                      ],
                      shading: { fill: "E8F5E9" },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: `ESTIMATED TAX SAVINGS (at ${Math.round(taxRate * 100)}% marginal rate)`,
                          bold: true,
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: `$${taxSavings.toLocaleString()}`,
                          bold: true,
                          alignment: AlignmentType.RIGHT,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({
              text: "YOUR DEDUCTIONS COMPARISON",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 300 },
            }),

            new Paragraph({
              text: `Without Strategy: $${withoutStrategy.toLocaleString()}`,
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: `With Strategy: $${totalDeductions.toLocaleString()}`,
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: "NOW LET'S GET YOUR CREATIVE JUICES FLOWING WITH THREE SIMPLE EXAMPLE OPPORTUNITIES ON HOW YOU MIGHT WANT TO USE YOUR TAX SAVINGS TO CREATE",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 300 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "OPPORTUNITY 1: ", bold: true }),
                new TextRun({ text: "Reinvest in Your Business" }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: `Use your $${taxSavings.toLocaleString()} annual tax savings to invest in equipment, marketing, or staff to grow your business faster.`,
              spacing: { after: 300 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "OPPORTUNITY 2: ", bold: true }),
                new TextRun({ text: "Pay Down Your Mortgage" }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: `Apply your tax savings to make extra mortgage payments. Over 10 years, this could save you tens of thousands in interest.`,
              spacing: { after: 300 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "OPPORTUNITY 3: ", bold: true }),
                new TextRun({ text: "Build Your Investment Portfolio" }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: `Invest your savings in shares, property, or superannuation to build long-term wealth and financial security.`,
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: "LIMITATIONS",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 600, after: 300 },
            }),

            ...RTA_NUANCES_DISCLOSURE_DAR.split("\n\n").map(
              (paragraph) =>
                new Paragraph({
                  text: paragraph,
                  spacing: { after: 200 },
                }),
            ),

            new Paragraph({
              text: "UNLOCK YOUR DEDUCTIONS",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { before: 600, after: 400 },
            }),

            new Paragraph({
              text: "To receive your complete Final Report with detailed analysis, methodology comparison, and implementation guide, choose your package:",
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Phase 1: ", bold: true }),
                new TextRun({ text: "Upfront: $6,600 + Monthly: $660" }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Phase 2: ", bold: true }),
                new TextRun({ text: "Year 1: $3,300 + Year 2+: $1,650" }),
              ],
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: "Click below to unlock your deductions:",
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "PURCHASE NOW",
                  bold: true,
                  color: "FFFFFF",
                }),
              ],
              alignment: AlignmentType.CENTER,
              shading: { fill: "4CAF50" },
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: `Visit: ${process.env.NEXT_PUBLIC_SITE_URL || "https://v0-rename-workspace.vercel.app"}/pricing`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
          ],
        },
      ],
    })

    const buffer = await Packer.toBuffer(doc)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${data.client_name || "Client"}_DAR_${new Date().toISOString().split("T")[0]}.docx"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating DAR:", error)
    return NextResponse.json({ error: "Failed to generate DAR" }, { status: 500 })
  }
}

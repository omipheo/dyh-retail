import { Document, Paragraph, TextRun, Table, TableCell, TableRow, AlignmentType, WidthType } from "docx"
import { Packer } from "docx"

export async function GET() {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "DYH QUICK QUESTIONNAIRE",
              heading: "Heading1",
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "HOME-BASED BUSINESS TAX DEDUCTION ASSESSMENT",
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Personal Information Section
            new Paragraph({
              text: "PERSONAL INFORMATION",
              heading: "Heading2",
              spacing: { before: 300, after: 200 },
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Full Name:")] }),
                    new TableCell({ children: [new Paragraph("_______________________________")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Address:")] }),
                    new TableCell({ children: [new Paragraph("_______________________________")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Tax File Number:")] }),
                    new TableCell({ children: [new Paragraph("_______________________________")] }),
                  ],
                }),
              ],
            }),

            // Property Details Section
            new Paragraph({
              text: "PROPERTY DETAILS",
              heading: "Heading2",
              spacing: { before: 400, after: 200 },
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Total Home Size (sqm):")] }),
                    new TableCell({ children: [new Paragraph("_______________________________")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Office Size (sqm):")] }),
                    new TableCell({ children: [new Paragraph("_______________________________")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Office Hours per Week:")] }),
                    new TableCell({ children: [new Paragraph("_______________________________")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Business Type:")] }),
                    new TableCell({ children: [new Paragraph("_______________________________")] }),
                  ],
                }),
              ],
            }),

            // Property Expenses Section
            new Paragraph({
              text: "PROPERTY EXPENSES (Annual Amounts)",
              heading: "Heading2",
              spacing: { before: 400, after: 200 },
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Home Loan Interest:")] }),
                    new TableCell({ children: [new Paragraph("$ _______________________________")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Council Rates:")] }),
                    new TableCell({ children: [new Paragraph("$ _______________________________")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Water Rates:")] }),
                    new TableCell({ children: [new Paragraph("$ _______________________________")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Building Insurance:")] }),
                    new TableCell({ children: [new Paragraph("$ _______________________________")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Building Value (for depreciation):")] }),
                    new TableCell({ children: [new Paragraph("$ _______________________________")] }),
                  ],
                }),
              ],
            }),

            // Running Expenses Section
            new Paragraph({
              text: "RUNNING EXPENSES (Annual Amounts)",
              heading: "Heading2",
              spacing: { before: 400, after: 200 },
            }),

            // Internet & Phone Explainer
            new Paragraph({
              children: [
                new TextRun({
                  text: "IMPORTANT: Internet & Phone Calculation",
                  bold: true,
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: "Unlike other running expenses, internet and phone costs cannot be calculated using the floor space percentage. You must determine business use separately.",
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Instructions: ",
                  bold: true,
                }),
                new TextRun({
                  text: 'Review a typical 30-day bill and estimate what percentage is for business use. For example, if you use your phone 60% for business calls/data, enter 60% in the "Business Use %" column.',
                }),
              ],
              spacing: { after: 200 },
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: "Expense Type", bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: "Annual Cost ($)", bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: "Business Use (%)", bold: true })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Internet")] }),
                    new TableCell({ children: [new Paragraph("$ _________________")] }),
                    new TableCell({ children: [new Paragraph("_______ %")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Phone")] }),
                    new TableCell({ children: [new Paragraph("$ _________________")] }),
                    new TableCell({ children: [new Paragraph("_______ %")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Electricity")] }),
                    new TableCell({ children: [new Paragraph("$ _________________")] }),
                    new TableCell({ children: [new Paragraph("(calculated by floor space)")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Heating & Cooling")] }),
                    new TableCell({ children: [new Paragraph("$ _________________")] }),
                    new TableCell({ children: [new Paragraph("(calculated by floor space)")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Cleaning")] }),
                    new TableCell({ children: [new Paragraph("$ _________________")] }),
                    new TableCell({ children: [new Paragraph("(calculated by floor space)")] }),
                  ],
                }),
              ],
            }),

            // Strategy Selector Questions Section
            new Paragraph({
              text: "DYH STRATEGY SELECTOR - COMPLETE ASSESSMENT (36 Questions)",
              heading: "Heading2",
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "IMPORTANT: ",
                  bold: true,
                }),
                new TextRun({
                  text: "Answer YES or NO to ALL 36 questions. These responses will determine the most suitable DYH Procedure for your situation.",
                }),
              ],
              spacing: { after: 300 },
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: "Question", bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: "Answer (YES/NO)", bold: true })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q1. Do you own your home?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q2. Do you have a mortgage?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q3. Is your home loan an 'interest only' loan?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q4. Do you have a home based business?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q5. Are you a sole trader?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q6. Do you have a car loan?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q7. Do you have credit card debt?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q8. Do you have personal loans?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q9. Do you have an investment property?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q10. Do you have investment property loans?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q11. Do you have shares?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q12. Do you have a margin loan?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q13. Do you have other investments?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q14. Do you have other investment loans?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q15. Are you in a partnership?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q16. Are you a company director?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q17. Do you have a trust?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q18. Do you have a SMSF?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Q3. Do you already operate a home based business?")] }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph("Q7. Would you consider running a home based business?")],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph("Q8. Would any degree of customer presence at your home be acceptable?"),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph("Q9. Could you accept a drop in business income for an undetermined period?"),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph(
                          "Q10. Are you familiar with business overdraft, line of credit, or redraw facilities?",
                        ),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph(
                          "Q11. Would you like professional assistance with business cash flow management?",
                        ),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph("Q12. Would you like to buy a home (if you don't have one)?")],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph("Q13. Could you see yourself working indefinitely from a home based business?"),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph("Q14. Would you like to extend your home for more space as a dual use property?"),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph(
                          "Q15. Would you like to sell your current home and upgrade to a better property?",
                        ),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph(
                          "Q25. Could you invest proceeds from a business asset into a home business property?",
                        ),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph("Q27. Do you wish to legally maximise all available business tax deductions?"),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph(
                          "Q28. Are you concerned about protecting your home against aggressive litigants?",
                        ),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph("Q29. If sick/injured, could business afford to pay you for months/years?"),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph("Q30. If sick/injured, could you sustain business expenses for up to one year?"),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph("Q31. Should business pay partner a regular income during prolonged absence?"),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph(
                          "Q32. Should company afford to pay out partner's share if they died/became disabled?",
                        ),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph(
                          "Q33. Would you want all business debts extinguished on death/serious disability?",
                        ),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph("Q34. Should business repay debts to avoid creditors pursuing personal assets?"),
                      ],
                    }),
                    new TableCell({ children: [new Paragraph("_______")] }),
                  ],
                }),
              ],
            }),

            new Paragraph({
              text: "",
              spacing: { before: 400 },
            }),

            new Paragraph({
              text: "Please complete all sections and return to your tax advisor.",
              alignment: AlignmentType.CENTER,
              italics: true,
            }),
          ],
        },
      ],
    })

    const buffer = await Packer.toBuffer(doc)

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="DYH_Quick_Questionnaire_Template.docx"',
      },
    })
  } catch (error) {
    console.error("Error generating questionnaire:", error)
    return new Response(JSON.stringify({ error: "Failed to generate questionnaire" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

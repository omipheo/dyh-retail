import { NextResponse } from "next/server"
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableCell,
  TableRow,
  WidthType,
  AlignmentType,
} from "docx"

export async function GET() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            text: "HOME BASED, BUSINESS & TAXATION ADVICE",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Prepared for: ", bold: true }), new TextRun("Sarah Chen")],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: "Business: ", bold: true }), new TextRun("IT Consulting Services")],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: "Date: ", bold: true }), new TextRun(new Date().toLocaleDateString())],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Table of Contents
          new Paragraph({
            text: "TABLE OF CONTENTS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({ text: "1. Executive Summary ............................ 2" }),
          new Paragraph({ text: "2. DYH Strategy Selector Analysis ............... 3" }),
          new Paragraph({ text: "3. Property & Running Expenses .................. 5" }),
          new Paragraph({ text: "4. Tax Calculation Methods ...................... 6" }),
          new Paragraph({ text: "5. Expense Comparison Analysis .................. 7" }),
          new Paragraph({ text: "6. Recommended Strategy & Implementation ........ 8" }),
          new Paragraph({ text: "7. Hints and Tips (From Strategy Selector) ...... 9" }),
          new Paragraph({ text: "8. ATO Compliance Requirements .................. 12" }),
          new Paragraph({ text: "9. Next Steps & Action Items .................... 13" }),
          new Paragraph({ text: "10. Professional Disclaimers .................... 14", spacing: { after: 400 } }),

          // Executive Summary
          new Paragraph({
            text: "1. EXECUTIVE SUMMARY",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: 'This comprehensive report provides home-based business taxation advice based on detailed analysis of your circumstances, cross-referenced with "Deduct Your Home" (DYH) strategies and ATO Private Binding Rulings.',
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "Key Findings",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({ text: "• DYH Strategy: Lease Buster (DYH-LB)" }),
          new Paragraph({ text: "• Annual Home Office Deduction: $3,637" }),
          new Paragraph({ text: "• Estimated Tax Savings: $1,091 (at 30% tax rate)" }),
          new Paragraph({ text: "• Recommended Method: Actual Cost Method" }),
          new Paragraph({ text: "• Office Area: 18 sqm (9% of total home area)", spacing: { after: 200 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The Actual Cost Method provides $2,418 MORE in deductions annually compared to the Fixed Rate Method, and aligns perfectly with your Lease Buster strategy.",
                bold: true,
              }),
            ],
            spacing: { after: 400 },
          }),

          // DYH Strategy Selector Analysis
          new Paragraph({
            text: "2. DYH STRATEGY SELECTOR ANALYSIS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            text: "2.1 Overview",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: 'The DYH Strategy Selector is a systematic questionnaire-based tool from the "Deduct Your Home" methodology that identifies the optimal taxation strategy for your specific circumstances.',
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "2.2 Your Determined Strategy: Lease Buster (DYH-LB)",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Procedure Code: ", bold: true }), new TextRun("DYH-LB")],
          }),
          new Paragraph({
            children: [new TextRun({ text: "Full Strategy Name: ", bold: true }), new TextRun("Lease Buster")],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "2.3 Client Profile",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "You are operating a home-based business with significant occupancy costs and are looking to maximize legitimate tax deductions while maintaining full ATO compliance. You own your property outright and have a dedicated business space within your home. This ownership structure provides opportunities for optimal tax planning not available to renters.",
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "2.4 Selection Rationale",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "The Lease Buster strategy was determined based on your specific questionnaire responses:",
            spacing: { after: 100 },
          }),
          new Paragraph({ text: "• Question 2: NO - Property is owned outright, not rented or leased" }),
          new Paragraph({ text: "• Question 5: NO - Not using simplified depreciation rules for capital assets" }),
          new Paragraph({
            text: "• Question 8: NO - Home office is a dedicated business space with clear demarcation",
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "These responses indicate you have the optimal conditions for the Lease Buster approach: property ownership, capacity for detailed record-keeping, and a defined business space allowing for maximum deduction claims.",
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "2.5 Strategy Benefits",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({ text: "✓ Maximizes deductions for property ownership costs including mortgage interest" }),
          new Paragraph({ text: "✓ Captures building depreciation at 2.5% per annum on building value" }),
          new Paragraph({ text: "✓ Optimizes allocation of all occupancy-related expenses" }),
          new Paragraph({ text: "✓ Maintains full ATO compliance with detailed record-keeping" }),
          new Paragraph({ text: "✓ Provides long-term wealth building through property appreciation" }),
          new Paragraph({
            text: "✓ Offers flexibility to adjust business use percentage as needs change",
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "2.6 How This Strategy Applies to Your Situation",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "The Lease Buster strategy is specifically designed for business owners who:",
            spacing: { after: 100 },
          }),
          new Paragraph({ text: "1. Own their residential property" }),
          new Paragraph({ text: "2. Operate a home-based business with measurable space allocation" }),
          new Paragraph({ text: "3. Want to maximize legitimate tax deductions" }),
          new Paragraph({ text: "4. Are willing to maintain detailed records for ATO compliance" }),
          new Paragraph({
            text: "5. Plan to continue their business for the medium to long term",
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "Your IT consulting business operating from an 18 sqm dedicated office space in your owned property aligns perfectly with all these criteria.",
            spacing: { after: 400 },
          }),

          // Property & Running Expenses
          new Paragraph({
            text: "3. PROPERTY & RUNNING EXPENSES",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "Property Expenses (Annual)",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),

          // Property Expenses Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Expense Category", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Annual Amount", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Business Use", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Deductible", bold: true })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Home Loan Interest")] }),
                  new TableCell({ children: [new Paragraph("$24,000")] }),
                  new TableCell({ children: [new Paragraph("9%")] }),
                  new TableCell({ children: [new Paragraph("$2,160")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Council Rates")] }),
                  new TableCell({ children: [new Paragraph("$2,400")] }),
                  new TableCell({ children: [new Paragraph("9%")] }),
                  new TableCell({ children: [new Paragraph("$216")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Water Rates")] }),
                  new TableCell({ children: [new Paragraph("$800")] }),
                  new TableCell({ children: [new Paragraph("9%")] }),
                  new TableCell({ children: [new Paragraph("$72")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Building Insurance")] }),
                  new TableCell({ children: [new Paragraph("$1,200")] }),
                  new TableCell({ children: [new Paragraph("9%")] }),
                  new TableCell({ children: [new Paragraph("$108")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Building Depreciation (2.5%)")] }),
                  new TableCell({ children: [new Paragraph("$6,250")] }),
                  new TableCell({ children: [new Paragraph("9%")] }),
                  new TableCell({ children: [new Paragraph("$563")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Total Property Expenses", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "$34,650", bold: true })] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph({ text: "$3,119", bold: true })] }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),
          new Paragraph({
            text: "Running Expenses (Annual)",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),

          // Running Expenses Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Expense Category", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Annual Amount", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Business Use", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Deductible", bold: true })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Electricity")] }),
                  new TableCell({ children: [new Paragraph("$2,400")] }),
                  new TableCell({ children: [new Paragraph("9%")] }),
                  new TableCell({ children: [new Paragraph("$216")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Internet")] }),
                  new TableCell({ children: [new Paragraph("$1,200")] }),
                  new TableCell({ children: [new Paragraph("9%")] }),
                  new TableCell({ children: [new Paragraph("$108")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Phone")] }),
                  new TableCell({ children: [new Paragraph("$960")] }),
                  new TableCell({ children: [new Paragraph("9%")] }),
                  new TableCell({ children: [new Paragraph("$86")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Cleaning")] }),
                  new TableCell({ children: [new Paragraph("$1,200")] }),
                  new TableCell({ children: [new Paragraph("9%")] }),
                  new TableCell({ children: [new Paragraph("$108")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Total Running Expenses", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "$5,760", bold: true })] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph({ text: "$518", bold: true })] }),
                ],
              }),
            ],
          }),

          new Paragraph({
            children: [new TextRun({ text: "Total Annual Deduction (Actual Cost Method): $3,637", bold: true })],
            spacing: { before: 200, after: 400 },
          }),

          // Tax Calculation Methods
          new Paragraph({
            text: "4. TAX CALCULATION METHODS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "Method 1: Actual Cost Method (RECOMMENDED - Aligns with Lease Buster Strategy)",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({ text: "• Office Area: 18 sqm" }),
          new Paragraph({ text: "• Total Home Area: 200 sqm" }),
          new Paragraph({ text: "• Business Use Percentage: 9%" }),
          new Paragraph({ text: "• Property Expenses Deduction: $3,119" }),
          new Paragraph({ text: "• Running Expenses Deduction: $518" }),
          new Paragraph({
            children: [new TextRun({ text: "Total Annual Deduction: $3,637", bold: true })],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "Method 2: Fixed Rate Method (Commissioner's Allowance)",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({ text: "• Hours Worked: 35 hours/week" }),
          new Paragraph({ text: "• Annual Hours: 1,820 hours" }),
          new Paragraph({ text: "• Rate: $0.67 per hour" }),
          new Paragraph({
            children: [new TextRun({ text: "Total Annual Deduction: $1,219", bold: true })],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Difference: ", bold: true }),
              new TextRun("Actual Cost Method provides $2,418 MORE in deductions annually"),
            ],
            spacing: { after: 400 },
          }),

          // Expense Comparison Analysis
          new Paragraph({
            text: "5. EXPENSE COMPARISON ANALYSIS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "This section compares the deductions available under the Actual Cost Method and the Fixed Rate Method.",
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "Actual Cost Method vs Fixed Rate Method",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Actual Cost Method Deduction: $3,637", bold: true }),
              new TextRun({ text: " vs Fixed Rate Method Deduction: $1,219", bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Difference: ", bold: true }),
              new TextRun("$2,418 MORE in deductions annually"),
            ],
            spacing: { after: 400 },
          }),

          // Recommended Strategy & Implementation
          new Paragraph({
            text: "6. RECOMMENDED STRATEGY & IMPLEMENTATION",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "Based on the analysis, the recommended strategy is the Actual Cost Method.",
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "Implementation Steps",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({ text: "1. Maintain detailed records of all business-related expenses" }),
          new Paragraph({ text: "2. Regularly update your business use percentage as your space requirements change" }),
          new Paragraph({ text: "3. Consult with your accountant to ensure compliance with ATO regulations" }),
          new Paragraph({
            text: "4. Consider seeking legal advice on asset protection strategies",
            spacing: { after: 400 },
          }),

          // Hints and Tips (From Strategy Selector)
          new Paragraph({
            text: "7. HINTS AND TIPS (From DYH Strategy Selector)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            text: "7.1 General Advice",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• All DYH Procedures are suited to a long-term outlook, well into normal retirement years",
          }),
          new Paragraph({
            text: "• Unlike usual rental properties, there are no tenants or bad managers to make life difficult",
          }),
          new Paragraph({
            text: "• The DYH Procedures maximize all available business taxation deductions and capital depreciation allowances",
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "7.2 Insurance Considerations",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• Consider income protection insurance - generally tax-deductible and vital for self-employed individuals",
          }),
          new Paragraph({ text: "• Insure business expenses for up to one year - generally tax-deductible" }),
          new Paragraph({ text: "• Business Key-Person insurance is vital if you have a business partner" }),
          new Paragraph({
            text: "• Life, TPD and Trauma insurance for capital purposes is essential in partnerships",
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "7.3 Asset Protection",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• Property not held in company name is quarantined from legal action against the company",
          }),
          new Paragraph({ text: "• Running business in your own name exposes all personal assets to legal action" }),
          new Paragraph({
            text: "• Consult your lawyer about asset protection before committing to any structure",
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "7.4 Cash Flow Management",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({ text: "• Consider business overdrafts or lines of credit for cash-flow management" }),
          new Paragraph({ text: "• Financial planners specializing in budgeting can help with cash-flow choices" }),
          new Paragraph({
            text: "• Discuss loan accounts between company and shareholders with your accountant",
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "7.5 Superannuation",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• DYH Procedures have advantages over superannuation but don't necessarily replace it",
          }),
          new Paragraph({
            text: "• Consider re-weighting priorities between super contributions and property investment",
          }),
          new Paragraph({
            text: "• Speak to your financial planner about adjusting super contributions",
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "7.6 Compliance & Legal",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• Check local council regulations if more than 2-3 non-resident employees work at your home",
          }),
          new Paragraph({ text: "• Workers compensation insurance may apply - speak to a general insurance broker" }),
          new Paragraph({
            text: "• Ask your lawyer about the 'main residence CGT six year rule' for renting out your home",
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "7.7 Property Considerations",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({ text: "• Start looking for suitable properties now - use internet research effectively" }),
          new Paragraph({ text: "• Consider engaging a buyers agent to help find your ideal property" }),
          new Paragraph({ text: "• Check newspapers and internet to get realistic feel for property prices" }),
          new Paragraph({
            text: "• Consider the benefits of having more and better space to live in and work from",
            spacing: { after: 400 },
          }),

          // ATO Compliance Requirements
          new Paragraph({
            text: "8. ATO COMPLIANCE REQUIREMENTS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "To ensure full compliance with the Australian Tax Office (ATO), it is essential to maintain detailed records of all business-related expenses and adhere to the specified requirements.",
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "Key Compliance Requirements",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({ text: "• Keep accurate records of all business-related expenses" }),
          new Paragraph({
            text: "• Ensure your business space is clearly demarcated and used exclusively for business purposes",
          }),
          new Paragraph({ text: "• Regularly review and update your business use percentage" }),
          new Paragraph({
            text: "• Consult with your accountant to stay informed about any changes in ATO regulations",
            spacing: { after: 400 },
          }),

          // Next Steps & Action Items
          new Paragraph({
            text: "9. NEXT STEPS & ACTION ITEMS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "Based on the Lease Buster strategy, the following steps should be taken:",
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "Action Items",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({ text: "1. Begin maintaining detailed records of all business-related expenses" }),
          new Paragraph({ text: "2. Consult with your accountant to implement the Actual Cost Method" }),
          new Paragraph({ text: "3. Seek legal advice on asset protection strategies" }),
          new Paragraph({ text: "4. Consider insurance options for business and personal protection" }),
          new Paragraph({
            text: "5. Regularly review and update your business use percentage",
            spacing: { after: 400 },
          }),

          // Disclaimer
          new Paragraph({
            text: "10. PROFESSIONAL DISCLAIMERS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: `This report has been prepared based on information provided and current taxation legislation as at ${new Date().toLocaleDateString()}. Tax laws and ATO interpretations may change. Please consult with your tax advisor before implementing any strategies outlined in this report.`,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "This advice is based on the DYH Strategy Selector methodology and your specific responses to the questionnaire. Individual circumstances vary, and professional advice should be sought before making significant financial or business structure decisions.",
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Prepared by: ", bold: true }), new TextRun("Set Up For Life")],
          }),
          new Paragraph({
            children: [new TextRun({ text: "Contact: ", bold: true }), new TextRun("frank@setupforlife.com.au")],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Report Date: ", bold: true }),
              new TextRun(new Date().toLocaleDateString()),
            ],
          }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": 'attachment; filename="HOME_BASED_BUSINESS_TAXATION_ADVICE.docx"',
    },
  })
}

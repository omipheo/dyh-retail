import { generateText } from "ai"

export interface InterimReportData {
  assessmentId: string
  clientName: string
  strategy: string
  calculations: {
    fixedRate: { total: number; hours: number }
    actualCost: { total: number; details: any }
    recommended: string
  }
  documentAnalysis: any[]
  recommendations: string[]
}

export async function generateFinalClientReport(
  interimReportData: InterimReportData,
  templateContent?: string,
): Promise<string> {
  // Extract key data from interim report
  const { clientName, strategy, calculations, recommendations } = interimReportData

  const hintsAndTips = {
    general: [
      "All the DYH Procedures are suited to a long-term outlook, well into normal retirement years",
      "Unlike usual rental properties, there are no tenants or bad managers to make life difficult as you'll live in the property and look after it",
      "The DYH Procedures are designed to legally maximise all available business taxation deductions and business capital depreciation allowances in ways like no other",
    ],
    insurance: [
      "If you intend to be fully self-employed, you should seriously consider insuring your income as you will effectively not have any sick leave (even if employed by your own company). Generally, it's tax-deductible and it's vital to all, especially those in the COWB Procedure",
      "Consider insuring your business expenses for up to one year. Generally, it's tax-deductible",
      "Business Key-Person insurance is vital if you have a business partner - it allows the business to pay either of you a regular personal income during a prolonged absence due to sickness or injury",
      "Life, TPD and Trauma insurance for capital purposes is essential in partnerships - gross up the sums insured to account for the tax payable on any received claim proceeds",
    ],
    assetProtection: [
      "Any portion of the property not held in the name of your current or intended company, plus any related company debt not guaranteed by another person, is thereby quarantined from any legal action against the company or its employees",
      "If you run your business in your own name, all your personal assets are exposed to legal action",
    ],
    cashFlow: [
      "A finance broker can help with business overdrafts, lines of credit, or redraw facilities to manage periods of poor or zero business cash-flow",
      "Financial planners who specialise in budgeting can help you take the emotion out of your budgetary and cash-flow choices",
      "Your accountant can speak to you about how a loan account between the company and yourself (as shareholder) might be of benefit from time to time",
    ],
    superannuation: [
      "The DYH Procedures have many key advantages over superannuation, but this does not necessarily mean you should stop your current super arrangements",
      "For some, a re-weighting of priorities may entail reducing superannuation contributions to assist in meeting higher loan repayments for a property capable of excellent long-term growth",
      "Speak to your financial planner to confirm any penalties or alternatives associated with adjusting your super contributions",
    ],
    compliance: [
      "Consult your lawyer about asset protection considerations before committing to any of the Procedures",
      "Check with local council if more than two or three non-resident employees will work at your home - they may have restrictions",
      "Workers compensation insurance obligations may apply depending on whether you engage employees or contractors - speak to a general insurance broker",
      "Ask your lawyer about the 'main residence CGT six year rule' which allows you to rent out your home for up to six years without incurring a CGT liability",
    ],
    sbrb: [
      "The SBRB allows you to park funds from the sale of active assets for up to two years before using them to acquire a replacement active asset",
      "You could immediately replace the active asset with a property to live in and work from, and rent it out for up to two years while taking a break",
      "Your company could employ an office manager to run your business from the property in your absence",
      "Move into the property for at least a short time first - otherwise you can't claim it was ever your home for CGT purposes",
    ],
    property: [
      "Start looking for suitable properties now - the internet is a fine place to get a great idea of what's available",
      "Consider engaging a buyers agent to help find your ideal property",
      "Check newspapers and the internet to get a realistic feel for property prices before making decisions",
      "Consider the benefits of having more and better space to live in and work from",
    ],
  }

  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt: `You are a professional tax advisor creating a final client report titled "HOME BASED, BUSINESS & TAXATION ADVICE".

${templateContent ? `Use this uploaded template structure and populate it with the data below:\n${templateContent}\n\n` : "Create a professional report with the following sections and INDEX:\n\nTABLE OF CONTENTS (INDEX)\n1. Executive Summary\n2. Client Situation Overview\n3. Recommended Tax Strategy\n4. Deduction Calculations\n5. Expense Comparison Analysis\n6. ATO Compliance Requirements\n7. Hints and Tips\n8. Action Items & Next Steps\n9. Professional Disclaimers\n\n"}

POPULATE THE TEMPLATE WITH THIS DATA:

CLIENT: ${clientName}

RECOMMENDED STRATEGY:
${strategy}

TAX CALCULATIONS:
- Fixed Rate Method: $${calculations.fixedRate.total.toFixed(2)} (${calculations.fixedRate.hours} hours)
- Actual Cost Method: $${calculations.actualCost.total.toFixed(2)}
- Recommended: ${calculations.recommended}

KEY RECOMMENDATIONS:
${recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

HINTS AND TIPS (From DYH Strategy Selector):

General Advice:
${hintsAndTips.general.map((tip, i) => `• ${tip}`).join("\n")}

Insurance Considerations:
${hintsAndTips.insurance.map((tip, i) => `• ${tip}`).join("\n")}

Asset Protection:
${hintsAndTips.assetProtection.map((tip, i) => `• ${tip}`).join("\n")}

Cash Flow Management:
${hintsAndTips.cashFlow.map((tip, i) => `• ${tip}`).join("\n")}

Superannuation Considerations:
${hintsAndTips.superannuation.map((tip, i) => `• ${tip}`).join("\n")}

Compliance & Legal:
${hintsAndTips.compliance.map((tip, i) => `• ${tip}`).join("\n")}

${strategy.includes("SBRB") ? `\nSBRB Specific Tips:\n${hintsAndTips.sbrb.map((tip, i) => `• ${tip}`).join("\n")}\n` : ""}

Property Considerations:
${hintsAndTips.property.map((tip, i) => `• ${tip}`).join("\n")}

INSTRUCTIONS:
1. Create a comprehensive TABLE OF CONTENTS (INDEX) at the beginning with page references
2. Add a new section called "7. HINTS AND TIPS" that incorporates all the guidance above
3. Organize the hints and tips by category with clear subheadings
4. If a template was provided, integrate the Hints and Tips section while maintaining the template structure
5. Use professional tax advisory language appropriate for client delivery
6. Explain the recommended tax strategy in clear, accessible terms
7. Detail all applicable deductions with calculations shown
8. Include specific compliance requirements from ATO guidance
9. Provide actionable next steps with timelines
10. Include standard professional disclaimers about tax advice
11. Format as a complete, polished client-ready document
12. Reference the DYH (Deduct Your Home) methodology where applicable
13. Ensure all figures are accurate and clearly presented
14. Make the Hints and Tips section practical and actionable for the client

This is the FINAL client deliverable - make it comprehensive and professional.`,
  })

  return text
}

export async function extractDataFromInterimReport(interimReportContent: string): Promise<Partial<InterimReportData>> {
  // Parse the interim report to extract structured data
  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt: `Extract structured data from this interim tax report:

${interimReportContent}

Return a JSON object with:
- clientName: string
- strategy: string (the recommended strategy)
- recommendedMethod: string (Fixed Rate or Actual Cost)
- totalDeduction: number
- keyRecommendations: string[] (array of recommendations)
- nextSteps: string[]

Extract only factual information from the report.`,
  })

  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

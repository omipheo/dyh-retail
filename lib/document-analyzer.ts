import { generateObject, generateText } from "ai"

export interface DocumentAnalysis {
  documentType: string
  keyFindings: string[]
  extractedData: Record<string, any>
  relevantSections: string[]
  confidence: number
}

export interface StrategyRecommendation {
  recommendedMethod: "fixed_rate" | "actual_cost"
  reasoning: string
  eligibilityCriteria: string[]
  potentialDeduction: number
  riskFactors: string[]
  atoCompliance: string[]
  nextSteps: string[]
}

export interface InterimReportVersion {
  versionNumber: 1 | 2 | 3
  scenarioLabel: string // Renamed from scenarioName to scenarioLabel for clarity
  strategy: StrategyRecommendation
  calculations: any
  report: string
  generatedAt: string
  clientInputVariation?: any // Added to track which client data variation this is based on
}

export async function analyzeClientDocument(documentUrl: string, documentType: string): Promise<DocumentAnalysis> {
  // Use AI to analyze client documents
  const { object } = await generateObject({
    model: "openai/gpt-4o",
    prompt: `Analyze this ${documentType} document for home office tax deduction purposes. 
    Extract key information such as:
    - Work hours and patterns
    - Home office space details
    - Business expenses
    - Income information
    - Property details
    
    Document URL: ${documentUrl}`,
    schema: {
      type: "object",
      properties: {
        documentType: { type: "string" },
        keyFindings: { type: "array", items: { type: "string" } },
        extractedData: { type: "object" },
        relevantSections: { type: "array", items: { type: "string" } },
        confidence: { type: "number" },
      },
      required: ["documentType", "keyFindings", "extractedData", "confidence"],
    },
  })

  return object as DocumentAnalysis
}

export async function generateStrategy(
  clientData: any,
  referenceDocuments: string[],
  clientDocumentAnalysis: DocumentAnalysis[],
): Promise<StrategyRecommendation> {
  const prompt = `You are a tax strategy expert specializing in Australian home office deductions.
  
Reference Documents Available:
${referenceDocuments.map((doc) => `- ${doc}`).join("\n")}

Client Information:
${JSON.stringify(clientData, null, 2)}

Client Document Analysis:
${JSON.stringify(clientDocumentAnalysis, null, 2)}

Based on the "Deduct Your Home" (DYH) methodology and ATO Private Binding Rulings (PBRs), analyze this client's situation and recommend the optimal tax strategy for maximizing their home office deductions while maintaining ATO compliance.

Consider:
1. Fixed rate method vs Actual cost method
2. Eligibility criteria from ATO guidelines
3. Documentation requirements
4. Risk factors and compliance issues
5. Potential deduction amounts
6. Next steps for implementation`

  const { object } = await generateObject({
    model: "openai/gpt-4o",
    prompt,
    schema: {
      type: "object",
      properties: {
        recommendedMethod: { type: "string", enum: ["fixed_rate", "actual_cost"] },
        reasoning: { type: "string" },
        eligibilityCriteria: { type: "array", items: { type: "string" } },
        potentialDeduction: { type: "number" },
        riskFactors: { type: "array", items: { type: "string" } },
        atoCompliance: { type: "array", items: { type: "string" } },
        nextSteps: { type: "array", items: { type: "string" } },
      },
      required: ["recommendedMethod", "reasoning", "potentialDeduction"],
    },
  })

  return object as StrategyRecommendation
}

export async function generateInterimReportForClientData(
  clientDataVariation: any,
  versionNumber: 1 | 2 | 3,
  referenceDocuments: string[],
  clientDocumentAnalysis: DocumentAnalysis[],
): Promise<InterimReportVersion> {
  const prompt = `You are a tax strategy expert specializing in Australian home office deductions.

Reference Documents Available:
${referenceDocuments.map((doc) => `- ${doc}`).join("\n")}

Client Information (Scenario ${versionNumber}):
${JSON.stringify(clientDataVariation, null, 2)}

Client Document Analysis:
${JSON.stringify(clientDocumentAnalysis, null, 2)}

Based on the "Deduct Your Home" (DYH) methodology and ATO Private Binding Rulings (PBRs), analyze this specific client data variation and recommend the optimal tax strategy.

Consider:
1. Fixed rate method vs Actual cost method
2. Eligibility criteria from ATO guidelines
3. Documentation requirements
4. Risk factors and compliance issues
5. Potential deduction amounts
6. Next steps for implementation`

  const { object } = await generateObject({
    model: "openai/gpt-4o",
    prompt,
    schema: {
      type: "object",
      properties: {
        recommendedMethod: { type: "string", enum: ["fixed_rate", "actual_cost"] },
        reasoning: { type: "string" },
        eligibilityCriteria: { type: "array", items: { type: "string" } },
        potentialDeduction: { type: "number" },
        riskFactors: { type: "array", items: { type: "string" } },
        atoCompliance: { type: "array", items: { type: "string" } },
        nextSteps: { type: "array", items: { type: "string" } },
      },
      required: ["recommendedMethod", "reasoning", "potentialDeduction"],
    },
  })

  const strategy = object as StrategyRecommendation
  const calculations = calculateDeductions(clientDataVariation, strategy)
  const report = await generateInterimReport(clientDataVariation, strategy, calculations, `Scenario ${versionNumber}`)

  return {
    versionNumber,
    scenarioLabel: `Scenario ${versionNumber}`, // Neutral labeling
    strategy,
    calculations,
    report,
    generatedAt: new Date().toISOString(),
    clientInputVariation: clientDataVariation, // Track what client inputs were used
  }
}

function calculateDeductions(clientData: any, strategy: StrategyRecommendation): any {
  // Import calculator if needed
  // This is a simplified version - integrate with your calculator
  const method = strategy.recommendedMethod

  if (method === "fixed_rate") {
    return {
      method: "Fixed Rate",
      hoursWorked: clientData.hoursWorked || 2000,
      ratePerHour: 0.67,
      totalDeduction: (clientData.hoursWorked || 2000) * 0.67,
    }
  } else {
    const percentage = (clientData.homeOfficeArea || 15) / (clientData.totalHomeArea || 150)
    return {
      method: "Actual Cost",
      homeOfficePercentage: percentage * 100,
      totalExpenses: clientData.businessExpenses || 5000,
      totalDeduction: (clientData.businessExpenses || 5000) * percentage,
    }
  }
}

export async function generateInterimReport(
  clientData: any,
  strategy: StrategyRecommendation,
  calculations: any,
  scenarioLabel?: string, // Renamed parameter
): Promise<string> {
  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt: `Generate a professional, client-friendly interim report for home office tax deductions.

${scenarioLabel ? `SCENARIO: ${scenarioLabel}\n` : ""}
Client Data: ${JSON.stringify(clientData, null, 2)}
Strategy: ${JSON.stringify(strategy, null, 2)}
Calculations: ${JSON.stringify(calculations, null, 2)}

The report should:
1. Be professional but accessible
2. ${scenarioLabel ? `Clearly state this is "${scenarioLabel}" based on the client's input data` : ""}
3. Explain the recommended strategy clearly
4. Show calculation breakdown
5. Highlight compliance requirements
6. Provide clear next steps
7. Reference DYH methodology and ATO guidance
8. Be formatted in markdown

Keep it concise (2-3 pages) as this is an interim report.`,
  })

  return text
}

export function compareExpenseDeductions(clientData: any): {
  propertyExpenses: any
  runningExpenses: any
  recommendation: string
  totalDeductionActual: number
  totalDeductionFixed: number
} {
  // Calculate office percentage
  const officePercentage = Number.parseFloat(clientData.office_size_sqm) / Number.parseFloat(clientData.home_size_sqm)

  // Calculate building depreciation at 2.5% p.a.
  const buildingDepreciation = Number.parseFloat(clientData.building_value || "0") * 0.025

  // Property expenses - actual costs
  const propertyExpensesActual = {
    homeLoanInterest: Number.parseFloat(clientData.home_loan_interest_annual || "0"),
    councilRates: Number.parseFloat(clientData.council_rates_annual || "0"),
    waterRates: Number.parseFloat(clientData.water_rates_annual || "0"),
    buildingInsurance: Number.parseFloat(clientData.building_insurance_annual || "0"),
    buildingDepreciation: buildingDepreciation,
  }

  const totalPropertyExpenses = Object.values(propertyExpensesActual).reduce((sum, val) => sum + val, 0)
  const propertyDeductionActual = totalPropertyExpenses * officePercentage

  // Running expenses - actual costs
  const runningExpensesActual = {
    internet: Number.parseFloat(clientData.internet_annual || "0"),
    phone: Number.parseFloat(clientData.phone_annual || "0"),
    electricity: Number.parseFloat(clientData.electricity_annual || "0"),
    heatingCooling: Number.parseFloat(clientData.heating_cooling_annual || "0"),
    cleaning: Number.parseFloat(clientData.cleaning_annual || "0"),
  }

  const totalRunningExpenses = Object.values(runningExpensesActual).reduce((sum, val) => sum + val, 0)
  const runningDeductionActual = totalRunningExpenses * officePercentage

  // Fixed rate method (Commissioner's allowance)
  const hoursPerYear = Number.parseFloat(clientData.office_hours_per_week || "0") * 52
  const fixedRateDeduction = hoursPerYear * 0.67 // ATO fixed rate

  // Total deductions
  const totalActualDeduction = propertyDeductionActual + runningDeductionActual
  const totalFixedDeduction = fixedRateDeduction

  // Compare and determine most favorable
  const mostFavorable = totalActualDeduction > totalFixedDeduction ? "Actual Cost" : "Fixed Rate"

  // Item by item comparison for running expenses
  const runningExpensesComparison = Object.entries(runningExpensesActual).map(([key, actualValue]) => {
    const actualDeduction = actualValue * officePercentage
    // Fixed rate covers all running expenses proportionally
    const fixedRateAllocated = (actualValue / totalRunningExpenses) * fixedRateDeduction
    return {
      expense: key,
      actualCost: actualValue,
      actualDeduction: actualDeduction,
      fixedRateAllocated: fixedRateAllocated,
      mostFavorable: actualDeduction > fixedRateAllocated ? "Actual" : "Fixed Rate",
      difference: Math.abs(actualDeduction - fixedRateAllocated),
    }
  })

  return {
    propertyExpenses: {
      items: propertyExpensesActual,
      total: totalPropertyExpenses,
      deduction: propertyDeductionActual,
      officePercentage: officePercentage * 100,
      note: "Property expenses can only be claimed using actual cost method with apportionment",
    },
    runningExpenses: {
      items: runningExpensesActual,
      total: totalRunningExpenses,
      deductionActual: runningDeductionActual,
      deductionFixed: fixedRateDeduction,
      comparison: runningExpensesComparison,
      mostFavorable: runningDeductionActual > fixedRateDeduction ? "Actual Cost" : "Fixed Rate",
    },
    recommendation: mostFavorable,
    totalDeductionActual: totalActualDeduction,
    totalDeductionFixed: totalFixedDeduction,
  }
}

// Tax Deduction Calculator with Decision Tree Logic

export interface CalculatorInputs {
  // Home details
  homeSize: number // sqm
  officeSize: number // sqm
  
  // Usage details
  hoursPerWeek: number
  weeksPerYear?: number // default 52
  
  // Employment details
  employmentStatus: 'employee' | 'self_employed' | 'contractor'
  businessType?: string
  
  // Annual expenses
  internetAnnual: number
  phoneAnnual: number
  electricityAnnual: number
  heatingCoolingAnnual: number
  cleaningAnnual: number
  rentMortgageAnnual?: number
  insuranceAnnual?: number
  ratesAnnual?: number
  
  // Optional depreciation
  furnitureValue?: number
  equipmentValue?: number
}

export interface CalculationResult {
  // Fixed rate method
  fixedRateDeduction: number
  fixedRateDetails: {
    hourlyRate: number
    hoursPerYear: number
    totalDeduction: number
  }
  
  // Actual cost method
  actualCostDeduction: number
  actualCostDetails: {
    officePercentage: number
    runningExpenses: number
    occupancyCosts: number
    depreciationCosts: number
    totalDeduction: number
    breakdown: {
      internet: number
      phone: number
      electricity: number
      heatingCooling: number
      cleaning: number
      rentMortgage: number
      insurance: number
      rates: number
      furniture: number
      equipment: number
    }
  }
  
  // Recommendation
  recommendedMethod: 'fixed_rate' | 'actual_cost'
  recommendedDeduction: number
  savings: number
  
  // Eligibility checks
  eligibility: {
    meetsMinimumHours: boolean
    hasDedicatedSpace: boolean
    isEligible: boolean
    warnings: string[]
  }
}

const FIXED_RATE_PER_HOUR = 0.67 // ATO rate for 2024
const MIN_HOURS_PER_WEEK = 8 // Minimum to claim fixed rate
const FURNITURE_DEPRECIATION_RATE = 0.125 // 12.5% per year (8 years)
const EQUIPMENT_DEPRECIATION_RATE = 0.20 // 20% per year (5 years)

export function calculateDeductions(inputs: CalculatorInputs): CalculationResult {
  const weeksPerYear = inputs.weeksPerYear || 52
  const hoursPerYear = inputs.hoursPerWeek * weeksPerYear
  const officePercentage = inputs.officeSize / inputs.homeSize
  
  // Eligibility checks
  const meetsMinimumHours = inputs.hoursPerWeek >= MIN_HOURS_PER_WEEK
  const hasDedicatedSpace = inputs.officeSize > 0 && officePercentage > 0
  const warnings: string[] = []
  
  if (!meetsMinimumHours) {
    warnings.push(`You need to work at least ${MIN_HOURS_PER_WEEK} hours per week to use the fixed rate method`)
  }
  
  if (!hasDedicatedSpace) {
    warnings.push('You need a dedicated space for home business deductions')
  }
  
  if (officePercentage > 0.5) {
    warnings.push('Office space exceeds 50% of home - may require additional ATO scrutiny')
  }
  
  // Fixed Rate Method Calculation
  const fixedRateDeduction = meetsMinimumHours ? FIXED_RATE_PER_HOUR * hoursPerYear : 0
  
  // Actual Cost Method Calculation
  const runningExpenses = 
    inputs.internetAnnual +
    inputs.phoneAnnual +
    inputs.electricityAnnual +
    inputs.heatingCoolingAnnual +
    inputs.cleaningAnnual
  
  const occupancyCosts =
    (inputs.rentMortgageAnnual || 0) +
    (inputs.insuranceAnnual || 0) +
    (inputs.ratesAnnual || 0)
  
  const furnitureDepreciation = (inputs.furnitureValue || 0) * FURNITURE_DEPRECIATION_RATE
  const equipmentDepreciation = (inputs.equipmentValue || 0) * EQUIPMENT_DEPRECIATION_RATE
  const depreciationCosts = furnitureDepreciation + equipmentDepreciation
  
  // Apply office percentage
  const actualCostDeduction = 
    (runningExpenses * officePercentage) +
    (occupancyCosts * officePercentage) +
    depreciationCosts
  
  // Breakdown
  const breakdown = {
    internet: inputs.internetAnnual * officePercentage,
    phone: inputs.phoneAnnual * officePercentage,
    electricity: inputs.electricityAnnual * officePercentage,
    heatingCooling: inputs.heatingCoolingAnnual * officePercentage,
    cleaning: inputs.cleaningAnnual * officePercentage,
    rentMortgage: (inputs.rentMortgageAnnual || 0) * officePercentage,
    insurance: (inputs.insuranceAnnual || 0) * officePercentage,
    rates: (inputs.ratesAnnual || 0) * officePercentage,
    furniture: furnitureDepreciation,
    equipment: equipmentDepreciation,
  }
  
  // Determine recommendation
  const recommendedMethod = actualCostDeduction > fixedRateDeduction ? 'actual_cost' : 'fixed_rate'
  const recommendedDeduction = Math.max(actualCostDeduction, fixedRateDeduction)
  const savings = Math.abs(actualCostDeduction - fixedRateDeduction)
  
  return {
    fixedRateDeduction: Math.round(fixedRateDeduction * 100) / 100,
    fixedRateDetails: {
      hourlyRate: FIXED_RATE_PER_HOUR,
      hoursPerYear,
      totalDeduction: Math.round(fixedRateDeduction * 100) / 100,
    },
    actualCostDeduction: Math.round(actualCostDeduction * 100) / 100,
    actualCostDetails: {
      officePercentage: Math.round(officePercentage * 10000) / 100,
      runningExpenses: Math.round(runningExpenses * 100) / 100,
      occupancyCosts: Math.round(occupancyCosts * 100) / 100,
      depreciationCosts: Math.round(depreciationCosts * 100) / 100,
      totalDeduction: Math.round(actualCostDeduction * 100) / 100,
      breakdown,
    },
    recommendedMethod,
    recommendedDeduction: Math.round(recommendedDeduction * 100) / 100,
    savings: Math.round(savings * 100) / 100,
    eligibility: {
      meetsMinimumHours,
      hasDedicatedSpace,
      isEligible: meetsMinimumHours && hasDedicatedSpace,
      warnings,
    },
  }
}

// Decision tree for scenario selection
export function determineScenario(inputs: CalculatorInputs): string {
  const result = calculateDeductions(inputs)
  
  if (!result.eligibility.isEligible) {
    return 'not_eligible'
  }
  
  // Decision tree logic
  if (result.recommendedMethod === 'fixed_rate') {
    if (inputs.hoursPerWeek >= 40) {
      return 'full_time_fixed_rate'
    } else if (inputs.hoursPerWeek >= 20) {
      return 'part_time_fixed_rate'
    } else {
      return 'casual_fixed_rate'
    }
  } else {
    if (inputs.officeSize / inputs.homeSize > 0.2) {
      return 'large_office_actual_cost'
    } else if (inputs.rentMortgageAnnual && inputs.rentMortgageAnnual > 0) {
      return 'renter_actual_cost'
    } else {
      return 'homeowner_actual_cost'
    }
  }
}

// Generate ATO-compliant summary
export function generateATOSummary(inputs: CalculatorInputs, result: CalculationResult): string {
  const scenario = determineScenario(inputs)
  
  let summary = `HOME BUSINESS WEALTH OPTIMISATION CALCULATION\n\n`
  summary += `Method: ${result.recommendedMethod === 'fixed_rate' ? 'Fixed Rate' : 'Actual Cost'}\n`
  summary += `Scenario: ${scenario.replace(/_/g, ' ').toUpperCase()}\n\n`
  
  summary += `HOME DETAILS:\n`
  summary += `Total home size: ${inputs.homeSize} sqm\n`
  summary += `Office size: ${inputs.officeSize} sqm\n`
  summary += `Office percentage: ${result.actualCostDetails.officePercentage}%\n\n`
  
  summary += `USAGE:\n`
  summary += `Hours per week: ${inputs.hoursPerWeek}\n`
  summary += `Hours per year: ${result.fixedRateDetails.hoursPerYear}\n\n`
  
  if (result.recommendedMethod === 'fixed_rate') {
    summary += `FIXED RATE METHOD:\n`
    summary += `Rate: $${result.fixedRateDetails.hourlyRate} per hour\n`
    summary += `Total deduction: $${result.fixedRateDetails.totalDeduction}\n\n`
  } else {
    summary += `ACTUAL COST METHOD:\n`
    summary += `Running expenses: $${result.actualCostDetails.runningExpenses}\n`
    summary += `Occupancy costs: $${result.actualCostDetails.occupancyCosts}\n`
    summary += `Depreciation: $${result.actualCostDetails.depreciationCosts}\n`
    summary += `Total deduction: $${result.actualCostDetails.totalDeduction}\n\n`
    
    summary += `BREAKDOWN:\n`
    Object.entries(result.actualCostDetails.breakdown).forEach(([key, value]) => {
      if (value > 0) {
        summary += `${key.replace(/([A-Z])/g, ' $1').trim()}: $${value.toFixed(2)}\n`
      }
    })
  }
  
  summary += `\nRECOMMENDED ANNUAL DEDUCTION: $${result.recommendedDeduction}\n`
  
  if (result.eligibility.warnings.length > 0) {
    summary += `\nWARNINGS:\n`
    result.eligibility.warnings.forEach(warning => {
      summary += `- ${warning}\n`
    })
  }
  
  return summary
}

/**
 * Australian Resident Tax Rates 2025-26
 * Tax Calculator Wizard for calculating net benefits after tax and fees
 */

export interface TaxBracket {
  min: number
  max: number | null
  baseAmount: number
  rate: number
  threshold: number
}

// Australian resident tax rates 2025-26
export const TAX_BRACKETS_2025_26: TaxBracket[] = [
  { min: 0, max: 18200, baseAmount: 0, rate: 0, threshold: 0 },
  { min: 18201, max: 45000, baseAmount: 0, rate: 0.16, threshold: 18200 },
  { min: 45001, max: 135000, baseAmount: 4288, rate: 0.3, threshold: 45000 },
  { min: 135001, max: 190000, baseAmount: 31288, rate: 0.37, threshold: 135000 },
  { min: 190001, max: null, baseAmount: 51638, rate: 0.45, threshold: 190000 },
]

export const MEDICARE_LEVY_RATE = 0.02 // 2%

// Tax Agent Fee Structure (from products.ts)
export const TAX_AGENT_FEES = {
  phase1Upfront: 6600, // Phase 1 upfront
  phase1Monthly: 660, // Phase 1 monthly for 12 periods
  phase2Monthly: 220, // Phase 2 monthly for first 12 periods
  phase2MonthlyAfter: 550, // Phase 2 monthly after 12 periods
  totalFirstYearPhase1: 6600 + 660 * 12, // $14,520
  totalFirstYearBoth: 6600 + 660 * 12 + 220 * 12, // $17,160
}

/**
 * Calculate income tax based on 2025-26 tax brackets
 */
export function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0

  let tax = 0

  for (const bracket of TAX_BRACKETS_2025_26) {
    if (taxableIncome > bracket.min - 1) {
      if (bracket.max === null || taxableIncome <= bracket.max) {
        // Income falls in this bracket
        tax = bracket.baseAmount + (taxableIncome - bracket.threshold) * bracket.rate
        break
      }
    }
  }

  return tax
}

/**
 * Calculate Medicare levy (2% of taxable income)
 */
export function calculateMedicareLevy(taxableIncome: number): number {
  return taxableIncome * MEDICARE_LEVY_RATE
}

/**
 * Calculate total tax including Medicare levy
 */
export function calculateTotalTax(taxableIncome: number): number {
  const incomeTax = calculateIncomeTax(taxableIncome)
  const medicareLevy = calculateMedicareLevy(taxableIncome)
  return incomeTax + medicareLevy
}

/**
 * Calculate marginal tax rate (including Medicare levy)
 */
export function calculateMarginalTaxRate(taxableIncome: number): number {
  for (let i = TAX_BRACKETS_2025_26.length - 1; i >= 0; i--) {
    const bracket = TAX_BRACKETS_2025_26[i]
    if (taxableIncome >= bracket.min) {
      return bracket.rate + MEDICARE_LEVY_RATE
    }
  }
  return MEDICARE_LEVY_RATE // Only Medicare levy if below tax-free threshold
}

/**
 * Calculate tax savings from a deduction
 */
export function calculateTaxSavings(deductionAmount: number, taxableIncome: number): number {
  const marginalRate = calculateMarginalTaxRate(taxableIncome)
  return deductionAmount * marginalRate
}

/**
 * Calculate net benefit after tax and agent fees
 * This shows the TRUE upside to the client after all costs
 */
export function calculateNetBenefit(
  deductionAmount: number,
  taxableIncome: number,
  includePhase2 = false,
): {
  grossDeduction: number
  taxSavings: number
  agentFees: number
  netBenefit: number
  marginalTaxRate: number
  breakEvenInYears: number
} {
  const grossDeduction = deductionAmount
  const taxSavings = calculateTaxSavings(deductionAmount, taxableIncome)
  const marginalTaxRate = calculateMarginalTaxRate(taxableIncome)

  // Calculate first year agent fees
  const agentFees = includePhase2 ? TAX_AGENT_FEES.totalFirstYearBoth : TAX_AGENT_FEES.totalFirstYearPhase1

  // Net benefit is tax savings minus agent fees
  const netBenefit = taxSavings - agentFees

  // Calculate break-even period (when cumulative tax savings exceed fees)
  const breakEvenInYears = agentFees / taxSavings

  return {
    grossDeduction,
    taxSavings,
    agentFees,
    netBenefit,
    marginalTaxRate,
    breakEvenInYears,
  }
}

/**
 * Calculate mortgage acceleration benefit NET OF FEES
 */
export function calculateMortgageAccelerationNetBenefit(
  annualTaxSavings: number,
  mortgageBalance: number,
  interestRate: number,
  agentFees: number,
): {
  netAnnualPayment: number
  yearsReduced: number
  interestSaved: number
  netInterestSaved: number
} {
  // Net annual payment after agent fees
  const netAnnualPayment = Math.max(0, annualTaxSavings - agentFees)

  // Calculate mortgage payoff with and without extra payments
  const monthlyRate = interestRate / 12
  const standardMonthlyPayment = (mortgageBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -360)) // 30-year mortgage

  // Calculate years saved with extra annual payment
  let remainingBalance = mortgageBalance
  let monthsWithExtra = 0
  const monthlyExtraPayment = netAnnualPayment / 12

  while (remainingBalance > 0 && monthsWithExtra < 360) {
    const interestCharge = remainingBalance * monthlyRate
    const principalPayment = standardMonthlyPayment + monthlyExtraPayment - interestCharge
    remainingBalance -= principalPayment
    monthsWithExtra++
  }

  const yearsReduced = Math.max(0, (360 - monthsWithExtra) / 12)

  // Calculate interest saved
  const totalInterestStandard = standardMonthlyPayment * 360 - mortgageBalance
  const totalInterestWithExtra =
    standardMonthlyPayment * monthsWithExtra + monthlyExtraPayment * monthsWithExtra - mortgageBalance
  const interestSaved = Math.max(0, totalInterestStandard - totalInterestWithExtra)

  // Net interest saved after accounting for fees over the period
  const totalFeesOverPeriod = agentFees * (monthsWithExtra / 12)
  const netInterestSaved = Math.max(0, interestSaved - totalFeesOverPeriod)

  return {
    netAnnualPayment,
    yearsReduced: Math.round(yearsReduced * 10) / 10,
    interestSaved: Math.round(interestSaved),
    netInterestSaved: Math.round(netInterestSaved),
  }
}

/**
 * Calculate superannuation boost NET OF FEES
 */
export function calculateSuperBoostNetBenefit(
  annualTaxSavings: number,
  currentAge: number,
  retirementAge: number,
  returnRate: number,
  taxRate: number,
  agentFees: number,
): {
  netAnnualContribution: number
  yearsToRetirement: number
  totalAccumulated: number
  netAccumulated: number
} {
  const netAnnualContribution = Math.max(0, annualTaxSavings - agentFees)
  const yearsToRetirement = Math.max(0, retirementAge - currentAge)

  // Calculate future value with compound interest and tax
  const afterTaxReturn = returnRate * (1 - taxRate)
  let totalAccumulated = 0

  for (let year = 0; year < yearsToRetirement; year++) {
    totalAccumulated = (totalAccumulated + netAnnualContribution) * (1 + afterTaxReturn)
  }

  // Net accumulated after all fees over the period
  const totalFeesOverPeriod = agentFees * yearsToRetirement
  const netAccumulated = Math.max(0, totalAccumulated - totalFeesOverPeriod)

  return {
    netAnnualContribution,
    yearsToRetirement,
    totalAccumulated: Math.round(totalAccumulated),
    netAccumulated: Math.round(netAccumulated),
  }
}

/**
 * Calculate home upgrade strategy NET OF FEES
 */
export function calculateHomeUpgradeNetBenefit(
  currentHomeValue: number,
  proposedHomeValue: number,
  currentAge: number,
  retirementAge: number,
  currentGrowthRate: number,
  proposedGrowthRate: number,
  interestRate: number,
  annualTaxSavings: number,
  agentFees: number,
  transactionCosts = 0.08,
): {
  yearsToRetirement: number
  futureCurrentValue: number
  futureProposedValue: number
  extraWealth: number
  netExtraWealth: number
  isViableAfterFees: boolean
} {
  const yearsToRetirement = Math.max(0, retirementAge - currentAge)

  // Future value calculations
  const futureCurrentValue = currentHomeValue * Math.pow(1 + currentGrowthRate, yearsToRetirement)
  const futureProposedValue = proposedHomeValue * Math.pow(1 + proposedGrowthRate, yearsToRetirement)

  // Calculate extra wealth (accounting for transaction costs)
  const netProceedsFromSale = currentHomeValue * (1 - transactionCosts)
  const additionalBorrowing = proposedHomeValue - netProceedsFromSale
  const extraWealth = futureProposedValue - futureCurrentValue

  // Total fees over the period
  const totalFeesOverPeriod = agentFees * yearsToRetirement

  // Net extra wealth after fees
  const netExtraWealth = extraWealth - totalFeesOverPeriod
  const isViableAfterFees = netExtraWealth > 0

  return {
    yearsToRetirement,
    futureCurrentValue: Math.round(futureCurrentValue),
    futureProposedValue: Math.round(futureProposedValue),
    extraWealth: Math.round(extraWealth),
    netExtraWealth: Math.round(netExtraWealth),
    isViableAfterFees,
  }
}

/**
 * Calculate lifetime benefits net of fees from age to 65
 * Year 1: Implementation fee ($14,520)
 * Year 2+: Ongoing fee only ($6,600/year)
 */
export function calculateLifetimeBenefits(
  annualTaxSavings: number,
  currentAge: number,
  retirementAge = 65,
): {
  yearsToRetirement: number
  year1NetBenefit: number
  year2PlusAnnualNetBenefit: number
  totalLifetimeGrossSavings: number
  totalLifetimeFees: number
  totalLifetimeNetBenefit: number
  breakEvenYear: number
  cumulativeBenefitByYear: Array<{ year: number; cumulativeNet: number }>
} {
  const yearsToRetirement = Math.max(1, retirementAge - currentAge)

  // Year 1: Tax savings minus implementation fee
  const year1Fees = TAX_AGENT_FEES.totalFirstYearPhase1 // $14,520
  const year1NetBenefit = annualTaxSavings - year1Fees

  // Year 2+: Tax savings minus ongoing fee only
  const ongoingAnnualFees = TAX_AGENT_FEES.phase2MonthlyAfter * 12 // $550 × 12 = $6,600
  const year2PlusAnnualNetBenefit = annualTaxSavings - ongoingAnnualFees

  // Calculate totals over lifetime
  const totalLifetimeGrossSavings = annualTaxSavings * yearsToRetirement
  const totalLifetimeFees = year1Fees + ongoingAnnualFees * (yearsToRetirement - 1)
  const totalLifetimeNetBenefit = totalLifetimeGrossSavings - totalLifetimeFees

  // Calculate break-even year and cumulative benefits
  let cumulativeNet = 0
  let breakEvenYear = 0
  const cumulativeBenefitByYear: Array<{ year: number; cumulativeNet: number }> = []

  for (let year = 1; year <= yearsToRetirement; year++) {
    if (year === 1) {
      cumulativeNet += year1NetBenefit
    } else {
      cumulativeNet += year2PlusAnnualNetBenefit
    }

    cumulativeBenefitByYear.push({ year, cumulativeNet })

    // Find break-even year (when cumulative net becomes positive)
    if (breakEvenYear === 0 && cumulativeNet >= 0) {
      breakEvenYear = year
    }
  }

  return {
    yearsToRetirement,
    year1NetBenefit,
    year2PlusAnnualNetBenefit,
    totalLifetimeGrossSavings,
    totalLifetimeFees,
    totalLifetimeNetBenefit,
    breakEvenYear,
    cumulativeBenefitByYear,
  }
}

/**
 * Calculate opportunity benefits over lifetime (mortgage, super, home upgrade)
 */
export function calculateLifetimeOpportunityBenefits(
  annualTaxSavings: number,
  currentAge: number,
  mortgageBalance: number,
  interestRate = 0.065,
  superReturnRate = 0.035, // Updated from 0.07 (7%) to 0.035 (3.5%) for long-term super growth
  superTaxRate = 0.15,
  retirementAge = 65,
): {
  lifetime: ReturnType<typeof calculateLifetimeBenefits>
  mortgageAcceleration: {
    year1ExtraPayment: number
    year2PlusExtraPayment: number
    totalInterestSaved: number
    yearsReduced: number
  }
  superBoost: {
    year1Contribution: number
    year2PlusContribution: number
    totalAccumulated: number
  }
} {
  const lifetime = calculateLifetimeBenefits(annualTaxSavings, currentAge, retirementAge)

  // Mortgage acceleration with year 1 and year 2+ different payments
  const monthlyRate = interestRate / 12
  const standardMonthlyPayment = (mortgageBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -360))

  let remainingBalance = mortgageBalance
  let monthsToPayoff = 0
  let totalInterestPaid = 0

  while (remainingBalance > 0 && monthsToPayoff < 360) {
    const currentYear = Math.floor(monthsToPayoff / 12) + 1
    const extraAnnualPayment = currentYear === 1 ? lifetime.year1NetBenefit : lifetime.year2PlusAnnualNetBenefit
    const monthlyExtraPayment = Math.max(0, extraAnnualPayment) / 12

    const interestCharge = remainingBalance * monthlyRate
    totalInterestPaid += interestCharge
    const principalPayment = standardMonthlyPayment + monthlyExtraPayment - interestCharge
    remainingBalance -= principalPayment
    monthsToPayoff++
  }

  const standardTotalInterest = standardMonthlyPayment * 360 - mortgageBalance
  const totalInterestSaved = Math.max(0, standardTotalInterest - totalInterestPaid)
  const yearsReduced = Math.max(0, (360 - monthsToPayoff) / 12)

  // Super boost with different contributions year 1 vs year 2+
  const afterTaxReturn = superReturnRate * (1 - superTaxRate)
  let totalAccumulated = 0

  for (let year = 1; year <= lifetime.yearsToRetirement; year++) {
    const contribution =
      year === 1 ? Math.max(0, lifetime.year1NetBenefit) : Math.max(0, lifetime.year2PlusAnnualNetBenefit)
    totalAccumulated = (totalAccumulated + contribution) * (1 + afterTaxReturn)
  }

  return {
    lifetime,
    mortgageAcceleration: {
      year1ExtraPayment: Math.max(0, lifetime.year1NetBenefit),
      year2PlusExtraPayment: Math.max(0, lifetime.year2PlusAnnualNetBenefit),
      totalInterestSaved: Math.round(totalInterestSaved),
      yearsReduced: Math.round(yearsReduced * 10) / 10,
    },
    superBoost: {
      year1Contribution: Math.max(0, lifetime.year1NetBenefit),
      year2PlusContribution: Math.max(0, lifetime.year2PlusAnnualNetBenefit),
      totalAccumulated: Math.round(totalAccumulated),
    },
  }
}

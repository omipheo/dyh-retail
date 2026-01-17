// ATO-compliant tax deduction calculations

const CENTS_PER_KM_RATE = 0.88 // 2024-25 ATO rate
const AVERAGE_TAX_RATE = 0.325 // Approximate average tax rate (32.5%)

interface QuestionnaireData {
  // Home Office
  office_percentage: number | null
  hours_per_week: number | null

  // Property
  is_owner_occupied: boolean
  annual_mortgage_interest: number | null
  annual_rent: number | null
  annual_property_insurance: number | null
  annual_council_rates: number | null
  annual_electricity: number | null
  annual_gas: number | null
  annual_water: number | null
  annual_internet: number | null
  annual_phone: number | null
  annual_cleaning: number | null
  annual_maintenance: number | null

  // Vehicle
  has_vehicle: boolean
  business_kms: number | null
  business_percentage: number | null

  // Equipment
  equipment_purchases: Array<{ cost: string }> | null
}

export interface ReportCalculations {
  homeOfficeDeduction: number
  homeOfficeBreakdown: {
    occupancyExpenses: number
    runningExpenses: number
  }
  vehicleDeduction: number
  equipmentDeduction: number
  totalDeductions: number
  estimatedTaxSaving: number
}

export function calculateDeductions(data: QuestionnaireData): ReportCalculations {
  const officePercentage = (data.office_percentage || 0) / 100

  // 1. HOME OFFICE DEDUCTION

  // Occupancy expenses (only for owners, apportioned by office percentage)
  let occupancyExpenses = 0
  if (data.is_owner_occupied) {
    const mortgageInterest = data.annual_mortgage_interest || 0
    const propertyInsurance = data.annual_property_insurance || 0
    const councilRates = data.annual_council_rates || 0

    occupancyExpenses = (mortgageInterest + propertyInsurance + councilRates) * officePercentage
  }

  // Running expenses (apportioned by office percentage)
  const electricity = data.annual_electricity || 0
  const gas = data.annual_gas || 0
  const water = data.annual_water || 0
  const internet = data.annual_internet || 0
  const phone = data.annual_phone || 0
  const cleaning = data.annual_cleaning || 0
  const maintenance = data.annual_maintenance || 0

  // For renters, include rent in running expenses
  const rent = !data.is_owner_occupied ? data.annual_rent || 0 : 0

  const runningExpenses =
    (electricity + gas + water + internet + phone + cleaning + maintenance + rent) * officePercentage

  const homeOfficeDeduction = occupancyExpenses + runningExpenses

  // 2. VEHICLE DEDUCTION (cents per km method)
  let vehicleDeduction = 0
  if (data.has_vehicle && data.business_kms) {
    // Maximum 5,000 business km per year for cents per km method
    const claimableKms = Math.min(data.business_kms, 5000)
    vehicleDeduction = claimableKms * CENTS_PER_KM_RATE
  }

  // 3. EQUIPMENT DEDUCTION
  let equipmentDeduction = 0
  if (data.equipment_purchases && Array.isArray(data.equipment_purchases)) {
    // Instant asset write-off for items under $20,000 (2024-25)
    equipmentDeduction = data.equipment_purchases.reduce((sum, item) => {
      const cost = Number.parseFloat(item.cost) || 0
      // Items under $20,000 can be immediately deducted
      // Items over $20,000 would need depreciation (not implemented here)
      return sum + (cost <= 20000 ? cost : 0)
    }, 0)
  }

  // 4. TOTAL CALCULATIONS
  const totalDeductions = homeOfficeDeduction + vehicleDeduction + equipmentDeduction
  const estimatedTaxSaving = totalDeductions * AVERAGE_TAX_RATE

  return {
    homeOfficeDeduction,
    homeOfficeBreakdown: {
      occupancyExpenses,
      runningExpenses,
    },
    vehicleDeduction,
    equipmentDeduction,
    totalDeductions,
    estimatedTaxSaving,
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { DEMO_CLIENTS } from "@/lib/demo-clients"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const questionnaireId = searchParams.get("id")

    if (!questionnaireId) {
      return NextResponse.json({ error: "Questionnaire ID is required" }, { status: 400 })
    }

    let response
    if (questionnaireId.startsWith("demo-")) {
      response = DEMO_CLIENTS[questionnaireId as keyof typeof DEMO_CLIENTS]
      if (!response) {
        return NextResponse.json({ error: "Demo client not found" }, { status: 404 })
      }
    } else {
      const supabase = await createServerClient()

      const { data, error } = await supabase
        .from("questionnaire_responses")
        .select("*")
        .eq("id", questionnaireId)
        .single()

      if (error || !data) {
        console.error("[v0] Database fetch error:", error)
        return NextResponse.json({ error: "Client data not found", details: error?.message }, { status: 404 })
      }
      response = data
    }

    // Parse questionnaire_data JSON if it exists
    const questionnaireData = response.questionnaire_data || {}

    const businessUsePercentage = response.bup_percentage || questionnaireData.bup || 0

    const mortgage = Number(questionnaireData.mortgage_interest) || 0
    const rates = Number(questionnaireData.council_rates) || 0
    const water = Number(questionnaireData.water_rates) || 0
    const insurance = Number(questionnaireData.building_insurance) || 0
    const repairs = Number(questionnaireData.repairs_maintenance) || 0
    const depreciation = Number(questionnaireData.depreciation) || 0
    const electricity = Number(questionnaireData.electricity_annual) || 0
    const gas = Number(questionnaireData.gas_annual) || 0
    const cleaning = Number(questionnaireData.cleaning_annual) || 0
    const security = Number(questionnaireData.security_annual) || 0

    console.log("[v0] Calculating deductions for:", response.client_name)
    console.log("[v0] Business use percentage:", businessUsePercentage.toFixed(2) + "%")
    console.log("[v0] Expenses extracted:", {
      mortgage,
      rates,
      water,
      insurance,
      repairs,
      depreciation,
      electricity,
      gas,
      cleaning,
      security,
    })

    // Calculate deductibles
    const mortgageDeductible = mortgage * (businessUsePercentage / 100)
    const ratesDeductible = rates * (businessUsePercentage / 100)
    const waterDeductible = water * (businessUsePercentage / 100)
    const insuranceDeductible = insurance * (businessUsePercentage / 100)
    const repairsDeductible = repairs * (businessUsePercentage / 100)
    const depreciationDeductible = depreciation * (businessUsePercentage / 100)
    const electricityDeductible = electricity * (businessUsePercentage / 100)
    const gasDeductible = gas * (businessUsePercentage / 100)
    const cleaningDeductible = cleaning * (businessUsePercentage / 100)
    const securityDeductible = security * (businessUsePercentage / 100)

    const totalPropertyExpenses = mortgage + rates + water + insurance + repairs + depreciation
    const totalPropertyDeductible =
      mortgageDeductible +
      ratesDeductible +
      waterDeductible +
      insuranceDeductible +
      repairsDeductible +
      depreciationDeductible

    const totalRunningExpenses = electricity + gas + cleaning + security
    const totalRunningDeductible = electricityDeductible + gasDeductible + cleaningDeductible + securityDeductible

    const totalAnnualDeduction = totalPropertyDeductible + totalRunningDeductible

    // Calculate fixed rate method claim
    const weeksPerYear = response.weeks_per_year || 48
    const totalHoursWorked = response.hours_per_week * weeksPerYear
    const fixedRateMethodClaim = Math.min(totalHoursWorked * 0.67, 5000)

    // Determine recommended method
    const recommendedMethod = totalAnnualDeduction > fixedRateMethodClaim ? "Actual Cost Method" : "Fixed Rate Method"

    // Calculate tax savings (assuming 47% marginal tax rate)
    const marginalTaxRate = 47
    const estimatedTaxSavings = Math.round(totalAnnualDeduction * (marginalTaxRate / 100))

    // Service fees and opportunities
    const serviceFees = {
      basic: 1595,
      plus: 2395,
      premium: 3495,
    }

    // Calculate after-tax cost of services (at marginal tax rate)
    const afterTaxServiceCost = {
      basic: Math.round(serviceFees.basic * (1 - marginalTaxRate / 100)),
      plus: Math.round(serviceFees.plus * (1 - marginalTaxRate / 100)),
      premium: Math.round(serviceFees.premium * (1 - marginalTaxRate / 100)),
    }

    // Calculate value opportunities (potential additional deductions that could be claimed)
    const opportunities = [
      {
        name: "Depreciation Schedule Update",
        potentialValue: Math.round(depreciation * 0.3), // 30% potential increase
        afterTaxCost: afterTaxServiceCost.basic,
        netBenefit: Math.round(depreciation * 0.3 * (marginalTaxRate / 100) - afterTaxServiceCost.basic),
      },
      {
        name: "Structure Optimization",
        potentialValue: Math.round(totalAnnualDeduction * 0.15), // 15% efficiency gain
        afterTaxCost: afterTaxServiceCost.plus,
        netBenefit: Math.round(totalAnnualDeduction * 0.15 * (marginalTaxRate / 100) - afterTaxServiceCost.plus),
      },
      {
        name: "Comprehensive Tax Planning",
        potentialValue: Math.round(totalAnnualDeduction * 0.25), // 25% strategic improvement
        afterTaxCost: afterTaxServiceCost.premium,
        netBenefit: Math.round(totalAnnualDeduction * 0.25 * (marginalTaxRate / 100) - afterTaxServiceCost.premium),
      },
    ]

    const reportData = {
      CLIENT_NAME: response.client_name || "Client Name",
      CLIENT_ADDRESS: response.property_address || "Client Address",
      CLIENT_ABN: questionnaireData.abn || "ABN Not Provided",
      CLIENT_BUSINESS_NAME: response.business_name || "Business Name",
      CLIENT_BUSINESS_TYPE: response.business_type || "Business Type",
      CLIENT_BUSINESS_START_DATE: questionnaireData.businessStartDate || "Not Provided",
      CLIENT_INCOME: response.taxable_income || 0,
      CLIENT_AGE: response.age || 0,
      MORTGAGE_BALANCE: response.mortgage_balance || 0,
      CURRENT_HOME_VALUE: response.property_value || 0,
      BUILDING_VALUE: response.building_value || 0,
      STRATEGY: response.strategy || "Not Specified",
      STRATEGY_NAME: response.strategy_name || response.strategy || "Not Specified",
      STRATEGY_DESCRIPTION:
        response.strategy_description || "Custom tax strategy tailored to your specific circumstances.",
      REPORT_DATE: new Date().toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      TOTAL_FLOOR_AREA_M2: 0,
      TOTAL_BUSINESS_USE_AREA_M2: 0,
      BUSINESS_USE_PERCENTAGE: Math.round(businessUsePercentage),
      DEDICATED_OFFICE_AREA_M2: 0,
      DEDICATED_MEETING_AREA_M2: 0,
      DEDICATED_ARCHIVE_AREA_M2: 0,
      TOTAL_WEEKLY_HOURS_WORKED: response.hours_per_week || 0,
      TOTAL_NUMBER_OF_WEEKS_WORKED: weeksPerYear,
      TOTAL_NUMBER_OF_HOURS_WORKED: totalHoursWorked,
      MORTGAGE: Math.round(mortgage),
      RATES: Math.round(rates),
      INSURANCE: Math.round(insurance),
      REPAIRS: Math.round(repairs),
      DEPRECIATION: Math.round(depreciation),
      WATER: Math.round(water),
      SECURITY: Math.round(security),
      CLEANING: Math.round(cleaning),
      ELECTRICITY: Math.round(electricity),
      GAS: Math.round(gas),
      TOTAL_PROPERTY_EXPENSES: Math.round(totalPropertyExpenses),
      TOTAL_RUNNING_EXPENSES: Math.round(totalRunningExpenses),
      MORTGAGE_DEDUCTIBLE: Math.round(mortgageDeductible),
      RATES_DEDUCTIBLE: Math.round(ratesDeductible),
      INSURANCE_DEDUCTIBLE: Math.round(insuranceDeductible),
      REPAIRS_DEDUCTIBLE: Math.round(repairsDeductible),
      DEPRECIATION_DEDUCTIBLE: Math.round(depreciationDeductible),
      WATER_DEDUCTIBLE: Math.round(waterDeductible),
      SECURITY_DEDUCTIBLE: Math.round(securityDeductible),
      CLEANING_DEDUCTIBLE: Math.round(cleaningDeductible),
      ELECTRICITY_DEDUCTIBLE: Math.round(electricityDeductible),
      GAS_DEDUCTIBLE: Math.round(gasDeductible),
      TOTAL_PROPERTY_DEDUCTIBLE: Math.round(totalPropertyDeductible),
      TOTAL_RUNNING_COSTS_DEDUCTIBLE: Math.round(totalRunningDeductible),
      TOTAL_FIXED_RATE_METHOD_CLAIM: Math.round(fixedRateMethodClaim),
      RECOMMENDED_METHOD: recommendedMethod,
      RECOMMENDATION_TEXT: `Based on your business circumstances, we recommend using the ${recommendedMethod} for maximum tax deductions. This method provides an annual deduction of $${Math.round(totalAnnualDeduction).toLocaleString()}, which translates to estimated tax savings of $${estimatedTaxSavings.toLocaleString()} at your marginal tax rate of ${marginalTaxRate}%.`,
      // Service cost data
      serviceFees,
      afterTaxServiceCost,
      opportunities,
      marginalTaxRate,
      estimatedTaxSavings,
    }

    return NextResponse.json({ data: reportData })
  } catch (error) {
    console.error("[v0] PDF generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

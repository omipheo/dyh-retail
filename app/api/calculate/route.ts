import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { calculateDeductions, determineScenario, type CalculatorInputs } from '@/lib/calculator'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { assessmentId, ...inputs } = body

    // Validate inputs
    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID required' }, { status: 400 })
    }

    // Calculate deductions
    const calculatorInputs: CalculatorInputs = {
      homeSize: inputs.homeSize || 0,
      officeSize: inputs.officeSize || 0,
      hoursPerWeek: inputs.hoursPerWeek || 0,
      employmentStatus: inputs.employmentStatus || 'employee',
      businessType: inputs.businessType,
      internetAnnual: inputs.internetAnnual || 0,
      phoneAnnual: inputs.phoneAnnual || 0,
      electricityAnnual: inputs.electricityAnnual || 0,
      heatingCoolingAnnual: inputs.heatingCoolingAnnual || 0,
      cleaningAnnual: inputs.cleaningAnnual || 0,
      rentMortgageAnnual: inputs.rentMortgageAnnual,
      insuranceAnnual: inputs.insuranceAnnual,
      ratesAnnual: inputs.ratesAnnual,
      furnitureValue: inputs.furnitureValue,
      equipmentValue: inputs.equipmentValue,
    }

    const result = calculateDeductions(calculatorInputs)
    const scenario = determineScenario(calculatorInputs)

    // Update assessment with calculation results
    const { error: updateError } = await supabase
      .from('questionnaire_responses')
      .update({
        fixed_rate_deduction: result.fixedRateDeduction,
        actual_cost_deduction: result.actualCostDeduction,
        total_deduction: result.recommendedDeduction,
        scenario_type: result.recommendedMethod,
        status: 'completed',
      })
      .eq('id', assessmentId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json({ error: 'Failed to save calculation' }, { status: 500 })
    }

    return NextResponse.json({
      result,
      scenario,
    })
  } catch (error) {
    console.error('Calculation error:', error)
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 })
  }
}

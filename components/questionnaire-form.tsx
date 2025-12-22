"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, AlertCircle, Info } from "lucide-react" // Added Info icon
import { Alert, AlertDescription } from "@/components/ui/alert"

import { ValidatedInput } from "@/components/validated-input" // Imported ValidatedInput
import {
  validateNumericField,
  validatePercentage,
  validateFloorSpace,
  validateIncome,
  validateBuildingValue,
  validateBusinessUsePercentage,
} from "@/lib/form-validators" // Imported validators

interface QuestionnaireFormProps {
  userId: string
}

type Step = 1 | 2 | 3

export default function QuestionnaireForm({ userId }: QuestionnaireFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const [formData, setFormData] = useState({
    // Quick Questionnaire (Q1-29)
    q1_marital_status: "",
    q2_annual_income: "",
    q3_partner_income: "",
    q4_num_children: "",
    q5_ages_children: "",
    q6_children_incomes: "",
    q7_employment_status: "",
    q8_partner_employment: "",
    q9_renting: "",
    q10_home_status: "",
    q11_home_value: "",
    q12_personal_debts: "",
    q13_partner_debts: "",
    q14_home_status: "",
    q15_prefer_move_extend: "",
    q16_total_floor_space: "",
    q17_business_floor_space: "",
    q18_sheds_num: "",
    q18_sheds_sizes: "",
    q18_driveways_num: "",
    q18_driveways_type: "",
    q18_carports_num: "",
    q18_carports_type: "",
    q18_garages_num: "",
    q18_garages_type: "",
    q18_patios_num: "",
    q18_patios_sizes: "",
    q18_uncovered_num: "",
    q18_uncovered_sizes: "",
    q18_vehicles_business: "",
    q18_vehicles_personal: "",
    q19_sheds_business_sqm: "",
    q19_driveways_business_sqm: "",
    q19_carports_business_sqm: "",
    q19_garages_business_sqm: "",
    q19_patios_business_sqm: "",
    q19_uncovered_business_sqm: "",
    q20_years_operated: "",
    q21_past_business_sqm: "",
    q22_years_claimed_deductions: "",
    q23_has_accountant: "",
    q24_knows_insurance: "",
    q25_accountant_rating: "",
    q26_has_rented_premises: "",
    q27_rental_cost: "",
    q28_gst_registered: "",
    q29_rent_annual: "",
    q29_loan_interest: "",
    q29_staff_num: "",
    q29_staff_cost: "",
    q29_staff_super: "",
    q29_equipment_lease: "",
    q29_equipment_depreciation: "",
    q29_vehicle_expenses: "",
    q29_council_rates: "",
    q29_water_rates: "",
    q29_land_tax: "",
    q29_power_business_pct: "",
    q29_phone_business_pct: "",
    q29_advertising: "",
    q29_other1_desc: "",
    q29_other1_amt: "",
    q29_other2_desc: "",
    q29_other2_amt: "",
    q29_other3_desc: "",
    q29_other3_amt: "",
    q29_other4_desc: "",
    q29_other4_amt: "",
    comment1: "",
    comment2: "",
    comment3: "",

    // Strategy Selector Assets & Liabilities (Q1-Q2)
    ss_q1_plant_equipment: "",
    ss_q1_goodwill: "",
    ss_q1_ip_patents: "",
    ss_q1_real_property: "",
    ss_q2_liabilities: "",

    // Strategy Selector YES/NO Questions (Q3-Q65)
    ss_q3: "",
    ss_q4_desc: "",
    ss_q5_num: "",
    ss_q6: "",
    ss_q7: "",
    ss_q8: "",
    ss_q9: "",
    ss_q10: "",
    ss_q11: "",
    ss_q12: "",
    ss_q13: "",
    ss_q14: "",
    ss_q15: "",
    ss_q16: "",
    ss_q17_preference: "",
    ss_q18_desc: "",
    ss_q18_cost: "",
    ss_q19_location: "",
    ss_q20_land_cost: "",
    ss_q21_location: "",
    ss_q21_cost: "",
    ss_q22_experience: "",
    ss_q23_learned: "",
    ss_q24: "",
    ss_q25: "",
    ss_q26: "",
    ss_q27: "",
    ss_q28: "",
    ss_q29: "",
    ss_q30: "",
    ss_q31: "",
    ss_q32: "",
    ss_q33: "",
    ss_q34: "",
    ss_q35: "",
    ss_q36_attitude: "",
    ss_q37_smsf: "",
    ss_q38_pre_retirement: "",
    ss_q38_post_retirement: "",
    ss_q39_likes: "",
    ss_q40_dislikes: "",
    ss_q41: "",
    ss_q42_drop: "",
    ss_q43_amount: "",
    ss_q44_rent: "",
    ss_q44_staff_num: "",
    ss_q44_staff: "",
    ss_q44_super: "",
    ss_q44_equipment_lease: "",
    ss_q44_equipment_depreciation: "",
    ss_q44_vehicle: "",
    ss_q44_council: "",
    ss_q44_water: "",
    ss_q44_land_tax: "",
    ss_q44_power: "",
    ss_q44_phone: "",
    ss_q44_advertising: "",
    ss_q44_other1: "",
    ss_q44_other2: "",
    ss_q44_other3: "",
    ss_q44_other4: "",
    ss_q45: "",
    ss_q46: "",
    ss_q47_skills: "",
    ss_q48_time: "",
    ss_q49: "",
    ss_q50: "",
    ss_q51: "",
    ss_q52_why: "",
    ss_q53_pursuit1: "",
    ss_q53_pursuit2: "",
    ss_q53_pursuit3: "",
    ss_q54_pursuit1_level: "",
    ss_q54_pursuit2_level: "",
    ss_q54_pursuit3_level: "",
    ss_q55: "",
    ss_q56_priority1: "",
    ss_q56_priority2: "",
    ss_q56_priority3: "",
    ss_q57: "",
    ss_q58: "",
    ss_q59: "",
    ss_q60: "",
    ss_q61: "",
    ss_q62: "",
    ss_q63_desc: "",
    ss_q64: "",
    ss_q65: "",
  })

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // The previous `validationErrors` state was redundant and has been removed.
  // const [validationErrors, setValidationErrors] = useState<string[]>([])

  const validateStep = (step: Step): boolean => {
    const errors: string[] = []

    if (step === 1) {
      // Validate critical Quick Questionnaire fields
      if (!formData.q1_marital_status) errors.push("Marital status is required")
      if (!formData.q2_annual_income) errors.push("Annual income is required for tax calculations")

      const incomeValidation = validateIncome(formData.q2_annual_income, "Annual income")
      if (!incomeValidation.isValid) errors.push(incomeValidation.message || "Invalid income")

      const floorSpaceValidation = validateFloorSpace(formData.q16_total_floor_space, formData.q17_business_floor_space)
      if (!floorSpaceValidation.isValid) errors.push(floorSpaceValidation.message || "Invalid floor space")

      const businessUseValidation = validateBusinessUsePercentage(
        formData.q29_power_business_pct,
        formData.q29_phone_business_pct,
      )
      if (!businessUseValidation.isValid)
        errors.push(businessUseValidation.message || "Invalid business use percentages")
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("client_assessments")
        .insert({
          client_name: `User ${userId}`,
          status: "submitted",
          questionnaire_data: formData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      router.push(`/questionnaire/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit questionnaire")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep((currentStep + 1) as Step)
        setValidationErrors([])
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const progress = (currentStep / 3) * 100

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">Step {currentStep} of 3</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Please fix the following issues:</p>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Quick Questionnaire (29 Questions)"}
            {currentStep === 2 && "DYH Strategy Selector (65 Questions)"}
            {currentStep === 3 && "Review & Submit"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "DEDUCT YOUR HOME – CONFIDENTIAL INITIAL QUESTIONNAIRE"}
            {currentStep === 2 && "BUSINESS, WEALTH & LIFESTYLE SELF-PROFILER"}
            {currentStep === 3 && "Review your responses and submit"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* STEP 1: QUICK QUESTIONNAIRE */}
          {currentStep === 1 && (
            <>
              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label>1. Your marital Status?</Label>
                  <RadioGroup
                    value={formData.q1_marital_status}
                    onValueChange={(v) => updateFormData("q1_marital_status", v)}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="single" />
                        <Label htmlFor="single" className="font-normal cursor-pointer">
                          Single
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="married" id="married" />
                        <Label htmlFor="married" className="font-normal cursor-pointer">
                          Married
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="partnered" id="partnered" />
                        <Label htmlFor="partnered" className="font-normal cursor-pointer">
                          Partnered
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="divorced" id="divorced" />
                        <Label htmlFor="divorced" className="font-normal cursor-pointer">
                          Divorced
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <ValidatedInput
                  label="2. Your annual personal income (current or genuinely anticipated within the next 12 months)"
                  value={formData.q2_annual_income}
                  onChange={(v) => updateFormData("q2_annual_income", v)}
                  validator={(v) => validateIncome(v, "Annual income")}
                  type="number"
                  placeholder="$"
                  required
                />

                <div className="grid gap-2">
                  <Label htmlFor="q3">3. Your spouse/partner's annual personal income - (if applicable)</Label>
                  <Input
                    id="q3"
                    type="number"
                    placeholder="$"
                    value={formData.q3_partner_income}
                    onChange={(e) => updateFormData("q3_partner_income", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="q4">4. No. of children</Label>
                  <Input
                    id="q4"
                    type="number"
                    value={formData.q4_num_children}
                    onChange={(e) => updateFormData("q4_num_children", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="q5">5. Ages of children</Label>
                  <Input
                    id="q5"
                    placeholder="e.g., 5, 8, 12"
                    value={formData.q5_ages_children}
                    onChange={(e) => updateFormData("q5_ages_children", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="q6">6. Annual incomes of the children - (if applicable)</Label>
                  <Input
                    id="q6"
                    placeholder="$"
                    value={formData.q6_children_incomes}
                    onChange={(e) => updateFormData("q6_children_incomes", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>7. Employment status</Label>
                  <RadioGroup
                    value={formData.q7_employment_status}
                    onValueChange={(v) => updateFormData("q7_employment_status", v)}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="employee" id="employee" />
                        <Label htmlFor="employee" className="font-normal cursor-pointer">
                          Employee
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="proprietor" id="proprietor" />
                        <Label htmlFor="proprietor" className="font-normal cursor-pointer">
                          Proprietor
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>8. Your partner's employment status</Label>
                  <RadioGroup
                    value={formData.q8_partner_employment}
                    onValueChange={(v) => updateFormData("q8_partner_employment", v)}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="employee" id="partner_employee" />
                        <Label htmlFor="partner_employee" className="font-normal cursor-pointer">
                          Employee
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="proprietor" id="partner_proprietor" />
                        <Label htmlFor="partner_proprietor" className="font-normal cursor-pointer">
                          Proprietor
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>9. Are you renting?</Label>
                  <RadioGroup value={formData.q9_renting} onValueChange={(v) => updateFormData("q9_renting", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="renting_yes" />
                        <Label htmlFor="renting_yes" className="font-normal cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="renting_no" />
                        <Label htmlFor="renting_no" className="font-normal cursor-pointer">
                          No
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="q10">10. Have you paid off your home or are you paying it off?</Label>
                  <div className="flex gap-4">
                    <RadioGroup
                      value={formData.q10_home_status}
                      onValueChange={(v) => updateFormData("q10_home_status", v)}
                    >
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="paid_for" id="paid_for" />
                          <Label htmlFor="paid_for" className="font-normal cursor-pointer">
                            Paid For
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="owing" id="owing" />
                          <Label htmlFor="owing" className="font-normal cursor-pointer">
                            Amount Owing
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                    <Input type="number" placeholder="$ Amount Owing" className="flex-1" />
                  </div>
                </div>

                <ValidatedInput
                  label="11. Conservative estimated value of your current or anticipated future Home?"
                  value={formData.q11_home_value}
                  onChange={(v) => updateFormData("q11_home_value", v)}
                  validator={validateBuildingValue}
                  type="number"
                  placeholder="$"
                  required
                />

                <div className="grid gap-2">
                  <Label htmlFor="q12">
                    12. Approximate balance of your personal debts (car loans, personal loans, credit cards etc)?
                  </Label>
                  <Input
                    id="q12"
                    type="number"
                    placeholder="$"
                    value={formData.q12_personal_debts}
                    onChange={(e) => updateFormData("q12_personal_debts", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="q13">
                    13. Approximate balance of your partner's personal debts (car loans, personal loans, credit cards
                    etc)?
                  </Label>
                  <Input
                    id="q13"
                    type="number"
                    placeholder="$"
                    value={formData.q13_partner_debts}
                    onChange={(e) => updateFormData("q13_partner_debts", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>14. Is your home genuinely large enough and well suited for a home business?</Label>
                  <RadioGroup
                    value={formData.q14_home_suitable}
                    onValueChange={(v) => updateFormData("q14_home_suitable", v)}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="suitable_yes" />
                        <Label htmlFor="suitable_yes" className="font-normal cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="suitable_no" />
                        <Label htmlFor="suitable_no" className="font-normal cursor-pointer">
                          No
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>15. If no to (14), would you prefer to move or to extend?</Label>
                  <RadioGroup
                    value={formData.q15_prefer_move_extend}
                    onValueChange={(v) => updateFormData("q15_prefer_move_extend", v)}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="move" id="move" />
                        <Label htmlFor="move" className="font-normal cursor-pointer">
                          Move
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="extend" id="extend" />
                        <Label htmlFor="extend" className="font-normal cursor-pointer">
                          Extend
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <ValidatedInput
                  label="16. Approximate total m² of floor space under the main roof (excluding carports, garages and patios etc)?"
                  value={formData.q16_total_floor_space}
                  onChange={(v) => updateFormData("q16_total_floor_space", v)}
                  validator={(v) => validateNumericField(v, "Total floor space", 1)}
                  type="number"
                  placeholder="m²"
                  required
                />

                <ValidatedInput
                  label="17. Total m² at (16), that can be dedicated to business use?"
                  value={formData.q17_business_floor_space}
                  onChange={(v) => {
                    updateFormData("q17_business_floor_space", v)
                    // Validate relationship between total and business space
                    if (formData.q16_total_floor_space && v) {
                      validateFloorSpace(formData.q16_total_floor_space, v)
                    }
                  }}
                  validator={(v) => {
                    if (formData.q16_total_floor_space) {
                      return validateFloorSpace(formData.q16_total_floor_space, v)
                    }
                    return validateNumericField(v, "Business floor space", 1)
                  }}
                  type="number"
                  placeholder="m²"
                  required
                />

                {/* Q18 - Complex property features */}
                <div className="border-t pt-6">
                  <Label className="text-base font-semibold mb-4 block">
                    18. How many do you have of each of the following:
                  </Label>
                  <div className="space-y-4 ml-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="q18_sheds">Sheds - Number</Label>
                        <Input
                          id="q18_sheds"
                          type="number"
                          value={formData.q18_sheds_num}
                          onChange={(e) => updateFormData("q18_sheds_num", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="q18_sheds_sizes">Size m²</Label>
                        <Input
                          id="q18_sheds_sizes"
                          placeholder="e.g., 20, 30"
                          value={formData.q18_sheds_sizes}
                          onChange={(e) => updateFormData("q18_sheds_sizes", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="q18_driveways">Driveways - Number</Label>
                        <Input
                          id="q18_driveways"
                          type="number"
                          value={formData.q18_driveways_num}
                          onChange={(e) => updateFormData("q18_driveways_num", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="q18_driveways_type">Type</Label>
                        <Select
                          value={formData.q18_driveways_type}
                          onValueChange={(v) => updateFormData("q18_driveways_type", v)}
                        >
                          <SelectTrigger id="q18_driveways_type">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="double">Double</SelectItem>
                            <SelectItem value="triple">Triple</SelectItem>
                            <SelectItem value="quadruple">Quadruple</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="q18_carports">Carports - Number</Label>
                        <Input
                          id="q18_carports"
                          type="number"
                          value={formData.q18_carports_num}
                          onChange={(e) => updateFormData("q18_carports_num", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="q18_carports_type">Type</Label>
                        <Select
                          value={formData.q18_carports_type}
                          onValueChange={(v) => updateFormData("q18_carports_type", v)}
                        >
                          <SelectTrigger id="q18_carports_type">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="double">Double</SelectItem>
                            <SelectItem value="triple">Triple</SelectItem>
                            <SelectItem value="quadruple">Quadruple</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="q18_garages">Garages - Number</Label>
                        <Input
                          id="q18_garages"
                          type="number"
                          value={formData.q18_garages_num}
                          onChange={(e) => updateFormData("q18_garages_num", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="q18_garages_type">Type</Label>
                        <Select
                          value={formData.q18_garages_type}
                          onValueChange={(v) => updateFormData("q18_garages_type", v)}
                        >
                          <SelectTrigger id="q18_garages_type">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="double">Double</SelectItem>
                            <SelectItem value="triple">Triple</SelectItem>
                            <SelectItem value="quadruple">Quadruple</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="q18_patios">Patios - Number</Label>
                        <Input
                          id="q18_patios"
                          type="number"
                          value={formData.q18_patios_num}
                          onChange={(e) => updateFormData("q18_patios_num", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="q18_patios_sizes">Size m²</Label>
                        <Input
                          id="q18_patios_sizes"
                          placeholder="e.g., 15, 20"
                          value={formData.q18_patios_sizes}
                          onChange={(e) => updateFormData("q18_patios_sizes", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="q18_uncovered">Uncovered Areas - Number</Label>
                        <Input
                          id="q18_uncovered"
                          type="number"
                          value={formData.q18_uncovered_num}
                          onChange={(e) => updateFormData("q18_uncovered_num", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="q18_uncovered_sizes">Size m²</Label>
                        <Input
                          id="q18_uncovered_sizes"
                          placeholder="e.g., 50, 100"
                          value={formData.q18_uncovered_sizes}
                          onChange={(e) => updateFormData("q18_uncovered_sizes", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="q18_vehicles_business">Motor Vehicles for Business</Label>
                        <Input
                          id="q18_vehicles_business"
                          type="number"
                          value={formData.q18_vehicles_business}
                          onChange={(e) => updateFormData("q18_vehicles_business", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="q18_vehicles_personal">Motor Vehicles for Personal</Label>
                        <Input
                          id="q18_vehicles_personal"
                          type="number"
                          value={formData.q18_vehicles_personal}
                          onChange={(e) => updateFormData("q18_vehicles_personal", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Q19 */}
                <div className="border-t pt-6">
                  <Label className="text-base font-semibold mb-4 block">
                    19. Total m² at each of (18) if any, able to be exclusively or almost exclusively set aside for
                    business use?
                  </Label>
                  <div className="space-y-3 ml-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q19_sheds">Sheds (m²)</Label>
                      <Input
                        id="q19_sheds"
                        type="number"
                        value={formData.q19_sheds_business_sqm}
                        onChange={(e) => updateFormData("q19_sheds_business_sqm", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q19_driveways">Driveways (m²)</Label>
                      <Input
                        id="q19_driveways"
                        type="number"
                        value={formData.q19_driveways_business_sqm}
                        onChange={(e) => updateFormData("q19_driveways_business_sqm", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q19_carports">Carports (m²)</Label>
                      <Input
                        id="q19_carports"
                        type="number"
                        value={formData.q19_carports_business_sqm}
                        onChange={(e) => updateFormData("q19_carports_business_sqm", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q19_garages">Garages (m²)</Label>
                      <Input
                        id="q19_garages"
                        type="number"
                        value={formData.q19_garages_business_sqm}
                        onChange={(e) => updateFormData("q19_garages_business_sqm", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q19_patios">Patios (m²)</Label>
                      <Input
                        id="q19_patios"
                        type="number"
                        value={formData.q19_patios_business_sqm}
                        onChange={(e) => updateFormData("q19_patios_business_sqm", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q19_uncovered">Uncovered Area (m²)</Label>
                      <Input
                        id="q19_uncovered"
                        type="number"
                        value={formData.q19_uncovered_business_sqm}
                        onChange={(e) => updateFormData("q19_uncovered_business_sqm", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="q20">
                    20. How many years have You operated Your business at or from your current or prior home?
                  </Label>
                  <Input
                    id="q20"
                    type="number"
                    value={formData.q20_years_operated}
                    onChange={(e) => updateFormData("q20_years_operated", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="q21">
                    21. What do you estimate the total m² to be of the spaces You've already been using exclusively for
                    business in the past?
                  </Label>
                  <Input
                    id="q21"
                    type="number"
                    placeholder="m²"
                    value={formData.q21_past_business_sqm}
                    onChange={(e) => updateFormData("q21_past_business_sqm", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="q22">
                    22. Further to 21, for how many of those did you previously claim mortgage interest and council
                    rates etc?
                  </Label>
                  <Input
                    id="q22"
                    type="number"
                    placeholder="years"
                    value={formData.q22_years_claimed_deductions}
                    onChange={(e) => updateFormData("q22_years_claimed_deductions", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>23. Further to 22, have you been using an accountant?</Label>
                  <RadioGroup
                    value={formData.q23_has_accountant}
                    onValueChange={(v) => updateFormData("q23_has_accountant", v)}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="accountant_yes" />
                        <Label htmlFor="accountant_yes" className="font-normal cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="accountant_no" />
                        <Label htmlFor="accountant_no" className="font-normal cursor-pointer">
                          No
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>
                    24. Do you know that all public accountants such as Us must carry professional indemnity insurance?
                  </Label>
                  <RadioGroup
                    value={formData.q24_knows_insurance}
                    onValueChange={(v) => updateFormData("q24_knows_insurance", v)}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="insurance_yes" />
                        <Label htmlFor="insurance_yes" className="font-normal cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="insurance_no" />
                        <Label htmlFor="insurance_no" className="font-normal cursor-pointer">
                          No
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="q25">
                    25. On a scale of 1-10 (with 10 being optimum), how attached are you to your current accountant?
                  </Label>
                  <Input
                    id="q25"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.q25_accountant_rating}
                    onChange={(e) => updateFormData("q25_accountant_rating", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>
                    26. Do you or your partner have rented premises for another business that you could relocate as a
                    home business instead?
                  </Label>
                  <RadioGroup
                    value={formData.q26_has_rented_premises}
                    onValueChange={(v) => updateFormData("q26_has_rented_premises", v)}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="rented_yes" />
                        <Label htmlFor="rented_yes" className="font-normal cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="rented_no" />
                        <Label htmlFor="rented_no" className="font-normal cursor-pointer">
                          No
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="q27">
                    27. Further to 26, if applicable, what is the approximate annual cost of yours or your partner's
                    rented business premises?
                  </Label>
                  <Input
                    id="q27"
                    type="number"
                    placeholder="$"
                    value={formData.q27_rental_cost}
                    onChange={(e) => updateFormData("q27_rental_cost", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>28. Is your business GST registered?</Label>
                  <RadioGroup
                    value={formData.q28_gst_registered}
                    onValueChange={(v) => updateFormData("q28_gst_registered", v)}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="gst_yes" />
                        <Label htmlFor="gst_yes" className="font-normal cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="gst_no" />
                        <Label htmlFor="gst_no" className="font-normal cursor-pointer">
                          No
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Q29 - Business Outgoings */}
                <div className="border-t pt-6">
                  <Label className="text-base font-semibold mb-4 block">
                    29. Please list your main usual business outgoings (on an annual basis)
                  </Label>
                  <Alert className="bg-blue-50 border-blue-200 mb-4">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      <strong>Important:</strong> Internet and phone expenses cannot be calculated using floor space
                      percentage. Please review a typical 30-day bill and determine what percentage of usage is for
                      business purposes.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-3 ml-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q29_rent">Rent or</Label>
                      <Input
                        id="q29_rent"
                        type="number"
                        placeholder="$"
                        value={formData.q29_rent_annual}
                        onChange={(e) => updateFormData("q29_rent_annual", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q29_loan">Premises Loan Interest</Label>
                      <Input
                        id="q29_loan"
                        type="number"
                        placeholder="$"
                        value={formData.q29_loan_interest}
                        onChange={(e) => updateFormData("q29_loan_interest", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <Label htmlFor="q29_staff" className="col-span-1">
                        Staff (how many?)
                      </Label>
                      <Input
                        id="q29_staff_num"
                        type="number"
                        placeholder="Number"
                        value={formData.q29_staff_num}
                        onChange={(e) => updateFormData("q29_staff_num", e.target.value)}
                      />
                      <Input
                        id="q29_staff"
                        type="number"
                        placeholder="$ Cost"
                        value={formData.q29_staff_cost}
                        onChange={(e) => updateFormData("q29_staff_cost", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q29_super">Staff Superannuation @ 12% (minimum)</Label>
                      <Input
                        id="q29_super"
                        type="number"
                        placeholder="$"
                        value={formData.q29_staff_super}
                        onChange={(e) => updateFormData("q29_staff_super", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q29_equipment_lease">Office Equipment Lease Costs</Label>
                      <Input
                        id="q29_equipment_lease"
                        type="number"
                        placeholder="$"
                        value={formData.q29_equipment_lease}
                        onChange={(e) => updateFormData("q29_equipment_lease", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q29_equipment_dep">Office Equipment Depreciation</Label>
                      <Input
                        id="q29_equipment_dep"
                        type="number"
                        placeholder="$"
                        value={formData.q29_equipment_depreciation}
                        onChange={(e) => updateFormData("q29_equipment_depreciation", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q29_vehicle">Motor vehicle running expenses to/from work</Label>
                      <Input
                        id="q29_vehicle"
                        type="number"
                        placeholder="$"
                        value={formData.q29_vehicle_expenses}
                        onChange={(e) => updateFormData("q29_vehicle_expenses", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q29_council">Council Rates</Label>
                      <Input
                        id="q29_council"
                        type="number"
                        placeholder="$"
                        value={formData.q29_council_rates}
                        onChange={(e) => updateFormData("q29_council_rates", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q29_water">Water Rates</Label>
                      <Input
                        id="q29_water"
                        type="number"
                        placeholder="$"
                        value={formData.q29_water_rates}
                        onChange={(e) => updateFormData("q29_water_rates", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q29_land_tax">Land Tax</Label>
                      <Input
                        id="q29_land_tax"
                        type="number"
                        placeholder="$"
                        value={formData.q29_land_tax}
                        onChange={(e) => updateFormData("q29_land_tax", e.target.value)}
                      />
                    </div>
                    <ValidatedInput
                      label="29. Power/Electricity - Business Use %"
                      value={formData.q29_power_business_pct}
                      onChange={(v) => updateFormData("q29_power_business_pct", v)}
                      validator={(v) => validatePercentage(v, "Power business use")}
                      type="number"
                      placeholder="%"
                      required
                    />

                    <ValidatedInput
                      label="29. Phone/Internet - Business Use %"
                      value={formData.q29_phone_business_pct}
                      onChange={(v) => updateFormData("q29_phone_business_pct", v)}
                      validator={(v) => validatePercentage(v, "Phone/Internet business use")}
                      type="number"
                      placeholder="%"
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="q29_advertising">Advertising (Print, TV, Radio, Internet, etc)</Label>
                      <Input
                        id="q29_advertising"
                        type="number"
                        placeholder="$"
                        value={formData.q29_advertising}
                        onChange={(e) => updateFormData("q29_advertising", e.target.value)}
                      />
                    </div>

                    {/* Other expenses */}
                    <div className="grid grid-cols-3 gap-4">
                      <Label>Other</Label>
                      <Input
                        placeholder="Description"
                        value={formData.q29_other1_desc}
                        onChange={(e) => updateFormData("q29_other1_desc", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="$"
                        value={formData.q29_other1_amt}
                        onChange={(e) => updateFormData("q29_other1_amt", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <Label>Other</Label>
                      <Input
                        placeholder="Description"
                        value={formData.q29_other2_desc}
                        onChange={(e) => updateFormData("q29_other2_desc", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="$"
                        value={formData.q29_other2_amt}
                        onChange={(e) => updateFormData("q29_other2_amt", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <Label>Other</Label>
                      <Input
                        placeholder="Description"
                        value={formData.q29_other3_desc}
                        onChange={(e) => updateFormData("q29_other3_desc", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="$"
                        value={formData.q29_other3_amt}
                        onChange={(e) => updateFormData("q29_other3_amt", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <Label>Other</Label>
                      <Input
                        placeholder="Description"
                        value={formData.q29_other4_desc}
                        onChange={(e) => updateFormData("q29_other4_desc", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="$"
                        value={formData.q29_other4_amt}
                        onChange={(e) => updateFormData("q29_other4_amt", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Final Comments */}
                <div className="border-t pt-6 space-y-4">
                  <Label className="text-base font-semibold">
                    Finally, please indicate your top three comments or questions at this time (if any)?
                  </Label>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="comment1">1.</Label>
                      <Textarea
                        id="comment1"
                        value={formData.comment1}
                        onChange={(e) => updateFormData("comment1", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="comment2">2.</Label>
                      <Textarea
                        id="comment2"
                        value={formData.comment2}
                        onChange={(e) => updateFormData("comment2", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="comment3">3.</Label>
                      <Textarea
                        id="comment3"
                        value={formData.comment3}
                        onChange={(e) => updateFormData("comment3", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: DYH STRATEGY SELECTOR (65 Questions) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This profiler is designed to determine which of the "Deduct Your Home" Procedures can suit your
                  situation. Please complete very carefully and answer all applicable questions.
                </AlertDescription>
              </Alert>

              {/* Q1 & Q2: Assets and Liabilities */}
              <div className="border-t pt-6 space-y-4">
                <Label className="text-base font-semibold">
                  1. Please identify & estimate current value of business assets (if any)
                </Label>
                <div>
                  <Label htmlFor="ss_q1_plant">1.1 Plant & Equipment (Van, truck, car, tools, machinery, etc)</Label>
                  <Textarea
                    id="ss_q1_plant"
                    placeholder="List: Item, Owner, Date Acquired, Value $, To Be Sold? (Y/N)"
                    value={formData.ss_q1_plant_equipment}
                    onChange={(e) => updateFormData("ss_q1_plant_equipment", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ss_q1_goodwill">
                    1.2 Goodwill (client base, rent roll, multiple of annual net profits, etc)
                  </Label>
                  <Textarea
                    id="ss_q1_goodwill"
                    placeholder="List: Description, Owner, Date Acquired, Value $, To Be Sold? (Y/N)"
                    value={formData.ss_q1_goodwill}
                    onChange={(e) => updateFormData("ss_q1_goodwill", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ss_q1_ip">1.3 Intellectual Property/Patents/Trademarks</Label>
                  <Textarea
                    id="ss_q1_ip"
                    placeholder="List: Description, Owner, Date Acquired, Value $, To Be Sold? (Y/N)"
                    value={formData.ss_q1_ip_patents}
                    onChange={(e) => updateFormData("ss_q1_ip_patents", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ss_q1_property">
                    1.4 Business Real Property (Vacant land, office, workshop, factory, farm, etc)
                  </Label>
                  <Textarea
                    id="ss_q1_property"
                    placeholder="List: Description, Owner, Date Acquired, Value $, To Be Sold? (Y/N)"
                    value={formData.ss_q1_real_property}
                    onChange={(e) => updateFormData("ss_q1_real_property", e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <Label className="text-base font-semibold mb-4 block">2. Please list all business liabilities</Label>
                <Textarea
                  placeholder="List: Type (Tax debts, business loans, supplier debts, etc), Lender/Creditor, Date Incurred, Amount $"
                  value={formData.ss_q2_liabilities}
                  onChange={(e) => updateFormData("ss_q2_liabilities", e.target.value)}
                  className="min-h-[150px]"
                />
              </div>

              {/* YES/NO Questions start from Q3 */}
              <div className="border-t pt-6 space-y-6">
                <p className="text-sm text-muted-foreground">
                  Place an "X" in either YES or NO column for the following questions:
                </p>

                <div className="grid gap-2">
                  <Label>3. Do you already operate a home based business?</Label>
                  <RadioGroup value={formData.ss_q3} onValueChange={(v) => updateFormData("ss_q3", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q3_yes" />
                        <Label htmlFor="ss_q3_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q3_no" />
                        <Label htmlFor="ss_q3_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q4">4. Re (Q.3) If yes, what is it? (Please describe)</Label>
                  <Input
                    id="ss_q4"
                    value={formData.ss_q4_desc}
                    onChange={(e) => updateFormData("ss_q4_desc", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q5">5. How many people work in it?</Label>
                  <Input
                    id="ss_q5"
                    type="number"
                    value={formData.ss_q5_num}
                    onChange={(e) => updateFormData("ss_q5_num", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>6. Do more than 2 people work at your home business premises who don't live there?</Label>
                  <RadioGroup value={formData.ss_q6} onValueChange={(v) => updateFormData("ss_q6", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q6_yes" />
                        <Label htmlFor="ss_q6_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q6_no" />
                        <Label htmlFor="ss_q6_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>7. Are they employees or contractors?</Label>
                  <RadioGroup value={formData.ss_q7} onValueChange={(v) => updateFormData("ss_q7", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="employees" id="ss_q7_emp" />
                        <Label htmlFor="ss_q7_emp" className="font-normal cursor-pointer">
                          EMPLOYEES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="contractors" id="ss_q7_con" />
                        <Label htmlFor="ss_q7_con" className="font-normal cursor-pointer">
                          CONTRACTORS
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>8. If you're not already running a home based business, would you consider running one?</Label>
                  <RadioGroup value={formData.ss_q8} onValueChange={(v) => updateFormData("ss_q8", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q8_yes" />
                        <Label htmlFor="ss_q8_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q8_no" />
                        <Label htmlFor="ss_q8_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>9. Would any degree of customer presence at your home be acceptable?</Label>
                  <RadioGroup value={formData.ss_q9} onValueChange={(v) => updateFormData("ss_q9", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q9_yes" />
                        <Label htmlFor="ss_q9_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q9_no" />
                        <Label htmlFor="ss_q9_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>
                    10. Could you accept the possibility of a drop in business income for an undetermined period whilst
                    you adjusted into a home based business?
                  </Label>
                  <RadioGroup value={formData.ss_q10} onValueChange={(v) => updateFormData("ss_q10", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q10_yes" />
                        <Label htmlFor="ss_q10_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q10_no" />
                        <Label htmlFor="ss_q10_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>
                    11. Are you familiar with "business overdraft", "line of credit" or "redraw facility" banking
                    products?
                  </Label>
                  <RadioGroup value={formData.ss_q11} onValueChange={(v) => updateFormData("ss_q11", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q11_yes" />
                        <Label htmlFor="ss_q11_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q11_no" />
                        <Label htmlFor="ss_q11_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Questions 12-65 are implemented below in the same YES/NO format */}

                <div className="grid gap-2">
                  <Label>
                    12. Would you like professional assistance to strategise and monitor your business cash flow?
                  </Label>
                  <RadioGroup value={formData.ss_q12} onValueChange={(v) => updateFormData("ss_q12", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q12_yes" />
                        <Label htmlFor="ss_q12_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q12_no" />
                        <Label htmlFor="ss_q12_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>13. Would you like to buy a home (if you don't have one)?</Label>
                  <RadioGroup value={formData.ss_q13} onValueChange={(v) => updateFormData("ss_q13", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q13_yes" />
                        <Label htmlFor="ss_q13_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q13_no" />
                        <Label htmlFor="ss_q13_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>14. Could you see yourself working indefinitely from a future home based business?</Label>
                  <RadioGroup value={formData.ss_q14} onValueChange={(v) => updateFormData("ss_q14", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q14_yes" />
                        <Label htmlFor="ss_q14_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q14_no" />
                        <Label htmlFor="ss_q14_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>15. Would you like to extend your home for more space and value as a dual use property?</Label>
                  <RadioGroup value={formData.ss_q15} onValueChange={(v) => updateFormData("ss_q15", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q15_yes" />
                        <Label htmlFor="ss_q15_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q15_no" />
                        <Label htmlFor="ss_q15_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>16. Would you like to sell your current home and upgrade to a better property?</Label>
                  <RadioGroup value={formData.ss_q16} onValueChange={(v) => updateFormData("ss_q16", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q16_yes" />
                        <Label htmlFor="ss_q16_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q16_no" />
                        <Label htmlFor="ss_q16_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>17. If yes to (15) or (16), what is your preferred method?</Label>
                  <Select
                    value={formData.ss_q17_preference}
                    onValueChange={(v) => updateFormData("ss_q17_preference", v)}
                  >
                    <SelectTrigger id="ss_q17_preference">
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="extend_only">Extend only</SelectItem>
                      <SelectItem value="sell_upgrade_only">Sell/upgrade only</SelectItem>
                      <SelectItem value="extend_then_sell">Extend then sell</SelectItem>
                      <SelectItem value="sell_then_extend">Sell then extend</SelectItem>
                      <SelectItem value="no_preference">No preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q18">
                    18. If you've owned a prior or current business property, describe it here:
                  </Label>
                  <Textarea
                    id="ss_q18_desc"
                    placeholder="Description"
                    value={formData.ss_q18_desc}
                    onChange={(e) => updateFormData("ss_q18_desc", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q18_cost">18.1 What was its original cost?</Label>
                  <Input
                    id="ss_q18_cost"
                    type="number"
                    placeholder="$"
                    value={formData.ss_q18_cost}
                    onChange={(e) => updateFormData("ss_q18_cost", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q19">
                    19. If you've owned or leased a business premises, where was it located?
                  </Label>
                  <Input
                    id="ss_q19"
                    value={formData.ss_q19_location}
                    onChange={(e) => updateFormData("ss_q19_location", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q20">19.1 What was the approximate cost of the land?</Label>
                  <Input
                    id="ss_q20"
                    type="number"
                    placeholder="$"
                    value={formData.ss_q20_land_cost}
                    onChange={(e) => updateFormData("ss_q20_land_cost", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q21">21. If you've leased a business property, where was it located?</Label>
                  <Input
                    id="ss_q21"
                    value={formData.ss_q21_location}
                    onChange={(e) => updateFormData("ss_q21_location", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q21_cost">21.1 What was the annual rent?</Label>
                  <Input
                    id="ss_q21_cost"
                    type="number"
                    placeholder="$"
                    value={formData.ss_q21_cost}
                    onChange={(e) => updateFormData("ss_q21_cost", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>22. If you've had business experience, what kind?</Label>
                  <Select
                    value={formData.ss_q22_experience}
                    onValueChange={(v) => updateFormData("ss_q22_experience", v)}
                  >
                    <SelectTrigger id="ss_q22_experience">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="owner_operator">Owner Operator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q23">23. What have you learned from that experience?</Label>
                  <Textarea
                    id="ss_q23"
                    placeholder="What you've learned"
                    value={formData.ss_q23_learned}
                    onChange={(e) => updateFormData("ss_q23_learned", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>24. Would you consider operating your business from a purpose-built home office?</Label>
                  <RadioGroup value={formData.ss_q24} onValueChange={(v) => updateFormData("ss_q24", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q24_yes" />
                        <Label htmlFor="ss_q24_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q24_no" />
                        <Label htmlFor="ss_q24_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>25. Could you accommodate a purpose-built home business office?</Label>
                  <RadioGroup value={formData.ss_q25} onValueChange={(v) => updateFormData("ss_q25", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q25_yes" />
                        <Label htmlFor="ss_q25_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q25_no" />
                        <Label htmlFor="ss_q25_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>26. Could you benefit from improved business asset protection?</Label>
                  <RadioGroup value={formData.ss_q26} onValueChange={(v) => updateFormData("ss_q26", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q26_yes" />
                        <Label htmlFor="ss_q26_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q26_no" />
                        <Label htmlFor="ss_q26_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>27. Could you benefit from improved asset protection for your home and investments?</Label>
                  <RadioGroup value={formData.ss_q27} onValueChange={(v) => updateFormData("ss_q27", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q27_yes" />
                        <Label htmlFor="ss_q27_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q27_no" />
                        <Label htmlFor="ss_q27_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>28. Are you concerned about creditors pursuing your personal assets for business debts?</Label>
                  <RadioGroup value={formData.ss_q28} onValueChange={(v) => updateFormData("ss_q28", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q28_yes" />
                        <Label htmlFor="ss_q28_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q28_no" />
                        <Label htmlFor="ss_q28_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>
                    29. If you became sick or injured, would your business be able to afford to pay you a regular income
                    for up to 1-2 years?
                  </Label>
                  <RadioGroup value={formData.ss_q29} onValueChange={(v) => updateFormData("ss_q29", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q29_yes" />
                        <Label htmlFor="ss_q29_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q29_no" />
                        <Label htmlFor="ss_q29_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>
                    30. If you became sick or injured, could you sustain your business and personal living expenses for
                    up to 1 year?
                  </Label>
                  <RadioGroup value={formData.ss_q30} onValueChange={(v) => updateFormData("ss_q30", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q30_yes" />
                        <Label htmlFor="ss_q30_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q30_no" />
                        <Label htmlFor="ss_q30_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>
                    31. Could your business afford to pay your partner a regular income during a prolonged absence by
                    you?
                  </Label>
                  <RadioGroup value={formData.ss_q31} onValueChange={(v) => updateFormData("ss_q31", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q31_yes" />
                        <Label htmlFor="ss_q31_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q31_no" />
                        <Label htmlFor="ss_q31_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>
                    32. Would you want your company to be able to afford to buy out a partner's share if they died or
                    became disabled?
                  </Label>
                  <RadioGroup value={formData.ss_q32} onValueChange={(v) => updateFormData("ss_q32", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q32_yes" />
                        <Label htmlFor="ss_q32_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q32_no" />
                        <Label htmlFor="ss_q32_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>
                    33. Would you want all business debts extinguished in the event of your death or serious disability?
                  </Label>
                  <RadioGroup value={formData.ss_q33} onValueChange={(v) => updateFormData("ss_q33", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q33_yes" />
                        <Label htmlFor="ss_q33_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q33_no" />
                        <Label htmlFor="ss_q33_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>
                    34. Would you wish your business to be able to repay debts to avoid creditors pursuing your personal
                    assets?
                  </Label>
                  <RadioGroup value={formData.ss_q34} onValueChange={(v) => updateFormData("ss_q34", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q34_yes" />
                        <Label htmlFor="ss_q34_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q34_no" />
                        <Label htmlFor="ss_q34_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>
                    35. Do you currently have any business assets or investments that are not earning a satisfactory
                    return?
                  </Label>
                  <RadioGroup value={formData.ss_q35} onValueChange={(v) => updateFormData("ss_q35", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q35_yes" />
                        <Label htmlFor="ss_q35_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q35_no" />
                        <Label htmlFor="ss_q35_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>36. What is your attitude towards "risk"?</Label>
                  <Select value={formData.ss_q36_attitude} onValueChange={(v) => updateFormData("ss_q36_attitude", v)}>
                    <SelectTrigger id="ss_q36_attitude">
                      <SelectValue placeholder="Select attitude" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very_low">Very Low</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="very_high">Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>37. Do you have a Self-Managed Super Fund (SMSF)?</Label>
                  <RadioGroup value={formData.ss_q37_smsf} onValueChange={(v) => updateFormData("ss_q37_smsf", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q37_yes" />
                        <Label htmlFor="ss_q37_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q37_no" />
                        <Label htmlFor="ss_q37_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>38. If you have an SMSF, are you either pre-retirement or post-retirement phase?</Label>
                  <RadioGroup
                    value={formData.ss_q38_pre_retirement}
                    onValueChange={(v) => updateFormData("ss_q38_pre_retirement", v)}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pre_retirement" id="ss_q38_pre" />
                        <Label htmlFor="ss_q38_pre" className="font-normal cursor-pointer">
                          PRE-RETIREMENT
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="post_retirement" id="ss_q38_post" />
                        <Label htmlFor="ss_q38_post" className="font-normal cursor-pointer">
                          POST-RETIREMENT
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q39">39. What do you like most about your current lifestyle?</Label>
                  <Textarea
                    id="ss_q39"
                    placeholder="What you like"
                    value={formData.ss_q39_likes}
                    onChange={(e) => updateFormData("ss_q39_likes", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q40">40. What do you dislike most about your current lifestyle?</Label>
                  <Textarea
                    id="ss_q40"
                    placeholder="What you dislike"
                    value={formData.ss_q40_dislikes}
                    onChange={(e) => updateFormData("ss_q40_dislikes", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>41. Would you prefer to work less hours in the future?</Label>
                  <RadioGroup value={formData.ss_q41} onValueChange={(v) => updateFormData("ss_q41", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q41_yes" />
                        <Label htmlFor="ss_q41_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q41_no" />
                        <Label htmlFor="ss_q41_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>
                    42. Could you accept a temporary reduction in business income to secure future lifestyle benefits?
                  </Label>
                  <RadioGroup value={formData.ss_q42_drop} onValueChange={(v) => updateFormData("ss_q42_drop", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q42_yes" />
                        <Label htmlFor="ss_q42_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q42_no" />
                        <Label htmlFor="ss_q42_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q43">43. If yes to (42), by how much do you anticipate the income drop?</Label>
                  <Input
                    id="ss_q43"
                    placeholder="%"
                    value={formData.ss_q43_amount}
                    onChange={(e) => updateFormData("ss_q43_amount", e.target.value)}
                  />
                </div>

                {/* Q44 - Business Outgoings */}
                <div className="border-t pt-6">
                  <Label className="text-base font-semibold mb-4 block">
                    44. Please list your main usual business outgoings (on an annual basis)
                  </Label>
                  <Alert className="bg-blue-50 border-blue-200 mb-4">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      <strong>Important:</strong> Internet and phone expenses cannot be calculated using floor space
                      percentage. Please review a typical 30-day bill and determine what percentage of usage is for
                      business purposes.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-3 ml-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="ss_q44_rent">Rent or</Label>
                      <Input
                        id="ss_q44_rent"
                        type="number"
                        placeholder="$"
                        value={formData.ss_q44_rent}
                        onChange={(e) => updateFormData("ss_q44_rent", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="ss_q44_staff_num">Staff (how many?)</Label>
                      <Input
                        id="ss_q44_staff_num"
                        type="number"
                        placeholder="Number"
                        value={formData.ss_q44_staff_num}
                        onChange={(e) => updateFormData("ss_q44_staff_num", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="ss_q44_staff">Staff Costs (incl. on-costs)</Label>
                      <Input
                        id="ss_q44_staff"
                        type="number"
                        placeholder="$"
                        value={formData.ss_q44_staff}
                        onChange={(e) => updateFormData("ss_q44_staff", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="ss_q44_super">Staff Superannuation @ 12% (minimum)</Label>
                      <Input
                        id="ss_q44_super"
                        type="number"
                        placeholder="$"
                        value={formData.ss_q44_super}
                        onChange={(e) => updateFormData("ss_q44_super", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="ss_q44_equipment_lease">Office Equipment Lease Costs</Label>
                      <Input
                        id="ss_q44_equipment_lease"
                        type="number"
                        placeholder="$"
                        value={formData.ss_q44_equipment_lease}
                        onChange={(e) => updateFormData("ss_q44_equipment_lease", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="ss_q44_equipment_dep">Office Equipment Depreciation</Label>
                      <Input
                        id="ss_q44_equipment_dep"
                        type="number"
                        placeholder="$"
                        value={formData.ss_q44_equipment_depreciation}
                        onChange={(e) => updateFormData("ss_q44_equipment_depreciation", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="ss_q44_vehicle">Motor vehicle running expenses to/from work</Label>
                      <Input
                        id="ss_q44_vehicle"
                        type="number"
                        placeholder="$"
                        value={formData.ss_q44_vehicle}
                        onChange={(e) => updateFormData("ss_q44_vehicle", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="ss_q44_council">Council Rates</Label>
                      <Input
                        id="ss_q44_council"
                        type="number"
                        placeholder="$"
                        value={formData.ss_q44_council}
                        onChange={(e) => updateFormData("ss_q44_council", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="ss_q44_water">Water Rates</Label>
                      <Input
                        id="ss_q44_water"
                        type="number"
                        placeholder="$"
                        value={formData.ss_q44_water}
                        onChange={(e) => updateFormData("ss_q44_water", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="ss_q44_land_tax">Land Tax</Label>
                      <Input
                        id="ss_q44_land_tax"
                        type="number"
                        placeholder="$"
                        value={formData.ss_q44_land_tax}
                        onChange={(e) => updateFormData("ss_q44_land_tax", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="ss_q44_power">Power (per Business Use %)</Label>
                      <Input
                        id="ss_q44_power"
                        type="number"
                        placeholder="%"
                        value={formData.ss_q44_power}
                        onChange={(e) => updateFormData("ss_q44_power", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="ss_q44_phone">Phone (per Business Use %)</Label>
                      <Input
                        id="ss_q44_phone"
                        type="number"
                        placeholder="%"
                        value={formData.ss_q44_phone}
                        onChange={(e) => updateFormData("ss_q44_phone", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="ss_q44_advertising">Advertising (Print, TV, Radio, Internet, etc)</Label>
                      <Input
                        id="ss_q44_advertising"
                        type="number"
                        placeholder="$"
                        value={formData.ss_q44_advertising}
                        onChange={(e) => updateFormData("ss_q44_advertising", e.target.value)}
                      />
                    </div>

                    {/* Other expenses */}
                    <div className="grid grid-cols-3 gap-4">
                      <Label>Other</Label>
                      <Input
                        placeholder="Description"
                        value={formData.ss_q44_other1}
                        onChange={(e) => updateFormData("ss_q44_other1", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="$"
                        value={formData.ss_q44_other1_amt}
                        onChange={(e) => updateFormData("ss_q44_other1_amt", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <Label>Other</Label>
                      <Input
                        placeholder="Description"
                        value={formData.ss_q44_other2}
                        onChange={(e) => updateFormData("ss_q44_other2", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="$"
                        value={formData.ss_q44_other2_amt}
                        onChange={(e) => updateFormData("ss_q44_other2_amt", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <Label>Other</Label>
                      <Input
                        placeholder="Description"
                        value={formData.ss_q44_other3}
                        onChange={(e) => updateFormData("ss_q44_other3", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="$"
                        value={formData.ss_q44_other3_amt}
                        onChange={(e) => updateFormData("ss_q44_other3_amt", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <Label>Other</Label>
                      <Input
                        placeholder="Description"
                        value={formData.ss_q44_other4}
                        onChange={(e) => updateFormData("ss_q44_other4", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="$"
                        value={formData.ss_q44_other4_amt}
                        onChange={(e) => updateFormData("ss_q44_other4_amt", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>45. Do you wish to legally maximise all available business taxation deductions?</Label>
                  <RadioGroup value={formData.ss_q45} onValueChange={(v) => updateFormData("ss_q45", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q45_yes" />
                        <Label htmlFor="ss_q45_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q45_no" />
                        <Label htmlFor="ss_q45_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>46. Are you concerned about protecting your home against litigants or creditors?</Label>
                  <RadioGroup value={formData.ss_q46} onValueChange={(v) => updateFormData("ss_q46", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q46_yes" />
                        <Label htmlFor="ss_q46_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q46_no" />
                        <Label htmlFor="ss_q46_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q47">47. What business skills do you have?</Label>
                  <Textarea
                    id="ss_q47"
                    placeholder="Skills"
                    value={formData.ss_q47_skills}
                    onChange={(e) => updateFormData("ss_q47_skills", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q48">48. How much time do you have available for your business?</Label>
                  <Input
                    id="ss_q48"
                    placeholder="Hours per week"
                    value={formData.ss_q48_time}
                    onChange={(e) => updateFormData("ss_q48_time", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>49. Do you intend to retire within the next 5-10 years?</Label>
                  <RadioGroup value={formData.ss_q49} onValueChange={(v) => updateFormData("ss_q49", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q49_yes" />
                        <Label htmlFor="ss_q49_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q49_no" />
                        <Label htmlFor="ss_q49_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>50. Is your spouse/partner's business currently struggling?</Label>
                  <RadioGroup value={formData.ss_q50} onValueChange={(v) => updateFormData("ss_q50", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q50_yes" />
                        <Label htmlFor="ss_q50_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q50_no" />
                        <Label htmlFor="ss_q50_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>51. Could your spouse/partner's business be relocated to your home?</Label>
                  <RadioGroup value={formData.ss_q51} onValueChange={(v) => updateFormData("ss_q51", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q51_yes" />
                        <Label htmlFor="ss_q51_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q51_no" />
                        <Label htmlFor="ss_q51_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q52">52. If yes to (51), why not?</Label>
                  <Input
                    id="ss_q52"
                    value={formData.ss_q52_why}
                    onChange={(e) => updateFormData("ss_q52_why", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>53. What is your primary pursuit?</Label>
                  <Select value={formData.ss_q53_pursuit1} onValueChange={(v) => updateFormData("ss_q53_pursuit1", v)}>
                    <SelectTrigger id="ss_q53_pursuit1">
                      <SelectValue placeholder="Select pursuit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wealth_creation">Wealth creation</SelectItem>
                      <SelectItem value="asset_protection">Asset protection</SelectItem>
                      <SelectItem value="tax_minimisation">Tax minimisation</SelectItem>
                      <SelectItem value="lifestyle_enhancement">Lifestyle enhancement</SelectItem>
                      <SelectItem value="debt_reduction">Debt reduction</SelectItem>
                      <SelectItem value="business_growth">Business growth</SelectItem>
                      <SelectItem value="retirement_planning">Retirement planning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q53_pursuit2">53.1 What is your secondary pursuit?</Label>
                  <Select value={formData.ss_q53_pursuit2} onValueChange={(v) => updateFormData("ss_q53_pursuit2", v)}>
                    <SelectTrigger id="ss_q53_pursuit2">
                      <SelectValue placeholder="Select pursuit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wealth_creation">Wealth creation</SelectItem>
                      <SelectItem value="asset_protection">Asset protection</SelectItem>
                      <SelectItem value="tax_minimisation">Tax minimisation</SelectItem>
                      <SelectItem value="lifestyle_enhancement">Lifestyle enhancement</SelectItem>
                      <SelectItem value="debt_reduction">Debt reduction</SelectItem>
                      <SelectItem value="business_growth">Business growth</SelectItem>
                      <SelectItem value="retirement_planning">Retirement planning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q53_pursuit3">53.2 What is your tertiary pursuit?</Label>
                  <Select value={formData.ss_q53_pursuit3} onValueChange={(v) => updateFormData("ss_q53_pursuit3", v)}>
                    <SelectTrigger id="ss_q53_pursuit3">
                      <SelectValue placeholder="Select pursuit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wealth_creation">Wealth creation</SelectItem>
                      <SelectItem value="asset_protection">Asset protection</SelectItem>
                      <SelectItem value="tax_minimisation">Tax minimisation</SelectItem>
                      <SelectItem value="lifestyle_enhancement">Lifestyle enhancement</SelectItem>
                      <SelectItem value="debt_reduction">Debt reduction</SelectItem>
                      <SelectItem value="business_growth">Business growth</SelectItem>
                      <SelectItem value="retirement_planning">Retirement planning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>54. What is the importance level of your primary pursuit?</Label>
                  <Select
                    value={formData.ss_q54_pursuit1_level}
                    onValueChange={(v) => updateFormData("ss_q54_pursuit1_level", v)}
                  >
                    <SelectTrigger id="ss_q54_pursuit1_level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q54_pursuit2_level">
                    54. What is the importance level of your secondary pursuit?
                  </Label>
                  <Select
                    value={formData.ss_q54_pursuit2_level}
                    onValueChange={(v) => updateFormData("ss_q54_pursuit2_level", v)}
                  >
                    <SelectTrigger id="ss_q54_pursuit2_level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q54_pursuit3_level">
                    54. What is the importance level of your tertiary pursuit?
                  </Label>
                  <Select
                    value={formData.ss_q54_pursuit3_level}
                    onValueChange={(v) => updateFormData("ss_q54_pursuit3_level", v)}
                  >
                    <SelectTrigger id="ss_q54_pursuit3_level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>55. Do you wish to protect your assets from divorce or relationship breakdown?</Label>
                  <RadioGroup value={formData.ss_q55} onValueChange={(v) => updateFormData("ss_q55", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q55_yes" />
                        <Label htmlFor="ss_q55_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q55_no" />
                        <Label htmlFor="ss_q55_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>56. What is your priority regarding your children?</Label>
                  <Select
                    value={formData.ss_q56_priority1}
                    onValueChange={(v) => updateFormData("ss_q56_priority1", v)}
                  >
                    <SelectTrigger id="ss_q56_priority1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="provide_for">Provide for them financially</SelectItem>
                      <SelectItem value="teach_entrepreneurship">Teach them entrepreneurship</SelectItem>
                      <SelectItem value="protect_inheritance">Protect their inheritance</SelectItem>
                      <SelectItem value="ensure_education">Ensure their education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q56_priority2">56. What is your secondary priority regarding your children?</Label>
                  <Select
                    value={formData.ss_q56_priority2}
                    onValueChange={(v) => updateFormData("ss_q56_priority2", v)}
                  >
                    <SelectTrigger id="ss_q56_priority2">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="provide_for">Provide for them financially</SelectItem>
                      <SelectItem value="teach_entrepreneurship">Teach them entrepreneurship</SelectItem>
                      <SelectItem value="protect_inheritance">Protect their inheritance</SelectItem>
                      <SelectItem value="ensure_education">Ensure their education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q56_priority3">56. What is your tertiary priority regarding your children?</Label>
                  <Select
                    value={formData.ss_q56_priority3}
                    onValueChange={(v) => updateFormData("ss_q56_priority3", v)}
                  >
                    <SelectTrigger id="ss_q56_priority3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="provide_for">Provide for them financially</SelectItem>
                      <SelectItem value="teach_entrepreneurship">Teach them entrepreneurship</SelectItem>
                      <SelectItem value="protect_inheritance">Protect their inheritance</SelectItem>
                      <SelectItem value="ensure_education">Ensure their education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>57. Do you wish to increase your passive income stream?</Label>
                  <RadioGroup value={formData.ss_q57} onValueChange={(v) => updateFormData("ss_q57", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q57_yes" />
                        <Label htmlFor="ss_q57_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q57_no" />
                        <Label htmlFor="ss_q57_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>58. Do you wish to reduce your personal tax burden?</Label>
                  <RadioGroup value={formData.ss_q58} onValueChange={(v) => updateFormData("ss_q58", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q58_yes" />
                        <Label htmlFor="ss_q58_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q58_no" />
                        <Label htmlFor="ss_q58_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>59. Do you wish to increase your business's profitability?</Label>
                  <RadioGroup value={formData.ss_q59} onValueChange={(v) => updateFormData("ss_q59", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q59_yes" />
                        <Label htmlFor="ss_q59_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q59_no" />
                        <Label htmlFor="ss_q59_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>60. Do you wish to increase your business's asset backing?</Label>
                  <RadioGroup value={formData.ss_q60} onValueChange={(v) => updateFormData("ss_q60", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q60_yes" />
                        <Label htmlFor="ss_q60_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q60_no" />
                        <Label htmlFor="ss_q60_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>61. Would you prefer to sell your business in the future?</Label>
                  <RadioGroup value={formData.ss_q61} onValueChange={(v) => updateFormData("ss_q61", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q61_yes" />
                        <Label htmlFor="ss_q61_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q61_no" />
                        <Label htmlFor="ss_q61_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>62. Are you interested in succession planning for your business?</Label>
                  <RadioGroup value={formData.ss_q62} onValueChange={(v) => updateFormData("ss_q62", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q62_yes" />
                        <Label htmlFor="ss_q62_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q62_no" />
                        <Label htmlFor="ss_q62_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ss_q63">63. If yes to (62), describe your succession plan.</Label>
                  <Textarea
                    id="ss_q63"
                    placeholder="Succession plan"
                    value={formData.ss_q63_desc}
                    onChange={(e) => updateFormData("ss_q63_desc", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>64. Do you wish to use your business to help fund your retirement?</Label>
                  <RadioGroup value={formData.ss_q64} onValueChange={(v) => updateFormData("ss_q64", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q64_yes" />
                        <Label htmlFor="ss_q64_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q64_no" />
                        <Label htmlFor="ss_q64_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>
                    65. Do you wish to use your business to facilitate a "buy-out" of your partner or co-owner?
                  </Label>
                  <RadioGroup value={formData.ss_q65} onValueChange={(v) => updateFormData("ss_q65", v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ss_q65_yes" />
                        <Label htmlFor="ss_q65_yes" className="font-normal cursor-pointer">
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ss_q65_no" />
                        <Label htmlFor="ss_q65_no" className="font-normal cursor-pointer">
                          NO
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p>Please review your responses and click Submit to complete your questionnaire.</p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Once submitted, your responses will be analyzed and you'll receive your personalized DYH strategy
                  recommendations.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Questionnaire"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

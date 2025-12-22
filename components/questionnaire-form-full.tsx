"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface QuestionnaireFormProps {
  userId: string
}

type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  // Q1-Q3: Business basics
  has_home_business: string
  industry_description: string
  legal_structure: string

  // Q4-Q5: Workers
  num_workers: string
  num_external_workers: string

  // Q6-Q13: Personal & Family
  marital_status: string
  annual_income: string
  partner_income: string
  num_children: string
  children_ages: string
  children_incomes: string
  employment_status: string
  partner_employment_status: string

  // Q14-Q16: Property
  is_renting: string
  home_paid_off_or_owing: string
  home_value: string

  // Q17-Q18: Debts
  personal_debts: string
  partner_debts: string

  // Q19-Q22: Property suitability
  home_suitable_for_business: string
  prefer_move_or_extend: string
  total_floor_space_sqm: string
  business_floor_space_sqm: string

  // Q23-Q24: Additional spaces
  sheds_count: string
  sheds_sizes: string
  driveways_count: string
  carports_count: string
  garages_count: string
  patios_count: string
  patios_sizes: string
  uncovered_count: string
  uncovered_sizes: string

  sheds_business_sqm: string
  driveways_business_sqm: string
  carports_business_sqm: string
  garages_business_sqm: string
  patios_business_sqm: string
  uncovered_business_sqm: string

  // Q25-Q28: History
  years_operating_from_home: string
  past_exclusive_use_sqm: string
  years_claimed_mortgage_interest: string
  used_accountant: string

  // Q29-Q32: Accountant & Premises
  knows_professional_indemnity: string
  has_rented_premises: string
  attachment_to_accountant: string
  annual_premises_cost: string

  // Q33
  is_gst_registered: string

  // Additional comments
  comment_1: string
  comment_2: string
  comment_3: string
}

export default function QuestionnaireFormFull({ userId }: QuestionnaireFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    has_home_business: "",
    industry_description: "",
    legal_structure: "",
    num_workers: "",
    num_external_workers: "",
    marital_status: "",
    annual_income: "",
    partner_income: "",
    num_children: "",
    children_ages: "",
    children_incomes: "",
    employment_status: "",
    partner_employment_status: "",
    is_renting: "",
    home_paid_off_or_owing: "",
    home_value: "",
    personal_debts: "",
    partner_debts: "",
    home_suitable_for_business: "",
    prefer_move_or_extend: "",
    total_floor_space_sqm: "",
    business_floor_space_sqm: "",
    sheds_count: "",
    sheds_sizes: "",
    driveways_count: "",
    carports_count: "",
    garages_count: "",
    patios_count: "",
    patios_sizes: "",
    uncovered_count: "",
    uncovered_sizes: "",
    sheds_business_sqm: "",
    driveways_business_sqm: "",
    carports_business_sqm: "",
    garages_business_sqm: "",
    patios_business_sqm: "",
    uncovered_business_sqm: "",
    years_operating_from_home: "",
    past_exclusive_use_sqm: "",
    years_claimed_mortgage_interest: "",
    used_accountant: "",
    knows_professional_indemnity: "",
    has_rented_premises: "",
    attachment_to_accountant: "",
    annual_premises_cost: "",
    is_gst_registered: "",
    comment_1: "",
    comment_2: "",
    comment_3: "",
  })

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("questionnaire_responses")
        .insert({
          user_id: userId,
          status: "completed",
          full_name: formData.industry_description, // Placeholder
          responses_json: formData,
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
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const progress = (currentStep / 5) * 100

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">Step {currentStep} of 5</p>
      </div>

      {error && <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Business & Personal Information"}
            {currentStep === 2 && "Property & Financial Details"}
            {currentStep === 3 && "Property Spaces & Business Use"}
            {currentStep === 4 && "Business History & Accountant"}
            {currentStep === 5 && "Review & Additional Comments"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Tell us about your business and family situation"}
            {currentStep === 2 && "Property ownership and financial position"}
            {currentStep === 3 && "Detailed property measurements for business use"}
            {currentStep === 4 && "Your business history and professional relationships"}
            {currentStep === 5 && "Review and provide any additional information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Business & Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Q1 */}
              <div className="grid gap-2">
                <Label>1. Do You already have a home business?</Label>
                <RadioGroup
                  value={formData.has_home_business}
                  onValueChange={(v) => updateFormData("has_home_business", v)}
                >
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="has_home_business_yes" />
                      <Label htmlFor="has_home_business_yes" className="font-normal cursor-pointer">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="has_home_business_no" />
                      <Label htmlFor="has_home_business_no" className="font-normal cursor-pointer">
                        No
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Q2 */}
              <div className="grid gap-2">
                <Label htmlFor="industry_description">2. Industry/description?</Label>
                <Input
                  id="industry_description"
                  value={formData.industry_description}
                  onChange={(e) => updateFormData("industry_description", e.target.value)}
                  placeholder="e.g., IT Consulting, Accounting Services"
                />
              </div>

              {/* Q3 */}
              <div className="grid gap-2">
                <Label htmlFor="legal_structure">3. Legal structure of the business:</Label>
                <Select value={formData.legal_structure} onValueChange={(v) => updateFormData("legal_structure", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select structure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sole_trader">Sole Trader</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="trust">Trust</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Q4 */}
              <div className="grid gap-2">
                <Label htmlFor="num_workers">4. How many people work in the business?</Label>
                <Input
                  id="num_workers"
                  type="number"
                  value={formData.num_workers}
                  onChange={(e) => updateFormData("num_workers", e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Q5 */}
              <div className="grid gap-2">
                <Label htmlFor="num_external_workers">
                  5. Further to (4), if applicable, how many workers other than those who live there frequent your home?
                </Label>
                <Input
                  id="num_external_workers"
                  type="number"
                  value={formData.num_external_workers}
                  onChange={(e) => updateFormData("num_external_workers", e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Q6 */}
              <div className="grid gap-2">
                <Label htmlFor="marital_status">6. Your marital Status?</Label>
                <Select value={formData.marital_status} onValueChange={(v) => updateFormData("marital_status", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="partnered">Partnered</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Q7 */}
              <div className="grid gap-2">
                <Label htmlFor="annual_income">
                  7. Your annual personal income (current or genuinely anticipated within the next 12 months)
                </Label>
                <Input
                  id="annual_income"
                  type="number"
                  value={formData.annual_income}
                  onChange={(e) => updateFormData("annual_income", e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Q8 */}
              <div className="grid gap-2">
                <Label htmlFor="partner_income">
                  8. Your spouse/partner's annual personal income - (if applicable)
                </Label>
                <Input
                  id="partner_income"
                  type="number"
                  value={formData.partner_income}
                  onChange={(e) => updateFormData("partner_income", e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Q9 */}
              <div className="grid gap-2">
                <Label htmlFor="num_children">9. No. of children</Label>
                <Input
                  id="num_children"
                  type="number"
                  value={formData.num_children}
                  onChange={(e) => updateFormData("num_children", e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Q10 */}
              <div className="grid gap-2">
                <Label htmlFor="children_ages">10. Ages of children</Label>
                <Input
                  id="children_ages"
                  value={formData.children_ages}
                  onChange={(e) => updateFormData("children_ages", e.target.value)}
                  placeholder="e.g., 5, 8, 12"
                />
              </div>

              {/* Q11 */}
              <div className="grid gap-2">
                <Label htmlFor="children_incomes">11. Annual incomes of the children - (if applicable)</Label>
                <Input
                  id="children_incomes"
                  value={formData.children_incomes}
                  onChange={(e) => updateFormData("children_incomes", e.target.value)}
                  placeholder="e.g., 0, 5000, 12000"
                />
              </div>

              {/* Q12 */}
              <div className="grid gap-2">
                <Label htmlFor="employment_status">12. Employment status:</Label>
                <Select
                  value={formData.employment_status}
                  onValueChange={(v) => updateFormData("employment_status", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="proprietor">Proprietor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Q13 */}
              <div className="grid gap-2">
                <Label htmlFor="partner_employment_status">13. Your partner's employment status:</Label>
                <Select
                  value={formData.partner_employment_status}
                  onValueChange={(v) => updateFormData("partner_employment_status", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="proprietor">Proprietor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Property & Financial Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Q14 */}
              <div className="grid gap-2">
                <Label>14. Are you renting?</Label>
                <RadioGroup value={formData.is_renting} onValueChange={(v) => updateFormData("is_renting", v)}>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="is_renting_yes" />
                      <Label htmlFor="is_renting_yes" className="font-normal cursor-pointer">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="is_renting_no" />
                      <Label htmlFor="is_renting_no" className="font-normal cursor-pointer">
                        No
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Q15 */}
              <div className="grid gap-2">
                <Label htmlFor="home_paid_off_or_owing">
                  15. Have you paid off your home or are you paying it off? (Amount Owing $)
                </Label>
                <Input
                  id="home_paid_off_or_owing"
                  value={formData.home_paid_off_or_owing}
                  onChange={(e) => updateFormData("home_paid_off_or_owing", e.target.value)}
                  placeholder="Enter 'Paid For' or amount owing"
                />
              </div>

              {/* Q16 */}
              <div className="grid gap-2">
                <Label htmlFor="home_value">
                  16. Conservative estimated value of your current or anticipated future Home?
                </Label>
                <Input
                  id="home_value"
                  type="number"
                  value={formData.home_value}
                  onChange={(e) => updateFormData("home_value", e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Q17 */}
              <div className="grid gap-2">
                <Label htmlFor="personal_debts">
                  17. Approximate balance of your personal debts (car loans, personal loans, credit cards etc)?
                </Label>
                <Input
                  id="personal_debts"
                  type="number"
                  value={formData.personal_debts}
                  onChange={(e) => updateFormData("personal_debts", e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Q18 */}
              <div className="grid gap-2">
                <Label htmlFor="partner_debts">
                  18. Approximate balance of your partner's personal debts (car loans, personal loans, credit cards
                  etc)?
                </Label>
                <Input
                  id="partner_debts"
                  type="number"
                  value={formData.partner_debts}
                  onChange={(e) => updateFormData("partner_debts", e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Q19 */}
              <div className="grid gap-2">
                <Label>19. Is your home genuinely large enough and well suited for a home business?</Label>
                <RadioGroup
                  value={formData.home_suitable_for_business}
                  onValueChange={(v) => updateFormData("home_suitable_for_business", v)}
                >
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="home_suitable_yes" />
                      <Label htmlFor="home_suitable_yes" className="font-normal cursor-pointer">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="home_suitable_no" />
                      <Label htmlFor="home_suitable_no" className="font-normal cursor-pointer">
                        No
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Q20 */}
              <div className="grid gap-2">
                <Label htmlFor="prefer_move_or_extend">20. If no to (19), would you prefer to move or to extend?</Label>
                <Select
                  value={formData.prefer_move_or_extend}
                  onValueChange={(v) => updateFormData("prefer_move_or_extend", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="move">Move</SelectItem>
                    <SelectItem value="extend">Extend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Q21 */}
              <div className="grid gap-2">
                <Label htmlFor="total_floor_space_sqm">
                  21. Approximate total m² of floor space under the main roof (excluding carports, garages and patios
                  etc)?
                </Label>
                <Input
                  id="total_floor_space_sqm"
                  type="number"
                  value={formData.total_floor_space_sqm}
                  onChange={(e) => updateFormData("total_floor_space_sqm", e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Q22 */}
              <div className="grid gap-2">
                <Label htmlFor="business_floor_space_sqm">
                  22. Total m² at (21), as able to be dedicated to business use (think about any unused rooms such as
                  bedrooms, formal lounge, formal dining, games room, etc)?
                </Label>
                <Input
                  id="business_floor_space_sqm"
                  type="number"
                  value={formData.business_floor_space_sqm}
                  onChange={(e) => updateFormData("business_floor_space_sqm", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {/* Step 3: Property Spaces & Business Use */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Question 23 & 24: Additional Spaces</h4>
                <p className="text-sm text-blue-800">
                  Please provide details about additional spaces on your property and how much can be used for business.
                </p>
              </div>

              {/* Q23: Sheds */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Sheds</h4>
                <div className="grid gap-2">
                  <Label htmlFor="sheds_count">Number of Sheds</Label>
                  <Input
                    id="sheds_count"
                    type="number"
                    value={formData.sheds_count}
                    onChange={(e) => updateFormData("sheds_count", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sheds_sizes">Size(s) in m² (separate multiple with /)</Label>
                  <Input
                    id="sheds_sizes"
                    value={formData.sheds_sizes}
                    onChange={(e) => updateFormData("sheds_sizes", e.target.value)}
                    placeholder="e.g., 20 / 30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sheds_business_sqm">24. Total m² for business use</Label>
                  <Input
                    id="sheds_business_sqm"
                    type="number"
                    value={formData.sheds_business_sqm}
                    onChange={(e) => updateFormData("sheds_business_sqm", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Q23: Driveways */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Driveways</h4>
                <div className="grid gap-2">
                  <Label htmlFor="driveways_count">Number (Single / Double / Triple / Quadruple)</Label>
                  <Input
                    id="driveways_count"
                    value={formData.driveways_count}
                    onChange={(e) => updateFormData("driveways_count", e.target.value)}
                    placeholder="e.g., 1 Double"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="driveways_business_sqm">24. Total m² for business use</Label>
                  <Input
                    id="driveways_business_sqm"
                    type="number"
                    value={formData.driveways_business_sqm}
                    onChange={(e) => updateFormData("driveways_business_sqm", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Q23: Carports */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Carports</h4>
                <div className="grid gap-2">
                  <Label htmlFor="carports_count">Number (Single / Double / Triple / Quadruple)</Label>
                  <Input
                    id="carports_count"
                    value={formData.carports_count}
                    onChange={(e) => updateFormData("carports_count", e.target.value)}
                    placeholder="e.g., 1 Single"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="carports_business_sqm">24. Total m² for business use</Label>
                  <Input
                    id="carports_business_sqm"
                    type="number"
                    value={formData.carports_business_sqm}
                    onChange={(e) => updateFormData("carports_business_sqm", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Q23: Garages */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Garages</h4>
                <div className="grid gap-2">
                  <Label htmlFor="garages_count">Number (Single / Double / Triple / Quadruple)</Label>
                  <Input
                    id="garages_count"
                    value={formData.garages_count}
                    onChange={(e) => updateFormData("garages_count", e.target.value)}
                    placeholder="e.g., 1 Double"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="garages_business_sqm">24. Total m² for business use</Label>
                  <Input
                    id="garages_business_sqm"
                    type="number"
                    value={formData.garages_business_sqm}
                    onChange={(e) => updateFormData("garages_business_sqm", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Q23: Patios */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Patios</h4>
                <div className="grid gap-2">
                  <Label htmlFor="patios_count">Number</Label>
                  <Input
                    id="patios_count"
                    type="number"
                    value={formData.patios_count}
                    onChange={(e) => updateFormData("patios_count", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="patios_sizes">Size(s) in m² (separate multiple with /)</Label>
                  <Input
                    id="patios_sizes"
                    value={formData.patios_sizes}
                    onChange={(e) => updateFormData("patios_sizes", e.target.value)}
                    placeholder="e.g., 25 / 15"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="patios_business_sqm">24. Total m² for business use</Label>
                  <Input
                    id="patios_business_sqm"
                    type="number"
                    value={formData.patios_business_sqm}
                    onChange={(e) => updateFormData("patios_business_sqm", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Q23: Uncovered Areas */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Uncovered Areas</h4>
                <div className="grid gap-2">
                  <Label htmlFor="uncovered_count">Number</Label>
                  <Input
                    id="uncovered_count"
                    type="number"
                    value={formData.uncovered_count}
                    onChange={(e) => updateFormData("uncovered_count", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="uncovered_sizes">Size(s) in m² (separate multiple with /)</Label>
                  <Input
                    id="uncovered_sizes"
                    value={formData.uncovered_sizes}
                    onChange={(e) => updateFormData("uncovered_sizes", e.target.value)}
                    placeholder="e.g., 50 / 30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="uncovered_business_sqm">24. Total m² for business use</Label>
                  <Input
                    id="uncovered_business_sqm"
                    type="number"
                    value={formData.uncovered_business_sqm}
                    onChange={(e) => updateFormData("uncovered_business_sqm", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Business History & Accountant */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Q25 */}
              <div className="grid gap-2">
                <Label htmlFor="years_operating_from_home">
                  25. How many years have You operated Your business at or from your current or prior home?
                </Label>
                <Input
                  id="years_operating_from_home"
                  type="number"
                  value={formData.years_operating_from_home}
                  onChange={(e) => updateFormData("years_operating_from_home", e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Q26 */}
              <div className="grid gap-2">
                <Label htmlFor="past_exclusive_use_sqm">
                  26. What do you estimate the total m² to be of the spaces You've already been using exclusively for
                  business in the past?
                </Label>
                <Input
                  id="past_exclusive_use_sqm"
                  type="number"
                  value={formData.past_exclusive_use_sqm}
                  onChange={(e) => updateFormData("past_exclusive_use_sqm", e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Q27 */}
              <div className="grid gap-2">
                <Label htmlFor="years_claimed_mortgage_interest">
                  27. Further to 25, for how many of those did you previously claim mortgage interest and council rates
                  etc?
                </Label>
                <Input
                  id="years_claimed_mortgage_interest"
                  type="number"
                  value={formData.years_claimed_mortgage_interest}
                  onChange={(e) => updateFormData("years_claimed_mortgage_interest", e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Q28 */}
              <div className="grid gap-2">
                <Label>28. Further to 27, have you been using an accountant?</Label>
                <RadioGroup
                  value={formData.used_accountant}
                  onValueChange={(v) => updateFormData("used_accountant", v)}
                >
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="used_accountant_yes" />
                      <Label htmlFor="used_accountant_yes" className="font-normal cursor-pointer">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="used_accountant_no" />
                      <Label htmlFor="used_accountant_no" className="font-normal cursor-pointer">
                        No
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Q29 */}
              <div className="grid gap-2">
                <Label>
                  29. Do you know that all public accountants such as Us must carry professional indemnity insurance?
                </Label>
                <RadioGroup
                  value={formData.knows_professional_indemnity}
                  onValueChange={(v) => updateFormData("knows_professional_indemnity", v)}
                >
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="knows_indemnity_yes" />
                      <Label htmlFor="knows_indemnity_yes" className="font-normal cursor-pointer">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="knows_indemnity_no" />
                      <Label htmlFor="knows_indemnity_no" className="font-normal cursor-pointer">
                        No
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Q30 */}
              <div className="grid gap-2">
                <Label>
                  30. Do you or your partner have rented premises for another business that you could relocate as a home
                  business instead?
                </Label>
                <RadioGroup
                  value={formData.has_rented_premises}
                  onValueChange={(v) => updateFormData("has_rented_premises", v)}
                >
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="has_rented_yes" />
                      <Label htmlFor="has_rented_yes" className="font-normal cursor-pointer">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="has_rented_no" />
                      <Label htmlFor="has_rented_no" className="font-normal cursor-pointer">
                        No
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Q31 */}
              <div className="grid gap-2">
                <Label htmlFor="attachment_to_accountant">
                  31. On a scale of 1 -10 (with 10 being optimum), how attached are you to your current accountant?
                </Label>
                <Input
                  id="attachment_to_accountant"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.attachment_to_accountant}
                  onChange={(e) => updateFormData("attachment_to_accountant", e.target.value)}
                  placeholder="5"
                />
              </div>

              {/* Q32 */}
              <div className="grid gap-2">
                <Label htmlFor="annual_premises_cost">
                  32. Further to 30, if applicable, what is the approximate annual cost of yours or your partner's
                  rented business premises plus associated expenses e.g. real estate agency mgt fees and outgoings?
                </Label>
                <Input
                  id="annual_premises_cost"
                  type="number"
                  value={formData.annual_premises_cost}
                  onChange={(e) => updateFormData("annual_premises_cost", e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Q33 */}
              <div className="grid gap-2">
                <Label>33. Is your business GST registered?</Label>
                <RadioGroup
                  value={formData.is_gst_registered}
                  onValueChange={(v) => updateFormData("is_gst_registered", v)}
                >
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="is_gst_yes" />
                      <Label htmlFor="is_gst_yes" className="font-normal cursor-pointer">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="is_gst_no" />
                      <Label htmlFor="is_gst_no" className="font-normal cursor-pointer">
                        No
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 5: Review & Comments */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Additional Comments or Questions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Please indicate your top three comments or questions at this time (if any):
                </p>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="comment_1">1.</Label>
                    <Textarea
                      id="comment_1"
                      value={formData.comment_1}
                      onChange={(e) => updateFormData("comment_1", e.target.value)}
                      placeholder="Your first comment or question..."
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="comment_2">2.</Label>
                    <Textarea
                      id="comment_2"
                      value={formData.comment_2}
                      onChange={(e) => updateFormData("comment_2", e.target.value)}
                      placeholder="Your second comment or question..."
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="comment_3">3.</Label>
                    <Textarea
                      id="comment_3"
                      value={formData.comment_3}
                      onChange={(e) => updateFormData("comment_3", e.target.value)}
                      placeholder="Your third comment or question..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-semibold mb-2">Review Your Responses</h3>
                <p className="text-sm text-muted-foreground">
                  Please review all your answers before submitting. You can go back to any previous step to make
                  changes.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || isLoading}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep < 5 ? (
                <Button onClick={nextStep} disabled={isLoading}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Questionnaire"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

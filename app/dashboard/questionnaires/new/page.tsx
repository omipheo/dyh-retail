"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { calculateDeductions } from "@/lib/calculations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { QuestionnaireProgress } from "@/components/questionnaire-progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { SaveProgressDialog } from "@/components/save-progress-dialog"
import { IPWarningBanner } from "@/components/ip-warning-banner"

const STEPS = ["Home Office", "Property", "Vehicle", "Equipment", "Review"]

export default function NewQuestionnairePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedSessionToken, setSavedSessionToken] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")

  // Form state
  const [formData, setFormData] = useState({
    // Home Office
    total_floor_area: "",
    office_area: "",
    hours_per_week: "",

    // Property
    property_type: "",
    is_owner_occupied: true,
    annual_mortgage_interest: "",
    annual_rent: "",
    annual_property_insurance: "",
    annual_council_rates: "",
    annual_electricity: "",
    annual_gas: "",
    annual_water: "",
    annual_internet: "",
    annual_phone: "",
    annual_cleaning: "",
    annual_maintenance: "",

    // Vehicle
    has_vehicle: false,
    vehicle_type: "",
    annual_vehicle_kms: "",
    business_kms: "",

    // Equipment
    equipment_purchases: [] as Array<{ item: string; cost: string; date: string }>,
  })

  const updateFormData = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Not authenticated")
      }

      // Calculate percentages
      const officePercentage =
        formData.total_floor_area && formData.office_area
          ? (Number.parseFloat(formData.office_area) / Number.parseFloat(formData.total_floor_area)) * 100
          : null

      const businessPercentage =
        formData.annual_vehicle_kms && formData.business_kms
          ? (Number.parseFloat(formData.business_kms) / Number.parseFloat(formData.annual_vehicle_kms)) * 100
          : null

      const { data: questionnaireData, error: questionnaireError } = await supabase
        .from("questionnaires")
        .insert({
          user_id: user.id,
          status: "completed",
          total_floor_area: Number.parseFloat(formData.total_floor_area) || null,
          office_area: Number.parseFloat(formData.office_area) || null,
          office_percentage: officePercentage,
          hours_per_week: Number.parseFloat(formData.hours_per_week) || null,
          property_type: formData.property_type,
          is_owner_occupied: formData.is_owner_occupied,
          annual_mortgage_interest: Number.parseFloat(formData.annual_mortgage_interest) || null,
          annual_rent: Number.parseFloat(formData.annual_rent) || null,
          annual_property_insurance: Number.parseFloat(formData.annual_property_insurance) || null,
          annual_council_rates: Number.parseFloat(formData.annual_council_rates) || null,
          annual_electricity: Number.parseFloat(formData.annual_electricity) || null,
          annual_gas: Number.parseFloat(formData.annual_gas) || null,
          annual_water: Number.parseFloat(formData.annual_water) || null,
          annual_internet: Number.parseFloat(formData.annual_internet) || null,
          annual_phone: Number.parseFloat(formData.annual_phone) || null,
          annual_cleaning: Number.parseFloat(formData.annual_cleaning) || null,
          annual_maintenance: Number.parseFloat(formData.annual_maintenance) || null,
          has_vehicle: formData.has_vehicle,
          vehicle_type: formData.vehicle_type || null,
          annual_vehicle_kms: Number.parseFloat(formData.annual_vehicle_kms) || null,
          business_kms: Number.parseFloat(formData.business_kms) || null,
          business_percentage: businessPercentage,
          equipment_purchases: formData.equipment_purchases,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (questionnaireError) throw questionnaireError

      // Calculate deductions
      const calculations = calculateDeductions(questionnaireData)

      // Create report
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          questionnaire_id: questionnaireData.id,
          home_office_deduction: calculations.homeOfficeDeduction,
          vehicle_deduction: calculations.vehicleDeduction,
          equipment_deduction: calculations.equipmentDeduction,
          total_deductions: calculations.totalDeductions,
          estimated_tax_saving: calculations.estimatedTaxSaving,
          report_data: {
            homeOfficeBreakdown: calculations.homeOfficeBreakdown,
            calculationDate: new Date().toISOString(),
          },
        })
        .select()
        .single()

      if (reportError) throw reportError

      // Redirect to report
      router.push(`/dashboard/reports/${reportData.id}`)
    } catch (err) {
      console.error("Error submitting questionnaire:", err)
      setError(err instanceof Error ? err.message : "Failed to submit questionnaire")
    } finally {
      setIsLoading(false)
    }
  }

  const addEquipment = () => {
    setFormData((prev) => ({
      ...prev,
      equipment_purchases: [...prev.equipment_purchases, { item: "", cost: "", date: "" }],
    }))
  }

  const updateEquipment = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment_purchases: prev.equipment_purchases.map((eq, i) => (i === index ? { ...eq, [field]: value } : eq)),
    }))
  }

  const removeEquipment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      equipment_purchases: prev.equipment_purchases.filter((_, i) => i !== index),
    }))
  }

  useEffect(() => {
    const loadUserEmail = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    loadUserEmail()
  }, [])

  const handleResumeProgress = (resumedData: Record<string, any>, resumedStep: number, token: string) => {
    setFormData(resumedData)
    setCurrentStep(resumedStep)
    setSavedSessionToken(token)
  }

  const handleSessionSaved = (token: string) => {
    setSavedSessionToken(token)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* IP Warning Banner at the top */}
      <IPWarningBanner />

      <Card>
        <CardHeader>
          <CardTitle>Deduction Questionnaire</CardTitle>
          <QuestionnaireProgress currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />
        </CardHeader>
        <CardContent>
          {/* Step 0: Home Office */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="text-xl mb-2">Home Office Details</CardTitle>
                <CardDescription>Information about your home office space</CardDescription>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="total_floor_area">Total Home Floor Area (m²)</Label>
                  <Input
                    id="total_floor_area"
                    type="number"
                    placeholder="150"
                    value={formData.total_floor_area}
                    onChange={(e) => updateFormData("total_floor_area", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="office_area">Office Area (m²)</Label>
                  <Input
                    id="office_area"
                    type="number"
                    placeholder="15"
                    value={formData.office_area}
                    onChange={(e) => updateFormData("office_area", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="hours_per_week">Hours Per Week in Office</Label>
                  <Input
                    id="hours_per_week"
                    type="number"
                    placeholder="40"
                    value={formData.hours_per_week}
                    onChange={(e) => updateFormData("hours_per_week", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Property */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="text-xl mb-2">Property Details</CardTitle>
                <CardDescription>Information about your property and expenses</CardDescription>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Property Type</Label>
                  <RadioGroup
                    value={formData.property_type}
                    onValueChange={(value) => updateFormData("property_type", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="house" id="house" />
                      <Label htmlFor="house">House</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="apartment" id="apartment" />
                      <Label htmlFor="apartment">Apartment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="townhouse" id="townhouse" />
                      <Label htmlFor="townhouse">Townhouse</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_owner_occupied"
                    checked={formData.is_owner_occupied}
                    onCheckedChange={(checked) => updateFormData("is_owner_occupied", checked)}
                  />
                  <Label htmlFor="is_owner_occupied">I own this property</Label>
                </div>

                {formData.is_owner_occupied ? (
                  <div>
                    <Label htmlFor="annual_mortgage_interest">Annual Mortgage Interest ($)</Label>
                    <Input
                      id="annual_mortgage_interest"
                      type="number"
                      placeholder="12000"
                      value={formData.annual_mortgage_interest}
                      onChange={(e) => updateFormData("annual_mortgage_interest", e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="annual_rent">Annual Rent ($)</Label>
                    <Input
                      id="annual_rent"
                      type="number"
                      placeholder="24000"
                      value={formData.annual_rent}
                      onChange={(e) => updateFormData("annual_rent", e.target.value)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="annual_property_insurance">Property Insurance ($)</Label>
                    <Input
                      id="annual_property_insurance"
                      type="number"
                      placeholder="1200"
                      value={formData.annual_property_insurance}
                      onChange={(e) => updateFormData("annual_property_insurance", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="annual_council_rates">Council Rates ($)</Label>
                    <Input
                      id="annual_council_rates"
                      type="number"
                      placeholder="1500"
                      value={formData.annual_council_rates}
                      onChange={(e) => updateFormData("annual_council_rates", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="annual_electricity">Electricity ($)</Label>
                    <Input
                      id="annual_electricity"
                      type="number"
                      placeholder="1800"
                      value={formData.annual_electricity}
                      onChange={(e) => updateFormData("annual_electricity", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="annual_gas">Gas ($)</Label>
                    <Input
                      id="annual_gas"
                      type="number"
                      placeholder="600"
                      value={formData.annual_gas}
                      onChange={(e) => updateFormData("annual_gas", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="annual_water">Water ($)</Label>
                    <Input
                      id="annual_water"
                      type="number"
                      placeholder="800"
                      value={formData.annual_water}
                      onChange={(e) => updateFormData("annual_water", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="annual_internet">Internet ($)</Label>
                    <Input
                      id="annual_internet"
                      type="number"
                      placeholder="960"
                      value={formData.annual_internet}
                      onChange={(e) => updateFormData("annual_internet", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="annual_phone">Phone ($)</Label>
                    <Input
                      id="annual_phone"
                      type="number"
                      placeholder="600"
                      value={formData.annual_phone}
                      onChange={(e) => updateFormData("annual_phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="annual_cleaning">Cleaning ($)</Label>
                    <Input
                      id="annual_cleaning"
                      type="number"
                      placeholder="2400"
                      value={formData.annual_cleaning}
                      onChange={(e) => updateFormData("annual_cleaning", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="annual_maintenance">Maintenance ($)</Label>
                    <Input
                      id="annual_maintenance"
                      type="number"
                      placeholder="1000"
                      value={formData.annual_maintenance}
                      onChange={(e) => updateFormData("annual_maintenance", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Vehicle */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="text-xl mb-2">Vehicle Details</CardTitle>
                <CardDescription>Information about business vehicle usage</CardDescription>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_vehicle"
                    checked={formData.has_vehicle}
                    onCheckedChange={(checked) => updateFormData("has_vehicle", checked)}
                  />
                  <Label htmlFor="has_vehicle">I use a vehicle for business purposes</Label>
                </div>

                {formData.has_vehicle && (
                  <>
                    <div>
                      <Label>Vehicle Type</Label>
                      <RadioGroup
                        value={formData.vehicle_type}
                        onValueChange={(value) => updateFormData("vehicle_type", value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="car" id="car" />
                          <Label htmlFor="car">Car</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="van" id="van" />
                          <Label htmlFor="van">Van</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="truck" id="truck" />
                          <Label htmlFor="truck">Truck</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="annual_vehicle_kms">Total Annual Kilometers</Label>
                      <Input
                        id="annual_vehicle_kms"
                        type="number"
                        placeholder="15000"
                        value={formData.annual_vehicle_kms}
                        onChange={(e) => updateFormData("annual_vehicle_kms", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="business_kms">Business Kilometers</Label>
                      <Input
                        id="business_kms"
                        type="number"
                        placeholder="10000"
                        value={formData.business_kms}
                        onChange={(e) => updateFormData("business_kms", e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Equipment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="text-xl mb-2">Equipment Purchases</CardTitle>
                <CardDescription>Add any business equipment purchased this financial year</CardDescription>
              </div>

              <div className="space-y-4">
                {formData.equipment_purchases.map((equipment, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`item-${index}`}>Item Name</Label>
                        <Input
                          id={`item-${index}`}
                          placeholder="Laptop"
                          value={equipment.item}
                          onChange={(e) => updateEquipment(index, "item", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`cost-${index}`}>Cost ($)</Label>
                        <Input
                          id={`cost-${index}`}
                          type="number"
                          placeholder="2000"
                          value={equipment.cost}
                          onChange={(e) => updateEquipment(index, "cost", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`date-${index}`}>Purchase Date</Label>
                        <Input
                          id={`date-${index}`}
                          type="date"
                          value={equipment.date}
                          onChange={(e) => updateEquipment(index, "date", e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-destructive"
                      onClick={() => removeEquipment(index)}
                    >
                      Remove
                    </Button>
                  </Card>
                ))}

                <Button type="button" variant="outline" onClick={addEquipment} className="w-full bg-transparent">
                  Add Equipment
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="text-xl mb-2">Review Your Information</CardTitle>
                <CardDescription>Please review your details before submitting</CardDescription>
              </div>

              <div className="space-y-4">
                <Card className="p-4 bg-muted/50">
                  <h3 className="font-bold mb-2">Home Office</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Total Floor Area: {formData.total_floor_area}m²</p>
                    <p>Office Area: {formData.office_area}m²</p>
                    <p>Hours Per Week: {formData.hours_per_week}</p>
                  </div>
                </Card>

                <Card className="p-4 bg-muted/50">
                  <h3 className="font-bold mb-2">Property</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Type: {formData.property_type}</p>
                    <p>Ownership: {formData.is_owner_occupied ? "Owner" : "Renter"}</p>
                  </div>
                </Card>

                {formData.has_vehicle && (
                  <Card className="p-4 bg-muted/50">
                    <h3 className="font-bold mb-2">Vehicle</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>Type: {formData.vehicle_type}</p>
                      <p>Business KMs: {formData.business_kms}</p>
                    </div>
                  </Card>
                )}

                {formData.equipment_purchases.length > 0 && (
                  <Card className="p-4 bg-muted/50">
                    <h3 className="font-bold mb-2">Equipment</h3>
                    <p className="text-sm">{formData.equipment_purchases.length} items</p>
                  </Card>
                )}
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button onClick={handleBack} variant="outline" disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="flex gap-2">
              {userEmail && currentStep < STEPS.length - 1 && (
                <SaveProgressDialog
                  email={userEmail}
                  questionnaireType="dashboard"
                  formData={formData}
                  currentStep={currentStep}
                  existingToken={savedSessionToken || undefined}
                  onSaved={handleSessionSaved}
                />
              )}

              {currentStep < STEPS.length - 1 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Questionnaire"}
                </Button>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

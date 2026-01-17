"use client"

import { useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import YouTube, { type YouTubeEvent } from "react-youtube"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle2, Info } from "lucide-react"
import { determineStrategy, extractNoAnswers, type StrategyMatch } from "@/lib/strategy-selector"
import { SaveProgressDialog } from "@/components/save-progress-dialog"
import { ResumeProgressDialog } from "@/components/resume-progress-dialog"
import { IPWarningBanner } from "@/components/ip-warning-banner"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const STEPS = ["Contact Details", "Quick Questionnaire", "Strategy Selector", "Complete"]

const initialFormData = {
  // Contact Details
  fullName: "",
  email: "",
  phone: "",
  streetAddress: "",
  suburb: "",
  state: "",
  postcode: "",

  // Quick Questionnaire (29 Questions)
  q_age: "",
  q_mortgage_balance: "",
  q1_marital_status: "",
  q2_annual_income: "",
  q3_partner_income: "",
  q4_num_children: "",
  q5_ages_children: "",
  q6_children_income: "",
  q7_employment_status: "",
  q8_partner_employment_status: "",
  q9_renting: "",
  q10_home_paid: "",
  q10_amount_owing: "",
  q11_home_value: "",
  q12_personal_debts: "",
  q13_partner_debts: "",
  q14_home_suitable: "",
  q15_move_extend: "",
  q16_total_floor_space: "",
  q17_business_floor_space: "",
  q18_sheds_num: "", // This field is now used for Q18: Principal source of income
  q18_sheds_size: "",
  q18_driveways_num: "",
  q18_driveways_size: "",
  q18_carports_num: "",
  q18_carports_size: "",
  q18_garages_num: "",
  q18_garages_size: "",
  q18_patios_num: "",
  q18_patios_size: "",
  q18_uncovered_num: "",
  q18_uncovered_size: "",
  q18_vehicles_business: "",
  q18_vehicles_personal: "",
  q19_sheds: "",
  q19_driveways: "",
  q19_carports: "",
  q19_garages: "",
  q19_patios: "",
  q19_uncovered: "",
  q20_years_operating: "",
  q21_past_business_space: "",
  q22_years_claimed: "",
  q23_using_accountant: "",
  q24_know_insurance: "",
  q25_accountant_attachment: "",
  q26_rented_premises: "",
  q27_rental_cost: "",
  q28_gst_registered: "",
  q29_comment1: "",
  q29_comment2: "",
  q29_comment3: "",

  // Business Outgoings
  q29_rent_or: "",
  q29_premises_loan_interest: "",
  q29_staff_number: "",
  q29_staff_cost: "",
  q29_staff_super: "",
  q29_office_equipment_lease: "",
  q29_office_equipment_depreciation: "",
  q29_motor_vehicle_expenses: "",
  q29_council_rates: "",
  q29_water_rates: "",
  q29_land_tax: "",
  q29_power_electricity_percent: "",
  // New fields for power/electricity dollar amounts
  q31_power_electricity_amount: "",
  q29_phone_internet_percent: "",
  // New fields for phone/internet dollar amounts
  q33_phone_internet_amount: "",
  q29_advertising: "",
  q29_other_1_desc: "",
  q29_other_1_cost: "",
  q29_other_2_desc: "",
  q29_other_2_cost: "",
  q29_other_3_desc: "",
  q29_other_3_cost: "",
  q29_other_4_desc: "",
  q29_other_4_cost: "",

  // Added new Q30 and Q31 about employees
  q30_employees_at_home: "",
  q31_employees_work_from_own_home: "",

  // Added new Q32 for employee contact information
  q32_employee_0_first_name: "",
  q32_employee_0_mobile: "",
  q32_employee_0_email: "",
  q32_employee_1_first_name: "",
  q32_employee_1_mobile: "",
  q32_employee_1_email: "",
  q32_employee_2_first_name: "",
  q32_employee_2_mobile: "",
  q32_employee_2_email: "",
  q32_employee_3_first_name: "",
  q32_employee_3_mobile: "",
  q32_employee_3_email: "",

  // Strategy Selector - Original fields
  ss_q1_plant_equipment_old: "", // Renamed to avoid conflict
  ss_q1_goodwill_old: "", // Renamed to avoid conflict
  ss_q1_ip_patents_old: "", // Renamed to avoid conflict
  ss_q1_real_property_old: "", // Renamed to avoid conflict
  ss_q2_liabilities_old: "", // Renamed to avoid conflict
  ss_q22_experience: "",
  ss_q23_learned: "",
  ss_q36_attitude: "",
  ss_q37_smsf: "",
  ss_q38_pre_retirement: "",
  ss_q38_post_retirement: "",
  ss_q39_likes: "",
  ss_q40_dislikes: "",
  ss_q42_drop: "",
  ss_q43_amount: "",
  ss_q47_skills: "",
  ss_q52_why: "",
  ss_q53_pursuit1: "",
  ss_q53_pursuit2: "",
  ss_q53_pursuit3: "",
  ss_q56_priority1: "",
  ss_q56_priority2: "",
  ss_q56_priority3: "",
  ss_q63_desc: "",

  // Strategy Selector - New 64 Questions
  ss_q1_plant_equipment: "", // New field
  ss_q1_goodwill: "", // New field
  ss_q1_real_property: "", // New field
  ss_q2_liabilities: "", // New field
  ss_q3: "", // New field
  ss_q4: "", // New field
  ss_q5: "", // New field
  ss_q6: "", // New field
  ss_q7: "", // New field
  ss_q8: "", // New field
  ss_q9: "", // New field
  ss_q10: "", // New field
  ss_q11: "", // New field
  ss_q12: "", // New field
  ss_q13: "", // New field
  ss_q14: "", // New field
  ss_q15: "", // New field
  ss_q16: "", // New field
  ss_q17: "", // New field
  ss_q18: "", // New field
  ss_q19: "", // New field
  ss_q20: "", // New field
  ss_q21: "", // New field
  ss_q22_experience: "", // Existing, now mapped to ss_q22
  ss_q23_learned: "", // Existing, now mapped to ss_q23
  ss_q24: "", // New field
  ss_q25: "", // New field
  ss_q26: "", // New field
  // ss_q27 to ss_q64 will be added as needed based on the full list
  // Placeholder for now:
  ss_q27: "",
  ss_q28: "",
  ss_q29: "",
  ss_q30: "",
  ss_q31: "",
  ss_q32: "",
  ss_q33: "",
  ss_q34: "",
  ss_q35: "",
  ss_q35_other: "", // New field for Q35 other
  ss_q36_attitude: "", // Existing, now mapped to ss_q36
  ss_q36_other: "", // New field for Q36 other
  ss_q37_smsf: "", // Existing, now mapped to ss_q37
  ss_q37_pre: "", // New field for Q37 pre-retirement checkboxes
  ss_q37_pre_other: "", // New field for Q37 pre-retirement other
  ss_q37_post: "", // New field for Q37 post-retirement checkboxes
  ss_q37_post_other: "", // New field for Q37 post-retirement other
  ss_q38_pre_retirement: "", // Existing, now mapped to ss_q38
  ss_q38_other: "", // New field for Q38 other
  ss_q38_post_retirement: "", // Existing, now mapped to ss_q39
  ss_q39_likes: "", // Existing, now mapped to ss_q40
  ss_q39_other: "", // New field for Q39 other
  ss_q40_dislikes: "", // Existing, now mapped to ss_q41
  ss_q41_exit_strategy: "", // New field
  ss_q41_other: "", // New field for Q41 other
  ss_q42_growth_aspirations: "", // New field
  ss_q42_other: "", // New field for Q42 other
  ss_q43_rent: "", // New field for Q43 rent
  ss_q43_staff: "", // New field for Q43 staff cost
  ss_q43_staff_num: "", // New field for Q43 staff number
  ss_q43_super: "", // New field for Q43 staff super
  ss_q43_equipment_lease: "", // New field for Q43 equipment lease
  ss_q43_equipment_depreciation: "", // New field for Q43 equipment depreciation
  ss_q43_motor: "", // New field for Q43 motor expenses
  ss_q43_council: "", // New field for Q43 council rates
  ss_q43_water: "", // New field for Q43 water rates
  ss_q43_land_tax: "", // New field for Q43 land tax
  ss_q43_power: "", // New field for Q43 power
  ss_q43_telephone: "", // New field for Q43 telephone
  ss_q43_advertising: "", // New field for Q43 advertising
  ss_q43_other_1_desc: "", // New field for Q43 other 1 desc
  ss_q43_other_1: "", // New field for Q43 other 1 amount
  ss_q43_other_2_desc: "", // New field for Q43 other 2 desc
  ss_q43_other_2: "", // New field for Q43 other 2 amount
  ss_q43_other_3_desc: "", // New field for Q43 other 3 desc
  ss_q43_other_3: "", // New field for Q43 other 3 amount
  ss_q43_other_4_desc: "", // New field for Q43 other 4 desc
  ss_q43_other_4: "", // New field for Q43 other 4 amount
  ss_q43_total: "", // New field for Q43 total
  ss_q44: "", // New field
  ss_q45: "", // New field
  ss_q46: "", // New field for Q46 checkboxes
  ss_q46_other: "", // New field for Q46 other
  ss_q47: "", // New field
  ss_q47_other: "", // New field for Q47 other
  ss_q48: "", // New field
  ss_q49: "", // New field
  ss_q50: "", // New field
  ss_q51_1: "", // New field for Q51 pursuit 1
  ss_q51_2: "", // New field for Q51 pursuit 2
  ss_q51_3: "", // New field for Q51 pursuit 3
  ss_q52_1: "", // New field for Q52 1st pursuit level
  ss_q52_2: "", // New field for Q52 2nd pursuit level
  ss_q52_3: "", // New field for Q52 3rd pursuit level
  ss_q53: "", // New field
  ss_q54_1: "", // New field for Q54 priority 1
  ss_q54_2: "", // New field for Q54 priority 2
  ss_q54_3: "", // New field for Q54 priority 3
  ss_q55: "", // New field
  ss_q56: "", // New field
  ss_q57: "", // New field
  ss_q58: "", // New field
  ss_q59: "", // New field
  ss_q60: "", // New field
  ss_q61: "", // New field
  ss_q62: "", // New field
  ss_q63: "", // New field
  ss_q64: "", // New field
  ss_q40: "", // Q40: Do you lease business premises? (CRITICAL for Table 2)

  // Temporary fields for new structure
  ss_q18_cost: "",
  ss_q18_desc: "",
  ss_q19_location: "",
  ss_q21_location: "",
  ss_q41: "", // Correct field for Q41
  ss_q42_1: "",
  ss_q42_2: "",
  ss_q42_3: "",
  ss_q51: "", // Correct field for Q51
  ss_q52: "", // Correct field for Q52
  ss_q53_pursuit1: "", // Correct field for Q53 pursuit 1
  ss_q53_pursuit2: "", // Correct field for Q53 pursuit 2
  ss_q53_pursuit3: "", // Correct field for Q53 pursuit 3
  ss_q54: "", // Correct field for Q54
  ss_q55: "", // Correct field for Q55
  ss_q56: "", // Correct field for Q56
  ss_q57: "", // Correct field for Q57
  ss_q58: "", // Correct field for Q58
  ss_q59: "", // Correct field for Q59
  ss_q60: "", // Correct field for Q60
  ss_q61: "", // Correct field for Q61
  ss_q62: "", // Correct field for Q62
  // Added fields for Q18 types
  q18_driveways_type: "",
  q18_carports_type: "",
  q18_garages_type: "",
}

export default function GetStartedPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [determinedStrategy, setDeterminedStrategy] = useState<StrategyMatch | null>(null)
  const [savedSessionToken, setSavedSessionToken] = useState<string | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false) // State for save dialog
  const [otherExpensesCount, setOtherExpensesCount] = useState(4) // State for tracking "Other" expense fields
  const [shedCount, setShedCount] = useState(1)
  const [drivewayCount, setDrivewayCount] = useState(1)
  const [carportCount, setCarportCount] = useState(1)
  const [garageCount, setGarageCount] = useState(1)
  const [patioCount, setPatioCount] = useState(1)
  const [uncoveredCount, setUncoveredCount] = useState(1)

  const [employeeContactCount, setEmployeeContactCount] = useState(1)

  const [q40OtherCount, setQ40OtherCount] = useState(3)

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const q8Ref = useRef<HTMLDivElement>(null)

  // Video overlay state
  const [showVideoOverlay, setShowVideoOverlay] = useState(true)
  const [showButterfly, setShowButterfly] = useState(true)
  const [videoPlayer, setVideoPlayer] = useState<any>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(true)
  const [videoPlayerReady, setVideoPlayerReady] = useState(false)
  const videoHasEnded = useRef(false)

  const handleVideoEnd = useCallback(() => {
    if (videoHasEnded.current) return
    videoHasEnded.current = true
    // Show butterfly first
    setShowButterfly(true)
    // Wait 2 seconds, then hide the entire overlay
    setTimeout(() => {
      setShowVideoOverlay(false)
      setShowButterfly(false)
    }, 2000)
  }, [])

  const handleSkipVideo = useCallback(() => {
    if (videoHasEnded.current) return
    videoHasEnded.current = true
    if (videoPlayer) {
      videoPlayer.stopVideo()
    }
    // Show butterfly first
    setShowButterfly(true)
    // Wait 2 seconds, then hide the entire overlay
    setTimeout(() => {
      setShowVideoOverlay(false)
      setShowButterfly(false)
    }, 2000)
  }, [videoPlayer])

  const handleVideoReady = (event: YouTubeEvent) => {
    setVideoPlayer(event.target)
    event.target.mute()
    event.target.playVideo()
    setVideoPlayerReady(true)
    setTimeout(() => {
      setShowButterfly(false)
    }, 500)
  }

  const handleVideoStateChange = (event: YouTubeEvent) => {
    if (event.data === 1) {
      setIsVideoPlaying(true)
    }
  }

  const handlePlayAndUnmute = () => {
    if (videoPlayer) {
      videoPlayer.unMute()
      videoPlayer.playVideo()
      setIsVideoMuted(false)
      setIsVideoPlaying(true)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    if (field === "ss_q3" && value === "no") {
      setTimeout(() => {
        q8Ref.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
    }
  }

  const validateStep0 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    if (!formData.streetAddress.trim()) newErrors.streetAddress = "Street address is required"
    if (!formData.suburb.trim()) newErrors.suburb = "Suburb is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.postcode.trim()) newErrors.postcode = "Postcode is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    // Required questions from Quick Questionnaire
    if (!formData.q2_annual_income) newErrors.q2_annual_income = "Question 2 is required"
    if (!formData.q11_home_value) newErrors.q11_home_value = "Question 11 is required"
    // Updated question numbers for validation
    if (!formData.q29_power_electricity_percent) newErrors.q29_power_electricity_percent = "Question 33 is required"
    if (!formData.q29_phone_internet_percent) newErrors.q29_phone_internet_percent = "Question 35 is required"

    setErrors(newErrors)

    // Scroll to first error if any
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.focus()
      }
    }

    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    // Critical questions for strategy determination (mentioned in line 1513)
    if (!formData.ss_q3) newErrors.ss_q3 = "Question 3 is required - critical for strategy selection"
    if (!formData.ss_q13) newErrors.ss_q13 = "Question 13 is required - critical for strategy selection"
    if (!formData.ss_q15) newErrors.ss_q15 = "Question 15 is required - critical for strategy selection"
    if (!formData.ss_q16) newErrors.ss_q16 = "Question 16 is required - critical for strategy selection"
    if (!formData.ss_q26) newErrors.ss_q26 = "Question 26 is required - critical for strategy selection"
    if (!formData.ss_q40) newErrors.ss_q40 = "Question 40 is required - critical for strategy selection"

    setErrors(newErrors)

    // Scroll to first error if any
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0]
      // For Strategy Selector questions, use ss-q prefix for IDs
      const elementId = firstErrorField.replace("ss_", "ss-")
      const element = document.getElementById(elementId) || document.querySelector(`[id*="${firstErrorField}"]`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.focus()
      }
    }

    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateStep0()) return
    }
    if (currentStep === 1) {
      if (!validateStep1()) return
    }
    if (currentStep === 2) {
      if (!validateStep2()) return
    }

    // Update progress bar logic to use 3 steps for the main form
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else if (currentStep === 2) {
      // When moving from Step 2 to Step 3 (Complete)
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleResumeProgress = (resumedData: Record<string, any>, resumedStep: number, token: string) => {
    setFormData(resumedData)
    setCurrentStep(resumedStep)
    setSavedSessionToken(token)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSessionSaved = (token: string) => {
    setSavedSessionToken(token)
  }

  // Renamed from handleSubmit to handleFinalSubmit to avoid confusion with the button click
  const handleFinalSubmit = async () => {
    setIsLoading(true)

    const noAnswers = extractNoAnswers(formData)
    const strategy = determineStrategy(noAnswers)

    console.log("[v0] Strategy Selector - NO answers:", noAnswers)
    console.log("[v0] Determined strategy:", strategy)

    const questionnaireData = {
      ...formData,
      // Map new dollar amount fields for reports
      electricity_annual: formData.q31_power_electricity_amount,
      phone_annual: formData.q33_phone_internet_amount,
      // Include dynamic other expenses
      ...Object.keys(formData)
        .filter((key) => key.startsWith("q29_other_"))
        .reduce(
          (acc, key) => {
            acc[key] = formData[key as keyof typeof formData]
            return acc
          },
          {} as Record<string, any>,
        ),
      determinedStrategy: strategy,
      noAnswers: noAnswers,
      timestamp: new Date().toISOString(),
    }

    // Extract strategy selector data separately if available
    const strategyData =
      currentStep >= 2
        ? {
            ss_q1_plant_equipment: formData.ss_q1_plant_equipment,
            ss_q1_goodwill: formData.ss_q1_goodwill,
            ss_q1_real_property: formData.ss_q1_real_property,
            ss_q2_liabilities: formData.ss_q2_liabilities,
            ss_q3: formData.ss_q3,
            ss_q4: formData.ss_q4,
            ss_q5: formData.ss_q5,
            ss_q6: formData.ss_q6,
            ss_q7: formData.ss_q7,
            ss_q8: formData.ss_q8,
            ss_q9: formData.ss_q9,
            ss_q10: formData.ss_q10,
            ss_q11: formData.ss_q11,
            ss_q12: formData.ss_q12,
            ss_q13: formData.ss_q13,
            ss_q14: formData.ss_q14,
            ss_q15: formData.ss_q15,
            ss_q16: formData.ss_q16,
            ss_q17: formData.ss_q17,
            ss_q18: formData.ss_q18,
            ss_q19: formData.ss_q19,
            ss_q20: formData.ss_q20,
            ss_q21: formData.ss_q21,
            ss_q22_experience: formData.ss_q22_experience,
            ss_q23_learned: formData.ss_q23_learned,
            ss_q24: formData.ss_q24,
            ss_q25: formData.ss_q25,
            ss_q26: formData.ss_q26,
            ss_q27: formData.ss_q27,
            ss_q28: formData.ss_q28,
            ss_q29: formData.ss_q29,
            ss_q30: formData.ss_q30,
            ss_q31: formData.ss_q31,
            ss_q32: formData.ss_q32,
            ss_q33: formData.ss_q33,
            ss_q34: formData.ss_q34,
            ss_q35: formData.ss_q35,
            ss_q35_other: formData.ss_q35_other,
            ss_q36_attitude: formData.ss_q36_attitude,
            ss_q36_other: formData.ss_q36_other,
            ss_q37_smsf: formData.ss_q37_smsf,
            ss_q37_pre: formData.ss_q37_pre,
            ss_q37_pre_other: formData.ss_q37_pre_other,
            ss_q37_post: formData.ss_q37_post,
            ss_q37_post_other: formData.ss_q37_post_other,
            ss_q38_pre_retirement: formData.ss_q38_pre_retirement,
            ss_q38_other: formData.ss_q38_other,
            ss_q38_post_retirement: formData.ss_q38_post_retirement,
            ss_q39_likes: formData.ss_q39_likes,
            ss_q39_other: formData.ss_q39_other,
            ss_q40_dislikes: formData.ss_q40_dislikes,
            ss_q41_exit_strategy: formData.ss_q41_exit_strategy,
            ss_q41_other: formData.ss_q41_other,
            ss_q42_growth_aspirations: formData.ss_q42_growth_aspirations,
            ss_q42_other: formData.ss_q42_other,
            ss_q43_rent: formData.ss_q43_rent,
            ss_q43_staff_num: formData.ss_q43_staff_num,
            ss_q43_staff_cost: formData.ss_q43_staff_cost,
            ss_q43_super: formData.ss_q43_super,
            ss_q43_equipment_lease: formData.ss_q43_equipment_lease,
            ss_q43_equipment_depreciation: formData.ss_q43_equipment_depreciation,
            ss_q43_motor: formData.ss_q43_motor,
            ss_q43_council: formData.ss_q43_council,
            ss_q43_water: formData.ss_q43_water,
            ss_q43_land_tax: formData.ss_q43_land_tax,
            ss_q43_power: formData.ss_q43_power,
            ss_q43_telephone: formData.ss_q43_telephone,
            ss_q43_advertising: formData.ss_q43_advertising,
            ss_q43_other_1_desc: formData.ss_q43_other_1_desc,
            ss_q43_other_1: formData.ss_q43_other_1,
            ss_q43_other_2_desc: formData.ss_q43_other_2_desc,
            ss_q43_other_2: formData.ss_q43_other_2,
            ss_q43_other_3_desc: formData.ss_q43_other_3_desc,
            ss_q43_other_3: formData.ss_q43_other_3,
            ss_q43_other_4_desc: formData.ss_q43_other_4_desc,
            ss_q43_other_4: formData.ss_q43_other_4,
            ss_q43_total: formData.ss_q43_total,
            ss_q44: formData.ss_q44,
            ss_q45: formData.ss_q45,
            ss_q46: formData.ss_q46,
            ss_q46_other: formData.ss_q46_other,
            ss_q47: formData.ss_q47,
            ss_q47_other: formData.ss_q47_other,
            ss_q48: formData.ss_q48,
            ss_q49: formData.ss_q49,
            ss_q50: formData.ss_q50,
            ss_q51_1: formData.ss_q51_1,
            ss_q51_2: formData.ss_q51_2,
            ss_q51_3: formData.ss_q51_3,
            ss_q52: formData.ss_q52,
            ss_q53_pursuit1: formData.ss_q53_pursuit1,
            ss_q53_pursuit2: formData.ss_q53_pursuit2,
            ss_q53_pursuit3: formData.ss_q53_pursuit3,
            ss_q54_1: formData.ss_q54_1,
            ss_q54_2: formData.ss_q54_2,
            ss_q54_3: formData.ss_q54_3,
            ss_q55: formData.ss_q55,
            ss_q56: formData.ss_q56,
            ss_q57: formData.ss_q57,
            ss_q58: formData.ss_q58,
            ss_q59: formData.ss_q59,
            ss_q60: formData.ss_q60,
            ss_q61: formData.ss_q61,
            ss_q62: formData.ss_q62,
            ss_q63: formData.ss_q63,
            ss_q64: formData.ss_q64,
            // Add any other strategy selector fields not explicitly listed above
          }
        : null

    try {
      const supabase = createClient()

      // Try to get authenticated user
      const { data: userData } = await supabase.auth.getUser()

      const { error: insertError } = await supabase.from("dyh_explorer_prospects").insert({
        user_id: userData?.user?.id || null,
        email: formData.email,
        full_name: formData.fullName,
        phone_number: formData.phone, // Assuming this maps to formData.phone
        street_address: formData.streetAddress,
        suburb: formData.suburb,
        state: formData.state,
        postcode: formData.postcode,
        questionnaire_data: questionnaireData,
        strategy_selector_data: strategyData, // Use the extracted strategy data
        status: "prospect",
        last_activity_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("[v0] Error saving to prospects database:", insertError)
        // Continue anyway - still save to localStorage as fallback
      } else {
        console.log("[v0] Successfully saved prospect to database")
      }

      // Also keep saving to client_assessments for backward compatibility
      const { error: assessmentError } = await supabase.from("client_assessments").insert({
        client_id: userData?.user?.id || null,
        client_name: formData.fullName,
        status: "submitted",
        questionnaire_data: questionnaireData,
      })

      if (assessmentError) {
        console.error("[v0] Error saving to client_assessments:", assessmentError)
      }
    } catch (error) {
      console.error("[v0] Error saving assessment:", error)
    }

    // Store data in localStorage as backup
    localStorage.setItem("getStartedData", JSON.stringify(questionnaireData))

    // Redirect to pricing
    setTimeout(() => {
      router.push("/pricing")
    }, 1000)
  }

  // Update progress calculation to reflect 3 main steps before completion
  const progress = ((currentStep + 1) / 3) * 100

  return (
    <>
      {showVideoOverlay && (
        <>
          {showButterfly && (
            <div className="fixed inset-0 w-screen h-screen z-[99999]">
              <Image src="/images/butterfly.jpg" alt="Loading" fill className="object-cover" priority />
            </div>
          )}

          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
            <div className={`w-full h-full ${videoPlayerReady ? "opacity-100" : "opacity-0"}`}>
              <YouTube
                videoId="fDCcDPbcC6g"
                className="w-full h-full"
                iframeClassName="w-full h-full"
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: {
                    autoplay: 1,
                    mute: 1,
                    controls: 1,
                    playsinline: 1,
                    rel: 0,
                    modestbranding: 1,
                  },
                }}
                onReady={handleVideoReady}
                onStateChange={handleVideoStateChange}
                onEnd={handleVideoEnd}
              />
            </div>

            <button
              onClick={handleSkipVideo}
              className="absolute top-8 right-8 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-6 py-3 rounded-full font-medium transition-all border border-white/20 z-10"
            >
              Skip Video →
            </button>

            {isVideoMuted && (
              <button
                onClick={handlePlayAndUnmute}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all z-10 flex items-center gap-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Click to Unmute
              </button>
            )}
          </div>
        </>
      )}

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
        <div className="flex items-center justify-center py-8 border-b border-gray-200 bg-white">
          <img src="/images/intellisolve-20logo-20jpg-20file.jpg" alt="Intellisolve Logo" className="h-16" />
        </div>

        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-blue-600">Creator of "Deduct Your Home"</h2>
            <p className="text-lg text-blue-600">Take The Questionnaire And See Your Results For Free!</p>
            <h1 className="text-4xl font-bold text-blue-600">NOW LET'S GET YOU STARTED</h1>
          </div>

          <IPWarningBanner />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-2xl">{STEPS[currentStep]}</CardTitle>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <CardDescription>
                {currentStep === 0 && "Let's start with your contact information"}
                {currentStep === 1 &&
                  "Quick Questionnaire (29 Questions) - DEDUCT YOUR HOME – CONFIDENTIAL INITIAL QUESTIONNAIRE"}
                {currentStep === 2 && "Help us understand your business goals and priorities"}
                {currentStep === 3 && "You're all set!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-medium text-muted-foreground">
                    Step {currentStep + 1} of 3 {/* Updated to reflect 3 main steps */}
                  </h2>
                  {/* Percentage is now displayed in CardHeader */}
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Step 0: Contact Details */}
              {currentStep === 0 && !savedSessionToken && (
                <div className="mb-6 flex justify-center">
                  <ResumeProgressDialog onResumed={handleResumeProgress} />
                </div>
              )}

              {currentStep === 0 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="text-base">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => updateFormData("fullName", e.target.value)}
                      placeholder="John Smith"
                      required
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-base">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        placeholder="john@example.com"
                        required
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-base">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        placeholder="0400 000 000"
                        required
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="streetAddress" className="text-base">
                      Street Address *
                    </Label>
                    <Input
                      id="streetAddress"
                      value={formData.streetAddress}
                      onChange={(e) => updateFormData("streetAddress", e.target.value)}
                      placeholder="123 Main Street"
                      required
                      className={errors.streetAddress ? "border-red-500" : ""}
                    />
                    {errors.streetAddress && <p className="text-sm text-red-500 mt-1">{errors.streetAddress}</p>}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="suburb" className="text-base">
                        Suburb *
                      </Label>
                      <Input
                        id="suburb"
                        value={formData.suburb}
                        onChange={(e) => updateFormData("suburb", e.target.value)}
                        placeholder="Melbourne"
                        required
                        className={errors.suburb ? "border-red-500" : ""}
                      />
                      {errors.suburb && <p className="text-sm text-red-500 mt-1">{errors.suburb}</p>}
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-base">
                        State *
                      </Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => updateFormData("state", e.target.value)}
                        placeholder="VIC"
                        required
                        className={errors.state ? "border-red-500" : ""}
                      />
                      {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <Label htmlFor="postcode" className="text-base">
                        Postcode *
                      </Label>
                      <Input
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => updateFormData("postcode", e.target.value)}
                        placeholder="3000"
                        required
                        className={errors.postcode ? "border-red-500" : ""}
                      />
                      {errors.postcode && <p className="text-sm text-red-500 mt-1">{errors.postcode}</p>}
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t">
                    <button
                      onClick={handleNext}
                      className="px-6 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-hover"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Quick Questionnaire (29 Questions) */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Contact Info Display */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Your Contact Details:</p>
                    <div className="text-sm space-y-1 text-blue-800">
                      <p>
                        <strong>Name:</strong> {formData.fullName}
                      </p>
                      <p>
                        <strong>Email:</strong> {formData.email}
                      </p>
                      <p>
                        <strong>Address:</strong> {formData.streetAddress}, {formData.suburb} {formData.state}{" "}
                        {formData.postcode}
                      </p>
                    </div>
                  </div>

                  {/* Key Financial Information */}
                  <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg text-blue-900">Key Financial Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="q_age">Your Current Age</Label>
                        <Input
                          id="q_age"
                          type="number"
                          value={formData.q_age}
                          onChange={(e) => updateFormData("q_age", e.target.value)}
                          placeholder="e.g., 45"
                        />
                      </div>
                      <div>
                        <Label htmlFor="q_mortgage_balance">Outstanding Mortgage Balance ($)</Label>
                        <Input
                          id="q_mortgage_balance"
                          type="number"
                          value={formData.q_mortgage_balance}
                          onChange={(e) => updateFormData("q_mortgage_balance", e.target.value)}
                          placeholder="e.g., 500000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Q1-11 */}
                  <div className="space-y-4">
                    <div>
                      <Label>1. What is your marital status?</Label>
                      <RadioGroup
                        value={formData.q1_marital_status}
                        onValueChange={(v) => updateFormData("q1_marital_status", v)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Single" id="marital-single" />
                          <Label htmlFor="marital-single">Single</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Married" id="marital-married" />
                          <Label htmlFor="marital-married">Married</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Partnered" id="marital-partnered" />
                          <Label htmlFor="marital-partnered">Partnered</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Divorced" id="marital-divorced" />
                          <Label htmlFor="marital-divorced">Divorced</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="q2_annual_income">
                        2. Your annual personal income (current or genuinely anticipated within the next 12 months)? *
                      </Label>
                      <Input
                        id="q2_annual_income"
                        type="number"
                        value={formData.q2_annual_income}
                        onChange={(e) => updateFormData("q2_annual_income", e.target.value)}
                        placeholder="$"
                        className={errors.q2_annual_income ? "border-red-500" : ""}
                      />
                      {errors.q2_annual_income && (
                        <p className="text-sm text-red-500 mt-1">{errors.q2_annual_income}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="q3_partner_income">
                        3. Your spouse/partner's annual personal income – (if applicable)
                      </Label>
                      <Input
                        id="q3_partner_income"
                        type="number"
                        value={formData.q3_partner_income}
                        onChange={(e) => updateFormData("q3_partner_income", e.target.value)}
                        placeholder="$"
                      />
                    </div>

                    <div>
                      <Label htmlFor="q4_num_children">4. No. of children</Label>
                      <Input
                        id="q4_num_children"
                        type="number"
                        value={formData.q4_num_children}
                        onChange={(e) => updateFormData("q4_num_children", e.target.value)}
                        placeholder="e.g., 2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="q5_ages_children">5. Ages of children</Label>
                      <Input
                        id="q5_ages_children"
                        value={formData.q5_ages_children}
                        onChange={(e) => updateFormData("q5_ages_children", e.target.value)}
                        placeholder="e.g., 5, 8, 12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="q6_children_income">6. Annual incomes of the children - (if applicable)</Label>
                      <Input
                        id="q6_children_income"
                        type="number"
                        value={formData.q6_children_income}
                        onChange={(e) => updateFormData("q6_children_income", e.target.value)}
                        placeholder="$"
                      />
                    </div>

                    <div>
                      <Label>7. Employment status</Label>
                      <RadioGroup
                        value={formData.q7_employment_status}
                        onValueChange={(v) => updateFormData("q7_employment_status", v)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Employee" id="emp-employee" />
                          <Label htmlFor="emp-employee">Employee</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Proprietor" id="emp-proprietor" />
                          <Label htmlFor="emp-proprietor">Proprietor</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>8. Your partner's employment status</Label>
                      <RadioGroup
                        value={formData.q8_partner_employment_status}
                        onValueChange={(v) => updateFormData("q8_partner_employment_status", v)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Employee" id="pemp-employee" />
                          <Label htmlFor="pemp-employee">Employee</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Proprietor" id="pemp-proprietor" />
                          <Label htmlFor="pemp-proprietor">Proprietor</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>9. Are you renting?</Label>
                      <RadioGroup value={formData.q9_renting} onValueChange={(v) => updateFormData("q9_renting", v)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="rent-yes" />
                          <Label htmlFor="rent-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="rent-no" />
                          <Label htmlFor="rent-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>10. Have you paid off your home or are you paying it off?</Label>
                      <RadioGroup
                        value={formData.q10_home_paid}
                        onValueChange={(v) => updateFormData("q10_home_paid", v)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Paid For" id="paid-yes" />
                          <Label htmlFor="paid-yes">Paid For</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="$ Amount Owing" id="paid-amount" />
                          <Label htmlFor="paid-amount">$ Amount Owing</Label>
                        </div>
                      </RadioGroup>
                      {formData.q10_home_paid === "$ Amount Owing" && (
                        <Input
                          type="number"
                          value={formData.q10_amount_owing}
                          onChange={(e) => updateFormData("q10_amount_owing", e.target.value)}
                          placeholder="$"
                          className="mt-2"
                        />
                      )}
                    </div>

                    <div>
                      <Label htmlFor="q11_home_value" className="text-base">
                        11. Conservative estimated value of your current or anticipated future Home? *
                      </Label>
                      <Input
                        id="q11_home_value"
                        type="number"
                        value={formData.q11_home_value}
                        onChange={(e) => updateFormData("q11_home_value", e.target.value)}
                        placeholder="$"
                        className={errors.q11_home_value ? "border-red-500" : ""}
                      />
                      {errors.q11_home_value && <p className="text-sm text-red-500 mt-1">{errors.q11_home_value}</p>}
                    </div>
                  </div>

                  {/* Q12-18 */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="q12_personal_debts">
                        12. Approximate balance of your personal debts (car loans, personal loans, credit cards etc)?
                      </Label>
                      <Input
                        id="q12_personal_debts"
                        type="number"
                        value={formData.q12_personal_debts}
                        onChange={(e) => updateFormData("q12_personal_debts", e.target.value)}
                        placeholder="$"
                      />
                      <p className="text-sm text-muted-foreground mt-1 italic">
                        Tip: The ATO isn't a big fan of this whereby and if so, you may have inadvertently created a tax
                        problem for yourself but, don't worry, we're here to help you fix it.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="q13_partner_debts">
                        13. Approximate balance of your partner's personal debts (car loans, personal loans, credit
                        cards etc)?
                      </Label>
                      <Input
                        id="q13_partner_debts"
                        type="number"
                        value={formData.q13_partner_debts}
                        onChange={(e) => updateFormData("q13_partner_debts", e.target.value)}
                        placeholder="$"
                      />
                    </div>

                    <div>
                      <Label className="text-base">
                        14. Is your home large enough and well suited for a home business?
                      </Label>
                      <RadioGroup
                        value={formData.q14_home_suitable}
                        onValueChange={(v) => updateFormData("q14_home_suitable", v)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="suitable-yes" />
                          <Label htmlFor="suitable-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="suitable-no" />
                          <Label htmlFor="suitable-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.q14_home_suitable === "No" && (
                      <div>
                        <Label className="text-base">
                          15. If No to (14), do you have premises or can you get premises?
                        </Label>
                        <RadioGroup
                          value={formData.q15_move_extend}
                          onValueChange={(v) => updateFormData("q15_move_extend", v)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Move" id="move" />
                            <Label htmlFor="move">Move</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Extend" id="extend" />
                            <Label htmlFor="extend">Extend</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    <div>
                      <Label className="text-base">16. Do you work from home now or have you in the past?</Label>
                      <RadioGroup
                        value={formData.q16_total_floor_space}
                        onValueChange={(e) => updateFormData("q16_total_floor_space", e.target.value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="work-from-home-yes" />
                          <Label htmlFor="work-from-home-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="work-from-home-no" />
                          <Label htmlFor="work-from-home-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-base">17. If Yes to (16), for how long?</Label>
                      <Input
                        id="q17_business_floor_space"
                        type="number"
                        value={formData.q17_business_floor_space}
                        onChange={(e) => updateFormData("q17_business_floor_space", e.target.value)}
                        placeholder="Years"
                      />
                    </div>

                    {/* Q18: Counting structures */}
                    <div className="space-y-4">
                      <Label className="text-base">18. How many do you have of each of the following?</Label>
                      <p className="text-sm text-muted-foreground mt-1 italic">
                        Tip: the ATO applies a 'like-for-like' approach to claiming business deductions. E.g. If there
                        are two driveways and one is used for business and the other personally, they will be summed in
                        m² whereby only the business part may be be claimed. Similarly as with say one driveway that
                        leads to a carport or garage as shared by a business and a personal motor vehicle. Any which way
                        and ONLY if the business use percentage of the overall area is more than 50%, will you be
                        better-off by claiming. Should you become a client, we can possibly assist you in this area
                        which of itself, presents a solid opportunity to significantly maximise busines tax deductions.
                      </p>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label className="font-medium">Sheds</Label>
                          {Array.from({ length: shedCount }).map((_, index) => (
                            <div key={index} className="grid md:grid-cols-2 gap-4 pl-4">
                              <div>
                                <Label htmlFor={`q18_sheds_size_${index}`}>Size m²</Label>
                                <Input
                                  id={`q18_sheds_size_${index}`}
                                  placeholder="e.g., 20"
                                  value={formData.q18_sheds_size?.split(" / ")[index] || ""}
                                  onChange={(e) => {
                                    const sizes = formData.q18_sheds_size?.split(" / ") || []
                                    sizes[index] = e.target.value
                                    updateFormData("q18_sheds_size", sizes.filter((s) => s).join(" / "))
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShedCount(shedCount + 1)}
                            className="ml-4"
                          >
                            + Add More Shed
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <Label className="font-medium">Driveways</Label>
                          {Array.from({ length: drivewayCount }).map((_, index) => (
                            <div key={index} className="space-y-3 pl-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`q18_driveways_size_${index}`}>Size m²</Label>
                                  <Input
                                    id={`q18_driveways_size_${index}`}
                                    placeholder="e.g., 20"
                                    value={formData.q18_driveways_size?.split(" / ")[index] || ""}
                                    onChange={(e) => {
                                      const sizes = formData.q18_driveways_size?.split(" / ") || []
                                      sizes[index] = e.target.value
                                      updateFormData("q18_driveways_size", sizes.filter((s) => s).join(" / "))
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label>Type</Label>
                                  <RadioGroup
                                    value={formData.q18_driveways_type?.split(",")[index] || ""}
                                    onValueChange={(v) => {
                                      const types = formData.q18_driveways_type?.split(",") || []
                                      types[index] = v
                                      updateFormData("q18_driveways_type", types.filter((t) => t).join(","))
                                    }}
                                  >
                                    <div className="flex flex-wrap gap-4">
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Single" id={`driveway-single-${index}`} />
                                        <Label htmlFor={`driveway-single-${index}`}>Single</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Double" id={`driveway-double-${index}`} />
                                        <Label htmlFor={`driveway-double-${index}`}>Double</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Triple" id={`driveway-triple-${index}`} />
                                        <Label htmlFor={`driveway-triple-${index}`}>Triple</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Quadruple" id={`driveway-quadruple-${index}`} />
                                        <Label htmlFor={`driveway-quadruple-${index}`}>Quadruple</Label>
                                      </div>
                                    </div>
                                  </RadioGroup>
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDrivewayCount(drivewayCount + 1)}
                            className="ml-4"
                          >
                            + Add More Driveway
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <Label className="font-medium">Carports</Label>
                          {Array.from({ length: carportCount }).map((_, index) => (
                            <div key={index} className="space-y-3 pl-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`q18_carports_size_${index}`}>Size m²</Label>
                                  <Input
                                    id={`q18_carports_size_${index}`}
                                    placeholder="e.g., 20"
                                    value={formData.q18_carports_size?.split(" / ")[index] || ""}
                                    onChange={(e) => {
                                      const sizes = formData.q18_carports_size?.split(" / ") || []
                                      sizes[index] = e.target.value
                                      updateFormData("q18_carports_size", sizes.filter((s) => s).join(" / "))
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label>Type</Label>
                                  <RadioGroup
                                    value={formData.q18_carports_type?.split(",")[index] || ""}
                                    onValueChange={(v) => {
                                      const types = formData.q18_carports_type?.split(",") || []
                                      types[index] = v
                                      updateFormData("q18_carports_type", types.filter((t) => t).join(","))
                                    }}
                                  >
                                    <div className="flex flex-wrap gap-4">
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Single" id={`carport-single-${index}`} />
                                        <Label htmlFor={`carport-single-${index}`}>Single</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Double" id={`carport-double-${index}`} />
                                        <Label htmlFor={`carport-double-${index}`}>Double</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Triple" id={`carport-triple-${index}`} />
                                        <Label htmlFor={`carport-triple-${index}`}>Triple</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Quadruple" id={`carport-quadruple-${index}`} />
                                        <Label htmlFor={`carport-quadruple-${index}`}>Quadruple</Label>
                                      </div>
                                    </div>
                                  </RadioGroup>
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCarportCount(carportCount + 1)}
                            className="ml-4"
                          >
                            + Add More Carport
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <Label className="font-medium">Garages</Label>
                          {Array.from({ length: garageCount }).map((_, index) => (
                            <div key={index} className="space-y-3 pl-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`q18_garages_size_${index}`}>Size m²</Label>
                                  <Input
                                    id={`q18_garages_size_${index}`}
                                    placeholder="e.g., 20"
                                    value={formData.q18_garages_size?.split(" / ")[index] || ""}
                                    onChange={(e) => {
                                      const sizes = formData.q18_garages_size?.split(" / ") || []
                                      sizes[index] = e.target.value
                                      updateFormData("q18_garages_size", sizes.filter((s) => s).join(" / "))
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label>Type</Label>
                                  <RadioGroup
                                    value={formData.q18_garages_type?.split(",")[index] || ""}
                                    onValueChange={(v) => {
                                      const types = formData.q18_garages_type?.split(",") || []
                                      types[index] = v
                                      updateFormData("q18_garages_type", types.filter((t) => t).join(","))
                                    }}
                                  >
                                    <div className="flex flex-wrap gap-4">
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Single" id={`garage-single-${index}`} />
                                        <Label htmlFor={`garage-single-${index}`}>Single</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Double" id={`garage-double-${index}`} />
                                        <Label htmlFor={`garage-double-${index}`}>Double</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Triple" id={`garage-triple-${index}`} />
                                        <Label htmlFor={`garage-triple-${index}`}>Triple</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Quadruple" id={`garage-quadruple-${index}`} />
                                        <Label htmlFor={`garage-quadruple-${index}`}>Quadruple</Label>
                                      </div>
                                    </div>
                                  </RadioGroup>
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setGarageCount(garageCount + 1)}
                            className="ml-4"
                          >
                            + Add More Garage
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <Label className="font-medium">Patios</Label>
                          {Array.from({ length: patioCount }).map((_, index) => (
                            <div key={index} className="grid md:grid-cols-2 gap-4 pl-4">
                              <div>
                                <Label htmlFor={`q18_patios_size_${index}`}>Size m²</Label>
                                <Input
                                  id={`q18_patios_size_${index}`}
                                  placeholder="e.g., 20"
                                  value={formData.q18_patios_size?.split(" / ")[index] || ""}
                                  onChange={(e) => {
                                    const sizes = formData.q18_patios_size?.split(" / ") || []
                                    sizes[index] = e.target.value
                                    updateFormData("q18_patios_size", sizes.filter((s) => s).join(" / "))
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPatioCount(patioCount + 1)}
                            className="ml-4"
                          >
                            + Add More Patio
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <Label className="font-medium">Uncovered Areas</Label>
                          {Array.from({ length: uncoveredCount }).map((_, index) => (
                            <div key={index} className="grid md:grid-cols-2 gap-4 pl-4">
                              <div>
                                <Label htmlFor={`q18_uncovered_size_${index}`}>Size m²</Label>
                                <Input
                                  id={`q18_uncovered_size_${index}`}
                                  placeholder="e.g., 20"
                                  value={formData.q18_uncovered_size?.split(" / ")[index] || ""}
                                  onChange={(e) => {
                                    const sizes = formData.q18_uncovered_size?.split(" / ") || []
                                    sizes[index] = e.target.value
                                    updateFormData("q18_uncovered_size", sizes.filter((s) => s).join(" / "))
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setUncoveredCount(uncoveredCount + 1)}
                            className="ml-4"
                          >
                            + Add More Uncovered Area
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="q18_vehicles_business">Motor Vehicles on-site - No. for business</Label>
                            <Input
                              id="q18_vehicles_business"
                              type="number"
                              value={formData.q18_vehicles_business}
                              onChange={(e) => updateFormData("q18_vehicles_business", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="q18_vehicles_personal">Motor Vehicles on-site - No. for personal</Label>
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

                    <div>
                      <Label className="text-base">
                        19. Total m² at each of (17) if any, able to be exclusively or almost exclusively set aside for
                        business use?
                      </Label>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="q19_sheds">Sheds (m²)</Label>
                          <Input
                            id="q19_sheds"
                            type="number"
                            value={formData.q19_sheds}
                            onChange={(e) => updateFormData("q19_sheds", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="q19_driveways">Driveways (m²)</Label>
                          <Input
                            id="q19_driveways"
                            type="number"
                            value={formData.q19_driveways}
                            onChange={(e) => updateFormData("q19_driveways", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="q19_carports">Carports (m²)</Label>
                          <Input
                            id="q19_carports"
                            type="number"
                            value={formData.q19_carports}
                            onChange={(e) => updateFormData("q19_carports", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="q19_garages">Garages (m²)</Label>
                          <Input
                            id="q19_garages"
                            type="number"
                            value={formData.q19_garages}
                            onChange={(e) => updateFormData("q19_garages", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="q19_patios">Patios (m²)</Label>
                          <Input
                            id="q19_patios"
                            type="number"
                            value={formData.q19_patios}
                            onChange={(e) => updateFormData("q19_patios", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="q19_uncovered">Uncovered Area (m²)</Label>
                          <Input
                            id="q19_uncovered"
                            type="number"
                            value={formData.q19_uncovered}
                            onChange={(e) => updateFormData("q19_uncovered", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="q20_years_operating">
                        20. How many years have You operated Your business at or from Your current or prior home?
                      </Label>
                      <Input
                        id="q20_years_operating"
                        value={formData.q20_years_operating}
                        onChange={(e) => updateFormData("q20_years_operating", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="q21_past_business_space">
                        21. What do you estimate the total m² to be of the spaces you've already been using exclusively
                        for business in the past?
                      </Label>
                      <Input
                        id="q21_past_business_space"
                        type="number"
                        value={formData.q21_past_business_space}
                        onChange={(e) => updateFormData("q21_past_business_space", e.target.value)}
                        placeholder="m²"
                      />
                    </div>

                    <div>
                      <Label htmlFor="q22_years_claimed">
                        22. Further to 21, for how many of those did you previously claim mortgage interest and council
                        rates etc?
                      </Label>
                      <Input
                        id="q22_years_claimed"
                        value={formData.q22_years_claimed}
                        onChange={(e) => updateFormData("q22_years_claimed", e.target.value)}
                        placeholder="years"
                      />
                    </div>

                    <div>
                      <Label>23. Further to 22, have you been using an accountant?</Label>
                      <RadioGroup
                        value={formData.q23_using_accountant}
                        onValueChange={(v) => updateFormData("q23_using_accountant", v)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="acc-yes" />
                          <Label htmlFor="acc-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="acc-no" />
                          <Label htmlFor="acc-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>
                        24. Do you know that all public accountants such as us must carry professional indemnity
                        insurance?
                      </Label>
                      <RadioGroup
                        value={formData.q24_know_insurance}
                        onValueChange={(v) => updateFormData("q24_know_insurance", v)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="ins-yes" />
                          <Label htmlFor="ins-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="ins-no" />
                          <Label htmlFor="ins-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="q25_accountant_attachment">
                        25. On a scale of 1-10 (with 10 being optimum), how attached are you to your current accountant?
                      </Label>
                      <Input
                        id="q25_accountant_attachment"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.q25_accountant_attachment}
                        onChange={(e) => updateFormData("q25_accountant_attachment", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Q26-28 */}
                  <div className="space-y-4">
                    <div>
                      <Label>
                        26. Do you or your partner rent premises for another business that you could relocate as a home
                        business instead?
                      </Label>
                      <RadioGroup
                        value={formData.q26_rented_premises}
                        onValueChange={(v) => updateFormData("q26_rented_premises", v)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="rent-prem-yes" />
                          <Label htmlFor="rent-prem-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="rent-prem-no" />
                          <Label htmlFor="rent-prem-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.q26_rented_premises === "Yes" && (
                      <div>
                        <Label htmlFor="q27_rental_cost">
                          27. Further to 26, if applicable, what is the approximate annual cost of yours or your
                          partner's rented business premises including associated expenses such as real estate agency
                          mgt fees and outgoings?
                        </Label>
                        <Input
                          id="q27_rental_cost"
                          type="number"
                          value={formData.q27_rental_cost}
                          onChange={(e) => updateFormData("q27_rental_cost", e.target.value)}
                          placeholder="$"
                        />
                      </div>
                    )}

                    <div>
                      <Label>28. Is your business GST registered?</Label>
                      <RadioGroup
                        value={formData.q28_gst_registered}
                        onValueChange={(v) => updateFormData("q28_gst_registered", v)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="gst-yes" />
                          <Label htmlFor="gst-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="gst-no" />
                          <Label htmlFor="gst-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Q29 - Business Outgoings */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-base">
                          29. Please list your main usual business outgoings (on an annual basis)
                        </Label>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="q29_rent_or" className="text-sm">
                              Rent or
                            </Label>
                            <Input
                              id="q29_rent_or"
                              type="text"
                              placeholder="$"
                              value={formData.q29_rent_or}
                              onChange={(e) => updateFormData("q29_rent_or", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="q29_premises_loan_interest" className="text-sm">
                              Premises Loan Interest
                            </Label>
                            <Input
                              id="q29_premises_loan_interest"
                              type="text"
                              placeholder="$"
                              value={formData.q29_premises_loan_interest}
                              onChange={(e) => updateFormData("q29_premises_loan_interest", e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="q29_staff_number" className="text-sm">
                                Staff (how many?)
                              </Label>
                              <Input
                                id="q29_staff_number"
                                type="number"
                                placeholder="Number"
                                value={formData.q29_staff_number}
                                onChange={(e) => updateFormData("q29_staff_number", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="q29_staff_cost" className="text-sm">
                                Cost
                              </Label>
                              <Input
                                id="q29_staff_cost"
                                type="text"
                                placeholder="$"
                                value={formData.q29_staff_cost}
                                onChange={(e) => updateFormData("q29_staff_cost", e.target.value)}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="q29_staff_super" className="text-sm">
                              Staff Superannuation @ 12% (minimum)
                            </Label>
                            <Input
                              id="q29_staff_super"
                              type="text"
                              placeholder="$"
                              value={formData.q29_staff_super}
                              onChange={(e) => updateFormData("q29_staff_super", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="q29_office_equipment_lease" className="text-sm">
                              Office Equipment Lease Costs
                            </Label>
                            <Input
                              id="q29_office_equipment_lease"
                              type="text"
                              placeholder="$"
                              value={formData.q29_office_equipment_lease}
                              onChange={(e) => updateFormData("q29_office_equipment_lease", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="q29_office_equipment_depreciation" className="text-sm">
                              Office Equipment Depreciation
                            </Label>
                            <Input
                              id="q29_office_equipment_depreciation"
                              type="text"
                              placeholder="$"
                              value={formData.q29_office_equipment_depreciation}
                              onChange={(e) => updateFormData("q29_office_equipment_depreciation", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="q29_motor_vehicle_expenses" className="text-sm">
                              Motor vehicle running expenses to/from work
                            </Label>
                            <Input
                              id="q29_motor_vehicle_expenses"
                              type="text"
                              placeholder="$"
                              value={formData.q29_motor_vehicle_expenses}
                              onChange={(e) => updateFormData("q29_motor_vehicle_expenses", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="q29_council_rates" className="text-sm">
                              Council Rates
                            </Label>
                            <Input
                              id="q29_council_rates"
                              type="text"
                              placeholder="$"
                              value={formData.q29_council_rates}
                              onChange={(e) => updateFormData("q29_council_rates", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="q29_water_rates" className="text-sm">
                              Water Rates
                            </Label>
                            <Input
                              id="q29_water_rates"
                              type="text"
                              placeholder="$"
                              value={formData.q29_water_rates}
                              onChange={(e) => updateFormData("q29_water_rates", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="q29_land_tax" className="text-sm">
                              Land Tax
                            </Label>
                            <Input
                              id="q29_land_tax"
                              type="text"
                              placeholder="$"
                              value={formData.q29_land_tax}
                              onChange={(e) => updateFormData("q29_land_tax", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="q30_employees_at_home" className="text-base">
                              30. How many of your current employees would be required to work at your home based
                              business?
                            </Label>
                            <Input
                              id="q30_employees_at_home"
                              type="number"
                              value={formData.q30_employees_at_home}
                              onChange={(e) => updateFormData("q30_employees_at_home", e.target.value)}
                              placeholder="Number of employees"
                              min="0"
                            />
                          </div>

                          <div>
                            <Label htmlFor="q31_employees_work_from_own_home" className="text-base">
                              31. Further to Q. 30, how many could perform their role from their own home?
                            </Label>
                            <Input
                              id="q31_employees_work_from_own_home"
                              type="number"
                              value={formData.q31_employees_work_from_own_home}
                              onChange={(e) => updateFormData("q31_employees_work_from_own_home", e.target.value)}
                              placeholder="Number of employees"
                              min="0"
                            />
                          </div>

                          {/* Insert new Q32 for employee contact information after Q31 */}
                          <div>
                            <Label className="text-base">
                              32. Further to 31, if applicable, presuming you think that like you, those employees would
                              also benefit from this program, please provide their first name and mobile number or email
                              address so we may contact them to introduce this service and questionnaire on your behalf
                              (they will surely thank you for it)!
                            </Label>
                            <div className="space-y-4 mt-3">
                              {Array.from({ length: employeeContactCount }).map((_, index) => (
                                <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                                  <div>
                                    <Label htmlFor={`q32_employee_${index}_first_name`} className="text-sm">
                                      First Name
                                    </Label>
                                    <Input
                                      id={`q32_employee_${index}_first_name`}
                                      type="text"
                                      placeholder="First name"
                                      value={formData[`q32_employee_${index}_first_name`] || ""}
                                      onChange={(e) =>
                                        updateFormData(`q32_employee_${index}_first_name`, e.target.value)
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`q32_employee_${index}_mobile`} className="text-sm">
                                      Mobile Number
                                    </Label>
                                    <Input
                                      id={`q32_employee_${index}_mobile`}
                                      type="tel"
                                      placeholder="Mobile number"
                                      value={formData[`q32_employee_${index}_mobile`] || ""}
                                      onChange={(e) => updateFormData(`q32_employee_${index}_mobile`, e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`q32_employee_${index}_email`} className="text-sm">
                                      Email Address
                                    </Label>
                                    <Input
                                      id={`q32_employee_${index}_email`}
                                      type="email"
                                      placeholder="Email address"
                                      value={formData[`q32_employee_${index}_email`] || ""}
                                      onChange={(e) => updateFormData(`q32_employee_${index}_email`, e.target.value)}
                                    />
                                  </div>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEmployeeContactCount(employeeContactCount + 1)}
                                className="w-full"
                              >
                                Add Another Employee
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="q29_power_electricity_percent" className="text-base">
                              33. Power/Electricity - Business Use % *
                            </Label>
                            <Input
                              id="q29_power_electricity_percent"
                              type="number"
                              value={formData.q29_power_electricity_percent}
                              onChange={(e) => updateFormData("q29_power_electricity_percent", e.target.value)}
                              placeholder="%"
                              min="0"
                              max="100"
                              className={errors.q29_power_electricity_percent ? "border-red-500" : ""}
                            />
                            {errors.q29_power_electricity_percent && (
                              <p className="text-sm text-red-500 mt-1">{errors.q29_power_electricity_percent}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="q31_power_electricity_amount" className="text-base">
                              34. Power/Electricity $ (enter corresponding dollar figure to percentage figure above)
                            </Label>
                            <Input
                              id="q31_power_electricity_amount"
                              type="text"
                              placeholder="$"
                              value={formData.q31_power_electricity_amount}
                              onChange={(e) => updateFormData("q31_power_electricity_amount", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="q29_phone_internet_percent" className="text-base">
                              35. Phone/Internet - Business Use % * (Internet and phone expenses cannot be calculated
                              using floor space percentage. Please review a typical 30-day bill and determine what
                              percentage of usage applies for business purposes.)
                            </Label>
                            <Input
                              id="q29_phone_internet_percent"
                              type="number"
                              value={formData.q29_phone_internet_percent}
                              onChange={(e) => updateFormData("q29_phone_internet_percent", e.target.value)}
                              placeholder="%"
                              min="0"
                              max="100"
                              className={errors.q29_phone_internet_percent ? "border-red-500" : ""}
                            />
                            {errors.q29_phone_internet_percent && (
                              <p className="text-sm text-red-500 mt-1">{errors.q29_phone_internet_percent}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="q33_phone_internet_amount" className="text-base">
                              36. Phone/Internet $ (enter corresponding dollar figure to percentage figure above)
                            </Label>
                            <Input
                              id="q33_phone_internet_amount"
                              type="text"
                              placeholder="$"
                              value={formData.q33_phone_internet_amount}
                              onChange={(e) => updateFormData("q33_phone_internet_amount", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="q29_advertising" className="text-base">
                              37. Advertising (Print, TV, Radio, Internet, etc)
                            </Label>
                            <Input
                              id="q29_advertising"
                              type="text"
                              placeholder="$"
                              value={formData.q29_advertising}
                              onChange={(e) => updateFormData("q29_advertising", e.target.value)}
                            />
                          </div>

                          {/* Q37+ Other Expenses */}
                          <div className="space-y-4">
                            <Label className="text-base">Other Business Expenses</Label>

                            {Array.from({ length: otherExpensesCount }).map((_, i) => {
                              const num = i + 1
                              return (
                                <div key={num} className="space-y-2 border-l-2 border-gray-300 pl-4">
                                  <Label htmlFor={`q29_other_${num}_desc`} className="text-sm">
                                    Description
                                  </Label>
                                  <Input
                                    id={`q29_other_${num}_desc`}
                                    value={formData[`q29_other_${num}_desc`] || ""}
                                    onChange={(e) => updateFormData(`q29_other_${num}_desc`, e.target.value)}
                                    placeholder="e.g., Consulting fees, Software subscriptions"
                                  />
                                  <Label htmlFor={`q29_other_${num}_cost`} className="text-sm">
                                    $ Amount
                                  </Label>
                                  <Input
                                    id={`q29_other_${num}_cost`}
                                    type="number"
                                    value={formData[`q29_other_${num}_cost`] || ""}
                                    onChange={(e) => updateFormData(`q29_other_${num}_cost`, e.target.value)}
                                    placeholder="$"
                                  />
                                </div>
                              )
                            })}

                            {/* Add "Add Other" button */}
                            <div className="mt-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const newCount = otherExpensesCount + 1
                                  setOtherExpensesCount(newCount)
                                  // Initialize new fields in formData
                                  updateFormData(`q29_other_${newCount}_desc`, "")
                                  updateFormData(`q29_other_${newCount}_cost`, "")
                                }}
                                className="text-sm"
                              >
                                + Add Other Expense
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Final Comments Section */}
                      <div className="space-y-4 pt-6 border-t">
                        <Label className="text-base">
                          Finally, please indicate your top three comments or questions at this time if any?
                        </Label>

                        <div>
                          <Label htmlFor="q29_comment1">1.</Label>
                          <Textarea
                            id="q29_comment1"
                            rows={3}
                            value={formData.q29_comment1}
                            onChange={(e) => updateFormData("q29_comment1", e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="q29_comment2">2.</Label>
                          <Textarea
                            id="q29_comment2"
                            rows={3}
                            value={formData.q29_comment2}
                            onChange={(e) => updateFormData("q29_comment2", e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="q29_comment3">3.</Label>
                          <Textarea
                            id="q29_comment3"
                            rows={3}
                            value={formData.q29_comment3}
                            onChange={(e) => updateFormData("q29_comment3", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 bg-yellow-50 border-2 border-yellow-400 p-6 rounded-lg">
                      <h3 className="font-semibold text-lg text-yellow-900 mb-4">Warning, Disclaimer & Limitations:</h3>
                      <ul className="space-y-3 text-sm text-yellow-900">
                        <li className="flex gap-2">
                          <span className="font-semibold">•</span>
                          <span>
                            Our opinion of Your suitability to undertake Our specialist program is based on Our
                            interpretation of the various laws in place at the time of which these laws may be subject
                            to change by The Parliament of Australia and or subject to change of interpretation by any
                            Australian or state regulator, tribunal and or the courts.
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-semibold">•</span>
                          <span>
                            The results of this questionnaire is determined by Your response to the questions.
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-semibold">•</span>
                          <span>
                            We disclaim any and all liability arising from any errors, misinterpretation or omissions in
                            Your responses to the questions.
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-semibold">•</span>
                          <span>
                            Without Our further guidance, You must not act upon any thoughts We might offer after this
                            questionnaire has been completed by You as Our formulated opinion does not bind Us unless
                            and until We put Our formal and full advice to You in writing.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  {currentStep < 2 && (
                    <div className="flex justify-between items-center pt-6 border-t">
                      <button
                        onClick={handleBack}
                        className="px-6 py-2 rounded-md border border-input hover:bg-accent hover:text-accent-foreground font-semibold"
                        disabled={currentStep === 0}
                      >
                        Back
                      </button>

                      <div className="flex gap-2">
                        {formData.email && currentStep > 0 && (
                          <SaveProgressDialog
                            email={formData.email}
                            questionnaireType="get-started"
                            formData={formData}
                            currentStep={currentStep}
                            existingToken={savedSessionToken || undefined}
                            onSaved={handleSessionSaved}
                          />
                        )}

                        <button
                          onClick={handleNext}
                          className="px-6 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-hover"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Strategy Selector - DYH Business, Wealth & Lifestyle Self-Profiler (64 Questions) */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Contact Info Display */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Your Contact Details:</p>
                    <div className="text-sm space-y-1 text-blue-800">
                      <p>
                        <strong>Name:</strong> {formData.fullName}
                      </p>
                      <p>
                        <strong>Email:</strong> {formData.email}
                      </p>
                      <p>
                        <strong>Address:</strong> {formData.streetAddress}, {formData.suburb} {formData.state}{" "}
                        {formData.postcode}
                      </p>
                    </div>
                  </div>

                  {/* Introductory Text */}
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4 text-sm text-gray-700 leading-relaxed">
                    <p>
                      In order to determine which of the "Deduct Your Home" Procedures can suit, it is essential this
                      profiler is completed very carefully. Please retain a copy for your records as over time, it may
                      be useful to "check back" now and again with reference as to how the answers were considered at
                      this time relative to the future (a "compass check" of sorts if you like).
                    </p>
                    <p>
                      Additionally, please consider that there are 20 possible Procedures that can operate as either a
                      sole trader/partnership or as a company, making up 40 possible outcomes (i.e 2 x 20). It would
                      therefore be impractical and irresponsible of us to push beyond the already considerable scope of
                      this profiling tool, to hold this process up as being able to determine whether any particular
                      business ownership structure is right, better or best i.e; sole trader, partnership, company or in
                      using a company as trustee for a family trust. As Procedures can operate under all of these
                      structures, careful consideration must be given to matters as mentioned As you would expect, we
                      are registered tax agents and may be able to assist you on a more personal level.
                    </p>
                    <p>
                      Of note, more than one Procedure can be implemented to form a "Combo". For example, you may plan
                      to sell an active business asset such as plant or goodwill (SBRB), to then vacate the leased
                      premises these belonged within (SBLB) as you set about purchasing your own home under any of the
                      SBRB, TERS or HBRS. It is currently beyond the scope of this software to determine Combos although
                      with a little thought, it's really quite easy to apply them in reality.
                    </p>
                    <p>
                      Not every question is required in order to determine the right product or strategy for you (and in
                      this case, the right Procedure), however every question is included for good reason. This profiler
                      is designed to make you think about things that have probably never played on your mind before and
                      in new and interesting ways. It is designed to help you to understand yourself better and to learn
                      and grow from within.
                    </p>
                    <p className="font-semibold">
                      This is essential to successfully adapt the right mindset so as to enrich your life!
                    </p>
                  </div>

                  {/* Strategy Live Preview */}
                  {determinedStrategy && (
                    <div className="mt-6 bg-green-50 p-4 rounded-lg border-2 border-green-500">
                      <h3 className="font-bold text-lg text-green-900 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Your Recommended DYH Strategy
                      </h3>
                      <p className="text-green-800 font-semibold mb-1">{determinedStrategy.name}</p>
                      <p className="text-green-700">{determinedStrategy.description}</p>
                      <p className="text-xs text-green-600 mt-2 italic">
                        Based on your answers to questions 3, 13, 15, 16, 26, and 40
                      </p>
                    </div>
                  )}

                  {/* Important Notice */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <Info className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-700">
                        <p className="font-semibold">IMPORTANT: Read the hints before you answer!</p>
                        <p className="mt-1">
                          Where you see "Your answer does not contribute to the selection process", if applicable,
                          please answer as best you can otherwise leave BLANK.
                        </p>
                        <p className="mt-1 font-semibold">
                          At questions 15, 16 and 26 however, if inapplicable to your situation, you MUST answer NO or
                          the process will NOT provide a satisfactory outcome.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-2">BUSINESS, WEALTH & LIFESTYLE SELF-PROFILER</h2>
                    <p className="text-muted-foreground">
                      This comprehensive questionnaire will help determine which "Deduct Your Home" procedure best suits
                      your situation.
                    </p>
                  </div>

                  {/* Q1-2: Business Assets & Liabilities */}
                  <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-lg">Questions 1-2: Business Assets & Liabilities</h3>
                    <p className="text-sm text-muted-foreground italic">
                      With consideration to business assets you could consider selling...
                    </p>

                    <div>
                      <Label className="text-sm font-semibold">
                        1. Plant & Equipment, Goodwill, IP/Patents, Business Real Property
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Description, Owner, Date, $ Value, (TBS? Y/N) - One per line
                      </p>
                      <Textarea
                        id="ss-q1-plant-equipment"
                        value={formData.ss_q1_plant_equipment}
                        onChange={(e) => updateFormData("ss_q1_plant_equipment", e.target.value)}
                        placeholder="e.g., Van, Toyota Hiace, Self, 2020, $35,000, Y"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">
                        2. All Business Liabilities (tax debts, business loans, supplier debts, etc.)
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Description, Lender/Creditor, Date, $ Amount - One per line
                      </p>
                      <Textarea
                        id="ss-q2-liabilities"
                        value={formData.ss_q2_liabilities}
                        onChange={(e) => updateFormData("ss_q2_liabilities", e.target.value)}
                        placeholder="e.g., Equipment loan, ABC Bank, 2022, $15,000"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Q3-8: Home Business Questions */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Questions 3-8: Home Business Assessment</h3>

                    {/* Q3 */}
                    <div className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50/50">
                      <Label className="text-base font-semibold">
                        3. Do you already operate a home based business?
                      </Label>
                      <RadioGroup
                        id="ss-q3"
                        value={formData.ss_q3}
                        onValueChange={(v) => updateFormData("ss_q3", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q3-yes" />
                          <Label htmlFor="ss-q3-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q3-no" />
                          <Label htmlFor="ss-q3-no" className="font-normal">
                            No{" "}
                            <span className="text-blue-600 font-semibold ml-1">(if no, then move straight to Q8)</span>
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Presuming that you want to keep this going, then either of The HBRS (i)
                        or (ii) can apply.
                      </div>
                    </div>

                    <div className="ml-6 space-y-4 border-l-4 border-blue-300 pl-4">
                      {/* Q4 */}
                      <div>
                        <Label htmlFor="ss-q4" className="text-base font-semibold">
                          4. Re (Q.3) If yes, what is it? (Please describe):
                        </Label>
                        <Input
                          id="ss-q4"
                          value={formData.ss_q4}
                          onChange={(e) => updateFormData("ss_q4", e.target.value)}
                          placeholder="Describe your home-based business"
                          className="mt-2"
                        />
                        <div className="mt-2 text-xs bg-gray-100 p-3 rounded">
                          <strong>Hints & Tips:</strong> Your answer does not contribute to the selection process
                          however it's useful info to any advisers.
                        </div>
                      </div>

                      {/* Q5 */}
                      <div>
                        <Label htmlFor="ss-q5" className="text-base font-semibold">
                          5. How many people work in it?
                        </Label>
                        <Input
                          id="ss-q5"
                          type="number"
                          value={formData.ss_q5}
                          onChange={(e) => updateFormData("ss_q5", e.target.value)}
                          placeholder="Number of people"
                          className="mt-2"
                        />
                        <div className="mt-2 text-xs bg-gray-100 p-3 rounded">
                          <strong>Hints & Tips:</strong> Your answer does not contribute to the selection process
                          however you must check with local council as if there are more than say two or three who don't
                          live there, they may not allow them all to work at your home.
                        </div>
                      </div>

                      {/* Q6 */}
                      <div>
                        <Label className="text-base font-semibold">
                          6. Do more than 2 people work at your home business premises who don't live there?
                        </Label>
                        <RadioGroup
                          id="ss-q6"
                          value={formData.ss_q6}
                          onValueChange={(v) => updateFormData("ss_q6", v)}
                          className="mt-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="ss-q6-yes" />
                            <Label htmlFor="ss-q6-yes" className="font-normal">
                              Yes
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="ss-q6-no" />
                            <Label htmlFor="ss-q6-no" className="font-normal">
                              No
                            </Label>
                          </div>
                        </RadioGroup>
                        <div className="mt-2 text-xs bg-gray-100 p-3 rounded">
                          <strong>Hints & Tips:</strong> Your answer does not contribute to the selection process
                          however if so, the business use area within the home itself must not exceed 50m².
                        </div>
                      </div>

                      {/* Q7 */}
                      <div>
                        <Label className="text-base font-semibold">
                          7. Are they employees or contractors? PLEASE CIRCLE OR HIGHLIGHT WHICH:
                        </Label>
                        <RadioGroup
                          id="ss-q7"
                          value={formData.ss_q7}
                          onValueChange={(v) => updateFormData("ss_q7", v)}
                          className="mt-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="employees" id="ss-q7-employees" />
                            <Label htmlFor="ss-q7-employees" className="font-normal">
                              EMPLOYEES
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="contractors" id="ss-q7-contractors" />
                            <Label htmlFor="ss-q7-contractors" className="font-normal">
                              CONTRACTORS
                            </Label>
                          </div>
                        </RadioGroup>
                        <div className="mt-2 text-xs bg-gray-100 p-3 rounded">
                          <strong>Hints & Tips:</strong> Your answer does not contribute to the selection process
                          however it's useful info to any advisers. Can affect your workers compensation insurance
                          obligations.
                        </div>
                      </div>
                    </div>

                    {/* Q8 */}
                    <div ref={q8Ref} className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50/50">
                      <Label>
                        8. If you're not already running a home based business, would you consider running one (either
                        part or full-time as your main occupation or to derive extra income)?
                      </Label>
                      <RadioGroup
                        id="ss-q8"
                        value={formData.ss_q8}
                        onValueChange={(v) => updateFormData("ss_q8", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q8-yes" />
                          <Label htmlFor="ss-q8-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q8-no" />
                          <Label htmlFor="ss-q8-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Your answer does not contribute to the selection process however if no,
                        then why are you doing this?
                      </div>
                    </div>
                  </div>

                  {/* Q9-14: Cash Flow & Property */}
                  <div className="space-y-4">
                    {/* Q9 */}
                    <div className="border-l-4 border-green-400 pl-4 py-2">
                      <Label>9. Would any degree of customer presence at your home be acceptable?</Label>
                      <RadioGroup
                        id="ss-q9"
                        value={formData.ss_q9}
                        onValueChange={(v) => updateFormData("ss_q9", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q9-yes" />
                          <Label htmlFor="ss-q9-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q9-no" />
                          <Label htmlFor="ss-q9-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> This will help you to narrow down and choose the right type of business
                        to run.
                      </div>
                    </div>

                    {/* Q10-12: Cash flow management questions */}
                    <div className="border-l-4 border-green-400 pl-4 py-2">
                      <Label>
                        10. Could you accept the possibility of a drop in business income for an undetermined period
                        whilst you adjusted into a home based business?
                      </Label>
                      <RadioGroup
                        id="ss-q10"
                        value={formData.ss_q10}
                        onValueChange={(v) => updateFormData("ss_q10", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q10-yes" />
                          <Label htmlFor="ss-q10-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q10-no" />
                          <Label htmlFor="ss-q10-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> If not, is it because you don't have any cash reserves or home equity to
                        draw on or is it because you just can't bear the thought?
                      </div>
                    </div>

                    <div className="border-l-4 border-green-400 pl-4 py-2">
                      <Label>
                        11. Are you familiar with business overdraft, line of credit, or redraw facility banking
                        products and could you effectively operate one?
                      </Label>
                      <RadioGroup
                        id="ss-q11"
                        value={formData.ss_q11}
                        onValueChange={(v) => updateFormData("ss_q11", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q11-yes" />
                          <Label htmlFor="ss-q11-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q11-no" />
                          <Label htmlFor="ss-q11-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Your answer does not contribute to the selection process however if no,
                        then it may be wise to seek some advice about these as they're critical for managing cash flow.
                      </div>
                    </div>

                    {/* Q12 */}
                    <div className="border-l-4 border-green-400 pl-4 py-2">
                      <Label>
                        12. Do you know that you must never use your home equity or mortgage redraw facility to fund
                        ordinary business cash flow requirements?
                      </Label>
                      <RadioGroup
                        id="ss-q12"
                        value={formData.ss_q12}
                        onValueChange={(v) => updateFormData("ss_q12", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q12-yes" />
                          <Label htmlFor="ss-q12-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q12-no" />
                          <Label htmlFor="ss-q12-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> The ATO strictly prohibits this, so if you have, you may have
                        inadvertently created a tax problem for yourself. BUT, don't worry, we're here to help you fix
                        it.
                      </div>
                    </div>

                    {/* Q13 */}
                    <div className="border-l-4 border-green-400 pl-4 py-2">
                      <Label>
                        13. In retrospect, what percentage of the business's needs might YOU have previously met by
                        effectively using your own private "borrowing capacity" for your business?
                      </Label>
                      <RadioGroup
                        id="ss-q13"
                        value={formData.ss_q13}
                        onValueChange={(v) => updateFormData("ss_q13", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0-10%" id="ss-q13-0-10" />
                          <Label htmlFor="ss-q13-0-10" className="font-normal">
                            0-10%
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="11-20%" id="ss-q13-11-20" />
                          <Label htmlFor="ss-q13-11-20" className="font-normal">
                            11-20%
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="21-30%" id="ss-q13-21-30" />
                          <Label htmlFor="ss-q13-21-30" className="font-normal">
                            21-30%
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="31-40%" id="ss-q13-31-40" />
                          <Label htmlFor="ss-q13-31-40" className="font-normal">
                            31-40%
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="41-50%" id="ss-q13-41-50" />
                          <Label htmlFor="ss-q13-41-50" className="font-normal">
                            41-50%
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="51%+" id="ss-q13-51plus" />
                          <Label htmlFor="ss-q13-51plus" className="font-normal">
                            51%+
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> This shows how much you've relied on your private borrowing capacity and
                        whether you might be able to claim some of your home expenses as business expenses.
                      </div>
                    </div>

                    {/* Q14 */}
                    <div className="border-l-4 border-green-400 pl-4 py-2">
                      <Label className="text-base">
                        14. Would you be willing to work with us to significantly reduce your tax liability?
                      </Label>
                      <RadioGroup
                        id="ss-q14"
                        value={formData.ss_q14}
                        onValueChange={(v) => updateFormData("ss_q14", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q14-yes" />
                          <Label htmlFor="ss-q14-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q14-no" />
                          <Label htmlFor="ss-q14-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> This is a critical question.
                      </div>
                    </div>
                  </div>

                  {/* Q15-20: Property Usage & Tax History */}
                  <div className="space-y-4">
                    {/* Q15 */}
                    <div className="border-l-4 border-orange-400 pl-4 py-2">
                      <Label className="text-base">15. Do you have any business plans or proposals?</Label>
                      <RadioGroup
                        id="ss-q15"
                        value={formData.ss_q15}
                        onValueChange={(v) => updateFormData("ss_q15", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q15-yes" />
                          <Label htmlFor="ss-q15-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q15-no" />
                          <Label htmlFor="ss-q15-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> If YES, then we'll want to see them. If NO, then we'll help you create
                        them.
                      </div>
                    </div>

                    {/* Q16 */}
                    <div className="border-l-4 border-orange-400 pl-4 py-2">
                      <Label className="text-base">
                        16. Do you have any existing client lists or databases we could use?
                      </Label>
                      <RadioGroup
                        id="ss-q16"
                        value={formData.ss_q16}
                        onValueChange={(v) => updateFormData("ss_q16", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q16-yes" />
                          <Label htmlFor="ss-q16-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q16-no" />
                          <Label htmlFor="ss-q16-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> If YES, then we'll want to see them. If NO, then we'll help you create
                        them.
                      </div>
                    </div>

                    {/* Q17 */}
                    <div className="border-l-4 border-orange-400 pl-4 py-2">
                      <Label className="text-base">17. Do you have any existing marketing materials or website?</Label>
                      <RadioGroup
                        id="ss-q17"
                        value={formData.ss_q17}
                        onValueChange={(v) => updateFormData("ss_q17", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q17-yes" />
                          <Label htmlFor="ss-q17-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q17-no" />
                          <Label htmlFor="ss-q17-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> If YES, then we'll want to see them. If NO, then we'll help you create
                        them.
                      </div>
                    </div>

                    {/* Q18 */}
                    <div className="border-l-4 border-purple-400 pl-4 py-2">
                      <Label className="text-base">18. Do you have any business signage?</Label>
                      <RadioGroup
                        id="ss-q18"
                        value={formData.ss_q18}
                        onValueChange={(v) => updateFormData("ss_q18", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q18-yes" />
                          <Label htmlFor="ss-q18-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q18-no" />
                          <Label htmlFor="ss-q18-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> If YES, then we'll want to see them. If NO, then we'll help you create
                        them.
                      </div>
                    </div>

                    {/* Q19 */}
                    <div className="border-l-4 border-purple-400 pl-4 py-2">
                      <Label className="text-base">19. Do you have any business vehicles?</Label>
                      <RadioGroup
                        id="ss-q19"
                        value={formData.ss_q19}
                        onValueChange={(v) => updateFormData("ss_q19", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q19-yes" />
                          <Label htmlFor="ss-q19-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q19-no" />
                          <Label htmlFor="ss-q19-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> If YES, then we'll want to see them. If NO, then we'll help you create
                        them.
                      </div>
                    </div>

                    {/* Q20 */}
                    <div className="border-l-4 border-purple-400 pl-4 py-2">
                      <Label className="text-base">
                        20. Do you have any business telephone numbers or internet services?
                      </Label>
                      <RadioGroup
                        id="ss-q20"
                        value={formData.ss_q20}
                        onValueChange={(v) => updateFormData("ss_q20", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q20-yes" />
                          <Label htmlFor="ss-q20-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q20-no" />
                          <Label htmlFor="ss-q20-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> If YES, then we'll want to see them. If NO, then we'll help you create
                        them.
                      </div>
                    </div>
                  </div>

                  {/* Q21-26: Business Operations & Client Relations */}
                  <div className="space-y-4">
                    {/* Q21 */}
                    <div className="border-l-4 border-pink-400 pl-4 py-2">
                      <Label className="text-base">21. Do you have any business trading premises?</Label>
                      <RadioGroup
                        id="ss-q21"
                        value={formData.ss_q21}
                        onValueChange={(v) => updateFormData("ss_q21", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q21-yes" />
                          <Label htmlFor="ss-q21-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q21-no" />
                          <Label htmlFor="ss-q21-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> If YES, then we'll want to see them. If NO, then we'll help you create
                        them.
                      </div>
                    </div>

                    {/* Q22 */}
                    <div className="border-l-4 border-pink-400 pl-4 py-2">
                      <Label className="text-base">
                        22. How many years have you been operating this business (or similar)?
                      </Label>
                      <Input
                        id="ss-q22-experience"
                        type="number"
                        value={formData.ss_q22_experience}
                        onChange={(e) => updateFormData("ss_q22_experience", e.target.value)}
                        placeholder="Years"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> This question is critical for the selection process.
                      </div>
                    </div>

                    {/* Q23 */}
                    <div className="border-l-4 border-pink-400 pl-4 py-2">
                      <Label className="text-base">23. How did you learn about us?</Label>
                      <Input
                        id="ss-q23-learned"
                        value={formData.ss_q23_learned}
                        onChange={(e) => updateFormData("ss_q23_learned", e.target.value)}
                        placeholder="e.g., Google Search, Friend, Advertisement"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Your answer does not contribute to the selection process however it's
                        useful info to any advisers.
                      </div>
                    </div>

                    {/* Q24 */}
                    <div className="border-l-4 border-cyan-400 pl-4 py-2">
                      <Label className="text-base">24. Have you considered running a business from home before?</Label>
                      <RadioGroup
                        id="ss-q24"
                        value={formData.ss_q24}
                        onValueChange={(v) => updateFormData("ss_q24", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q24-yes" />
                          <Label htmlFor="ss-q24-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q24-no" />
                          <Label htmlFor="ss-q24-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Your answer does not contribute to the selection process however if no,
                        then why are you doing this?
                      </div>
                    </div>

                    {/* Q25 */}
                    <div className="border-l-4 border-cyan-400 pl-4 py-2">
                      <Label className="text-base">25. Do you have any partners in your business?</Label>
                      <RadioGroup
                        id="ss-q25"
                        value={formData.ss_q25}
                        onValueChange={(v) => updateFormData("ss_q25", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q25-yes" />
                          <Label htmlFor="ss-q25-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q25-no" />
                          <Label htmlFor="ss-q25-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Your answer does not contribute to the selection process however if no,
                        then why are you doing this?
                      </div>
                    </div>

                    {/* Q26 */}
                    <div className="border-l-4 border-cyan-400 pl-4 py-2">
                      <Label className="text-base">26. Do you have any business premises that you lease?</Label>
                      <RadioGroup
                        id="ss-q26"
                        value={formData.ss_q26}
                        onValueChange={(v) => updateFormData("ss_q26", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q26-yes" />
                          <Label htmlFor="ss-q26-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q26-no" />
                          <Label htmlFor="ss-q26-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> If YES, then answer "YES" to Q.40. If NO, then answer "NO" to Q.40.
                      </div>
                    </div>
                  </div>

                  {/* Q27-32: Business Size and Structure */}
                  <div className="space-y-4">
                    {/* Q27 */}
                    <div className="border-l-4 border-teal-400 pl-4 py-2">
                      <Label className="text-base">
                        27. How many people are employed by your business (including yourself)?
                      </Label>
                      <Input
                        id="ss-q27"
                        type="number"
                        value={formData.ss_q27}
                        onChange={(e) => updateFormData("ss_q27", e.target.value)}
                        placeholder="Number of people"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Your answer does not contribute to the selection process however it's
                        useful info to any advisers.
                      </div>
                    </div>

                    {/* Q28 */}
                    <div className="border-l-4 border-teal-400 pl-4 py-2">
                      <Label className="text-base">28. What is the approximate annual turnover of your business?</Label>
                      <Input
                        id="ss-q28"
                        type="number"
                        value={formData.ss_q28}
                        onChange={(e) => updateFormData("ss_q28", e.target.value)}
                        placeholder="$"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Your answer does not contribute to the selection process however it's
                        useful info to any advisers.
                      </div>
                    </div>

                    {/* Q29 */}
                    <div className="border-l-4 border-teal-400 pl-4 py-2">
                      <Label className="text-base">29. What is the approximate annual profit of your business?</Label>
                      <Input
                        id="ss-q29"
                        type="number"
                        value={formData.ss_q29}
                        onChange={(e) => updateFormData("ss_q29", e.target.value)}
                        placeholder="$"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Your answer does not contribute to the selection process however it's
                        useful info to any advisers.
                      </div>
                    </div>

                    {/* Q30 */}
                    <div className="border-l-4 border-indigo-400 pl-4 py-2">
                      <Label className="text-base">30. Do you have any shareholders in your business?</Label>
                      <RadioGroup
                        id="ss-q30"
                        value={formData.ss_q30}
                        onValueChange={(v) => updateFormData("ss_q30", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q30-yes" />
                          <Label htmlFor="ss-q30-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q30-no" />
                          <Label htmlFor="ss-q30-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Your answer does not contribute to the selection process however if no,
                        then why are you doing this?
                      </div>
                    </div>

                    {/* Q31 */}
                    <div className="border-l-4 border-indigo-400 pl-4 py-2">
                      <Label className="text-base">31. Do you have any directors in your business?</Label>
                      <RadioGroup
                        id="ss-q31"
                        value={formData.ss_q31}
                        onValueChange={(v) => updateFormData("ss_q31", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q31-yes" />
                          <Label htmlFor="ss-q31-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q31-no" />
                          <Label htmlFor="ss-q31-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Your answer does not contribute to the selection process however if no,
                        then why are you doing this?
                      </div>
                    </div>

                    {/* Q32 */}
                    <div className="border-l-4 border-indigo-400 pl-4 py-2">
                      <Label className="text-base">32. Do you have any company secretaries in your business?</Label>
                      <RadioGroup
                        id="ss-q32"
                        value={formData.ss_q32}
                        onValueChange={(v) => updateFormData("ss_q32", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q32-yes" />
                          <Label htmlFor="ss-q32-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q32-no" />
                          <Label htmlFor="ss-q32-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Your answer does not contribute to the selection process however if no,
                        then why are you doing this?
                      </div>
                    </div>
                  </div>

                  {/* Q33-39: Risk Appetite & Future Goals */}
                  <div className="space-y-4">
                    {/* Q33 */}
                    <div className="border-l-4 border-violet-400 pl-4 py-2">
                      <Label className="text-base">33. What is your primary goal for your business?</Label>
                      <Textarea
                        id="ss-q33"
                        value={formData.ss_q33}
                        onChange={(e) => updateFormData("ss_q33", e.target.value)}
                        placeholder="e.g., Financial freedom, Lifestyle, Exit strategy"
                        rows={3}
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q34 */}
                    <div className="border-l-4 border-violet-400 pl-4 py-2">
                      <Label className="text-base">34. What is your biggest fear regarding your business?</Label>
                      <Textarea
                        id="ss-q34"
                        value={formData.ss_q34}
                        onChange={(e) => updateFormData("ss_q34", e.target.value)}
                        placeholder="e.g., Failure, Competition, Lack of growth"
                        rows={3}
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q35 */}
                    <div className="border-l-4 border-violet-400 pl-4 py-2">
                      <Label className="text-base">35. What are your business values?</Label>
                      <Textarea
                        id="ss-q35"
                        value={formData.ss_q35}
                        onChange={(e) => updateFormData("ss_q35", e.target.value)}
                        placeholder="e.g., Integrity, Customer service, Innovation"
                        rows={3}
                        className="mt-2"
                      />
                      <Input
                        id="ss-q35-other"
                        value={formData.ss_q35_other}
                        onChange={(e) => updateFormData("ss_q35_other", e.target.value)}
                        placeholder="Or specify other values here"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q36 */}
                    <div className="border-l-4 border-blue-400 pl-4 py-2">
                      <Label className="text-base">36. What is your attitude towards risk?</Label>
                      <RadioGroup
                        id="ss-q36-attitude"
                        value={formData.ss_q36_attitude}
                        onValueChange={(v) => updateFormData("ss_q36_attitude", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="ss-q36-low" />
                          <Label htmlFor="ss-q36-low" className="font-normal">
                            Low risk tolerance
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="ss-q36-medium" />
                          <Label htmlFor="ss-q36-medium" className="font-normal">
                            Medium risk tolerance
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="ss-q36-high" />
                          <Label htmlFor="ss-q36-high" className="font-normal">
                            High risk tolerance
                          </Label>
                        </div>
                      </RadioGroup>
                      <Input
                        id="ss-q36-other"
                        value={formData.ss_q36_other}
                        onChange={(e) => updateFormData("ss_q36_other", e.target.value)}
                        placeholder="Or specify your attitude towards risk here"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q37 */}
                    <div className="border-l-4 border-blue-400 pl-4 py-2">
                      <Label className="text-base">37. Are you interested in Self Managed Super Funds (SMSF)?</Label>
                      <RadioGroup
                        id="ss-q37-smsf"
                        value={formData.ss_q37_smsf}
                        onValueChange={(v) => updateFormData("ss_q37_smsf", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q37-smsf-yes" />
                          <Label htmlFor="ss-q37-smsf-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q37-smsf-no" />
                          <Label htmlFor="ss-q37-smsf-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div>
                          <Label>Pre-Retirement Goals:</Label>
                          <Input
                            id="ss-q37-pre"
                            value={formData.ss_q37_pre}
                            onChange={(e) => updateFormData("ss_q37_pre", e.target.value)}
                            placeholder="e.g., Investment diversification"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Post-Retirement Goals:</Label>
                          <Input
                            id="ss-q37-post"
                            value={formData.ss_q37_post}
                            onChange={(e) => updateFormData("ss_q37_post", e.target.value)}
                            placeholder="e.g., Regular income stream"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Input
                        id="ss-q37-pre-other"
                        value={formData.ss_q37_pre_other}
                        onChange={(e) => updateFormData("ss_q37_pre_other", e.target.value)}
                        placeholder="Or specify other pre-retirement goals here"
                        className="mt-2"
                      />
                      <Input
                        id="ss-q37-post-other"
                        value={formData.ss_q37_post_other}
                        onChange={(e) => updateFormData("ss_q37_post_other", e.target.value)}
                        placeholder="Or specify other post-retirement goals here"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q38 */}
                    <div className="border-l-4 border-blue-400 pl-4 py-2">
                      <Label className="text-base">
                        38. Do you have any business plans or proposals for post-retirement?
                      </Label>
                      <RadioGroup
                        id="ss-q38-post-retirement"
                        value={formData.ss_q38_post_retirement}
                        onValueChange={(v) => updateFormData("ss_q38_post_retirement", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q38-post-retirement-yes" />
                          <Label htmlFor="ss-q38-post-retirement-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q38-post-retirement-no" />
                          <Label htmlFor="ss-q38-post-retirement-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <Input
                        id="ss-q38-other"
                        value={formData.ss_q38_other}
                        onChange={(e) => updateFormData("ss_q38_other", e.target.value)}
                        placeholder="Or specify your post-retirement business plans here"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q39 */}
                    <div className="border-l-4 border-blue-400 pl-4 py-2">
                      <Label className="text-base">39. What do you like most about your current business?</Label>
                      <Textarea
                        id="ss-q39-likes"
                        value={formData.ss_q39_likes}
                        onChange={(e) => updateFormData("ss_q39_likes", e.target.value)}
                        placeholder="e.g., Flexibility, Income, Client relationships"
                        rows={3}
                        className="mt-2"
                      />
                      <Input
                        id="ss-q39-other"
                        value={formData.ss_q39_other}
                        onChange={(e) => updateFormData("ss_q39_other", e.target.value)}
                        placeholder="Or specify other aspects you like here"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>
                  </div>

                  {/* Q40-42: Business Growth & Exit Strategies */}
                  <div className="space-y-4">
                    {/* Q40 */}
                    <div className="border-l-4 border-red-400 pl-4 py-2">
                      <Label className="text-base">40. What do you dislike most about your current business?</Label>
                      <Textarea
                        id="ss-q40-dislikes"
                        value={formData.ss_q40_dislikes}
                        onChange={(e) => updateFormData("ss_q40_dislikes", e.target.value)}
                        placeholder="e.g., Long hours, Administrative burden, Cash flow challenges"
                        rows={3}
                        className="mt-2"
                      />
                      <Input
                        id="ss-q40-other"
                        value={formData.ss_q40_other}
                        onChange={(e) => updateFormData("ss_q40_other", e.target.value)}
                        placeholder="Or specify other dislikes here"
                        className="mt-2"
                      />
                    </div>

                    {/* Q41 */}
                    <div className="border-l-4 border-red-400 pl-4 py-2">
                      <Label className="text-base">41. What is your ideal exit strategy for your business?</Label>
                      <Textarea
                        id="ss-q41-exit-strategy"
                        value={formData.ss_q41_exit_strategy}
                        onChange={(e) => updateFormData("ss_q41_exit_strategy", e.target.value)}
                        placeholder="e.g., Sell to competitor, Pass to family, Gradual wind-down"
                        rows={3}
                        className="mt-2"
                      />
                      <Input
                        id="ss-q41-other"
                        value={formData.ss_q41_other}
                        onChange={(e) => updateFormData("ss_q41_other", e.target.value)}
                        placeholder="Or specify your exit strategy here"
                        className="mt-2"
                      />
                    </div>

                    {/* Q42 */}
                    <div className="border-l-4 border-red-400 pl-4 py-2">
                      <Label className="text-base">42. What are your business growth aspirations?</Label>
                      <Textarea
                        id="ss-q42-growth-aspirations"
                        value={formData.ss_q42_growth_aspirations}
                        onChange={(e) => updateFormData("ss_q42_growth_aspirations", e.target.value)}
                        placeholder="e.g., Expand locations, Increase revenue by X%, Hire more staff"
                        rows={3}
                        className="mt-2"
                      />
                      <Input
                        id="ss-q42-other"
                        value={formData.ss_q42_other}
                        onChange={(e) => updateFormData("ss_q42_other", e.target.value)}
                        placeholder="Or specify your growth aspirations here"
                        className="mt-2"
                      />
                    </div>

                    {/* Q43 */}
                    <div className="border-l-4 border-red-400 pl-4 py-2">
                      <Label className="text-base">43. What are your business's main expenses?</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label htmlFor="ss_q43_rent">Rent</Label>
                          <Input
                            id="ss_q43_rent"
                            type="number"
                            value={formData.ss_q43_rent}
                            onChange={(e) => updateFormData("ss_q43_rent", e.target.value)}
                            placeholder="$"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_staff_num">Staff (Number)</Label>
                          <Input
                            id="ss_q43_staff_num"
                            type="number"
                            value={formData.ss_q43_staff_num}
                            onChange={(e) => updateFormData("ss_q43_staff_num", e.target.value)}
                            placeholder="Number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_staff_cost">Staff (Cost)</Label>
                          <Input
                            id="ss_q43_staff_cost"
                            type="number"
                            value={formData.ss_q43_staff_cost}
                            onChange={(e) => updateFormData("ss_q43_staff_cost", e.target.value)}
                            placeholder="$"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_super">Staff Superannuation</Label>
                          <Input
                            id="ss_q43_super"
                            type="number"
                            value={formData.ss_q43_super}
                            onChange={(e) => updateFormData("ss_q43_super", e.target.value)}
                            placeholder="$"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_equipment_lease">Equipment Lease</Label>
                          <Input
                            id="ss_q43_equipment_lease"
                            type="number"
                            value={formData.ss_q43_equipment_lease}
                            onChange={(e) => updateFormData("ss_q43_equipment_lease", e.target.value)}
                            placeholder="$"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_equipment_depreciation">Equipment Depreciation</Label>
                          <Input
                            id="ss_q43_equipment_depreciation"
                            type="number"
                            value={formData.ss_q43_equipment_depreciation}
                            onChange={(e) => updateFormData("ss_q43_equipment_depreciation", e.target.value)}
                            placeholder="$"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_motor">Motor Vehicle Expenses</Label>
                          <Input
                            id="ss_q43_motor"
                            type="number"
                            value={formData.ss_q43_motor}
                            onChange={(e) => updateFormData("ss_q43_motor", e.target.value)}
                            placeholder="$"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_council">Council Rates</Label>
                          <Input
                            id="ss_q43_council"
                            type="number"
                            value={formData.ss_q43_council}
                            onChange={(e) => updateFormData("ss_q43_council", e.target.value)}
                            placeholder="$"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_water">Water Rates</Label>
                          <Input
                            id="ss_q43_water"
                            type="number"
                            value={formData.ss_q43_water}
                            onChange={(e) => updateFormData("ss_q43_water", e.target.value)}
                            placeholder="$"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_land_tax">Land Tax</Label>
                          <Input
                            id="ss_q43_land_tax"
                            type="number"
                            value={formData.ss_q43_land_tax}
                            onChange={(e) => updateFormData("ss_q43_land_tax", e.target.value)}
                            placeholder="$"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_power">Power/Electricity</Label>
                          <Input
                            id="ss_q43_power"
                            type="number"
                            value={formData.ss_q43_power}
                            onChange={(e) => updateFormData("ss_q43_power", e.target.value)}
                            placeholder="$"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_telephone">Phone/Internet</Label>
                          <Input
                            id="ss_q43_telephone"
                            type="number"
                            value={formData.ss_q43_telephone}
                            onChange={(e) => updateFormData("ss_q43_telephone", e.target.value)}
                            placeholder="$"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_advertising">Advertising</Label>
                          <Input
                            id="ss_q43_advertising"
                            type="number"
                            value={formData.ss_q43_advertising}
                            onChange={(e) => updateFormData("ss_q43_advertising", e.target.value)}
                            placeholder="$"
                          />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ss_q43_other_1_desc">Other Expense</Label>
                          <Input
                            id="ss_q43_other_1_desc"
                            value={formData.ss_q43_other_1_desc}
                            onChange={(e) => updateFormData("ss_q43_other_1_desc", e.target.value)}
                            placeholder="Description"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_other_1">&nbsp;</Label>
                          <Input
                            id="ss_q43_other_1"
                            type="number"
                            value={formData.ss_q43_other_1}
                            onChange={(e) => updateFormData("ss_q43_other_1", e.target.value)}
                            placeholder="$"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ss_q43_other_2_desc">Other Expense</Label>
                          <Input
                            id="ss_q43_other_2_desc"
                            value={formData.ss_q43_other_2_desc}
                            onChange={(e) => updateFormData("ss_q43_other_2_desc", e.target.value)}
                            placeholder="Description"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_other_2">&nbsp;</Label>
                          <Input
                            id="ss_q43_other_2"
                            type="number"
                            value={formData.ss_q43_other_2}
                            onChange={(e) => updateFormData("ss_q43_other_2", e.target.value)}
                            placeholder="$"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ss_q43_other_3_desc">Other Expense</Label>
                          <Input
                            id="ss_q43_other_3_desc"
                            value={formData.ss_q43_other_3_desc}
                            onChange={(e) => updateFormData("ss_q43_other_3_desc", e.target.value)}
                            placeholder="Description"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_other_3">&nbsp;</Label>
                          <Input
                            id="ss_q43_other_3"
                            type="number"
                            value={formData.ss_q43_other_3}
                            onChange={(e) => updateFormData("ss_q43_other_3", e.target.value)}
                            placeholder="$"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ss_q43_other_4_desc">Other Expense</Label>
                          <Input
                            id="ss_q43_other_4_desc"
                            value={formData.ss_q43_other_4_desc}
                            onChange={(e) => updateFormData("ss_q43_other_4_desc", e.target.value)}
                            placeholder="Description"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ss_q43_other_4">&nbsp;</Label>
                          <Input
                            id="ss_q43_other_4"
                            type="number"
                            value={formData.ss_q43_other_4}
                            onChange={(e) => updateFormData("ss_q43_other_4", e.target.value)}
                            placeholder="$"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="ss_q43_total">Total Expenses</Label>
                        <Input
                          id="ss_q43_total"
                          type="number"
                          value={formData.ss_q43_total}
                          onChange={(e) => updateFormData("ss_q43_total", e.target.value)}
                          placeholder="$"
                          className="mt-1"
                        />
                      </div>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q44 */}
                    <div className="border-l-4 border-red-400 pl-4 py-2">
                      <Label className="text-base">44. Do you have any existing business plans or proposals?</Label>
                      <RadioGroup
                        id="ss-q44"
                        value={formData.ss_q44}
                        onValueChange={(v) => updateFormData("ss_q44", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q44-yes" />
                          <Label htmlFor="ss-q44-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q44-no" />
                          <Label htmlFor="ss-q44-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> If YES, then we'll want to see them. If NO, then we'll help you create
                        them.
                      </div>
                    </div>

                    {/* Q45 */}
                    <div className="border-l-4 border-red-400 pl-4 py-2">
                      <Label className="text-base">
                        45. Do you have any existing client lists or databases we could use?
                      </Label>
                      <RadioGroup
                        id="ss-q45"
                        value={formData.ss_q45}
                        onValueChange={(v) => updateFormData("ss_q45", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q45-yes" />
                          <Label htmlFor="ss-q45-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q45-no" />
                          <Label htmlFor="ss-q45-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> If YES, then we'll want to see them. If NO, then we'll help you create
                        them.
                      </div>
                    </div>

                    {/* Q46 */}
                    <div className="border-l-4 border-red-400 pl-4 py-2">
                      <Label className="text-base">46. Do you have any existing marketing materials or website?</Label>
                      <RadioGroup
                        id="ss-q46"
                        value={formData.ss_q46}
                        onValueChange={(v) => updateFormData("ss_q46", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q46-yes" />
                          <Label htmlFor="ss-q46-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q46-no" />
                          <Label htmlFor="ss-q46-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <Input
                        id="ss-q46-other"
                        value={formData.ss_q46_other}
                        onChange={(e) => updateFormData("ss_q46_other", e.target.value)}
                        placeholder="Or specify other marketing materials here"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> If YES, then we'll want to see them. If NO, then we'll help you create
                        them.
                      </div>
                    </div>

                    {/* Q47 */}
                    <div className="border-l-4 border-red-400 pl-4 py-2">
                      <Label className="text-base">47. Do you have any existing business signage?</Label>
                      <RadioGroup
                        id="ss-q47"
                        value={formData.ss_q47}
                        onValueChange={(v) => updateFormData("ss_q47", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ss-q47-yes" />
                          <Label htmlFor="ss-q47-yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ss-q47-no" />
                          <Label htmlFor="ss-q47-no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      <Input
                        id="ss-q47-other"
                        value={formData.ss_q47_other}
                        onChange={(e) => updateFormData("ss_q47_other", e.target.value)}
                        placeholder="Or specify other signage here"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> If YES, then we'll want to see them. If NO, then we'll help you create
                        them.
                      </div>
                    </div>
                  </div>

                  {/* Q48-53: Business Skills & Future Focus */}
                  <div className="space-y-4">
                    {/* Q48 */}
                    <div className="border-l-4 border-yellow-400 pl-4 py-2">
                      <Label className="text-base">48. What are your key business skills?</Label>
                      <Textarea
                        id="ss-q48"
                        value={formData.ss_q48}
                        onChange={(e) => updateFormData("ss_q48", e.target.value)}
                        placeholder="e.g., Sales, Marketing, Operations, Finance"
                        rows={3}
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q49 */}
                    <div className="border-l-4 border-yellow-400 pl-4 py-2">
                      <Label className="text-base">49. What are your business weaknesses?</Label>
                      <Textarea
                        id="ss-q49"
                        value={formData.ss_q49}
                        onChange={(e) => updateFormData("ss_q49", e.target.value)}
                        placeholder="e.g., Lack of sales, Poor marketing, Inefficient operations"
                        rows={3}
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q50 */}
                    <div className="border-l-4 border-yellow-400 pl-4 py-2">
                      <Label className="text-base">50. What are your business opportunities?</Label>
                      <Textarea
                        id="ss-q50"
                        value={formData.ss_q50}
                        onChange={(e) => updateFormData("ss_q50", e.target.value)}
                        placeholder="e.g., New markets, Growing demand, Competitor weaknesses"
                        rows={3}
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q51 */}
                    <div className="border-l-4 border-lime-400 pl-4 py-2">
                      <Label className="text-base">51. What are your business threats?</Label>
                      <Textarea
                        id="ss-q51-1"
                        value={formData.ss_q51_1}
                        onChange={(e) => updateFormData("ss_q51_1", e.target.value)}
                        placeholder="e.g., New competition, Economic downturn, Regulatory changes"
                        rows={3}
                        className="mt-2"
                      />
                      <Input
                        id="ss-q51-2"
                        value={formData.ss_q51_2}
                        onChange={(e) => updateFormData("ss_q51_2", e.target.value)}
                        placeholder="Or specify other threats here"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q52 */}
                    <div className="border-l-4 border-lime-400 pl-4 py-2">
                      <Label className="text-base">
                        52. What is your primary reason for pursuing this business strategy?
                      </Label>
                      <Textarea
                        id="ss-q52"
                        value={formData.ss_q52}
                        onChange={(e) => updateFormData("ss_q52", e.target.value)}
                        placeholder="e.g., To increase profitability, To improve lifestyle, To achieve financial freedom"
                        rows={3}
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q53 */}
                    <div className="border-l-4 border-lime-400 pl-4 py-2">
                      <Label className="text-base">53. What are your top three pursuits in life?</Label>
                      <Input
                        id="ss-q53-pursuit1"
                        value={formData.ss_q53_pursuit1}
                        onChange={(e) => updateFormData("ss_q53_pursuit1", e.target.value)}
                        placeholder="Pursuit 1"
                        className="mt-2"
                      />
                      <Input
                        id="ss-q53-pursuit2"
                        value={formData.ss_q53_pursuit2}
                        onChange={(e) => updateFormData("ss_q53_pursuit2", e.target.value)}
                        placeholder="Pursuit 2"
                        className="mt-2"
                      />
                      <Input
                        id="ss-q53-pursuit3"
                        value={formData.ss_q53_pursuit3}
                        onChange={(e) => updateFormData("ss_q53_pursuit3", e.target.value)}
                        placeholder="Pursuit 3"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>
                  </div>

                  {/* Q54-64: Priorities and Preferences */}
                  <div className="space-y-4">
                    {/* Q54 */}
                    <div className="border-l-4 border-cyan-400 pl-4 py-2">
                      <Label className="text-base">54. What are your top three priorities for your business?</Label>
                      <Input
                        id="ss-q54-1"
                        value={formData.ss_q54_1}
                        onChange={(e) => updateFormData("ss_q54_1", e.target.value)}
                        placeholder="Priority 1"
                        className="mt-2"
                      />
                      <Input
                        id="ss-q54-2"
                        value={formData.ss_q54_2}
                        onChange={(e) => updateFormData("ss_q54_2", e.target.value)}
                        placeholder="Priority 2"
                        className="mt-2"
                      />
                      <Input
                        id="ss-q54-3"
                        value={formData.ss_q54_3}
                        onChange={(e) => updateFormData("ss_q54_3", e.target.value)}
                        placeholder="Priority 3"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q55 */}
                    <div className="border-l-4 border-cyan-400 pl-4 py-2">
                      <Label className="text-base">55. What are your business hours?</Label>
                      <Input
                        id="ss-q55"
                        value={formData.ss_q55}
                        onChange={(e) => updateFormData("ss_q55", e.target.value)}
                        placeholder="e.g., 9am - 5pm, Monday - Friday"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q56 */}
                    <div className="border-l-4 border-cyan-400 pl-4 py-2">
                      <Label className="text-base">56. What is your preferred communication method?</Label>
                      <RadioGroup
                        id="ss-q56"
                        value={formData.ss_q56}
                        onValueChange={(v) => updateFormData("ss_q56", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="ss-q56-email" />
                          <Label htmlFor="ss-q56-email" className="font-normal">
                            Email
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phone" id="ss-q56-phone" />
                          <Label htmlFor="ss-q56-phone" className="font-normal">
                            Phone
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="in-person" id="ss-q56-in-person" />
                          <Label htmlFor="ss-q56-in-person" className="font-normal">
                            In-person
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q57 */}
                    <div className="border-l-4 border-cyan-400 pl-4 py-2">
                      <Label className="text-base">57. What is your preferred meeting frequency?</Label>
                      <RadioGroup
                        id="ss-q57"
                        value={formData.ss_q57}
                        onValueChange={(v) => updateFormData("ss_q57", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="weekly" id="ss-q57-weekly" />
                          <Label htmlFor="ss-q57-weekly" className="font-normal">
                            Weekly
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="monthly" id="ss-q57-monthly" />
                          <Label htmlFor="ss-q57-monthly" className="font-normal">
                            Monthly
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="quarterly" id="ss-q57-quarterly" />
                          <Label htmlFor="ss-q57-quarterly" className="font-normal">
                            Quarterly
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="annually" id="ss-q57-annually" />
                          <Label htmlFor="ss-q57-annually" className="font-normal">
                            Annually
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q58 */}
                    <div className="border-l-4 border-cyan-400 pl-4 py-2">
                      <Label className="text-base">
                        58. What is your desired level of involvement in your business?
                      </Label>
                      <RadioGroup
                        id="ss-q58"
                        value={formData.ss_q58}
                        onValueChange={(v) => updateFormData("ss_q58", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="hands-on" id="ss-q58-hands-on" />
                          <Label htmlFor="ss-q58-hands-on" className="font-normal">
                            Hands-on
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="strategic" id="ss-q58-strategic" />
                          <Label htmlFor="ss-q58-strategic" className="font-normal">
                            Strategic
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="passive" id="ss-q58-passive" />
                          <Label htmlFor="ss-q58-passive" className="font-normal">
                            Passive
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q59 */}
                    <div className="border-l-4 border-cyan-400 pl-4 py-2">
                      <Label className="text-base">59. What is your desired level of financial independence?</Label>
                      <RadioGroup
                        id="ss-q59"
                        value={formData.ss_q59}
                        onValueChange={(v) => updateFormData("ss_q59", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="ss-q59-high" />
                          <Label htmlFor="ss-q59-high" className="font-normal">
                            High
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="ss-q59-medium" />
                          <Label htmlFor="ss-q59-medium" className="font-normal">
                            Medium
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="ss-q59-low" />
                          <Label htmlFor="ss-q59-low" className="font-normal">
                            Low
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q60 */}
                    <div className="border-l-4 border-cyan-400 pl-4 py-2">
                      <Label className="text-base">60. What is your desired level of work-life balance?</Label>
                      <RadioGroup
                        id="ss-q60"
                        value={formData.ss_q60}
                        onValueChange={(v) => updateFormData("ss_q60", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="ss-q60-high" />
                          <Label htmlFor="ss-q60-high" className="font-normal">
                            High
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="ss-q60-medium" />
                          <Label htmlFor="ss-q60-medium" className="font-normal">
                            Medium
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="ss-q60-low" />
                          <Label htmlFor="ss-q60-low" className="font-normal">
                            Low
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q61 */}
                    <div className="border-l-4 border-cyan-400 pl-4 py-2">
                      <Label className="text-base">61. What is your desired level of business success?</Label>
                      <RadioGroup
                        id="ss-q61"
                        value={formData.ss_q61}
                        onValueChange={(v) => updateFormData("ss_q61", v)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="ss-q61-high" />
                          <Label htmlFor="ss-q61-high" className="font-normal">
                            High
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="ss-q61-medium" />
                          <Label htmlFor="ss-q61-medium" className="font-normal">
                            Medium
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="ss-q61-low" />
                          <Label htmlFor="ss-q61-low" className="font-normal">
                            Low
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q62 */}
                    <div className="border-l-4 border-cyan-400 pl-4 py-2">
                      <Label className="text-base">62. What are your business financial goals?</Label>
                      <Textarea
                        id="ss-q62"
                        value={formData.ss_q62}
                        onChange={(e) => updateFormData("ss_q62", e.target.value)}
                        placeholder="e.g., Increase profit by 15%, Achieve $1M turnover"
                        rows={3}
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q63 */}
                    <div className="border-l-4 border-gray-400 pl-4 py-2">
                      <Label className="text-base">63. What is your business description?</Label>
                      <Textarea
                        id="ss-q63"
                        value={formData.ss_q63}
                        onChange={(e) => updateFormData("ss_q63", e.target.value)}
                        placeholder="Briefly describe your business"
                        rows={3}
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>

                    {/* Q64 */}
                    <div className="border-l-4 border-gray-400 pl-4 py-2">
                      <Label className="text-base">64. What is your business name?</Label>
                      <Input
                        id="ss-q64"
                        value={formData.ss_q64}
                        onChange={(e) => updateFormData("ss_q64", e.target.value)}
                        placeholder="Business Name"
                        className="mt-2"
                      />
                      <div className="mt-2 text-xs bg-gray-100 p-2 rounded italic">
                        <strong>Hint:</strong> Be specific and realistic.
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  {currentStep < 3 && ( // Changed condition to allow navigation until step 3 (Complete)
                    <div className="flex justify-between items-center pt-6 border-t">
                      <button
                        onClick={handleBack}
                        className="px-6 py-2 rounded-md border border-input hover:bg-accent hover:text-accent-foreground font-semibold"
                        disabled={currentStep === 0}
                      >
                        Back
                      </button>

                      <div className="flex gap-2">
                        {formData.email && currentStep > 0 && (
                          <SaveProgressDialog
                            email={formData.email}
                            questionnaireType="get-started"
                            formData={formData}
                            currentStep={currentStep}
                            existingToken={savedSessionToken || undefined}
                            onSaved={handleSessionSaved}
                          />
                        )}

                        {currentStep < 2 ? (
                          <button
                            onClick={handleNext}
                            className="px-6 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-hover"
                          >
                            Next
                          </button>
                        ) : (
                          // This button will now handle the submission from Step 2 to Step 3
                          <button
                            onClick={handleFinalSubmit} // Use the renamed submit handler
                            className="px-6 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-hover"
                          >
                            {isLoading ? "Processing..." : "Submit"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Complete */}
              {currentStep === 3 && (
                <div className="text-center py-12">
                  <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Your information has been submitted successfully. We will be in touch shortly.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

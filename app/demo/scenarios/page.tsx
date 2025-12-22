"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const STRATEGY_PATTERNS: { [key: string]: number[] } = {
  "A(i) - Small Business Re-Birth: Sell Asset & Buy Home": [3, 14, 15, 40],
  "A(ii) - Small Business Re-Birth: Sell Asset & Stay in Current Home": [3, 12, 14, 15, 40],
  "A(iii) - Small Business Re-Birth: Sell Asset & Extend Current Home": [3, 12, 15, 40],
  "A(iv) - Small Business Re-Birth: Sell Asset & Upgrade Home": [3, 12, 14, 40],
  "B(i) - Twist Exist Re-Structure: Stop Renting & Buy Home": [14, 15, 25, 40],
  "B(ii) - Twist Exist Re-Structure: Stay & Continue Business": [12, 14, 15, 25, 40],
  "B(iii) - Twist Exist Re-Structure: Stay & Extend Home": [12, 15, 25, 40],
  "B(iv) - Twist Exist Re-Structure: Upgrade Home": [12, 14, 25, 40],
  "C(i) - Home Business Re-Structure: Buy Home & Start Business": [3, 14, 15, 25, 40],
  "C(ii) - Home Business Re-Structure: Stay & Start Business": [3, 12, 14, 15, 25, 40],
  "C(iii) - Home Business Re-Structure: Extend & Start Business": [3, 12, 15, 25, 40],
  "C(iv) - Home Business Re-Structure: Upgrade & Start Business": [3, 12, 14, 25, 40],
  "D(i) - Small Business Lease Buster: Buy Home & Start Business": [3, 14, 15, 25],
  "D(ii) - Small Business Lease Buster: Stay & Start Business": [3, 12, 14, 15, 25],
  "D(iii) - Small Business Lease Buster: Extend & Start Business": [3, 12, 15, 25],
  "D(iv) - Small Business Lease Buster: Upgrade & Start Business": [3, 12, 14, 25],
}

function determineStrategy(noAnswers: number[]): string {
  const sortedAnswers = [...noAnswers].sort((a, b) => a - b)

  for (const [strategy, pattern] of Object.entries(STRATEGY_PATTERNS)) {
    const sortedPattern = [...pattern].sort((a, b) => a - b)
    if (JSON.stringify(sortedAnswers) === JSON.stringify(sortedPattern)) {
      return strategy
    }
  }

  return "E - General Home Office Deduction (No specific restructure strategy)"
}

const demoScenarios = [
  {
    id: 1,
    name: "Scenario 1 - Lease Buster Strategy",
    strategyAnswers: {
      noAnswers: [3, 12, 15, 25], // Matches "D(iii) - Extend & Start Business"
      description: "Business owner renting premises, considering home-based operations with home extension",
    },
    data: {
      full_name: "Sarah Chen",
      address: "45 Collins Street, Melbourne VIC 3000",
      tfn: "123 456 789",
      home_size_sqm: "150",
      office_size_sqm: "18",
      office_hours_per_week: "35",
      business_type: "IT Consulting & Web Development",
      employment_status: "sole_trader",
      home_loan_interest_annual: "22000",
      council_rates_annual: "2800",
      water_rates_annual: "1400",
      building_insurance_annual: "1800",
      building_value: "700000",
      internet_annual: "1500",
      phone_annual: "900",
      electricity_annual: "3200",
      heating_cooling_annual: "2000",
      cleaning_annual: "800",
      financial_year: "2023",
    },
  },
  {
    id: 2,
    name: "Scenario 2 - Twist Exist Strategy",
    strategyAnswers: {
      noAnswers: [12, 15, 25, 40], // Matches "B(iii) - Stay & Extend Home"
      description: "Existing home-based business owner planning home extension",
    },
    data: {
      full_name: "Sarah Chen",
      address: "45 Collins Street, Melbourne VIC 3000",
      tfn: "123 456 789",
      home_size_sqm: "150",
      office_size_sqm: "25",
      office_hours_per_week: "42",
      business_type: "Graphic Design & Digital Marketing",
      employment_status: "sole_trader",
      home_loan_interest_annual: "25000",
      council_rates_annual: "3000",
      water_rates_annual: "1500",
      building_insurance_annual: "2000",
      building_value: "750000",
      internet_annual: "1800",
      phone_annual: "750",
      electricity_annual: "3600",
      heating_cooling_annual: "2400",
      cleaning_annual: "1000",
      financial_year: "2023",
    },
  },
  {
    id: 3,
    name: "Scenario 3 - Small Business Re-Birth Strategy",
    strategyAnswers: {
      noAnswers: [3, 12, 14, 40], // Matches "A(iv) - Sell Asset & Upgrade Home"
      description: "Business owner selling commercial asset and upgrading to larger home",
    },
    data: {
      full_name: "Sarah Chen",
      address: "45 Collins Street, Melbourne VIC 3000",
      tfn: "123 456 789",
      home_size_sqm: "150",
      office_size_sqm: "30",
      office_hours_per_week: "48",
      business_type: "Financial Planning & Taxation Services",
      employment_status: "sole_trader",
      home_loan_interest_annual: "28000",
      council_rates_annual: "3200",
      water_rates_annual: "1600",
      building_insurance_annual: "2200",
      building_value: "800000",
      internet_annual: "2000",
      phone_annual: "1200",
      electricity_annual: "4000",
      heating_cooling_annual: "2800",
      cleaning_annual: "1200",
      financial_year: "2023",
    },
  },
]

export default function DemoScenariosPage() {
  const [generatingScenario, setGeneratingScenario] = useState<number | null>(null)
  const [interimReports, setInterimReports] = useState<{ [key: number]: any }>({})
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null)

  const generateInterimReport = async (scenarioId: number) => {
    setGeneratingScenario(scenarioId)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const scenario = demoScenarios.find((s) => s.id === scenarioId)!

    const determinedStrategy = determineStrategy(scenario.strategyAnswers.noAnswers)

    const officePercentage =
      (Number.parseFloat(scenario.data.office_size_sqm) / Number.parseFloat(scenario.data.home_size_sqm)) * 100
    const buildingDepreciation = Number.parseFloat(scenario.data.building_value) * 0.025

    const propertyExpensesItems = {
      homeLoanInterest: Number.parseFloat(scenario.data.home_loan_interest_annual),
      councilRates: Number.parseFloat(scenario.data.council_rates_annual),
      waterRates: Number.parseFloat(scenario.data.water_rates_annual),
      buildingInsurance: Number.parseFloat(scenario.data.building_insurance_annual),
      buildingDepreciation: buildingDepreciation,
    }
    const propertyExpensesTotal = Object.values(propertyExpensesItems).reduce((sum, val) => sum + val, 0)
    const propertyDeductionActual = propertyExpensesTotal * (officePercentage / 100)

    const runningExpensesItems = {
      internet: Number.parseFloat(scenario.data.internet_annual),
      phone: Number.parseFloat(scenario.data.phone_annual),
      electricity: Number.parseFloat(scenario.data.electricity_annual),
      heatingCooling: Number.parseFloat(scenario.data.heating_cooling_annual),
      cleaning: Number.parseFloat(scenario.data.cleaning_annual),
    }
    const runningExpensesTotal = Object.values(runningExpensesItems).reduce((sum, val) => sum + val, 0)
    const runningDeductionActual = runningExpensesTotal * (officePercentage / 100)

    const hoursPerYear = Number.parseFloat(scenario.data.office_hours_per_week) * 52
    const fixedRateDeduction = hoursPerYear * 0.67

    const runningExpenseComparison = Object.entries(runningExpensesItems).map(([key, actualValue]) => {
      const actualDeduction = actualValue * (officePercentage / 100)
      const fixedRateAllocated = (actualValue / runningExpensesTotal) * fixedRateDeduction
      return {
        expense: key,
        actualCost: actualValue.toFixed(2),
        actualDeduction: actualDeduction.toFixed(2),
        fixedRateAllocated: fixedRateAllocated.toFixed(2),
        mostFavorable: actualDeduction > fixedRateAllocated ? "Actual Cost Method" : "Fixed Rate Method",
        difference: Math.abs(actualDeduction - fixedRateAllocated).toFixed(2),
      }
    })

    const totalActualDeduction = propertyDeductionActual + runningDeductionActual
    const totalFixedDeduction = fixedRateDeduction
    const recommendedMethod = totalActualDeduction > totalFixedDeduction ? "Actual Cost Method" : "Fixed Rate Method"
    const bestDeduction = Math.max(totalActualDeduction, totalFixedDeduction)

    const report = {
      client: {
        name: scenario.data.full_name,
        address: scenario.data.address,
        tfn: scenario.data.tfn,
      },
      dyhStrategy: {
        procedureCode: determinedStrategy.split(" - ")[0],
        procedureName: determinedStrategy.split(" - ")[1],
        determinedStrategy,
        noAnswers: scenario.strategyAnswers.noAnswers,
        description: scenario.strategyAnswers.description,
        rationale: `Based on your responses to the DYH Strategy Selector questionnaire (NO answers to questions ${scenario.strategyAnswers.noAnswers.join(", ")}), the recommended procedure is ${determinedStrategy}. This strategy aligns with your specific business and property circumstances as outlined in the DYH methodology and ATO compliance framework.`,
      },
      propertyDetails: {
        homeSize: scenario.data.home_size_sqm,
        officeSize: scenario.data.office_size_sqm,
        officePercentage: officePercentage.toFixed(2),
        hoursPerWeek: scenario.data.office_hours_per_week,
        businessType: scenario.data.business_type,
        buildingValue: scenario.data.building_value,
      },
      calculations: {
        propertyExpenses: {
          items: propertyExpensesItems,
          totalApportioned: propertyExpensesTotal,
          buildingDepreciation: buildingDepreciation.toFixed(2),
          totalWithDepreciation: (propertyExpensesTotal + buildingDepreciation).toFixed(2),
        },
        runningExpenses: {
          actualMethod: {
            items: runningExpensesItems,
            total: runningExpensesTotal.toFixed(2),
          },
          fixedRateMethod: {
            hours: hoursPerYear,
            rate: 0.67,
            total: fixedRateDeduction.toFixed(2),
          },
          comparison: runningExpenseComparison,
          recommendedMethod,
          difference: Math.abs(totalActualDeduction - totalFixedDeduction).toFixed(2),
        },
        totalDeduction: {
          actualMethod: totalActualDeduction.toFixed(2),
          fixedRateMethod: totalFixedDeduction.toFixed(2),
          recommendedTotal: bestDeduction.toFixed(2),
        },
      },
      outcome: {
        summary: `For the ${scenario.data.financial_year} financial year, using the ${determinedStrategy.split(" - ")[1]} strategy combined with ${recommendedMethod === "Actual Cost Method" ? "actual cost apportionment" : "the ATO fixed rate"} for running expenses, your total home office deduction is $${bestDeduction.toFixed(2)}.`,
        strategyImplementation: `Implement ${determinedStrategy.split(" - ")[0]} (${determinedStrategy.split(" - ")[1]}) as per the DYH Strategy Selector framework. This strategy is specifically designed for ${scenario.strategyAnswers.description.toLowerCase()}.`,
        taxBenefit: {
          totalDeduction: bestDeduction.toFixed(2),
          estimatedTaxSaving: (bestDeduction * 0.325).toFixed(2), // Assuming 32.5% marginal tax rate
          comparisonToAlternative: `This approach yields $${Math.abs(totalActualDeduction - totalFixedDeduction).toFixed(2)} more in deductions compared to ${recommendedMethod === "Actual Cost Method" ? "the Fixed Rate Method" : "the Actual Cost Method"}.`,
        },
        keyActions: [
          `Set up ${determinedStrategy.split(" - ")[0]} structure as outlined in DYH Strategy Selector documentation`,
          `Maintain detailed records of all ${recommendedMethod === "Actual Cost Method" ? "actual expenses with receipts and invoices" : "hours worked from home in a logbook"}`,
          `Document office space with floor plan showing ${officePercentage.toFixed(2)}% business use`,
          `Photograph office setup for ATO substantiation requirements`,
          `Track building depreciation claims at 2.5% per annum on $${scenario.data.building_value} building value`,
          `Implement recommendations from DYH book Chapter 7 regarding record keeping`,
        ],
        complianceChecklist: [
          "Office space used exclusively or almost exclusively for business",
          "All claims substantiated with receipts/invoices or logbook",
          "Apportionment calculations documented and reasonable",
          "Building depreciation claim supported by valuation",
          `${determinedStrategy.split(" - ")[0]} structure properly established and documented`,
        ],
        nextSteps: [
          "Review and approve this scenario for final report generation",
          "Ensure all supporting documentation is collected",
          "Implement the recommended DYH strategy structure",
          "Lodge tax return with approved deductions",
        ],
      },
      recommendations: [
        {
          title: "DYH Strategy Determination",
          description: `${determinedStrategy} - ${scenario.strategyAnswers.description}`,
          detail: `This strategy was determined using the DYH Strategy Selector decision logic (Tables 1 & 2). Your responses (NO to questions ${scenario.strategyAnswers.noAnswers.join(", ")}) indicate this approach optimizes your tax position while maintaining ATO compliance.`,
          priority: "critical",
        },
        {
          title: "Running Expense Method",
          description:
            recommendedMethod === "Actual Cost Method"
              ? `Use Actual Cost Method for running expenses - saves additional $${Math.abs(totalActualDeduction - totalFixedDeduction).toFixed(2)} compared to Fixed Rate Method`
              : `Use Fixed Rate Method for running expenses - saves additional $${Math.abs(totalActualDeduction - totalFixedDeduction).toFixed(2)} compared to Actual Cost Method`,
          priority: "high",
        },
        {
          title: "Property Expenses & Depreciation",
          description: `Always use Actual Cost Method for property expenses. Building depreciation at 2.5% per annum provides additional deduction of $${buildingDepreciation.toFixed(2)}`,
          priority: "medium",
        },
        {
          title: "ATO Compliance",
          description:
            "Ensure office space is clearly delineated and used predominantly for business purposes. Maintain detailed records as per ATO guidelines.",
          priority: "medium",
        },
        {
          title: "Documentation Requirements",
          description: `As outlined in the "Deduct Your Home" book Chapter 7, maintain receipts, floor plans, usage logs, and photographs to substantiate your claims.`,
          priority: "medium",
        },
      ],
      ato_references: [
        {
          document: `DYH Strategy Selector - ${determinedStrategy.split(" - ")[0]}`,
          relevance: `Provides complete implementation framework for ${determinedStrategy.split(" - ")[1]} including documentation requirements, compliance steps, and optimization strategies.`,
        },
        {
          document: "Private Binding Ruling - Home Office Deductions",
          relevance: `Confirms methodology for apportioning property expenses based on floor area percentage (${officePercentage.toFixed(2)}%)`,
        },
        {
          document: "ATO Ruling TR 93/30",
          relevance:
            "Validates building depreciation calculation at 2.5% per annum for residential property used for business",
        },
        {
          document: "Deduct Your Home (DYH Book) - Chapter 5",
          relevance: `Strategy selection framework and ${determinedStrategy.split(" - ")[0]} procedure implementation guide`,
        },
      ],
      generatedAt: new Date().toISOString(),
    }

    setInterimReports((prev) => ({ ...prev, [scenarioId]: report }))
    setGeneratingScenario(null)
  }

  const generateAllReports = async () => {
    for (const scenario of demoScenarios) {
      await generateInterimReport(scenario.id)
    }
  }

  const handleSelectScenario = (scenarioId: number) => {
    setSelectedScenario(scenarioId)
    alert(
      `Scenario ${scenarioId} selected! In production, this would proceed to generate the final "HOME BASED, BUSINESS & TAXATION ADVICE" report using your uploaded template populated with data from this selected scenario.`,
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Demo Client Scenarios with Strategy Selector</h1>
        <p className="text-muted-foreground">
          Three variations of client data with different DYH Strategy Selector responses, generating comprehensive
          Interim Reports with strategy recommendations based on Tables 1 and 2 decision logic.
        </p>
      </div>

      <div className="mb-6 flex gap-3">
        <Button onClick={generateAllReports} disabled={generatingScenario !== null} size="lg">
          {generatingScenario ? "Generating..." : "Generate All 3 Reports"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {demoScenarios.map((scenario) => (
          <Card key={scenario.id}>
            <CardHeader>
              <CardTitle>{scenario.name}</CardTitle>
              <CardDescription>{scenario.data.business_type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Strategy Selector Profile:</h4>
                <p className="text-sm text-muted-foreground">{scenario.strategyAnswers.description}</p>
                <div className="flex flex-wrap gap-1">
                  {scenario.strategyAnswers.noAnswers.map((q) => (
                    <Badge key={q} variant="secondary">
                      Q{q}: NO
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Expected Strategy:</strong> {determineStrategy(scenario.strategyAnswers.noAnswers)}
                </p>
              </div>

              <div className="space-y-2 border-t pt-4">
                <h4 className="font-semibold text-sm">Property & Office Details:</h4>
                <div className="text-sm space-y-1">
                  <p>
                    Office: {scenario.data.office_size_sqm}sqm of {scenario.data.home_size_sqm}sqm (
                    {(
                      (Number.parseFloat(scenario.data.office_size_sqm) /
                        Number.parseFloat(scenario.data.home_size_sqm)) *
                      100
                    ).toFixed(1)}
                    %)
                  </p>
                  <p>Hours: {scenario.data.office_hours_per_week} hrs/week</p>
                  <p>Building Value: ${Number.parseFloat(scenario.data.building_value).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <h4 className="font-semibold text-sm">Property Expenses (Annual):</h4>
                <div className="text-sm space-y-1">
                  <p>Loan Interest: ${Number.parseFloat(scenario.data.home_loan_interest_annual).toLocaleString()}</p>
                  <p>Council Rates: ${Number.parseFloat(scenario.data.council_rates_annual).toLocaleString()}</p>
                  <p>Water Rates: ${Number.parseFloat(scenario.data.water_rates_annual).toLocaleString()}</p>
                  <p>Insurance: ${Number.parseFloat(scenario.data.building_insurance_annual).toLocaleString()}</p>
                  <p>
                    Depreciation (2.5%): ${(Number.parseFloat(scenario.data.building_value) * 0.025).toLocaleString()}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => generateInterimReport(scenario.id)}
                disabled={generatingScenario !== null}
                className="w-full"
              >
                {generatingScenario === scenario.id ? "Generating..." : "Generate Interim Report"}
              </Button>

              {interimReports[scenario.id] && (
                <Button onClick={() => setSelectedScenario(scenario.id)} variant="outline" className="w-full">
                  View Report
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedScenario && interimReports[selectedScenario] && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Interim Report - {demoScenarios.find((s) => s.id === selectedScenario)?.name}</CardTitle>
            <CardDescription>Comprehensive analysis with DYH Strategy Selector recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="report">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="report">Interim Report</TabsTrigger>
                <TabsTrigger value="calculations">Calculations</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="references">References</TabsTrigger>
              </TabsList>

              <TabsContent value="report" className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Interim Report - Scenario {selectedScenario}</h3>

                  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Badge className="text-base px-3 py-1">
                          {interimReports[selectedScenario].dyhStrategy.procedureCode}
                        </Badge>
                        <span>DYH Strategy Determination</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg mb-2">
                          {interimReports[selectedScenario].dyhStrategy.procedureName}
                        </h4>
                        <p className="text-sm mb-3">{interimReports[selectedScenario].dyhStrategy.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {interimReports[selectedScenario].dyhStrategy.rationale}
                        </p>
                      </div>

                      <div className="border-t pt-3">
                        <p className="text-xs font-semibold mb-2">Strategy Selector Responses (NO answers):</p>
                        <div className="flex flex-wrap gap-2">
                          {interimReports[selectedScenario].dyhStrategy.noAnswers.map((q: number) => (
                            <Badge key={q} variant="secondary" className="text-xs">
                              Q{q}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Based on DYH Strategy Selector Tables 1 & 2 decision logic
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold">Name:</p>
                          <p>{interimReports[selectedScenario].client.name}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Address:</p>
                          <p>{interimReports[selectedScenario].client.address}</p>
                        </div>
                        <div>
                          <p className="font-semibold">TFN:</p>
                          <p>{interimReports[selectedScenario].client.tfn}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Business Type:</p>
                          <p>{interimReports[selectedScenario].propertyDetails.businessType}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Property & Office Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold">Total Home Size:</p>
                          <p>{interimReports[selectedScenario].propertyDetails.homeSize} sqm</p>
                        </div>
                        <div>
                          <p className="font-semibold">Office Size:</p>
                          <p>{interimReports[selectedScenario].propertyDetails.officeSize} sqm</p>
                        </div>
                        <div>
                          <p className="font-semibold">Office Percentage:</p>
                          <p>{interimReports[selectedScenario].propertyDetails.officePercentage}%</p>
                        </div>
                        <div>
                          <p className="font-semibold">Hours per Week:</p>
                          <p>{interimReports[selectedScenario].propertyDetails.hoursPerWeek}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {interimReports[selectedScenario].recommendations.map((rec: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border ${
                              rec.priority === "critical"
                                ? "bg-blue-50 dark:bg-blue-950 border-blue-200"
                                : rec.priority === "high"
                                  ? "bg-amber-50 dark:bg-amber-950 border-amber-200"
                                  : "bg-slate-50 dark:bg-slate-900 border-slate-200"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <Badge
                                variant={
                                  rec.priority === "critical"
                                    ? "default"
                                    : rec.priority === "high"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {rec.priority}
                              </Badge>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1">{rec.title}</h4>
                                <p className="text-sm text-muted-foreground mb-1">{rec.description}</p>
                                {rec.detail && <p className="text-xs text-muted-foreground mt-2">{rec.detail}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="calculations" className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Calculations</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm">Property Expenses:</h4>
                      <div className="text-sm space-y-1">
                        {Object.entries(interimReports[selectedScenario].calculations.propertyExpenses.items).map(
                          ([key, value]) => (
                            <p key={key}>
                              {key.replace(/([A-Z])/g, " $1").trim()}: ${value.toFixed(2)}
                            </p>
                          ),
                        )}
                        <p className="font-semibold">
                          Total Apportioned: $
                          {interimReports[selectedScenario].calculations.propertyExpenses.totalApportioned.toFixed(2)}
                        </p>
                        <p className="font-semibold">
                          Building Depreciation: $
                          {interimReports[selectedScenario].calculations.propertyExpenses.buildingDepreciation}
                        </p>
                        <p className="font-semibold">
                          Total with Depreciation: $
                          {interimReports[selectedScenario].calculations.propertyExpenses.totalWithDepreciation}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm">Running Expenses:</h4>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold text-sm">Actual Method:</h5>
                          <div className="text-sm space-y-1">
                            {Object.entries(
                              interimReports[selectedScenario].calculations.runningExpenses.actualMethod.items,
                            ).map(([key, value]) => (
                              <p key={key}>
                                {key.replace(/([A-Z])/g, " $1").trim()}: ${value.toFixed(2)}
                              </p>
                            ))}
                            <p className="font-semibold">
                              Total: ${interimReports[selectedScenario].calculations.runningExpenses.actualMethod.total}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold text-sm">Fixed Rate Method:</h5>
                          <div className="text-sm space-y-1">
                            <p>
                              Hours:{" "}
                              {interimReports[selectedScenario].calculations.runningExpenses.fixedRateMethod.hours}
                            </p>
                            <p>
                              Rate: $
                              {interimReports[
                                selectedScenario
                              ].calculations.runningExpenses.fixedRateMethod.rate.toFixed(2)}{" "}
                              per hour
                            </p>
                            <p>
                              Total: $
                              {interimReports[selectedScenario].calculations.runningExpenses.fixedRateMethod.total}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold text-sm">Comparison:</h5>
                          <div className="text-sm space-y-1">
                            {interimReports[selectedScenario].calculations.runningExpenses.comparison.map((item) => (
                              <div key={item.expense} className="flex justify-between">
                                <span className="font-medium">{item.expense.replace(/([A-Z])/g, " $1").trim()}</span>
                                <span className="font-medium">Actual Cost: ${item.actualCost}</span>
                                <span className="font-medium">Actual Deduction: ${item.actualDeduction}</span>
                                <span className="font-medium">Fixed Rate Allocated: ${item.fixedRateAllocated}</span>
                                <span className="font-medium">Most Favorable: {item.mostFavorable}</span>
                                <span className="font-medium">Difference: ${item.difference}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold text-sm">Recommended Method:</h5>
                          <p className="text-sm">
                            {interimReports[selectedScenario].calculations.runningExpenses.recommendedMethod}
                          </p>
                        </div>

                        <div>
                          <h5 className="font-semibold text-sm">Difference:</h5>
                          <p className="text-sm">
                            ${interimReports[selectedScenario].calculations.runningExpenses.difference}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm">Total Deduction:</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          Actual Method: ${interimReports[selectedScenario].calculations.totalDeduction.actualMethod}
                        </p>
                        <p>
                          Fixed Rate Method: $
                          {interimReports[selectedScenario].calculations.totalDeduction.fixedRateMethod}
                        </p>
                        <p>
                          Recommended Total: $
                          {interimReports[selectedScenario].calculations.totalDeduction.recommendedTotal}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Comparison of Deduction Methods</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm">Property Expenses:</h4>
                      <p className="text-sm">Actual Cost Method is always used for property expenses.</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm">Running Expenses:</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          Recommended Method:{" "}
                          {interimReports[selectedScenario].calculations.runningExpenses.recommendedMethod}
                        </p>
                        <p>Difference: ${interimReports[selectedScenario].calculations.runningExpenses.difference}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm">Total Deduction:</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          Recommended Total Deduction: $
                          {interimReports[selectedScenario].calculations.totalDeduction.recommendedTotal}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="references" className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">References</h3>
                  <div className="space-y-4">
                    {interimReports[selectedScenario].ato_references.map((ref) => (
                      <div key={ref.document} className="space-y-2">
                        <h4 className="font-semibold text-sm">{ref.document}</h4>
                        <p className="text-sm">{ref.relevance}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => setSelectedScenario(null)} variant="outline">
                Close Report
              </Button>
              <Button
                onClick={() => {
                  alert(
                    `Client would now select this version (Scenario ${selectedScenario}) to proceed to Final Report generation`,
                  )
                }}
              >
                Select This Version for Final Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

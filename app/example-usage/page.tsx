"use client"

import { DownloadReportButton } from "@/components/download-report-button"

export default function ExampleUsagePage() {
  // Example questionnaire data structure
  const exampleQuestionnaireData = {
    // Client Information
    CLIENT_FULL_NAME: "John Smith",
    CLIENT_FIRST_NAME: "John",
    CLIENT_ADDRESS: "123 Example Street, Sydney NSW 2000",
    CLIENT_LOCAL_COUNCIL: "City of Sydney",
    REPORT_DATE: new Date().toLocaleDateString("en-AU"),

    // Business Information
    CLIENT_BUSINESS_NAME: "Smith Consulting",
    CLIENT_ABN: "12 345 678 901",
    CLIENT_BUSINESS_TYPE: "Business Consulting",
    CLIENT_BUSINESS_START_DATE: "01/01/2023",
    BUSINESS_TYPE: "Business Consulting",

    // Property Areas
    TOTAL_FLOOR_AREA_M2: 200,
    DEDICATED_OFFICE_AREA_M2: 50,
    BUSINESS_USE_PERCENTAGE: 25,

    // Property Values & Expenses
    BUILDING_VALUE: 500000,
    MORTGAGE: 35000,
    RATES: 4000,
    WATER: 2000,
    INSURANCE: 3000,
    REPAIRS: 2500,
    DEPRECIATION: 12500,
    ELECTRICITY: 3500,
    GAS: 1500,
    CLEANING: 2000,

    // All other required fields...
    // Add remaining placeholders as needed
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Report Download Example</h1>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          Click the button below to generate and download a report using the questionnaire data.
        </p>

        <DownloadReportButton
          questionnaireData={exampleQuestionnaireData}
          buttonText="Download Tax Report"
          variant="default"
          size="lg"
        />
      </div>
    </div>
  )
}

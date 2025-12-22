"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"

export default function QuestionnaireDownloadPage() {
  const handleDownload = async () => {
    try {
      const response = await fetch("/api/questionnaire/download-template")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "DYH_Quick_Questionnaire_Template.docx"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Failed to download questionnaire template")
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Quick Questionnaire Template</CardTitle>
          <CardDescription>Download the questionnaire template for client completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">What's Included</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Personal information fields</li>
                <li>Property details (home size, office size, hours worked)</li>
                <li>Property expenses (loan interest, rates, insurance)</li>
                <li>Running expenses with detailed internet and phone guidance</li>
                <li>Instructions for calculating business use percentages</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-medium text-amber-900 mb-2">Important Note: Internet & Phone</h3>
              <p className="text-sm text-amber-800">
                Unlike other running expenses, internet and phone costs cannot be calculated using floor space
                percentage. Clients must review a typical 30-day bill and determine their business use percentage
                separately.
              </p>
            </div>

            <Button onClick={handleDownload} size="lg" className="w-full">
              <Download className="mr-2 h-5 w-5" />
              Download Questionnaire Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

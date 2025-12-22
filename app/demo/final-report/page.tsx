"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, AlertCircle } from "lucide-react"
import { useState, useRef } from "react"
import { DEMO_CLIENTS } from "@/lib/demo-clients"

const DEMO_CLIENTS_ARRAY = Object.values(DEMO_CLIENTS)

export default function FinalReportDemoPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(DEMO_CLIENTS_ARRAY[0].id)
  
  // Use refs to track and cleanup previous requests
  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleDownloadReport = async () => {
    if (!selectedQuestionnaire) {
      setError("Please select a client to generate report")
      return
    }

    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setIsGenerating(true)
    setError(null)

    try {
      const selectedClient = DEMO_CLIENTS_ARRAY.find((q) => q.id === selectedQuestionnaire)
      if (!selectedClient) {
        throw new Error("Client not found")
      }

      console.log("[v0] Generating report for:", selectedClient.client_name)

      // Create new AbortController for this request
      const controller = new AbortController()
      abortControllerRef.current = controller
      
      const timeoutId = setTimeout(() => {
        console.log("[v0] Request timeout - aborting")
        controller.abort()
      }, 90000) // 90 second timeout (increased for PDF conversion)
      timeoutRef.current = timeoutId

      try {
        // Call the generate-report API which reads the actual Word template
        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionnaire1: selectedClient,
            questionnaire2: {}, // Empty second questionnaire for demo
          }),
          signal: controller.signal,
        })

        // Clear timeout on successful response start
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        if (!response.ok) {
          // Try to parse as JSON error first
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json()
            throw new Error(errorData.error || errorData.details || "Failed to generate report")
          } else {
            // Plain text error
            const errorText = await response.text()
            throw new Error(errorText || "Failed to generate report")
          }
        }

        // Download the document (PDF or DOCX fallback)
        const blob = await response.blob()
        const contentType = response.headers.get("Content-Type")
        const isPdf = contentType?.includes("application/pdf")
        const extension = isPdf ? "pdf" : "docx"
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${selectedClient.client_name}_Report_${new Date().toISOString().split("T")[0]}.${extension}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        console.log(`[v0] ${isPdf ? "PDF" : "DOCX"} report downloaded successfully`)
      } finally {
        // Cleanup
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null
        }
      }
    } catch (error: any) {
      console.error("[v0] Report generation error:", error)
      if (error.name === "AbortError") {
        // Only show error if this wasn't a manual abort from a new request
        if (abortControllerRef.current?.signal.aborted) {
          setError("Request was cancelled. Please try again.")
        } else {
          setError("Request timed out after 90 seconds. The server may be processing a large document. Please try again or check server logs.")
        }
      } else {
        setError(error.message || "File Error: Could not generate report from template")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const currentQuestionnaire = DEMO_CLIENTS_ARRAY.find((q) => q.id === selectedQuestionnaire)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Final Client Report</h1>
          <p className="text-muted-foreground">
            Download a comprehensive "HOME BASED, BUSINESS & TAXATION ADVICE" report
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Final Report Preview
            </CardTitle>
            <CardDescription>
              This report includes all sections: Executive Summary, Strategy Selector Analysis, Expense Comparisons, Tax
              Calculations, Recommendations, Hints & Tips, and Next Steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <h3>Report Contents:</h3>
              <ol>
                <li>
                  <strong>Table of Contents</strong>
                </li>
                <li>
                  <strong>Executive Summary</strong> - Overview of client situation and key findings
                </li>
                <li>
                  <strong>DYH Strategy Selector Analysis</strong> - Determined procedure and rationale
                </li>
                <li>
                  <strong>Property & Running Expenses</strong> - Detailed breakdown with comparisons
                </li>
                <li>
                  <strong>Tax Calculation Methods</strong> - Actual Cost vs Fixed Rate comparison
                </li>
                <li>
                  <strong>Recommended Strategy</strong> - Optimal approach with compliance requirements
                </li>
                <li>
                  <strong>Hints and Tips</strong> - Comprehensive guidance from Strategy Selector
                </li>
                <li>
                  <strong>Implementation Steps</strong> - Clear next actions for the client
                </li>
                <li>
                  <strong>Appendices</strong> - Supporting documentation and references
                </li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Select Client:</h4>
              <div className="flex flex-wrap gap-3">
                {DEMO_CLIENTS_ARRAY.map((q) => (
                  <Button
                    key={q.id}
                    variant={selectedQuestionnaire === q.id ? "default" : "outline"}
                    onClick={() => setSelectedQuestionnaire(q.id)}
                  >
                    {q.client_name || "Unnamed Client"}
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={handleDownloadReport} size="lg" className="gap-2" disabled={isGenerating}>
                <Download className="h-4 w-4" />
                {isGenerating ? "Generating PDF report..." : "Download PDF Report"}
              </Button>
            </div>

            {currentQuestionnaire && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Selected Client Details:</h4>
                <ul className="text-sm space-y-1">
                  <li>
                    • <strong>Client:</strong> {currentQuestionnaire.client_name || "N/A"}
                  </li>
                  <li>
                    • <strong>Address:</strong> {currentQuestionnaire.property_address || "N/A"}
                  </li>
                  <li>
                    • <strong>Business Type:</strong> {currentQuestionnaire.business_type || "N/A"}
                  </li>
                  <li>
                    • <strong>Income:</strong> ${(currentQuestionnaire.taxable_income || 0).toLocaleString()}
                  </li>
                  <li>
                    • <strong>Age:</strong> {currentQuestionnaire.age || "N/A"}
                  </li>
                  <li>
                    • <strong>Business Use %:</strong> {currentQuestionnaire.bup_percentage || 0}%
                  </li>
                  <li>
                    • <strong>Weekly Hours:</strong> {currentQuestionnaire.hours_per_week || 0} hours
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

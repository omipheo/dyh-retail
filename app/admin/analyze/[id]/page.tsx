"use client"

import type React from "react"

import { use, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReactMarkdown from "react-markdown"
import type { InterimReportVersion } from "@/lib/document-analyzer"

export default function AnalyzeAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [generatingFinal, setGeneratingFinal] = useState(false)
  const [finalReport, setFinalReport] = useState<any>(null)
  const [showConsultationForm, setShowConsultationForm] = useState(false)
  const [validationIssues, setValidationIssues] = useState<boolean>(false)

  const handleGenerateStrategy = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/analyze/generate-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId: id, clientId: id }),
      })

      const data = await response.json()
      if (data.success) {
        setResult(data.data)
        setSelectedVersion(null) // Reset selection
        setValidationIssues(data.validationIssues || false)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Analysis error:", error)
      alert("Failed to generate strategy")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectVersion = (versionNumber: number) => {
    setSelectedVersion(versionNumber)
  }

  const handleGenerateFinalReport = async () => {
    if (selectedVersion === null) {
      alert("Please select a preferred version first")
      return
    }

    const chosenVersion = result.versions.find((v: InterimReportVersion) => v.versionNumber === selectedVersion)
    if (!chosenVersion) return

    setGeneratingFinal(true)
    try {
      const response = await fetch("/api/reports/generate-final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: id,
          selectedVersionNumber: selectedVersion,
          interimReportData: {
            assessmentId: id,
            clientName: "Client Name",
            scenarioName: chosenVersion.scenarioName,
            strategy: chosenVersion.strategy.reasoning,
            calculations: chosenVersion.calculations,
            documentAnalysis: result.documentAnalyses,
            recommendations: chosenVersion.strategy.nextSteps || [],
          },
        }),
      })

      const data = await response.json()
      if (data.success) {
        setFinalReport(data)
        alert("Final client report generated successfully!")
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Final report generation error:", error)
      alert("Failed to generate final report")
    } finally {
      setGeneratingFinal(false)
    }
  }

  const handleRequestConsultation = () => {
    setShowConsultationForm(true)
  }

  const handleSendConsultationRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const preferredMethod = formData.get("preferredMethod") as string
    const notes = formData.get("notes") as string

    const emailBody = `
Client Consultation Request

Assessment ID: ${id}
Email: ${email}
Phone: ${phone}
Preferred Contact: ${preferredMethod}
Additional Notes: ${notes}

The client is reviewing their 3 DYH scenario versions and would like a 15-minute consultation to discuss which option is best for their situation.
    `.trim()

    window.location.href = `mailto:?subject=15-Minute Consultation Request&body=${encodeURIComponent(emailBody)}`

    alert("Your consultation request has been prepared. Please send the email that just opened.")
    setShowConsultationForm(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Strategy Analysis</h1>
        <p className="text-muted-foreground">
          Cross-examine client documents against DYH book and ATO PBRs to generate Interim Reports for up to 3 client
          data scenarios
        </p>
      </div>

      {validationIssues && result && (
        <Card className="mb-6 bg-amber-50 border-amber-300">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 text-xl">⚠</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 text-amber-900">Manual Review Required</h3>
                <p className="text-amber-800 mb-3">
                  The system detected incomplete or missing data that prevents accurate calculations. A detailed message
                  has been automatically sent to the tax agent listing all items requiring manual review.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href="/messages">View Messages</a>
                  </Button>
                  <Button asChild variant="default" size="sm">
                    <a href="/messages/compose">Contact Tax Agent</a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!result && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Strategy Reports</CardTitle>
            <CardDescription>
              The system will analyze all client-uploaded documents, cross-reference with your reference materials (DYH
              book, ATO PBRs, strategy selectors), and generate Interim Reports based on the client's input data.
              Clients can submit up to 3 different data variations to experiment with different scenarios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateStrategy} disabled={loading} size="lg">
              {loading ? "Analyzing..." : "Generate Interim Reports"}
            </Button>
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          <div className="mb-6 flex gap-4 items-center">
            <Button onClick={handleGenerateStrategy} disabled={loading} variant="outline">
              Regenerate Analysis
            </Button>

            {selectedVersion !== null && (
              <>
                <Badge variant="default" className="text-sm px-4 py-2">
                  Selected: Version {selectedVersion}
                </Badge>
                <Button onClick={handleGenerateFinalReport} disabled={generatingFinal} size="lg">
                  {generatingFinal ? "Generating..." : "Generate Final Client Report"}
                </Button>
              </>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Select Your Preferred Scenario</h2>
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Need Help Deciding?</h3>
                    <p className="text-muted-foreground mb-4">
                      If you're unsure which scenario is right for you, request a 15-minute consultation with your tax
                      agent to discuss your options.
                    </p>
                  </div>
                  <Button onClick={handleRequestConsultation} variant="default">
                    Request Consultation
                  </Button>
                </div>

                {showConsultationForm && (
                  <form onSubmit={handleSendConsultationRequest} className="mt-4 space-y-4 border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Your Email</label>
                        <input
                          type="email"
                          name="email"
                          required
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Your Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="04XX XXX XXX"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Preferred Contact Method</label>
                      <select name="preferredMethod" required className="w-full px-3 py-2 border rounded-md">
                        <option value="phone">Phone Call</option>
                        <option value="video">Online Chat/Video</option>
                        <option value="either">Either</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Additional Notes (Optional)</label>
                      <textarea
                        name="notes"
                        className="w-full px-3 py-2 border rounded-md"
                        rows={3}
                        placeholder="Any specific questions or concerns..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Send Consultation Request</Button>
                      <Button type="button" variant="outline" onClick={() => setShowConsultationForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.versions?.map((version: InterimReportVersion) => (
                <Card
                  key={version.versionNumber}
                  className={`cursor-pointer transition-all ${
                    selectedVersion === version.versionNumber ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
                  }`}
                  onClick={() => handleSelectVersion(version.versionNumber)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{version.scenarioLabel}</CardTitle>
                      {selectedVersion === version.versionNumber && <Badge variant="default">Selected</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold">Method</p>
                      <Badge variant="outline">
                        {version.strategy.recommendedMethod === "actual_cost" ? "Actual Cost" : "Fixed Rate"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Potential Deduction</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${version.strategy.potentialDeduction.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">
                        {version.strategy.reasoning.substring(0, 100)}...
                      </p>
                    </div>
                    <Button
                      variant={selectedVersion === version.versionNumber ? "default" : "outline"}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectVersion(version.versionNumber)
                      }}
                    >
                      {selectedVersion === version.versionNumber ? "Selected" : "Select This Scenario"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {selectedVersion !== null && (
            <Tabs defaultValue="report" className="space-y-6">
              <TabsList>
                <TabsTrigger value="report">
                  Interim Report (
                  {
                    result.versions.find((v: InterimReportVersion) => v.versionNumber === selectedVersion)
                      ?.scenarioLabel
                  }
                  )
                </TabsTrigger>
                <TabsTrigger value="strategy">Strategy Details</TabsTrigger>
                <TabsTrigger value="calculations">Calculations</TabsTrigger>
                <TabsTrigger value="analysis">Document Analysis</TabsTrigger>
                {finalReport && <TabsTrigger value="final">Final Client Report</TabsTrigger>}
              </TabsList>

              {(() => {
                const version = result.versions.find((v: InterimReportVersion) => v.versionNumber === selectedVersion)
                if (!version) return null

                return (
                  <>
                    <TabsContent value="report">
                      <Card>
                        <CardHeader>
                          <CardTitle>Interim Report - {version.scenarioLabel}</CardTitle>
                          <CardDescription>
                            Generated on {new Date(version.generatedAt).toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="prose max-w-none">
                          <ReactMarkdown>{version.report}</ReactMarkdown>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="strategy">
                      <Card>
                        <CardHeader>
                          <CardTitle>Recommended Strategy - {version.scenarioLabel}</CardTitle>
                          <Badge
                            variant={version.strategy.recommendedMethod === "actual_cost" ? "default" : "secondary"}
                          >
                            {version.strategy.recommendedMethod === "actual_cost"
                              ? "Actual Cost Method"
                              : "Fixed Rate Method"}
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <h3 className="font-semibold mb-2">Reasoning</h3>
                            <p className="text-muted-foreground">{version.strategy.reasoning}</p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Potential Deduction</h3>
                            <p className="text-2xl font-bold text-green-600">
                              ${version.strategy.potentialDeduction.toLocaleString()}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Eligibility Criteria</h3>
                            <ul className="list-disc list-inside space-y-1">
                              {version.strategy.eligibilityCriteria?.map((criteria: string, idx: number) => (
                                <li key={idx}>{criteria}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">ATO Compliance Requirements</h3>
                            <ul className="list-disc list-inside space-y-1">
                              {version.strategy.atoCompliance?.map((item: string, idx: number) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          {version.strategy.riskFactors?.length > 0 && (
                            <div>
                              <h3 className="font-semibold mb-2 text-amber-600">Risk Factors</h3>
                              <ul className="list-disc list-inside space-y-1">
                                {version.strategy.riskFactors.map((risk: string, idx: number) => (
                                  <li key={idx}>{risk}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div>
                            <h3 className="font-semibold mb-2">Next Steps</h3>
                            <ul className="list-disc list-inside space-y-1">
                              {version.strategy.nextSteps?.map((step: string, idx: number) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="calculations">
                      <Card>
                        <CardHeader>
                          <CardTitle>Calculation Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="bg-muted p-4 rounded-lg overflow-auto">
                            {JSON.stringify(version.calculations, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </>
                )
              })()}

              <TabsContent value="analysis">
                <div className="space-y-4">
                  {result.documentAnalyses?.map((analysis: any, idx: number) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-lg">{analysis.documentType}</CardTitle>
                        <Badge variant="outline">Confidence: {(analysis.confidence * 100).toFixed(0)}%</Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Key Findings</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {analysis.keyFindings?.map((finding: string, i: number) => (
                              <li key={i}>{finding}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Extracted Data</h4>
                          <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                            {JSON.stringify(analysis.extractedData, null, 2)}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {finalReport && (
                <TabsContent value="final">
                  <Card>
                    <CardHeader>
                      <CardTitle>HOME BASED, BUSINESS & TAXATION ADVICE</CardTitle>
                      <CardDescription>Final Client Deliverable</CardDescription>
                      <div className="mt-4">
                        <Button asChild>
                          <a href={finalReport.reportUrl} target="_blank" rel="noopener noreferrer">
                            Download Report
                          </a>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                      <ReactMarkdown>{finalReport.reportContent}</ReactMarkdown>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          )}
        </>
      )}
    </div>
  )
}

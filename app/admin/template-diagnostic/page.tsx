"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TemplateDiagnosticPage() {
  const [placeholders, setPlaceholders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const analyzeTemplate = async () => {
    setLoading(true)
    setError("")
    setPlaceholders([])

    try {
      const response = await fetch("/api/admin/analyze-template")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze template")
      }

      setPlaceholders(data.placeholders)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze template")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Word Template Diagnostic</CardTitle>
          <CardDescription>Analyze your uploaded Word template to find all placeholders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={analyzeTemplate} disabled={loading} size="lg">
            {loading ? "Analyzing Template..." : "Analyze Template"}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {placeholders.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Found {placeholders.length} Placeholder(s):</h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <ul className="space-y-1 font-mono text-sm">
                  {placeholders.map((placeholder, index) => (
                    <li key={index} className="py-1">
                      {placeholder}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(placeholders, null, 2))
                }}
                variant="outline"
              >
                Copy as JSON
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

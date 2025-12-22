"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function ExtractTemplateStructurePage() {
  const [loading, setLoading] = useState(false)
  const [structure, setStructure] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const extractStructure = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/extract-template-structure")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract template structure")
      }

      setStructure(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Extract Template Structure</h1>

      <Card className="p-6 mb-6">
        <p className="mb-4">
          This tool will download your 40-page Word template and extract its complete structure including:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>All sections and headings</li>
          <li>All placeholders and their locations</li>
          <li>Page structure and content layout</li>
          <li>Tables, lists, and formatting</li>
        </ul>

        <Button onClick={extractStructure} disabled={loading}>
          {loading ? "Extracting..." : "Extract Template Structure"}
        </Button>
      </Card>

      {error && (
        <Card className="p-6 mb-6 border-red-500">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </Card>
      )}

      {structure && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Template Structure</h2>
          <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(structure, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}

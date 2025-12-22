"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function SeedDemoDataPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleSeed = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/admin/seed-demo-data")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Failed to seed data",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Seed Demo Client Data</h1>
        <p className="text-muted-foreground mb-6">
          This will populate your database with three demo clients: Sarah Chen, Marcus Thompson, and Jennifer Ormond.
        </p>

        <Button onClick={handleSeed} disabled={loading} className="mb-4">
          {loading ? "Seeding Data..." : "Seed Demo Data"}
        </Button>

        {result && (
          <div className={`p-4 rounded-md ${result.success ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}>
            <p className="font-medium">{result.success ? "Success!" : "Error"}</p>
            <p className="text-sm mt-1">{result.message || result.error}</p>

            {result.success && (
              <Link href="/demo/final-report">
                <Button className="mt-4">View Demo Reports</Button>
              </Link>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

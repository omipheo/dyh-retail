"use client"
import { ComprehensiveReport } from "@/components/reports/comprehensive-report"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function PrintReportPage() {
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] Print report page loaded")

    const loadData = () => {
      const data = sessionStorage.getItem("reportData")
      console.log("[v0] SessionStorage reportData:", data ? "Found" : "Not found")

      if (data) {
        try {
          const parsedData = JSON.parse(data)
          console.log("[v0] Report data loaded for client:", parsedData.CLIENT_NAME)
          setReportData(parsedData)
        } catch (error) {
          console.error("[v0] Error parsing report data:", error)
        }
      } else {
        console.log("[v0] No report data found, redirecting back")
        setTimeout(() => {
          router.push("/demo/final-report")
        }, 1000)
      }
      setLoading(false)
    }

    setTimeout(loadData, 100)
  }, [router])

  const handlePrint = () => {
    window.print()
  }

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading report...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="print:hidden fixed top-4 right-4 z-50 space-x-2">
        <Button onClick={handlePrint} size="lg">
          Print / Save as PDF
        </Button>
        <Button onClick={() => router.back()} variant="outline" size="lg">
          Back
        </Button>
      </div>
      <ComprehensiveReport data={reportData} />
    </div>
  )
}

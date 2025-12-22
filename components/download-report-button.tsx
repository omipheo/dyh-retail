"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DownloadReportButtonProps {
  questionnaireData: Record<string, any>
  buttonText?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function DownloadReportButton({
  questionnaireData,
  buttonText = "Download Report",
  variant = "default",
  size = "default",
  className = "",
}: DownloadReportButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log("[v0] 🚀 Requesting 40-page report generation...")

      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionnaireData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.details || errorData.error || `Server error: ${response.status}`

        // Log missing fields if provided
        if (errorData.missingFields && errorData.missingFields.length > 0) {
          console.warn("[v0] ⚠️  Missing template fields:", errorData.missingFields.join(", "))
        }

        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      console.log("[v0] ✅ Report received, size:", (blob.size / 1024).toFixed(2), "KB")

      if (blob.size === 0) {
        throw new Error("Received empty document from server")
      }

      const contentDisposition = response.headers.get("Content-Disposition")
      const contentType = response.headers.get("Content-Type")
      const isPdf = contentType?.includes("application/pdf")
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename =
        filenameMatch?.[1] || (isPdf ? `report_${Date.now()}.pdf` : `report_${Date.now()}.docx`)

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()

      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)

      console.log("[v0] ✅ Report downloaded successfully:", filename)
      setSuccess(true)

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error("[v0] ❌ Download error:", err)
      setError(err.message || "Failed to download report. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleDownload} disabled={isDownloading} variant={variant} size={size} className={className}>
        {isDownloading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating 40-page report...
          </>
        ) : success ? (
          <>
            <Download className="mr-2 h-4 w-4" />
            Downloaded!
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && <p className="text-sm text-green-600">Report downloaded successfully!</p>}
    </div>
  )
}

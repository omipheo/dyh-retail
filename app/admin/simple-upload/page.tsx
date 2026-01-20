"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"

export default function SimpleUploadPage() {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".docx")) {
      setError("Please select a .docx file")
      return
    }

    setUploading(true)
    setError("")
    setUploadedUrl("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/upload-template", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      setUploadedUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Upload Word Template</CardTitle>
          <CardDescription>Upload your .docx template file with placeholders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 hover:border-primary transition-colors">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button disabled={uploading} asChild>
                <span>{uploading ? "Uploading..." : "Select .docx File"}</span>
              </Button>
              <input id="file-upload" type="file" accept=".docx" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>

          {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>}

          {uploadedUrl && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 text-green-900 rounded-lg">
                <p className="font-semibold mb-2">Upload Successful!</p>
                <p className="text-sm mb-4">Copy this URL and share it with v0:</p>
                <code className="block p-3 bg-white rounded border text-xs break-all">{uploadedUrl}</code>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    navigator.clipboard.writeText(uploadedUrl)
                  }}
                >
                  Copy URL
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

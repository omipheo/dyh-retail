"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CheckCircle2, AlertCircle } from "lucide-react"

type TemplateType = "interim" | "final"

export default function UploadTemplatePage() {
  const [file, setFile] = useState<File | null>(null)
  const [templateType, setTemplateType] = useState<TemplateType>("interim")
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("templateType", templateType)

      const response = await fetch("/api/upload-template", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, url: data.url })
      } else {
        setResult({ success: false, error: data.error || "Upload failed" })
      }
    } catch (error) {
      setResult({ success: false, error: "Upload failed. Please try again." })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Report Templates</CardTitle>
          <CardDescription>Upload both Interim Report (DAR) and Final Report templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Template Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="interim"
                  checked={templateType === "interim"}
                  onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                  className="w-4 h-4"
                />
                <span>Interim Report (DAR - Sales Version)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="final"
                  checked={templateType === "final"}
                  onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                  className="w-4 h-4"
                />
                <span>Final Report (Full Version)</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <input type="file" accept=".docx" onChange={handleFileChange} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-sm text-muted-foreground">Click to select or drag and drop</div>
                <div className="text-xs text-muted-foreground mt-1">Word document (.docx) only</div>
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  <div className="text-xs text-primary mt-1">
                    Uploading as: {templateType === "interim" ? "Interim Report (DAR)" : "Final Report"}
                  </div>
                </div>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            )}

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>
                  {result.success ? (
                    <div className="space-y-2">
                      <div>Template uploaded successfully!</div>
                      <div className="text-xs break-all bg-background p-2 rounded">{result.url}</div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {templateType === "interim"
                          ? "Demo scenarios will use this Interim Report template with pricing."
                          : "Purchased reports will use this Final Report template."}
                      </div>
                    </div>
                  ) : (
                    <div>Error: {result.error}</div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

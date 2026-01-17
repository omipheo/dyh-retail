"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function ManageTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/blob/list")
      const data = await response.json()
      console.log("[v0] Blob files:", data)
      setTemplates(data.blobs || [])
    } catch (error) {
      console.error("[v0] Error fetching templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = (url: string, filename: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">Manage Templates</h1>

        {loading ? (
          <p>Loading templates...</p>
        ) : (
          <div className="space-y-4">
            {templates.length === 0 ? (
              <p>No templates found in Blob storage.</p>
            ) : (
              templates.map((template) => (
                <Card key={template.url} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{template.pathname}</h3>
                      <p className="text-sm text-muted-foreground">Size: {(template.size / 1024).toFixed(2)} KB</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded: {new Date(template.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                    <Button onClick={() => downloadTemplate(template.url, template.pathname)}>Download</Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        <div className="mt-8">
          <Button onClick={() => (window.location.href = "/admin/upload-template")}>Upload New Template</Button>
        </div>
      </div>
    </div>
  )
}

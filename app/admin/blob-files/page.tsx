"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function BlobFilesPage() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/blob/list")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setFiles(data.files || [])
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8">Loading Blob storage files...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Vercel Blob Storage Files</h1>

      {files.length === 0 ? (
        <p>No files found in Blob storage</p>
      ) : (
        <div className="space-y-4">
          {files.map((file, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-2">
                <div className="font-mono text-sm">{file.pathname}</div>
                <div className="text-sm text-muted-foreground">Size: {Math.round(file.size / 1024)} KB</div>
                <div className="text-xs text-muted-foreground">
                  Uploaded: {new Date(file.uploadedAt).toLocaleString()}
                </div>
                <Button size="sm" onClick={() => window.open(file.url, "_blank")}>
                  View/Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

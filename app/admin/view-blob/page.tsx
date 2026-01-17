"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function ViewBlobPage() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/blob/list")
      const data = await response.json()
      setFiles(data.blobs || [])
    } catch (error) {
      console.error("Error fetching blob files:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Blob Storage Files</h1>

      {loading ? (
        <p>Loading files...</p>
      ) : files.length === 0 ? (
        <p>No files found in Blob storage</p>
      ) : (
        <div className="space-y-4">
          {files.map((file, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-2">
                <p className="font-semibold">Filename: {file.pathname}</p>
                <p className="text-sm text-muted-foreground">URL: {file.url}</p>
                <p className="text-sm">Size: {(file.size / 1024).toFixed(2)} KB</p>
                <p className="text-sm">Uploaded: {new Date(file.uploadedAt).toLocaleString()}</p>
                <Button asChild size="sm">
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    Download
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

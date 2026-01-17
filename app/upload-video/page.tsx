"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function UploadVideoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [blobUrl, setBlobUrl] = useState<string>("")
  const [error, setError] = useState<string>("")

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError("")
      setBlobUrl("")
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("No file selected")
      return
    }

    setUploading(true)
    setError("")
    setBlobUrl("")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      console.log("[v0] Uploading file:", selectedFile.name, selectedFile.size)

      const response = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()
      setBlobUrl(data.url)
      console.log("[v0] Upload successful! URL:", data.url)
    } catch (err) {
      console.error("[v0] Upload error:", err)
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Upload Home Page Video</h1>
          <p className="text-muted-foreground mt-2">Upload a new video to replace the existing home page intro video</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="video-upload" className="block text-sm font-medium mb-2">
              Select Video File (MP4)
            </label>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
              onChange={handleFileSelect}
              disabled={uploading}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              id="video-upload"
            />
          </div>

          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}

          <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full" size="lg">
            {uploading ? "Uploading..." : "Upload Video"}
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {blobUrl && (
          <div className="bg-primary/10 p-4 rounded-lg space-y-3">
            <p className="font-semibold text-lg">Upload successful!</p>
            <div className="bg-background p-3 rounded border">
              <p className="text-sm break-all font-mono">{blobUrl}</p>
            </div>
            <Button onClick={() => navigator.clipboard.writeText(blobUrl)} variant="outline" size="sm">
              Copy URL
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"

export default function UploadVideoPage() {
  const [uploading, setUploading] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  async function uploadFile(file: File) {
    console.log("[v0] uploadFile called with:", file.name, file.type, file.size)

    if (!file.type.startsWith("video/")) {
      console.log("[v0] ERROR: Not a video file")
      setError("Please select a video file")
      return
    }

    const fileSizeMB = file.size / 1024 / 1024
    console.log("[v0] File size:", fileSizeMB.toFixed(2), "MB")

    if (file.size > 500 * 1024 * 1024) {
      console.log("[v0] ERROR: File too large")
      setError("File size must be less than 500MB")
      return
    }

    setUploading(true)
    setError("")
    setProgress(0)

    try {
      console.log("[v0] Getting presigned upload URL...")
      const urlResponse = await fetch("/api/get-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      })

      if (!urlResponse.ok) {
        throw new Error("Failed to get upload URL")
      }

      const { url: uploadUrl, downloadUrl } = await urlResponse.json()
      console.log("[v0] Got presigned URL, uploading directly to Blob...")

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to Blob storage")
      }

      console.log("[v0] Upload successful:", downloadUrl)

      setVideoUrl(downloadUrl)
      setProgress(100)
    } catch (err) {
      console.error("[v0] Upload error:", err)
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    uploadFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload New Video</CardTitle>
          <CardDescription>Upload a new video file to replace the home page video (max 500MB)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <label htmlFor="video-upload" className="cursor-pointer">
              <span className="text-sm text-gray-600">
                {isDragging ? "Drop video here..." : "Drag and drop video or click to select (max 500MB)"}
              </span>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {uploading && (
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">
                Uploading video... This may take a few minutes for large files.
              </div>
              <div className="animate-pulse text-blue-600">Processing...</div>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

          {videoUrl && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                Video uploaded successfully!
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Video URL (copy this):</label>
                <input
                  type="text"
                  value={videoUrl}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                  onClick={(e) => e.currentTarget.select()}
                />
              </div>
              <video src={videoUrl} controls className="w-full rounded-lg" />
            </div>
          )}

          <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full">
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

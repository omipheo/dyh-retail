"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2, CheckCircle2, Book, FileText, File } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ReferenceDocumentUploadForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    document_type: "book",
    description: "",
    version: "",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    if (!formData.title || !formData.document_type) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      console.log("[v0] Starting file upload:", file.name, file.size)

      // Upload file to Blob storage
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("documentType", formData.document_type)

      const uploadResponse = await fetch("/api/reference-docs/upload", {
        method: "POST",
        body: uploadFormData,
      })

      if (!uploadResponse.ok) {
        let errorMessage = "Failed to upload file"
        try {
          const errorData = await uploadResponse.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `${uploadResponse.status}: ${uploadResponse.statusText}`
        }
        throw new Error(errorMessage)
      }

      const { url, pathname } = await uploadResponse.json()

      console.log("[v0] File uploaded successfully:", url)

      // Save reference to database
      const dbResponse = await fetch("/api/reference-docs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          file_url: url,
          file_path: pathname,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        }),
      })

      if (!dbResponse.ok) {
        let errorMessage = "Failed to save document reference"
        try {
          const errorData = await dbResponse.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          errorMessage = `${dbResponse.status}: ${dbResponse.statusText}`
        }
        throw new Error(errorMessage)
      }

      toast({
        title: "Upload successful",
        description: "Reference document has been uploaded",
      })

      router.push("/admin/reference-docs")
      router.refresh()
    } catch (error) {
      console.error("[v0] Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const documentTypes = [
    { value: "book", label: "Book (Deduct Your Home)", icon: Book },
    { value: "ato_letter", label: "ATO Correspondence", icon: FileText },
    { value: "guide", label: "Reference Guide", icon: File },
    { value: "dyh_strategy", label: "DYH Strategy Selector", icon: FileText },
    { value: "quick_questionnaire", label: "Quick Questionnaire", icon: FileText },
    { value: "home_business_tax_advice", label: "HOME BASED,...BUSINESS & TAXATION ADVICE", icon: FileText },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Details</CardTitle>
        <CardDescription>
          Upload documents, images, and videos including your book and ATO correspondence
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="document_type">Document Type *</Label>
            <Select
              value={formData.document_type}
              onValueChange={(value) => setFormData({ ...formData, document_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Deduct Your Home - 2024 Edition"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Version/Year</Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="e.g., 2024"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the document contents..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File (Documents, Images, Videos) *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg,.mp4,.mov,.avi,.webm,.mkv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file" className="cursor-pointer">
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Click to upload document, image, or video</p>
                    <p className="text-xs text-muted-foreground">
                      PDF, Word, Text, Images (JPG, PNG, GIF, WebP, SVG), Videos (MP4, MOV, AVI, WebM)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Maximum file size: 100MB</p>
                  </div>
                )}
              </label>
            </div>
            {file && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>
                Remove file
              </Button>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={uploading || !file} className="flex-1">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={uploading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

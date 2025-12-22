'use client'

import { useState } from 'react'
import { Upload, FileText, Image, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface DocumentUploadProps {
  assessmentId: string
  onUploadComplete?: () => void
}

interface UploadedFile {
  id: string
  filename: string
  url: string
  type: string
  size: number
}

export function DocumentUpload({ assessmentId, onUploadComplete }: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [documentType, setDocumentType] = useState<string>('')
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    if (!documentType) {
      toast({
        title: 'Document Type Required',
        description: 'Please select a document type before uploading.',
        variant: 'destructive',
      })
      return
    }

    setUploading(true)

    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('assessmentId', assessmentId)
        formData.append('documentType', documentType)

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        return response.json()
      })

      const uploadedFiles = await Promise.all(uploadPromises)
      setFiles((prev) => [...prev, ...uploadedFiles])
      
      toast({
        title: 'Upload Successful',
        description: `${uploadedFiles.length} file(s) uploaded successfully.`,
      })

      if (onUploadComplete) {
        onUploadComplete()
      }

      // Reset file input
      e.target.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload files',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch('/api/documents/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId }),
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      setFiles((prev) => prev.filter((f) => f.id !== fileId))
      
      toast({
        title: 'File Deleted',
        description: 'The file has been removed successfully.',
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete the file',
        variant: 'destructive',
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">Upload Documents</h3>
          <p className="text-sm text-muted-foreground">
            Upload photos, documents, or videos of your home office, receipts, or other supporting materials (max 100MB per file)
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="document-type">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home_office_photo">Home Office Photo</SelectItem>
                <SelectItem value="utility_bill">Utility Bill</SelectItem>
                <SelectItem value="mortgage_statement">Mortgage Statement</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
                <SelectItem value="floor_plan">Floor Plan</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">
                      Images, PDFs, Word docs, text files, or videos (max 100MB)
                    </p>
                  </div>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                className="sr-only"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/svg+xml,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska"
                multiple
                onChange={handleFileChange}
                disabled={uploading || !documentType}
              />
            </Label>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Uploaded Files</h4>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {file.type.startsWith('image/') ? (
                      <Image className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

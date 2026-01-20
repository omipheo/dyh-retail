import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting reference document upload")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const documentType = formData.get("documentType") as string

    console.log("[v0] File received:", file?.name, "Size:", file?.size, "Type:", file?.type)

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/svg+xml",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
      "video/x-matroska",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not supported. Please upload PDF, Word, Text, Image, or Video files." },
        { status: 400 },
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "File size exceeds 10MB limit. Please compress the file or contact support for larger uploads.",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Uploading to Vercel Blob...")

    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `reference-docs/${documentType}/${timestamp}-${sanitizedName}`

    try {
      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: false,
      })

      console.log("[v0] Upload successful:", blob.url)

      return NextResponse.json({
        url: blob.url,
        pathname: blob.pathname,
        size: file.size,
      })
    } catch (blobError: any) {
      console.error("[v0] Blob upload failed:", blobError)

      // Try to extract meaningful error message from various error formats
      let errorMessage = "Unknown upload error"

      // Check if it's a Response object with text
      if (blobError && typeof blobError.text === "function") {
        try {
          errorMessage = await blobError.text()
        } catch (e) {
          errorMessage = "Failed to read error response"
        }
      } else if (typeof blobError === "string") {
        errorMessage = blobError
      } else if (blobError?.message) {
        errorMessage = blobError.message
      } else if (blobError?.toString) {
        try {
          const str = blobError.toString()
          if (str !== "[object Object]") {
            errorMessage = str
          }
        } catch (e) {
          // Ignore toString errors
        }
      }

      console.error("[v0] Error message:", errorMessage)

      // Check for size limit errors
      if (
        errorMessage.toLowerCase().includes("entity") ||
        errorMessage.toLowerCase().includes("large") ||
        errorMessage.toLowerCase().includes("limit") ||
        errorMessage.toLowerCase().includes("size")
      ) {
        return NextResponse.json(
          {
            error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the preview environment limit (~4.5MB). Please deploy to production for larger files, or compress your PDF to under 4MB.`,
          },
          { status: 413 },
        )
      }

      return NextResponse.json(
        {
          error: `Upload failed: ${errorMessage}. Please try again or contact support.`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Reference document upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload document" },
      { status: 500 },
    )
  }
}

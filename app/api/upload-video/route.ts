import type { NextRequest } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  console.log("[v0] Upload request received")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("[v0] ERROR: No file provided")
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] File received:", file.name)

    if (!file.type.startsWith("video/")) {
      console.log("[v0] ERROR: Invalid file type. Only video files are allowed.")
      return Response.json({ error: "Invalid file type. Only video files are allowed." }, { status: 400 })
    }

    console.log("[v0] File type validated successfully")

    if (file.size > 500 * 1024 * 1024) {
      console.log("[v0] ERROR: File too large. Maximum size is 500MB.")
      return Response.json({ error: "File too large. Maximum size is 500MB." }, { status: 400 })
    }

    console.log("[v0] File size validated successfully")

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    console.log("[v0] Blob token exists:", !!blobToken)

    if (!blobToken) {
      console.log("[v0] ERROR: BLOB_READ_WRITE_TOKEN not found")
      return Response.json({ error: "Server configuration error: Missing blob storage token" }, { status: 500 })
    }

    console.log("[v0] Starting upload to Vercel Blob...")

    const blob = await put(file.name, file, {
      access: "public",
      token: blobToken,
    })

    console.log("[v0] Upload completed successfully:", blob.url)

    return Response.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] Video upload error:", error)
    console.error("[v0] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      name: error instanceof Error ? error.name : "Unknown",
    })

    return Response.json({ error: error instanceof Error ? error.message : "Failed to upload video" }, { status: 500 })
  }
}

export const runtime = "nodejs"
export const maxDuration = 60

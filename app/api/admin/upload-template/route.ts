import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.name.endsWith(".docx")) {
      return NextResponse.json({ error: "File must be a .docx document" }, { status: 400 })
    }

    const blob = await put(`templates/${file.name}`, file, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: Request) {
  try {
    console.log("[v0] Getting presigned upload URL...")

    const { filename, contentType } = await request.json()

    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return NextResponse.json({ error: "Blob token not configured" }, { status: 500 })
    }

    // Generate presigned URL for direct upload
    const response = await fetch("https://blob.vercel-storage.com", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        type: "put-presigned",
        pathname: `videos/${filename}`,
        contentType: contentType,
      }),
    })

    const data = await response.json()
    console.log("[v0] Presigned URL generated successfully")

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Error generating presigned URL:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

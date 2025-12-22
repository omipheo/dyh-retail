import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

// Serve the icon to prevent 404 errors
// Access via /api/favicon or configure redirect in next.config
export async function GET() {
  try {
    const iconPath = join(process.cwd(), "public", "icon-light-32x32.png")
    const iconBuffer = readFileSync(iconPath)
    
    return new NextResponse(iconBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    return new NextResponse(null, { status: 204 })
  }
}


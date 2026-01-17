import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check database connectivity
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    const dbStatus = error ? "disconnected" : "connected"

    // Check required environment variables
    const envVars = {
      supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY,
      dyhApiKey: !!process.env.DYH_API_KEY,
      blob: !!process.env.BLOB_READ_WRITE_TOKEN,
    }

    const allEnvVarsPresent = Object.values(envVars).every((v) => v)

    return NextResponse.json({
      status: dbStatus === "connected" && allEnvVarsPresent ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        environment: allEnvVarsPresent ? "configured" : "missing_vars",
      },
      integrations: {
        supabase: envVars.supabase,
        dyhExplorer: envVars.dyhApiKey,
        blobStorage: envVars.blob,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}

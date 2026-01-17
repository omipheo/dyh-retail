import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createServiceRoleClient()

    console.log("[v0] Testing database insert...")

    const testClient = {
      full_name: "Test Client " + Date.now(),
      email: `test${Date.now()}@example.com`,
      phone_number: "0400000000",
      status: "active",
      questionnaire_data: {
        client_type: "individual",
      },
    }

    console.log("[v0] Attempting to insert:", testClient)

    const { data, error } = await supabase.from("dyh_practice_clients").insert(testClient).select().single()

    if (error) {
      console.error("[v0] Insert FAILED:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      })
    }

    console.log("[v0] Insert SUCCESS:", data)

    return NextResponse.json({
      success: true,
      message: "Test client inserted successfully",
      client: data,
    })
  } catch (error) {
    console.error("[v0] Test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

import { getServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceRoleClient()
    const { status } = await request.json()

    // Validate status
    if (!["active", "inactive", "archived"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("dyh_practice_clients")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error updating client status:", error)
    return NextResponse.json({ error: error.message || "Failed to update client status" }, { status: 500 })
  }
}

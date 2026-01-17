import { NextResponse } from "next/server"
import { getServiceRoleClient } from "@/lib/supabase/service-role"

export async function POST() {
  try {
    let supabase
    try {
      supabase = getServiceRoleClient()
    } catch (e) {
      console.error("[v0] Failed to create service role client:", e)
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const { data: allClients, error: fetchError } = await supabase
      .from("dyh_practice_clients")
      .select("*")
      .order("created_at", { ascending: true })

    if (fetchError) {
      console.error("[v0] Error fetching clients:", fetchError)
      return NextResponse.json({ error: fetchError.message || "Failed to fetch clients" }, { status: 500 })
    }

    const seen = new Map<string, { id: string; name: string; email: string }>()
    const duplicates: Array<{ id: string; name: string; email: string; reason: string }> = []

    for (const client of allClients || []) {
      const key = `${client.full_name}|${client.email || ""}`

      if (seen.has(key)) {
        const original = seen.get(key)!
        duplicates.push({
          id: client.id,
          name: client.full_name,
          email: client.email || "No email",
          reason: `Duplicate of ${original.name} (ID: ${original.id.substring(0, 8)}...)`,
        })
      } else {
        seen.set(key, { id: client.id, name: client.full_name, email: client.email || "" })
      }
    }

    if (duplicates.length > 0) {
      const duplicateIds = duplicates.map((d) => d.id)
      const { error: deleteError } = await supabase.from("dyh_practice_clients").delete().in("id", duplicateIds)

      if (deleteError) {
        console.error("[v0] Error deleting duplicates:", deleteError)
        return NextResponse.json({ error: deleteError.message || "Failed to delete duplicates" }, { status: 500 })
      }
    }

    return NextResponse.json({
      deleted: duplicates.length,
      remaining: (allClients?.length || 0) - duplicates.length,
      duplicates: duplicates,
    })
  } catch (error) {
    console.error("[v0] Error in remove-duplicates:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

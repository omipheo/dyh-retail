import { createServerClient } from "@/lib/supabase-server"

export async function POST() {
  try {
    const supabase = await createServerClient()

    // Delete all client data in correct order (child tables first)
    await supabase.from("client_notes").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    await supabase.from("client_group_members").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    await supabase.from("dyh_practice_clients").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Cleanup error:", error)
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}

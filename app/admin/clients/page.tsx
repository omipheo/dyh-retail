import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ClientsContent from "./clients-content"

export default async function ClientsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is a tax agent
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "tax_agent") {
    redirect("/dashboard")
  }

  return <ClientsContent />
}

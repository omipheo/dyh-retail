import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FollowUpForm } from "@/components/followup-form"

export default async function NewFollowUpPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile and check if tax agent
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (profile?.role !== "tax_agent") {
    redirect("/dashboard")
  }

  // Get all clients
  const { data: clients } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "end_user")
    .order("full_name")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin/follow-ups">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Follow-Ups
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Create New Follow-Up</h1>
          <p className="text-sm text-muted-foreground mt-1">Send a follow-up request to a client</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <FollowUpForm clients={clients || []} taxAgentId={data.user.id} />
        </div>
      </div>
    </div>
  )
}

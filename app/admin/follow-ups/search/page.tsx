import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { GlobalSearchContent } from "./search-content"

export default async function GlobalFollowUpSearchPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (profile?.role !== "tax_agent") {
    redirect("/dashboard")
  }

  // Get all follow-ups with client info and documents
  const { data: followups } = await supabase
    .from("client_followups")
    .select(`
      *,
      client:profiles!client_id(id, full_name, email),
      documents:followup_documents(*)
    `)
    .order("created_at", { ascending: false })

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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Search All Communications</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Search through all client follow-ups, messages, and documents
              </p>
            </div>
          </div>
        </div>
      </header>

      <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
        <GlobalSearchContent followups={followups || []} />
      </Suspense>
    </div>
  )
}

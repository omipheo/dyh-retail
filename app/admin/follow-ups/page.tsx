import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Search } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { FollowUpsContent } from "./followups-content"

export default async function FollowUpsPage() {
  const supabase = await createClient()

  const { data: followups } = await supabase
    .from("client_followups")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Client Follow-Up</h1>
              <p className="text-sm text-muted-foreground mt-1">Send and track client follow-up requests</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/admin/follow-ups/search">
                  <Search className="h-4 w-4 mr-2" />
                  Search All
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/follow-ups/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Follow-Up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
        <FollowUpsContent followups={followups || []} />
      </Suspense>
    </div>
  )
}

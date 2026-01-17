import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, UserPlus, Users, Upload } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { PracticeClientsContent } from "./practice-clients-content"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export default async function PracticeClientsPage() {
  const supabase = getSupabaseAdmin()

  const { data: clients, error } = await supabase
    .from("dyh_practice_clients")
    .select(`
      *,
      client_group_members(
        group_id,
        role_in_group,
        client_groups(
          id,
          group_name,
          group_type
        )
      )
    `)
    .order("created_at", { ascending: false })

  console.log("[v0] Fetched clients count:", clients?.length || 0)
  console.log("[v0] Fetch error:", error)
  if (clients && clients.length > 0) {
    console.log("[v0] First client sample:", JSON.stringify(clients[0], null, 2))
  }

  const { data: clientGroups } = await supabase
    .from("client_groups")
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
              <h1 className="text-3xl font-bold">Clients</h1>
              <p className="text-sm text-muted-foreground mt-1">Converted clients who purchased Final Reports</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/admin/practice-clients/groups">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Groups
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/practice-clients/import">
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/practice-clients/add">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Client
                </Link>
              </Button>
              <Button asChild>
                <Link href="/api/practice-clients/export">
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
        <PracticeClientsContent clients={clients || []} clientGroups={clientGroups || []} />
      </Suspense>
    </div>
  )
}

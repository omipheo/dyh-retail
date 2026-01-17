import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { ClientGroupsContent } from "./client-groups-content"

export default async function ClientGroupsPage() {
  const supabase = await createClient()

  // Get all client groups with member counts
  const { data: clientGroups } = await supabase
    .from("client_groups")
    .select(`
      *,
      client_group_members(
        id,
        client_id,
        role_in_group,
        dyh_practice_clients(
          id,
          client_name,
          client_email,
          client_type
        )
      )
    `)
    .order("created_at", { ascending: false })

  // Get all clients for adding to groups
  const { data: allClients } = await supabase
    .from("dyh_practice_clients")
    .select("id, client_name, client_email, client_type")
    .order("client_name")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin/practice-clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Practice Clients
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Client Groups</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage family and business relationships</p>
            </div>
            <Button asChild>
              <Link href="/admin/practice-clients/groups/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <ClientGroupsContent clientGroups={clientGroups || []} allClients={allClients || []} />
      </div>
    </div>
  )
}

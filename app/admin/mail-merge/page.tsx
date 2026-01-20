import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MailMergeContent } from "./mail-merge-content"

export default async function MailMergePage() {
  const supabase = await createClient()

  // Get all practice clients
  const { data: practiceClients } = await supabase
    .from("dyh_practice_clients")
    .select(`
      *,
      client_group_members(
        group_id,
        role_in_group,
        client_groups(group_name, group_type)
      )
    `)
    .order("created_at", { ascending: false })

  // Get all prospects
  const { data: prospects } = await supabase
    .from("dyh_explorer_prospects")
    .select("*")
    .order("created_at", { ascending: false })

  // Get all client groups
  const { data: clientGroups } = await supabase.from("client_groups").select("*").order("group_name")

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
          <div>
            <h1 className="text-3xl font-bold">Mail Merge for MS Outlook</h1>
            <p className="text-sm text-muted-foreground mt-1">Export client data for Outlook mail merge campaigns</p>
          </div>
        </div>
      </header>

      <MailMergeContent
        practiceClients={practiceClients || []}
        prospects={prospects || []}
        clientGroups={clientGroups || []}
      />
    </div>
  )
}

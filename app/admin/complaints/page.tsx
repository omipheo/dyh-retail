import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Download } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { ComplaintsContent } from "./complaints-content"

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const resolvedParams = await searchParams
  const supabase = await createClient()

  const { data } = await supabase.auth.getUser()

  const isDeletedView = resolvedParams.view === "deleted"

  let query = supabase
    .from("complaints")
    .select(
      `
      *,
      profiles!complaints_client_id_fkey(id, full_name, email)
    `,
    )
    .order("profiles(full_name)", { ascending: true })

  if (isDeletedView) {
    query = query.not("deleted_at", "is", null)
  } else {
    query = query.is("deleted_at", null)
  }

  const { data: complaints } = await query

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
              <h1 className="text-3xl font-bold">Complaints Register</h1>
              <p className="text-sm text-muted-foreground mt-1">Track and manage all client complaints</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/api/admin/complaints/export">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/complaints/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Complaint
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
        <ComplaintsContent
          complaints={complaints || []}
          currentUserId={data?.user?.id || ""}
          isDeletedView={isDeletedView}
        />
      </Suspense>
    </div>
  )
}

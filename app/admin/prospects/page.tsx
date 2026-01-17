import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { ProspectsContent } from "./prospects-content"

export default async function ProspectsPage() {
  const supabase = await createClient()

  // Get all DYH Explorer prospects
  const { data: prospects } = await supabase
    .from("dyh_explorer_prospects")
    .select("*")
    .order("client_name", { ascending: true })

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
              <h1 className="text-3xl font-bold">DYH Explorer Prospects</h1>
              <p className="text-sm text-muted-foreground mt-1">Prospective clients from DYH Explorer workspace</p>
            </div>
            <Button asChild>
              <Link href="/api/prospects/export">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
        <ProspectsContent prospects={prospects || []} />
      </Suspense>
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { SubmissionsContent } from "./submissions-content"

export default async function SubmissionsPage() {
  const supabase = await createClient()

  const { data: assessments } = await supabase
    .from("client_assessments")
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
              <h1 className="text-3xl font-bold">Form Submissions</h1>
              <p className="text-sm text-muted-foreground mt-1">Quick Questionnaires & Strategy Selector Forms</p>
            </div>
            <Button asChild>
              <Link href="/api/admin/submissions/export">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
        <SubmissionsContent assessments={assessments || []} />
      </Suspense>
    </div>
  )
}

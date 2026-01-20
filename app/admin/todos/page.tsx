import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { TodosContent } from "./todos-content"

export default async function TodosPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const resolvedParams = await searchParams
  const supabase = await createClient()

  const { data } = await supabase.auth.getUser()

  const isDeletedView = resolvedParams.view === "deleted"

  let query = supabase.from("todos").select("*").order("title", { ascending: true })

  if (isDeletedView) {
    query = query.not("deleted_at", "is", null)
  } else {
    query = query.is("deleted_at", null)
  }

  const { data: todos } = await query

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
              <h1 className="text-3xl font-bold">To-Do List</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage tasks with urgency levels</p>
            </div>
            <Button asChild>
              <Link href="/admin/todos/new">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
        <TodosContent todos={todos || []} currentUserId={data?.user?.id || ""} isDeletedView={isDeletedView} />
      </Suspense>
    </div>
  )
}

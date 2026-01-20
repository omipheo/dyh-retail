import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TodoForm } from "@/components/todo-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewTodoPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (profile?.role !== "tax_agent") {
    redirect("/dashboard")
  }

  const { data: clients } = await supabase.from("profiles").select("id, full_name, email").eq("role", "end_user")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin/todos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to To-Do List
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Create New Task</h1>
          <p className="text-sm text-muted-foreground mt-1">Add a new task with urgency level and notes</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <TodoForm clients={clients || []} currentUserId={data.user.id} />
        </div>
      </div>
    </div>
  )
}

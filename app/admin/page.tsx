import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { FileText, Users, UserPlus, Building2, Settings, Video } from "lucide-react"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile and check if tax agent
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (profile?.role !== "tax_agent") {
    redirect("/dashboard")
  }

  const { count: totalSubmissions } = await supabase
    .from("client_assessments")
    .select("*", { count: "exact", head: true })

  const { count: recentSubmissions } = await supabase
    .from("client_assessments")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { count: prospectsCount } = await supabase
    .from("dyh_explorer_prospects")
    .select("*", { count: "exact", head: true })

  const { count: clientsCount } = await supabase
    .from("dyh_practice_clients")
    .select("*", { count: "exact", head: true })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Practice Manager Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, {profile?.full_name || data.user.email}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="text-3xl font-bold mt-2">{totalSubmissions || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last 7 Days</p>
                <p className="text-3xl font-bold mt-2">{recentSubmissions || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Prospects</p>
                <p className="text-3xl font-bold mt-2">{prospectsCount || 0}</p>
              </div>
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Practice Clients</p>
                <p className="text-3xl font-bold mt-2">{clientsCount || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <FileText className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Form Submissions</h2>
            <p className="text-sm text-muted-foreground mb-4">View and manage all client questionnaire submissions</p>
            <Button asChild className="w-full">
              <Link href="/admin/submissions">View Submissions</Link>
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <UserPlus className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">DYH Explorer Prospects</h2>
            <p className="text-sm text-muted-foreground mb-4">Manage prospects from DYH Explorer system</p>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/admin/prospects">View Prospects</Link>
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Building2 className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">DYH Practice Clients</h2>
            <p className="text-sm text-muted-foreground mb-4">Manage converted clients with purchased reports</p>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/admin/clients">Manage Clients</Link>
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Video className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Upload Video</h2>
            <p className="text-sm text-muted-foreground mb-4">Replace the home page intro video</p>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/admin/upload-video">Upload Video</Link>
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Settings className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Settings</h2>
            <p className="text-sm text-muted-foreground mb-4">Configure your practice settings</p>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/admin/settings">Settings</Link>
            </Button>
          </Card>
        </div>
      </main>
    </div>
  )
}

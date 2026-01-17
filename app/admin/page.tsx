import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Calendar, CheckSquare, AlertCircle, MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
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

  // Get statistics
  const { count: totalClients } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "end_user")

  const { count: totalAssessments } = await supabase
    .from("client_assessments")
    .select("*", { count: "exact", head: true })

  const { count: completedAssessments } = await supabase
    .from("client_assessments")
    .select("*", { count: "exact", head: true })
    .eq("completed", true)

  const { count: totalProspects } = await supabase
    .from("dyh_explorer_prospects")
    .select("*", { count: "exact", head: true })
    .eq("status", "new")

  const { count: convertedClients } = await supabase
    .from("dyh_practice_clients")
    .select("*", { count: "exact", head: true })

  const { data: recentAssessments } = await supabase
    .from("client_assessments")
    .select(`
      *,
      profiles!client_assessments_user_id_fkey(full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Tax Agent Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{profile?.full_name || data.user.email}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients || 0}</div>
              <p className="text-xs text-muted-foreground">Registered end users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssessments || 0}</div>
              <p className="text-xs text-muted-foreground">All questionnaire responses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAssessments || 0}</div>
              <p className="text-xs text-muted-foreground">Finished assessments</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Prospects</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>DYH Explorer prospects awaiting conversion</CardDescription>
              <Button asChild className="mt-4 w-full">
                <Link href="/admin/prospects">View Prospects</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Practice Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Converted clients with Final Reports</CardDescription>
              <Button asChild className="mt-4 w-full">
                <Link href="/admin/practice-clients">View Clients</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Form Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>View completed questionnaires</CardDescription>
              <Button asChild className="mt-4 w-full">
                <Link href="/admin/submissions">View Submissions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Calendar className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>ATO Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Compliance calendar and reminders</CardDescription>
              <Button asChild className="mt-4 w-full">
                <Link href="/admin/ato-schedule">View Schedule</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CheckSquare className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>To-Do List</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Task management with urgency levels</CardDescription>
              <Button asChild className="mt-4 w-full">
                <Link href="/admin/todos">View Tasks</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <AlertCircle className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Complaints Register</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Track and manage client complaints</CardDescription>
              <Button asChild className="mt-4 w-full">
                <Link href="/admin/complaints">View Complaints</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <MessageSquare className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Client Follow-Ups</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Send and track client communications</CardDescription>
              <Button asChild variant="outline" className="mt-4 w-full bg-transparent">
                <Link href="/admin/follow-ups">Manage Follow-Ups</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Monitor DYH Explorer integration</CardDescription>
              <Button asChild variant="outline" className="mt-4 w-full bg-transparent">
                <Link href="/admin/integration-status">Check Status</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Assessments */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Recent Client Assessments</h3>
          {recentAssessments && recentAssessments.length > 0 ? (
            <div className="grid gap-4">
              {recentAssessments.map((assessment) => (
                <Card key={assessment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{assessment.full_name || "Unnamed Assessment"}</CardTitle>
                        <CardDescription>
                          Client: {assessment.profiles?.full_name || assessment.profiles?.email || "Unknown"} • Created{" "}
                          {new Date(assessment.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          assessment.completed
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {assessment.completed ? "Completed" : "Pending"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        {assessment.total_deduction && (
                          <p className="text-2xl font-bold text-primary">${assessment.total_deduction.toFixed(2)}</p>
                        )}
                        {assessment.scenario_type && (
                          <p className="text-sm text-muted-foreground">
                            Method: {assessment.scenario_type === "fixed_rate" ? "Fixed Rate" : "Actual Cost"}
                          </p>
                        )}
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/questionnaire/${assessment.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No assessments yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

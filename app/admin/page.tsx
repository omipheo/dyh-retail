import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Upload, Settings } from "lucide-react"
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
    .from("questionnaire_responses")
    .select("*", { count: "exact", head: true })

  const { count: completedAssessments } = await supabase
    .from("questionnaire_responses")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")

  const { data: recentAssessments } = await supabase
    .from("questionnaire_responses")
    .select(`
      *,
      profiles!questionnaire_responses_user_id_fkey(full_name, email)
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
            <Button variant="outline" asChild>
              <Link href="/dashboard">Client View</Link>
            </Button>
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
              <CardTitle>View All Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Manage client profiles and information</CardDescription>
              <Button asChild className="mt-4 w-full">
                <Link href="/admin/clients">View Clients</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>All Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>View and manage all client assessments</CardDescription>
              <Button asChild className="mt-4 w-full">
                <Link href="/admin/assessments">View All</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Upload className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Reference Docs</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Upload ATO guides and resources</CardDescription>
              <Button asChild className="mt-4 w-full">
                <Link href="/admin/reference-docs">Manage Docs</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Settings className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Configure system preferences</CardDescription>
              <Button asChild variant="outline" className="mt-4 w-full bg-transparent">
                <Link href="/settings">Settings</Link>
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
                          assessment.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : assessment.status === "draft"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {assessment.status}
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

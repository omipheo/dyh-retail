import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, BarChart3, CheckCircle2, Clock, FolderOpen } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single()

  // Get subscription
  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", user!.id).single()

  // Get questionnaires count
  const { count: totalQuestionnaires } = await supabase
    .from("questionnaires")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)

  const { count: completedQuestionnaires } = await supabase
    .from("questionnaires")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .eq("status", "completed")

  // Get reports count
  const { count: reportsCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)

  const { count: documentsCount } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)

  // Get recent questionnaires
  const { data: recentQuestionnaires } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name || "User"}!</h1>
        <p className="text-muted-foreground">Here's an overview of your home business tax optimization</p>
      </div>

      {/* Subscription Status */}
      {subscription?.status !== "active" && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle>Get Started with a Subscription</CardTitle>
            <CardDescription>Choose a plan to start optimizing your home business tax deductions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Questionnaires</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestionnaires || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{completedQuestionnaires || 0} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Generated Reports</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to download</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Uploaded files</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{subscription?.status || "Inactive"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {subscription?.status === "active" ? "Active subscription" : "No active plan"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Questionnaires */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Questionnaires</CardTitle>
            <CardDescription>Your latest tax optimization assessments</CardDescription>
          </div>
          <Button size="sm" asChild>
            <Link href="/dashboard/questionnaires/new">New Questionnaire</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentQuestionnaires && recentQuestionnaires.length > 0 ? (
            <div className="space-y-4">
              {recentQuestionnaires.map((questionnaire) => (
                <div
                  key={questionnaire.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {questionnaire.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">Questionnaire {questionnaire.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(questionnaire.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        questionnaire.status === "completed"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      }`}
                    >
                      {questionnaire.status}
                    </span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/questionnaires/${questionnaire.id}`}>
                        {questionnaire.status === "completed" ? "View" : "Continue"}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No questionnaires yet</p>
              <Button asChild>
                <Link href="/dashboard/questionnaires/new">Create Your First Questionnaire</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

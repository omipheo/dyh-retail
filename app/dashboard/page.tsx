import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, Users, Settings, Sparkles } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get user's questionnaires
  const { data: questionnaires } = await supabase
    .from("questionnaire_responses")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })

  const isTaxAgent = profile?.role === "tax_agent"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Home Business Wealth and Lifestyle Optimiser</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{profile?.full_name || data.user.email}</span>
            {isTaxAgent && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Tax Agent</span>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name?.split(" ")[0] || "User"}!</h2>
          <p className="text-muted-foreground">
            {isTaxAgent
              ? "Manage your clients and their home business optimisation assessments"
              : "Manage your home business wealth and lifestyle optimisation"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Plus className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>New Questionnaire</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Start a new home business optimisation assessment</CardDescription>
              <Button asChild className="mt-4 w-full">
                <Link href="/questionnaire/new">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>My Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{questionnaires?.length || 0} total assessments</CardDescription>
              <Button asChild variant="outline" className="mt-4 w-full bg-transparent">
                <Link href="/questionnaire">View All</Link>
              </Button>
            </CardContent>
          </Card>

          {isTaxAgent && (
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Client Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>View and manage all client assessments</CardDescription>
                <Button asChild variant="outline" className="mt-4 w-full bg-transparent">
                  <Link href="/admin/clients">Manage Clients</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <Settings className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Update your profile and preferences</CardDescription>
              <Button asChild variant="outline" className="mt-4 w-full bg-transparent">
                <Link href="/settings">View Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {isTaxAgent && (
          <Card className="mb-8 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-500" />
                <CardTitle className="text-xl">AI-Powered Strategy Analysis</CardTitle>
              </div>
              <CardDescription className="text-base">
                Automatically analyze client documents against DYH book and ATO PBRs to generate personalized tax
                strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-background/50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">How it works:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• AI analyzes all client-uploaded documents (questionnaires, receipts, photos)</li>
                  <li>
                    • Cross-references with your uploaded reference materials (DYH book, ATO PBRs, strategy selectors)
                  </li>
                  <li>• Recommends optimal deduction method with detailed reasoning</li>
                  <li>• Performs ATO-compliant calculations automatically</li>
                  <li>• Generates professional interim reports for clients</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Select any completed assessment to generate its AI strategy analysis and report
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recent Assessments */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Recent Assessments</h3>
          {questionnaires && questionnaires.length > 0 ? (
            <div className="grid gap-4">
              {questionnaires.slice(0, 3).map((q) => (
                <Card key={q.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{q.full_name || "Unnamed Assessment"}</CardTitle>
                        <CardDescription>Created {new Date(q.created_at).toLocaleDateString()}</CardDescription>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          q.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : q.status === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {q.total_deduction && (
                          <span className="font-semibold text-foreground">
                            Deduction: ${q.total_deduction.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {q.status === "completed" && isTaxAgent && (
                          <Button asChild variant="outline" size="sm" className="border-purple-500/50 bg-transparent">
                            <Link href={`/admin/analyze/${q.id}`}>
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Analysis
                            </Link>
                          </Button>
                        )}
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/questionnaire/${q.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No assessments yet. Start your first one!</p>
                <Button asChild>
                  <Link href="/questionnaire/new">Create Assessment</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

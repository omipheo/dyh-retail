import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function AllAssessmentsPage() {
  const supabase = await createClient()

  // Get all assessments with client info
  const { data: assessments } = await supabase
    .from("questionnaire_responses")
    .select(`
      *,
      profiles!questionnaire_responses_user_id_fkey(full_name, email)
    `)
    .order("created_at", { ascending: false })

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
          <h1 className="text-2xl font-bold">All Client Assessments</h1>
          <p className="text-sm text-muted-foreground">View and manage all assessments across clients</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by client name or assessment..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assessments List */}
          {assessments && assessments.length > 0 ? (
            <div className="grid gap-4">
              {assessments.map((assessment) => (
                <Card key={assessment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{assessment.full_name || "Unnamed Assessment"}</CardTitle>
                        <CardDescription>
                          Client: {assessment.profiles?.full_name || assessment.profiles?.email || "Unknown"} • Created{" "}
                          {new Date(assessment.created_at).toLocaleDateString()} • Updated{" "}
                          {new Date(assessment.updated_at).toLocaleDateString()}
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
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {assessment.scenario_type && (
                            <span>
                              Method: {assessment.scenario_type === "fixed_rate" ? "Fixed Rate" : "Actual Cost"}
                            </span>
                          )}
                          {assessment.employment_status && (
                            <span className="capitalize">{assessment.employment_status.replace("_", " ")}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/submissions?assessmentId=${assessment.id}`}>View Details</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/clients/${assessment.user_id}`}>Client Profile</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground text-lg">No assessments found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, CheckCircle2, Clock, FileText } from "lucide-react"

export default async function QuestionnairesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get all questionnaires
  const { data: questionnaires } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Questionnaires</h1>
          <p className="text-muted-foreground">Manage your tax optimization assessments</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/questionnaires/new">
            <Plus className="w-4 h-4 mr-2" />
            New Questionnaire
          </Link>
        </Button>
      </div>

      {/* Questionnaires List */}
      {questionnaires && questionnaires.length > 0 ? (
        <div className="grid gap-4">
          {questionnaires.map((questionnaire) => (
            <Card key={questionnaire.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Questionnaire {questionnaire.id.slice(0, 8)}</CardTitle>
                      <CardDescription>
                        Created {new Date(questionnaire.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {questionnaire.status === "completed" ? (
                      <span className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-green-500/10 text-green-500">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
                        <Clock className="w-4 h-4" />
                        Draft
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Property Type</p>
                      <p className="font-medium">{questionnaire.property_type || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Office Area</p>
                      <p className="font-medium">
                        {questionnaire.office_area ? `${questionnaire.office_area}m²` : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{new Date(questionnaire.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/questionnaires/${questionnaire.id}`}>
                      {questionnaire.status === "completed" ? "View Details" : "Continue"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No questionnaires yet</h3>
            <p className="text-muted-foreground mb-6">Create your first questionnaire to get started</p>
            <Button asChild>
              <Link href="/dashboard/questionnaires/new">Create Questionnaire</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

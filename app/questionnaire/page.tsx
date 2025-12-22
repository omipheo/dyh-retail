import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus } from 'lucide-react';

export default async function QuestionnairePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const { data: questionnaires } = await supabase
    .from("questionnaire_responses")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Assessments</h1>
          <Button asChild>
            <Link href="/questionnaire/new">
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {questionnaires && questionnaires.length > 0 ? (
          <div className="grid gap-4">
            {questionnaires.map((q) => (
              <Card key={q.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{q.full_name || "Unnamed Assessment"}</CardTitle>
                      <CardDescription>
                        Created {new Date(q.created_at).toLocaleDateString()} • 
                        Last updated {new Date(q.updated_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      q.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : q.status === "draft"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}>
                      {q.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      {q.total_deduction && (
                        <p className="text-2xl font-bold text-primary">
                          ${q.total_deduction.toFixed(2)}
                        </p>
                      )}
                      {q.scenario_type && (
                        <p className="text-sm text-muted-foreground">
                          Method: {q.scenario_type === "fixed_rate" ? "Fixed Rate" : "Actual Cost"}
                        </p>
                      )}
                      {q.employment_status && (
                        <p className="text-sm text-muted-foreground capitalize">
                          {q.employment_status.replace("_", " ")}
                        </p>
                      )}
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/questionnaire/${q.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground mb-6 text-lg">
                You haven't created any assessments yet.
              </p>
              <Button asChild size="lg">
                <Link href="/questionnaire/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Assessment
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

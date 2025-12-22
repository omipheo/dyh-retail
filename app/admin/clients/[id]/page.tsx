import { redirect, notFound } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Mail, Calendar } from 'lucide-react';
import Link from "next/link";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) {
    redirect("/auth/login");
  }

  // Check if current user is tax agent
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.user.id)
    .single();

  if (currentProfile?.role !== "tax_agent") {
    redirect("/dashboard");
  }

  // Get client profile
  const { data: clientProfile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !clientProfile) {
    notFound();
  }

  // Get client's assessments
  const { data: assessments } = await supabase
    .from("questionnaire_responses")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin/clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{clientProfile.full_name || "Client Profile"}</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{clientProfile.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">{new Date(clientProfile.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                <span className="inline-block px-3 py-1 text-sm rounded-full bg-secondary">
                  {clientProfile.role === "end_user" ? "End User" : "Tax Agent"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assessments</CardTitle>
                  <CardDescription>
                    {assessments?.length || 0} total assessments
                  </CardDescription>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/admin/clients/${id}/assessments`}>View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {assessments && assessments.length > 0 ? (
                <div className="space-y-4">
                  {assessments.slice(0, 3).map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{assessment.full_name || "Unnamed Assessment"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(assessment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {assessment.total_deduction && (
                          <p className="text-lg font-semibold text-primary">
                            ${assessment.total_deduction.toFixed(2)}
                          </p>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          assessment.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        }`}>
                          {assessment.status}
                        </span>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/questionnaire/${assessment.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No assessments yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

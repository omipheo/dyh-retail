import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from 'lucide-react';
import Link from "next/link";

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Get user profile and check if tax agent
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "tax_agent") {
    redirect("/dashboard");
  }

  // Get all clients (end users)
  const { data: clients } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "end_user")
    .order("created_at", { ascending: false });

  // Get assessment counts for each client
  const clientsWithCounts = await Promise.all(
    (clients || []).map(async (client) => {
      const { count } = await supabase
        .from("questionnaire_responses")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", client.id);
      
      return { ...client, assessmentCount: count || 0 };
    })
  );

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
          <h1 className="text-2xl font-bold">Client Management</h1>
          <p className="text-sm text-muted-foreground">View and manage all client profiles</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name or email..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Clients List */}
          {clientsWithCounts && clientsWithCounts.length > 0 ? (
            <div className="grid gap-4">
              {clientsWithCounts.map((client) => (
                <Card key={client.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{client.full_name || "Unnamed Client"}</CardTitle>
                        <CardDescription>{client.email}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{client.assessmentCount} assessments</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(client.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/clients/${client.id}`}>View Profile</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/clients/${client.id}/assessments`}>View Assessments</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground text-lg">No clients found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

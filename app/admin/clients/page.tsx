import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { getServiceRoleClient } from "@/lib/supabase/service-role"

export default async function ClientsPage() {
  const supabase = getServiceRoleClient()

  const { data: clients, error } = await supabase
    .from("dyh_practice_clients")
    .select("*")
    .order("full_name", { ascending: true })

  console.log("[v0] All Clients page - fetched count:", clients?.length || 0)
  console.log("[v0] All Clients page - error:", error)

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
              <Input placeholder="Search clients by name or email..." className="pl-10" />
            </div>
          </div>

          {/* Clients List */}
          {clients && clients.length > 0 ? (
            <div className="grid gap-4">
              {clients.map((client) => (
                <Card key={client.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{client.full_name || "Unnamed Client"}</CardTitle>
                        <CardDescription>{client.email}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium capitalize">{client.status}</p>
                        <p className="text-xs text-muted-foreground">
                          Since {new Date(client.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/practice-clients/${client.id}`}>View Profile</Link>
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
  )
}

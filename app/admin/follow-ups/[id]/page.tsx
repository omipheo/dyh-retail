import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Mail, Calendar, FileText, CheckCircle, Send } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function FollowUpDetailPage({ params }: PageProps) {
  const resolvedParams = await params
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

  // Get the follow-up with client info
  const { data: followup } = await supabase
    .from("client_followups")
    .select(
      `
      *,
      client:client_id(id, full_name, email),
      tax_agent:tax_agent_id(id, full_name)
    `,
    )
    .eq("id", resolvedParams.id)
    .single()

  if (!followup) {
    redirect("/admin/follow-ups")
  }

  // Get uploaded documents
  const { data: documents } = await supabase
    .from("followup_documents")
    .select("*")
    .eq("followup_id", resolvedParams.id)
    .order("created_at", { ascending: false })

  const client = followup.client as any
  const agent = followup.tax_agent as any

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="secondary">Sent</Badge>
      case "viewed":
        return <Badge variant="outline">Viewed</Badge>
      case "responded":
        return <Badge variant="default">Responded</Badge>
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin/follow-ups">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Follow-Ups
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Follow-Up Details</h1>
              <p className="text-sm text-muted-foreground mt-1">Complete follow-up request and response information</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Follow-Up Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{followup.subject}</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(followup.status)}
                  <Badge variant={followup.priority === "urgent" ? "destructive" : "secondary"}>
                    {followup.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{client?.full_name || "Unknown"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{client?.email || "No email"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sent Date</p>
                    <p className="font-medium">{format(new Date(followup.sent_at), "PPP")}</p>
                  </div>
                </div>
                {followup.due_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-medium">{format(new Date(followup.due_date), "PPP")}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Content */}
          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{followup.message_text}</p>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>What the client needs to provide</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {followup.requires_documents && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Document Upload Required</span>
                  </div>
                )}
                {followup.requires_signature && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Document Signing Required</span>
                  </div>
                )}
                {followup.requires_information && (
                  <div className="flex items-center gap-2 text-sm">
                    <Send className="h-4 w-4 text-primary" />
                    <span>Information Provision Required</span>
                  </div>
                )}
                {!followup.requires_documents && !followup.requires_signature && !followup.requires_information && (
                  <p className="text-sm text-muted-foreground">No specific requirements</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Response */}
          {followup.response_text && (
            <Card>
              <CardHeader>
                <CardTitle>Client Response</CardTitle>
                <CardDescription>
                  Responded on {followup.responded_at && format(new Date(followup.responded_at), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{followup.response_text}</p>
              </CardContent>
            </Card>
          )}

          {/* Uploaded Documents */}
          {documents && documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
                <CardDescription>{documents.length} document(s) uploaded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.file_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {format(new Date(doc.created_at), "PP")}
                          </p>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Signature */}
          {followup.signed_at && (
            <Card>
              <CardHeader>
                <CardTitle>Signature</CardTitle>
                <CardDescription>Signed on {format(new Date(followup.signed_at), "PPP")}</CardDescription>
              </CardHeader>
              <CardContent>
                {followup.signature_data && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Client acknowledged and signed this follow-up request</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Internal Notes */}
          {followup.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
                <CardDescription>Notes for tax agent use only</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{followup.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

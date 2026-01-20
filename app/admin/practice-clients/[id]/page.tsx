import { getServiceRoleClient } from "@/lib/supabase/service-role"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, Users, Clock } from "lucide-react"
import Link from "next/link"
import { ClientNotes } from "./client-notes"
import { ManualTimestamp } from "./manual-timestamp"
import { EditClientType } from "./edit-client-type"

export default async function ClientDetailsPage({ params }: { params: { id: string } }) {
  const reservedRoutes = ["import", "add", "groups"]
  if (reservedRoutes.includes(params.id)) {
    redirect(`/admin/practice-clients/${params.id}`)
  }

  const supabase = getServiceRoleClient()

  const { data: client, error } = await supabase
    .from("dyh_practice_clients")
    .select(`
      *,
      client_group_members (
        role_in_group,
        client_groups (
          id,
          group_name,
          description
        )
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !client) {
    notFound()
  }

  const { data: notes } = await supabase
    .from("client_notes")
    .select("*")
    .eq("client_id", params.id)
    .order("created_at", { ascending: false })

  const purchaseData = client.purchase_data as any
  const questionnaireData = client.questionnaire_data as any

  const businessDetails = {
    clientType: questionnaireData?.client_type || questionnaireData?.type,
    industryClassification: questionnaireData?.industry_classification,
    xero_plan: questionnaireData?.xero_plan,
    abn: questionnaireData?.abn,
  }

  // Remove business details from questionnaire data to avoid duplication
  const actualQuestionnaireData = questionnaireData ? { ...questionnaireData } : {}
  delete actualQuestionnaireData.client_type
  delete actualQuestionnaireData.type
  delete actualQuestionnaireData.industry_classification
  delete actualQuestionnaireData.xero_plan
  delete actualQuestionnaireData.abn

  const formatClientName = (fullName: string) => {
    if (!fullName) return "Unknown Client"
    const parts = fullName.split(",")
    if (parts.length === 2) {
      return fullName.trim()
    }
    const nameParts = fullName.trim().split(" ")
    if (nameParts.length === 1) return fullName
    const lastName = nameParts[nameParts.length - 1]
    const firstName = nameParts.slice(0, -1).join(" ")
    return `${lastName}, ${firstName}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/practice-clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Link>
          </Button>
          <ManualTimestamp clientId={params.id} />
        </div>

        {/* Client Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{formatClientName(client.full_name)}</CardTitle>
                <CardDescription className="text-base mt-2">
                  Client since {new Date(client.created_at).toLocaleDateString()}
                </CardDescription>
                {client.status_changed_at && client.status_changed_at !== client.created_at && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span className={client.status === "archived" ? "text-orange-600" : "text-green-600"}>
                      {client.status === "archived" ? "Archived:" : "Restored:"}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(client.status_changed_at).toLocaleDateString()} at{" "}
                      {new Date(client.status_changed_at).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
              <Badge variant={client.status === "active" ? "default" : "outline"} className="text-base px-3 py-1">
                {client.status}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>
              {client.phone_number && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{client.phone_number}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        {(businessDetails.clientType ||
          businessDetails.industryClassification ||
          businessDetails.xero_plan ||
          businessDetails.abn) && (
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {businessDetails.clientType && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Client Type</p>
                      <p className="font-medium">{businessDetails.clientType}</p>
                    </div>
                    <EditClientType clientId={params.id} currentType={businessDetails.clientType} />
                  </div>
                )}
                {businessDetails.industryClassification && (
                  <div>
                    <p className="text-sm text-muted-foreground">Industry Classification</p>
                    <p className="font-medium">{businessDetails.industryClassification}</p>
                  </div>
                )}
                {businessDetails.xero_plan && (
                  <div>
                    <p className="text-sm text-muted-foreground">Xero Plan</p>
                    <p className="font-medium">{businessDetails.xero_plan}</p>
                  </div>
                )}
                {businessDetails.abn && (
                  <div>
                    <p className="text-sm text-muted-foreground">ABN</p>
                    <p className="font-medium">{businessDetails.abn}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Information */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Date</p>
                  <p className="font-medium">
                    {new Date(client.final_report_purchased_at || client.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {purchaseData?.amount && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Amount</p>
                    <p className="font-medium text-lg">${purchaseData.amount}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="pt-4">
              <Badge variant="secondary" className="bg-green-50">
                <DollarSign className="h-3 w-3 mr-1" />
                Final Report Purchased
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Client Groups */}
        {client.client_group_members && client.client_group_members.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Client Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {client.client_group_members.map((member: any) => (
                  <div
                    key={member.client_groups.id}
                    className="flex items-start justify-between border-l-4 border-primary pl-4 py-2"
                  >
                    <div>
                      <p className="font-medium">{member.client_groups.group_name}</p>
                      {member.client_groups.description && (
                        <p className="text-sm text-muted-foreground">{member.client_groups.description}</p>
                      )}
                      {member.role_in_group && (
                        <Badge variant="outline" className="mt-2">
                          {member.role_in_group}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <ClientNotes clientId={params.id} initialNotes={notes || []} />

        {/* Questionnaire Data */}
        {actualQuestionnaireData && Object.keys(actualQuestionnaireData).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Questionnaire Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(actualQuestionnaireData).map(([key, value]) => (
                  <div key={key} className="border-b pb-3 last:border-0">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    <p className="text-sm">{String(value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

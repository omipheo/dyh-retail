import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, FileText, User, Calendar } from "lucide-react"
import Link from "next/link"

export default async function SubmissionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Get the specific assessment
  const { data: assessment, error: assessmentError } = await supabase
    .from("client_assessments")
    .select(
      `
      *,
      profiles!client_assessments_client_id_fkey(id, full_name, email)
    `,
    )
    .eq("id", params.id)
    .single()

  if (assessmentError || !assessment) {
    notFound()
  }

  const clientProfile = assessment.profiles as any
  const formData = assessment.questionnaire_data as any

  // Quick Questionnaire Sections
  const quickQuestions = [
    { q: "1", label: "Marital Status", value: formData.q1_marital_status },
    { q: "2", label: "Annual Income", value: formData.q2_annual_income, prefix: "$" },
    { q: "3", label: "Partner Income", value: formData.q3_partner_income, prefix: "$" },
    { q: "4", label: "Number of Children", value: formData.q4_num_children },
    { q: "5", label: "Ages of Children", value: formData.q5_ages_children },
    { q: "6", label: "Children Incomes", value: formData.q6_children_incomes, prefix: "$" },
    { q: "7", label: "Employment Status", value: formData.q7_employment_status },
    { q: "8", label: "Partner Employment", value: formData.q8_partner_employment },
    { q: "9", label: "Renting", value: formData.q9_renting },
    { q: "10", label: "Home Status", value: formData.q10_home_status },
    { q: "11", label: "Home Value", value: formData.q11_home_value, prefix: "$" },
    { q: "12", label: "Personal Debts", value: formData.q12_personal_debts, prefix: "$" },
    { q: "13", label: "Partner Debts", value: formData.q13_partner_debts, prefix: "$" },
    { q: "16", label: "Total Floor Space", value: formData.q16_total_floor_space, suffix: " sqm" },
    { q: "17", label: "Business Floor Space", value: formData.q17_business_floor_space, suffix: " sqm" },
    { q: "20", label: "Years Operating", value: formData.q20_years_operated },
    { q: "28", label: "GST Registered", value: formData.q28_gst_registered },
  ]

  // Strategy Selector Assets
  const strategyAssets = [
    { label: "Plant & Equipment", value: formData.ss_q1_plant_equipment, prefix: "$" },
    { label: "Goodwill", value: formData.ss_q1_goodwill, prefix: "$" },
    { label: "IP/Patents", value: formData.ss_q1_ip_patents, prefix: "$" },
    { label: "Real Property", value: formData.ss_q1_real_property, prefix: "$" },
    { label: "Liabilities", value: formData.ss_q2_liabilities, prefix: "$" },
  ]

  const hasStrategySelector = formData.ss_q1_plant_equipment !== undefined

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin/submissions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Submission Details</h1>
              <p className="text-sm text-muted-foreground mt-1">Complete questionnaire responses</p>
            </div>
            <Button asChild>
              <Link href={`/admin/submissions/${params.id}/export`}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    {clientProfile?.full_name || assessment.client_name || "Unknown Client"}
                  </CardTitle>
                  <CardDescription className="mt-2 space-y-1">
                    <div>{clientProfile?.email || "No email"}</div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Submitted: {new Date(assessment.created_at).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Last Updated: {new Date(assessment.updated_at).toLocaleString()}
                    </div>
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge
                    variant={
                      assessment.status === "submitted"
                        ? "default"
                        : assessment.status === "draft"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {assessment.status}
                  </Badge>
                  {hasStrategySelector && (
                    <Badge variant="outline" className="bg-blue-50">
                      <FileText className="h-3 w-3 mr-1" />
                      Strategy Selector Completed
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Quick Questionnaire Responses */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Questionnaire (29 Questions)</CardTitle>
              <CardDescription>Initial confidential questionnaire responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {quickQuestions.map((item) => (
                  <div key={item.q} className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      Q{item.q}: {item.label}
                    </div>
                    <div className="text-base font-medium capitalize">
                      {item.prefix}
                      {item.value || "Not provided"}
                      {item.suffix}
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Comments */}
              {(formData.comment1 || formData.comment2 || formData.comment3) && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Additional Comments</h3>
                    {formData.comment1 && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">Comment 1</div>
                        <div className="text-sm bg-muted p-3 rounded-md">{formData.comment1}</div>
                      </div>
                    )}
                    {formData.comment2 && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">Comment 2</div>
                        <div className="text-sm bg-muted p-3 rounded-md">{formData.comment2}</div>
                      </div>
                    )}
                    {formData.comment3 && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">Comment 3</div>
                        <div className="text-sm bg-muted p-3 rounded-md">{formData.comment3}</div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Strategy Selector Responses */}
          {hasStrategySelector && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Selector - Assets & Liabilities</CardTitle>
                  <CardDescription>Business assets and financial position</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {strategyAssets.map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-muted-foreground">{item.label}</div>
                        <div className="text-base font-medium">
                          {item.value ? `${item.prefix}${Number(item.value).toLocaleString()}` : "Not provided"}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Strategy Selector - Business Profile (65 Questions)</CardTitle>
                  <CardDescription>Comprehensive business, wealth & lifestyle profiler</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.keys(formData)
                      .filter((key) => key.startsWith("ss_q") && key >= "ss_q3")
                      .map((key) => {
                        const qNum = key.replace("ss_q", "")
                        const value = formData[key]

                        if (!value || value === "") return null

                        return (
                          <div key={key} className="flex items-start gap-3 text-sm">
                            <div className="font-medium text-muted-foreground min-w-[60px]">Q{qNum}:</div>
                            <div className="flex-1 capitalize">{value}</div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Raw JSON Data (for debugging/export) */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Data (JSON)</CardTitle>
              <CardDescription>Full questionnaire data structure</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-96">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

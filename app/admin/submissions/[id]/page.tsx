import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, User, Mail, Calendar, FileText } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SubmissionDetailPage({ params }: PageProps) {
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

  // Get the specific assessment with profile
  const { data: assessment } = await supabase
    .from("client_assessments")
    .select(
      `
      *,
      profiles!client_assessments_client_id_fkey(id, full_name, email)
    `,
    )
    .eq("id", resolvedParams.id)
    .single()

  if (!assessment) {
    redirect("/admin/submissions")
  }

  const clientProfile = assessment.profiles as any
  const data_ = assessment.questionnaire_data as any

  // Check if this has Strategy Selector data
  const hasStrategySelector = data_.ss_q1_plant_equipment !== undefined

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
              <p className="text-sm text-muted-foreground mt-1">
                Complete questionnaire and strategy selector responses
              </p>
            </div>
            <Button asChild>
              <Link href={`/api/admin/submissions/${assessment.id}/export`}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Client Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Client Information</CardTitle>
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
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Client Name</p>
                    <p className="font-medium">{clientProfile?.full_name || assessment.client_name || "Unknown"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{clientProfile?.email || "No email"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-medium">{new Date(assessment.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{new Date(assessment.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Questionnaire Responses */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Questionnaire Responses</CardTitle>
              <CardDescription>Client's answers to initial assessment questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Personal Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Marital Status</p>
                    <p className="font-medium capitalize">{data_.q1_marital_status || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Income</p>
                    <p className="font-medium">
                      {data_.q2_annual_income ? `$${Number(data_.q2_annual_income).toLocaleString()}` : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Spouse/Partner Income</p>
                    <p className="font-medium">
                      {data_.q3_spouse_income ? `$${Number(data_.q3_spouse_income).toLocaleString()}` : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Number of Children</p>
                    <p className="font-medium">{data_.q4_number_children ?? "Not provided"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Business Details */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Business Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Business Structure</p>
                    <p className="font-medium capitalize">{data_.q5_business_structure || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Income Type</p>
                    <p className="font-medium capitalize">{data_.q6_income_type || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Turnover</p>
                    <p className="font-medium">
                      {data_.q7_annual_turnover
                        ? `$${Number(data_.q7_annual_turnover).toLocaleString()}`
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Business Expenses</p>
                    <p className="font-medium">
                      {data_.q8_business_expenses
                        ? `$${Number(data_.q8_business_expenses).toLocaleString()}`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Deductions */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Deductions</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Claiming Home Office Deduction</p>
                    <p className="font-medium">{data_.q9_home_office === "yes" ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Claiming Vehicle Deduction</p>
                    <p className="font-medium">{data_.q10_vehicle === "yes" ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Claiming Business Travel</p>
                    <p className="font-medium">{data_.q11_business_travel === "yes" ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Professional Development Expenses</p>
                    <p className="font-medium">
                      {data_.q12_professional_dev
                        ? `$${Number(data_.q12_professional_dev).toLocaleString()}`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Assets & Investments */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Assets & Investments</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Investment Properties</p>
                    <p className="font-medium">{data_.q13_investment_properties ?? "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rental Income</p>
                    <p className="font-medium">
                      {data_.q14_rental_income
                        ? `$${Number(data_.q14_rental_income).toLocaleString()}`
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shares/Managed Funds</p>
                    <p className="font-medium">{data_.q15_shares === "yes" ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Home Office Details */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Home Office Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Floor Space</p>
                    <p className="font-medium">{data_.q16_total_floor_space || "Not provided"} sqm</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Business Floor Space</p>
                    <p className="font-medium">{data_.q17_business_floor_space || "Not provided"} sqm</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Business Use Percentage</p>
                    <p className="font-medium">{data_.q18_business_use_percentage || "Not provided"}%</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Information */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Additional Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Foreign Income</p>
                    <p className="font-medium">{data_.q19_foreign_income === "yes" ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CGT Events</p>
                    <p className="font-medium">{data_.q20_cgt_event === "yes" ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Private Health Insurance</p>
                    <p className="font-medium">{data_.q21_health_insurance === "yes" ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Superannuation Contributions</p>
                    <p className="font-medium">
                      {data_.q22_super_contributions
                        ? `$${Number(data_.q22_super_contributions).toLocaleString()}`
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Charitable Donations</p>
                    <p className="font-medium">
                      {data_.q23_charity_donations
                        ? `$${Number(data_.q23_charity_donations).toLocaleString()}`
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Agent Used Previously</p>
                    <p className="font-medium">{data_.q24_tax_agent === "yes" ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>

              {/* Comments */}
              {data_.q29_additional_comments && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">Additional Comments</h3>
                    <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                      {data_.q29_additional_comments}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Strategy Selector Section */}
          {hasStrategySelector && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <CardTitle>Strategy Selector Responses</CardTitle>
                </div>
                <CardDescription>Detailed business profile and asset information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Assets Summary */}
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Assets & Liabilities</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Assets</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${Number(data_.ss_total_assets || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Liabilities</p>
                      <p className="text-2xl font-bold text-red-700">
                        ${Number(data_.ss_total_liabilities || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Net Worth</p>
                      <p className="text-2xl font-bold text-blue-700">
                        $
                        {(
                          Number(data_.ss_total_assets || 0) - Number(data_.ss_total_liabilities || 0)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Business Profile - First 20 questions */}
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Business Profile (Questions 1-20)</h3>
                  <div className="space-y-3">
                    {Object.entries(data_)
                      .filter(
                        ([key]) => key.startsWith("ss_q") && Number.parseInt(key.split("_")[1].substring(1)) <= 20,
                      )
                      .sort((a, b) => {
                        const numA = Number.parseInt(a[0].split("_")[1].substring(1))
                        const numB = Number.parseInt(b[0].split("_")[1].substring(1))
                        return numA - numB
                      })
                      .map(([key, value]) => {
                        const questionNum = key.split("_")[1]
                        const questionText = key
                          .split("_")
                          .slice(2)
                          .join(" ")
                          .replace(/([A-Z])/g, " $1")
                          .trim()
                        return (
                          <div key={key} className="grid grid-cols-[1fr,auto] gap-4 py-2 border-b last:border-0">
                            <p className="text-sm capitalize">{questionText}</p>
                            <p className="font-medium text-right">
                              {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                            </p>
                          </div>
                        )
                      })}
                  </div>
                </div>

                <Separator />

                {/* Business Profile - Questions 21-40 */}
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Business Profile (Questions 21-40)</h3>
                  <div className="space-y-3">
                    {Object.entries(data_)
                      .filter(
                        ([key]) =>
                          key.startsWith("ss_q") &&
                          Number.parseInt(key.split("_")[1].substring(1)) > 20 &&
                          Number.parseInt(key.split("_")[1].substring(1)) <= 40,
                      )
                      .sort((a, b) => {
                        const numA = Number.parseInt(a[0].split("_")[1].substring(1))
                        const numB = Number.parseInt(b[0].split("_")[1].substring(1))
                        return numA - numB
                      })
                      .map(([key, value]) => {
                        const questionNum = key.split("_")[1]
                        const questionText = key
                          .split("_")
                          .slice(2)
                          .join(" ")
                          .replace(/([A-Z])/g, " $1")
                          .trim()
                        return (
                          <div key={key} className="grid grid-cols-[1fr,auto] gap-4 py-2 border-b last:border-0">
                            <p className="text-sm capitalize">{questionText}</p>
                            <p className="font-medium text-right">
                              {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                            </p>
                          </div>
                        )
                      })}
                  </div>
                </div>

                <Separator />

                {/* Business Profile - Questions 41-65 */}
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Business Profile (Questions 41-65)</h3>
                  <div className="space-y-3">
                    {Object.entries(data_)
                      .filter(
                        ([key]) =>
                          key.startsWith("ss_q") &&
                          Number.parseInt(key.split("_")[1].substring(1)) > 40 &&
                          Number.parseInt(key.split("_")[1].substring(1)) <= 65,
                      )
                      .sort((a, b) => {
                        const numA = Number.parseInt(a[0].split("_")[1].substring(1))
                        const numB = Number.parseInt(b[0].split("_")[1].substring(1))
                        return numA - numB
                      })
                      .map(([key, value]) => {
                        const questionNum = key.split("_")[1]
                        const questionText = key
                          .split("_")
                          .slice(2)
                          .join(" ")
                          .replace(/([A-Z])/g, " $1")
                          .trim()
                        return (
                          <div key={key} className="grid grid-cols-[1fr,auto] gap-4 py-2 border-b last:border-0">
                            <p className="text-sm capitalize">{questionText}</p>
                            <p className="font-medium text-right">
                              {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                            </p>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Data Card */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Data (JSON)</CardTitle>
              <CardDescription>Complete questionnaire data in JSON format</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">{JSON.stringify(data_, null, 2)}</pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

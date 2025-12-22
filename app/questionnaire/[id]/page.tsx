import { redirect, notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, Download, FileText, Sparkles } from "lucide-react"
import { DocumentUpload } from "@/components/document-upload"
import { DocumentList } from "@/components/document-list"

export default async function QuestionnaireDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) {
    redirect("/auth/login")
  }

  const { data: questionnaire, error } = await supabase
    .from("questionnaire_responses")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !questionnaire) {
    notFound()
  }

  // Check if user has access
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.user.id).single()

  const isTaxAgent = profile?.role === "tax_agent"
  const isOwner = questionnaire.user_id === user.user.id

  if (!isOwner && !isTaxAgent) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/questionnaire">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assessments
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{questionnaire.full_name || "Assessment Details"}</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Results Card */}
          {questionnaire.status === "completed" && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl">Optimisation Results</CardTitle>
                <CardDescription>
                  Based on your inputs, here are your home business wealth optimisation calculations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Recommended Deduction</p>
                  <p className="text-4xl font-bold text-primary">
                    ${questionnaire.total_deduction?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Using {questionnaire.scenario_type === "fixed_rate" ? "Fixed Rate" : "Actual Cost"} Method
                  </p>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Fixed Rate Method</p>
                    <p className="text-2xl font-semibold">
                      ${questionnaire.fixed_rate_deduction?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      $0.67 per hour × {questionnaire.office_hours_per_week} hours/week × 52 weeks
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Actual Cost Method</p>
                    <p className="text-2xl font-semibold">
                      ${questionnaire.actual_cost_deduction?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Based on {((questionnaire.office_size_sqm / questionnaire.home_size_sqm) * 100).toFixed(1)}% of
                      home used for office
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download ATO Document
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    View Detailed Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Upload Section */}
          <DocumentUpload assessmentId={id} />

          {/* Document List Section */}
          <DocumentList assessmentId={id} />

          {questionnaire.status === "completed" && (
            <Card className="border-purple-500/50 bg-purple-500/5">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      AI Strategy Analysis
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Generate a personalized DYH strategy by cross-examining your documents with our reference
                      materials (DYH book, ATO PBRs, and strategy selectors)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-background p-4 rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm">What this does:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✓ Analyzes all your uploaded documents</li>
                      <li>✓ Cross-references with DYH book and ATO Private Binding Rulings</li>
                      <li>✓ Recommends optimal deduction method (Fixed Rate vs Actual Cost)</li>
                      <li>✓ Performs detailed tax calculations</li>
                      <li>✓ Generates an interim report with next steps</li>
                    </ul>
                  </div>
                  <Button asChild size="lg" className="w-full">
                    <Link href={`/admin/analyze/${id}`}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Strategy & Report
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{questionnaire.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tax File Number</p>
                  <p className="font-medium">{questionnaire.tfn || "N/A"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{questionnaire.address || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Home Office Details */}
          <Card>
            <CardHeader>
              <CardTitle>Home Office Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Home Size</p>
                  <p className="font-medium">{questionnaire.home_size_sqm} sqm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Office Size</p>
                  <p className="font-medium">{questionnaire.office_size_sqm} sqm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hours per Week</p>
                  <p className="font-medium">{questionnaire.office_hours_per_week} hours</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Office Percentage</p>
                <p className="font-medium">
                  {((questionnaire.office_size_sqm / questionnaire.home_size_sqm) * 100).toFixed(2)}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Business Type</p>
                  <p className="font-medium">{questionnaire.business_type || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employment Status</p>
                  <p className="font-medium capitalize">
                    {questionnaire.employment_status?.replace("_", " ") || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Annual Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Internet</span>
                  <span className="font-medium">${questionnaire.internet_annual?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">${questionnaire.phone_annual?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Electricity</span>
                  <span className="font-medium">${questionnaire.electricity_annual?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Heating & Cooling</span>
                  <span className="font-medium">${questionnaire.heating_cooling_annual?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cleaning</span>
                  <span className="font-medium">${questionnaire.cleaning_annual?.toFixed(2) || "0.00"}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total Annual Expenses</span>
                  <span>
                    $
                    {(
                      (questionnaire.internet_annual || 0) +
                      (questionnaire.phone_annual || 0) +
                      (questionnaire.electricity_annual || 0) +
                      (questionnaire.heating_cooling_annual || 0) +
                      (questionnaire.cleaning_annual || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

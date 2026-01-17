import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart3, Download, DollarSign } from "lucide-react"

export default async function ReportsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get all reports
  const { data: reports } = await supabase
    .from("reports")
    .select("*, questionnaires(*)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <p className="text-muted-foreground">View your tax deduction reports and savings</p>
      </div>

      {/* Reports List */}
      {reports && reports.length > 0 ? (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Report {report.id.slice(0, 8)}</CardTitle>
                      <CardDescription>Generated {new Date(report.created_at).toLocaleDateString()}</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Home Office</p>
                    <p className="text-xl font-bold">${report.home_office_deduction?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Vehicle</p>
                    <p className="text-xl font-bold">${report.vehicle_deduction?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Equipment</p>
                    <p className="text-xl font-bold">${report.equipment_deduction?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-primary mb-1 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Total Deductions
                    </p>
                    <p className="text-xl font-bold text-primary">${report.total_deductions?.toFixed(2) || "0.00"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Tax Saving</p>
                    <p className="text-2xl font-bold text-green-500">
                      ${report.estimated_tax_saving?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/reports/${report.id}`}>View Details</Link>
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
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No reports yet</h3>
            <p className="text-muted-foreground mb-6">Complete a questionnaire to generate your first report</p>
            <Button asChild>
              <Link href="/dashboard/questionnaires/new">Create Questionnaire</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

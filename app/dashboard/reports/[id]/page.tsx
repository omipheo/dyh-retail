import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Download, Home, Car, Laptop, TrendingUp, FileText } from "lucide-react"

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get report with questionnaire data
  const { data: report, error } = await supabase
    .from("reports")
    .select("*, questionnaires(*)")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single()

  if (error || !report) {
    notFound()
  }

  const breakdown = report.report_data?.homeOfficeBreakdown || { occupancyExpenses: 0, runningExpenses: 0 }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/reports">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tax Deduction Report</h1>
            <p className="text-muted-foreground">Generated {new Date(report.created_at).toLocaleDateString()}</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="mb-8 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Total Annual Deductions
          </CardTitle>
          <CardDescription>Your total claimable tax deductions for the financial year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-4xl font-bold text-primary mb-2">${report.total_deductions?.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Deductions</p>
            </div>
            <div className="md:text-right">
              <p className="text-4xl font-bold text-green-500 mb-2">${report.estimated_tax_saving?.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Estimated Tax Saving (@ 32.5%)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deduction Breakdown */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Home Office</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-1">${report.home_office_deduction?.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Annual Deduction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-1">${report.vehicle_deduction?.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Annual Deduction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Laptop className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-1">${report.equipment_deduction?.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Annual Deduction</p>
          </CardContent>
        </Card>
      </div>

      {/* Home Office Detail */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Home Office Deduction Breakdown
          </CardTitle>
          <CardDescription>Detailed calculation of your home office expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Occupancy Expenses</p>
                <p className="text-sm text-muted-foreground">Mortgage interest, rates, insurance</p>
              </div>
              <p className="text-xl font-bold">${breakdown.occupancyExpenses.toFixed(2)}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Running Expenses</p>
                <p className="text-sm text-muted-foreground">
                  Electricity, gas, water, internet, phone, cleaning, maintenance
                </p>
              </div>
              <p className="text-xl font-bold">${breakdown.runningExpenses.toFixed(2)}</p>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="font-bold">Total Home Office Deduction</p>
                <p className="text-2xl font-bold text-primary">${report.home_office_deduction?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm font-medium mb-2 text-blue-500">Office Area Calculation</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Office Area</p>
                <p className="font-medium">{report.questionnaires.office_area}m²</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Home Area</p>
                <p className="font-medium">{report.questionnaires.total_floor_area}m²</p>
              </div>
              <div>
                <p className="text-muted-foreground">Office Percentage</p>
                <p className="font-medium">{report.questionnaires.office_percentage?.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Hours Per Week</p>
                <p className="font-medium">{report.questionnaires.hours_per_week}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Detail */}
      {report.questionnaires.has_vehicle && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Vehicle Deduction Detail
            </CardTitle>
            <CardDescription>Cents per kilometer method (ATO rate: $0.88/km)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Vehicle Type</p>
                <p className="font-medium capitalize">{report.questionnaires.vehicle_type}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Business Kilometers</p>
                <p className="font-medium">{report.questionnaires.business_kms?.toFixed(0)} km</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Business Percentage</p>
                <p className="font-medium">{report.questionnaires.business_percentage?.toFixed(2)}%</p>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm font-medium mb-2 text-yellow-700 dark:text-yellow-500">ATO Cents Per KM Method</p>
              <p className="text-sm text-muted-foreground">
                Maximum 5,000 business kilometers can be claimed at $0.88 per kilometer. For higher kilometers, consider
                the logbook method.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment Detail */}
      {report.questionnaires.equipment_purchases &&
        Array.isArray(report.questionnaires.equipment_purchases) &&
        report.questionnaires.equipment_purchases.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Laptop className="w-5 h-5" />
                Equipment Deduction Detail
              </CardTitle>
              <CardDescription>Instant asset write-off for items under $20,000</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {report.questionnaires.equipment_purchases.map(
                  (equipment: { item: string; cost: string; date: string }, index: number) => {
                    const cost = Number.parseFloat(equipment.cost)
                    const isEligible = cost <= 20000
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          isEligible ? "bg-green-500/10 border border-green-500/20" : "bg-muted/50"
                        }`}
                      >
                        <div>
                          <p className="font-medium">{equipment.item}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(equipment.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${cost.toFixed(2)}</p>
                          {isEligible ? (
                            <p className="text-xs text-green-500">Fully deductible</p>
                          ) : (
                            <p className="text-xs text-yellow-500">Depreciation applies</p>
                          )}
                        </div>
                      </div>
                    )
                  },
                )}
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm font-medium mb-2 text-blue-500">Instant Asset Write-Off</p>
                <p className="text-sm text-muted-foreground">
                  Business equipment purchases under $20,000 can be immediately deducted in the year of purchase.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Disclaimer */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-yellow-500" />
            Important Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed">
          <p className="mb-2">
            This report provides estimates based on the information you provided. These calculations follow current ATO
            guidelines and rates for the 2024-25 financial year.
          </p>
          <p>
            Please consult with a registered tax agent or accountant to ensure accuracy and compliance with your
            specific circumstances. Keep detailed records and receipts to support your claims.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2, ArrowLeft, FileText } from "lucide-react"

export default async function QuestionnairePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get questionnaire
  const { data: questionnaire, error } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single()

  if (error || !questionnaire) {
    notFound()
  }

  // Get associated report
  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("questionnaire_id", id)
    .eq("user_id", user!.id)
    .single()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/questionnaires">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Questionnaires
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Questionnaire Details</h1>
        <p className="text-muted-foreground">Review your submitted information</p>
      </div>

      {/* Status Banner */}
      <Card className="mb-6 border-green-500 bg-green-500/5">
        <CardContent className="flex items-center gap-3 p-4">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
          <div>
            <p className="font-medium text-green-500">Questionnaire Completed</p>
            <p className="text-sm text-muted-foreground">
              Submitted on {new Date(questionnaire.completed_at || questionnaire.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Home Office Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Home Office Details</CardTitle>
          <CardDescription>Your home office information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Floor Area</p>
              <p className="font-medium">{questionnaire.total_floor_area}m²</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Office Area</p>
              <p className="font-medium">{questionnaire.office_area}m²</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Office Percentage</p>
              <p className="font-medium">{questionnaire.office_percentage?.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Hours Per Week</p>
              <p className="font-medium">{questionnaire.hours_per_week}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>Your property information and expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Property Type</p>
              <p className="font-medium capitalize">{questionnaire.property_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ownership</p>
              <p className="font-medium">{questionnaire.is_owner_occupied ? "Owner Occupied" : "Renting"}</p>
            </div>
            {questionnaire.is_owner_occupied ? (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mortgage Interest</p>
                <p className="font-medium">${questionnaire.annual_mortgage_interest?.toFixed(2)}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Annual Rent</p>
                <p className="font-medium">${questionnaire.annual_rent?.toFixed(2)}</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-medium mb-4">Annual Expenses</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Property Insurance</p>
                <p className="font-medium">${questionnaire.annual_property_insurance?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Council Rates</p>
                <p className="font-medium">${questionnaire.annual_council_rates?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Electricity</p>
                <p className="font-medium">${questionnaire.annual_electricity?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gas</p>
                <p className="font-medium">${questionnaire.annual_gas?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Water</p>
                <p className="font-medium">${questionnaire.annual_water?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Internet</p>
                <p className="font-medium">${questionnaire.annual_internet?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">${questionnaire.annual_phone?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cleaning</p>
                <p className="font-medium">${questionnaire.annual_cleaning?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Maintenance</p>
                <p className="font-medium">${questionnaire.annual_maintenance?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Details */}
      {questionnaire.has_vehicle && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
            <CardDescription>Your business vehicle information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Vehicle Type</p>
                <p className="font-medium capitalize">{questionnaire.vehicle_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Annual Kilometers</p>
                <p className="font-medium">{questionnaire.annual_vehicle_kms?.toFixed(0)} km</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Business Kilometers</p>
                <p className="font-medium">{questionnaire.business_kms?.toFixed(0)} km</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Business Percentage</p>
                <p className="font-medium">{questionnaire.business_percentage?.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment Purchases */}
      {questionnaire.equipment_purchases &&
        Array.isArray(questionnaire.equipment_purchases) &&
        questionnaire.equipment_purchases.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Equipment Purchases</CardTitle>
              <CardDescription>Business equipment purchased this year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {questionnaire.equipment_purchases.map(
                  (equipment: { item: string; cost: string; date: string }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{equipment.item}</p>
                        <p className="text-sm text-muted-foreground">{new Date(equipment.date).toLocaleDateString()}</p>
                      </div>
                      <p className="font-bold">${Number.parseFloat(equipment.cost).toFixed(2)}</p>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Report Link */}
      {report && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Report Available
            </CardTitle>
            <CardDescription>View your calculated tax deduction report</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/dashboard/reports/${report.id}`}>View Report</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

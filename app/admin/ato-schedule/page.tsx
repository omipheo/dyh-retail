import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Bell, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"

export default async function ATOSchedulePage() {
  const supabase = await createClient()

  // Get all due dates without client info (client_id is just a UUID reference)
  const { data: dueDates } = await supabase.from("ato_due_dates").select("*").order("due_date", { ascending: true })

  // Get reminder statistics
  const { count: totalReminders } = await supabase
    .from("ato_reminders")
    .select("*", { count: "exact", head: true })
    .eq("status", "scheduled")

  const { count: sentReminders } = await supabase
    .from("ato_reminders")
    .select("*", { count: "exact", head: true })
    .eq("status", "sent")

  const { data: activityStatements } = await supabase
    .from("ato_activity_statements")
    .select("*")
    .order("due_date", { ascending: true })

  const { count: totalActivityReminders } = await supabase
    .from("ato_activity_reminders")
    .select("*", { count: "exact", head: true })
    .eq("status", "scheduled")

  const { data: registeredAgentsLodgments } = await supabase
    .from("ato_registered_agents_lodgments")
    .select("*")
    .order("original_due_date", { ascending: true })

  const { count: totalRegisteredAgentsReminders } = await supabase
    .from("ato_registered_agents_reminders")
    .select("*", { count: "exact", head: true })
    .eq("status", "scheduled")

  const { data: fbtReturns } = await supabase.from("ato_fbt_returns").select("*").order("due_date", { ascending: true })

  const { count: totalFbtReminders } = await supabase
    .from("ato_fbt_reminders")
    .select("*", { count: "exact", head: true })
    .eq("status", "scheduled")

  const { data: superFundLodgments } = await supabase
    .from("ato_super_fund_lodgments")
    .select("*")
    .order("due_date", { ascending: true })

  const { count: totalSuperFundReminders } = await supabase
    .from("ato_super_fund_reminders")
    .select("*", { count: "exact", head: true })
    .eq("status", "scheduled")

  // Calculate statistics
  const upcomingCount = dueDates?.filter((d) => d.status === "upcoming").length || 0
  const inProgressCount = dueDates?.filter((d) => d.status === "in_progress").length || 0
  const overdueCount = dueDates?.filter((d) => d.status === "overdue").length || 0
  const lodgedCount = dueDates?.filter((d) => d.status === "lodged").length || 0
  const companiesCount = dueDates?.filter((d) => d.client_type === "company").length || 0

  const activityUpcoming = activityStatements?.filter((s) => s.status === "upcoming").length || 0
  const activityInProgress = activityStatements?.filter((s) => s.status === "in_progress").length || 0
  const activityLodged = activityStatements?.filter((s) => s.status === "lodged").length || 0

  const registeredAgentsUpcoming = registeredAgentsLodgments?.filter((s) => s.status === "upcoming").length || 0
  const registeredAgentsInProgress = registeredAgentsLodgments?.filter((s) => s.status === "in_progress").length || 0
  const registeredAgentsLodged = registeredAgentsLodgments?.filter((s) => s.status === "lodged").length || 0

  const fbtUpcoming = fbtReturns?.filter((f) => f.status === "upcoming").length || 0
  const fbtInProgress = fbtReturns?.filter((f) => f.status === "in_progress").length || 0
  const fbtLodged = fbtReturns?.filter((f) => f.status === "lodged").length || 0

  const superFundUpcoming = superFundLodgments?.filter((s) => s.status === "upcoming").length || 0
  const superFundInProgress = superFundLodgments?.filter((s) => s.status === "in_progress").length || 0
  const superFundLodged = superFundLodgments?.filter((s) => s.status === "lodged").length || 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "secondary"
      case "reminded":
        return "default"
      case "in_progress":
        return "default"
      case "lodged":
        return "outline"
      case "overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getUrgencyBadge = (dueDate: string) => {
    const daysUntil = differenceInDays(new Date(dueDate), new Date())

    if (daysUntil < 0) {
      return (
        <Badge variant="destructive" className="ml-2">
          Overdue
        </Badge>
      )
    } else if (daysUntil <= 30) {
      return (
        <Badge variant="destructive" className="ml-2">
          Due in {daysUntil} days
        </Badge>
      )
    } else if (daysUntil <= 60) {
      return (
        <Badge variant="default" className="ml-2">
          Due in {daysUntil} days
        </Badge>
      )
    } else if (daysUntil <= 180) {
      return (
        <Badge variant="secondary" className="ml-2">
          Due in {Math.floor(daysUntil / 30)} months
        </Badge>
      )
    }
    return null
  }

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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">ATO Due Dates Schedule</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Tax Returns & Activity Statements - 2025-2026 Financial Year
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/ato-schedule/reminders">
                  <Bell className="h-4 w-4 mr-2" />
                  View Reminders
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Total Due Dates</CardDescription>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-3xl">{dueDates?.length || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Upcoming</CardDescription>
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-3xl text-blue-600">{upcomingCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>In Progress</CardDescription>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <CardTitle className="text-3xl text-yellow-600">{inProgressCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Overdue</CardDescription>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <CardTitle className="text-3xl text-red-600">{overdueCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Lodged</CardDescription>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-3xl text-green-600">{lodgedCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Companies</CardDescription>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-3xl text-green-600">{companiesCount}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Reminder Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-900">Automated Reminder System</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-blue-800">
                <p className="font-medium">Reminders are sent automatically:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold mb-1">Tax Returns (Individuals & Trusts):</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        <strong>6 months before</strong> the due date
                      </li>
                      <li>
                        <strong>Every 30 days thereafter</strong> if work not started
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">ASIC Registered Agents Lodgments:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        <strong>30 days before</strong> the due date
                      </li>
                      <li>
                        <strong>Every 7 days thereafter</strong> if work not started
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 flex gap-4">
                  <div>
                    <span className="font-semibold">
                      {(totalReminders || 0) +
                        (totalRegisteredAgentsReminders || 0) +
                        (totalFbtReminders || 0) +
                        (totalSuperFundReminders || 0)}
                    </span>{" "}
                    scheduled reminders
                  </div>
                  <div>
                    <span className="font-semibold">{sentReminders || 0}</span> reminders sent
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Individuals, Trusts, Companies, ASIC Registered Agents, FBT Returns, and Super Funds */}
          <Tabs defaultValue="individuals" className="space-y-4">
            <TabsList>
              <TabsTrigger value="individuals">
                Individuals ({dueDates?.filter((d) => d.client_type === "individual").length || 0})
              </TabsTrigger>
              <TabsTrigger value="trusts">
                Trusts ({dueDates?.filter((d) => d.client_type === "trust").length || 0})
              </TabsTrigger>
              <TabsTrigger value="companies">Companies ({companiesCount})</TabsTrigger>
              <TabsTrigger value="registered-agents">
                ASIC Registered Agents ({registeredAgentsLodgments?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="fbt">FBT Returns ({fbtReturns?.length || 0})</TabsTrigger>
              <TabsTrigger value="super-funds">Super Funds ({superFundLodgments?.length || 0})</TabsTrigger>
              <TabsTrigger value="all">All ({dueDates?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="individuals" className="space-y-4">
              {dueDates?.filter((d) => d.client_type === "individual").length ? (
                dueDates
                  .filter((d) => d.client_type === "individual")
                  .map((dueDate) => {
                    return (
                      <Card key={dueDate.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">Client ID: {dueDate.client_id}</CardTitle>
                                <Badge variant={getStatusColor(dueDate.status)}>{dueDate.status}</Badge>
                                {getUrgencyBadge(dueDate.due_date)}
                              </div>
                              <CardDescription className="space-y-1">
                                <div className="font-medium text-foreground">{dueDate.lodgment_category}</div>
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-4 w-4" />
                                Due: {format(new Date(dueDate.due_date), "PPP")}
                              </div>
                              {dueDate.work_started_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Started: {format(new Date(dueDate.work_started_at), "PP")}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                              {dueDate.notes && <p>{dueDate.notes}</p>}
                            </div>
                            <div className="flex gap-2">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/ato-schedule/${dueDate.id}`}>View Details</Link>
                              </Button>
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/clients/${dueDate.client_id}`}>Client Profile</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <p className="text-muted-foreground text-lg">No individual client due dates found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="trusts" className="space-y-4">
              {dueDates?.filter((d) => d.client_type === "trust").length ? (
                dueDates
                  .filter((d) => d.client_type === "trust")
                  .map((dueDate) => {
                    return (
                      <Card key={dueDate.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">Client ID: {dueDate.client_id}</CardTitle>
                                <Badge variant={getStatusColor(dueDate.status)}>{dueDate.status}</Badge>
                                {getUrgencyBadge(dueDate.due_date)}
                              </div>
                              <CardDescription className="space-y-1">
                                <div className="font-medium text-foreground">{dueDate.lodgment_category}</div>
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-4 w-4" />
                                Due: {format(new Date(dueDate.due_date), "PPP")}
                              </div>
                              {dueDate.work_started_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Started: {format(new Date(dueDate.work_started_at), "PP")}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                              {dueDate.notes && <p>{dueDate.notes}</p>}
                            </div>
                            <div className="flex gap-2">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/ato-schedule/${dueDate.id}`}>View Details</Link>
                              </Button>
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/clients/${dueDate.client_id}`}>Client Profile</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <p className="text-muted-foreground text-lg">No trust client due dates found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="companies" className="space-y-4">
              {dueDates?.filter((d) => d.client_type === "company").length ? (
                dueDates
                  .filter((d) => d.client_type === "company")
                  .map((dueDate) => {
                    return (
                      <Card key={dueDate.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">Client ID: {dueDate.client_id}</CardTitle>
                                <Badge variant={getStatusColor(dueDate.status)}>{dueDate.status}</Badge>
                                {getUrgencyBadge(dueDate.due_date)}
                              </div>
                              <CardDescription className="space-y-1">
                                <div className="font-medium text-foreground">{dueDate.lodgment_category}</div>
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-4 w-4" />
                                Due: {format(new Date(dueDate.due_date), "PPP")}
                              </div>
                              {dueDate.work_started_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Started: {format(new Date(dueDate.work_started_at), "PP")}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                              {dueDate.notes && <p>{dueDate.notes}</p>}
                            </div>
                            <div className="flex gap-2">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/ato-schedule/${dueDate.id}`}>View Details</Link>
                              </Button>
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/clients/${dueDate.client_id}`}>Client Profile</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <p className="text-muted-foreground text-lg">No company client due dates found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Run the seed_ato_30_june_balancers() function to populate company due dates
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              {activityStatements && activityStatements.length > 0 ? (
                <>
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Activity Statement Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{activityUpcoming}</p>
                          <p className="text-sm text-muted-foreground">Upcoming</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-600">{activityInProgress}</p>
                          <p className="text-sm text-muted-foreground">In Progress</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{activityLodged}</p>
                          <p className="text-sm text-muted-foreground">Lodged</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{activityStatements.length}</p>
                          <p className="text-sm text-muted-foreground">Total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {activityStatements.map((statement) => {
                    const client = statement.profiles as any
                    const statementTypeLabels: Record<string, string> = {
                      monthly: "Monthly BAS",
                      quarterly_payg: "Quarterly PAYG Instalment",
                      quarterly_electronic: "Quarterly (Electronic)",
                      quarterly_standard: "Quarterly (Standard)",
                    }
                    return (
                      <Card key={statement.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">Client ID: {statement.client_id}</CardTitle>
                                <Badge variant={getStatusColor(statement.status)}>{statement.status}</Badge>
                                {getUrgencyBadge(statement.due_date)}
                              </div>
                              <CardDescription className="space-y-1">
                                <div className="font-medium text-foreground">
                                  {statementTypeLabels[statement.statement_type]} - {statement.period}
                                </div>
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-4 w-4" />
                                Due: {format(new Date(statement.due_date), "PPP")}
                              </div>
                              {statement.work_started_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Started: {format(new Date(statement.work_started_at), "PP")}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                              {statement.notes && <p>{statement.notes}</p>}
                            </div>
                            <div className="flex gap-2">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/clients/${statement.client_id}`}>Client Profile</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <p className="text-muted-foreground text-lg">No activity statements found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Run the seed_ato_activity_statements() function to populate activity statement due dates
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="registered-agents" className="space-y-4">
              {registeredAgentsLodgments && registeredAgentsLodgments.length > 0 ? (
                registeredAgentsLodgments.map((lodgment) => {
                  const client = lodgment.profiles as any
                  const effectiveDueDate = lodgment.program_due_date || lodgment.original_due_date
                  return (
                    <Card key={lodgment.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">Client ID: {lodgment.client_id}</CardTitle>
                              <Badge variant={getStatusColor(lodgment.status)}>{lodgment.status}</Badge>
                              {getUrgencyBadge(effectiveDueDate)}
                              {lodgment.program_due_date && (
                                <Badge variant="outline" className="bg-blue-50">
                                  Lodgment Program
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="space-y-1">
                              <div className="font-medium text-foreground">{lodgment.quarter}</div>
                              <div className="text-xs">
                                Original: {format(new Date(lodgment.original_due_date), "PPP")}
                                {lodgment.program_due_date && (
                                  <span className="ml-2 text-blue-600">
                                    Program: {format(new Date(lodgment.program_due_date), "PPP")}
                                  </span>
                                )}
                                {!lodgment.program_due_date && lodgment.quarter === "Q2 2025-26" && (
                                  <span className="ml-2 text-muted-foreground">(No program due date)</span>
                                )}
                              </div>
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Calendar className="h-4 w-4" />
                              Due: {format(new Date(effectiveDueDate), "PPP")}
                            </div>
                            {lodgment.work_started_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Started: {format(new Date(lodgment.work_started_at), "PP")}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            {lodgment.notes && <p>{lodgment.notes}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/clients/${lodgment.client_id}`}>Client Profile</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <p className="text-muted-foreground text-lg">No registered agent lodgments found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="fbt" className="space-y-4">
              {fbtReturns && fbtReturns.length > 0 ? (
                <>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="text-sm text-blue-900">
                        <p className="font-semibold mb-2">FBT Return Lodgment Dates (2026):</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>
                            <strong>25 June 2026</strong> - Electronic lodgment via practitioner service
                          </li>
                          <li>
                            <strong>21 May 2026</strong> - Paper lodgment
                          </li>
                        </ul>
                        <p className="mt-3 text-xs">
                          Note: To ensure clients are covered by the lodgment program for their 2026 FBT return, you
                          must be appointed as the tax agent and add them to your FBT client list by 21 May.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 md:grid-cols-3 mb-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>Upcoming</CardDescription>
                        <CardTitle className="text-2xl text-blue-600">{fbtUpcoming}</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>In Progress</CardDescription>
                        <CardTitle className="text-2xl text-yellow-600">{fbtInProgress}</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>Lodged</CardDescription>
                        <CardTitle className="text-2xl text-green-600">{fbtLodged}</CardTitle>
                      </CardHeader>
                    </Card>
                  </div>

                  {fbtReturns.map((fbt) => {
                    const client = fbt.profiles as any
                    return (
                      <Card key={fbt.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">Client ID: {fbt.client_id}</CardTitle>
                                <Badge variant={getStatusColor(fbt.status)}>{fbt.status}</Badge>
                                <Badge variant="outline" className="capitalize">
                                  {fbt.lodgment_method}
                                </Badge>
                                {getUrgencyBadge(fbt.due_date)}
                              </div>
                              <CardDescription className="space-y-1">
                                <div className="font-medium text-foreground">
                                  FBT Return - {fbt.lodgment_method === "electronic" ? "Electronic" : "Paper"} Lodgment
                                </div>
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-4 w-4" />
                                Due: {format(new Date(fbt.due_date), "PPP")}
                              </div>
                              {fbt.work_started_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Started: {format(new Date(fbt.work_started_at), "PP")}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">{fbt.notes && <p>{fbt.notes}</p>}</div>
                            <div className="flex gap-2">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/clients/${fbt.client_id}`}>Client Profile</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <p className="text-muted-foreground text-lg">No FBT returns found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="super-funds" className="space-y-4">
              {superFundLodgments && superFundLodgments.length > 0 ? (
                superFundLodgments.map((lodgment) => {
                  const client = lodgment.profiles as any
                  return (
                    <Card key={lodgment.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">Client ID: {lodgment.client_id}</CardTitle>
                              <Badge variant="outline" className="capitalize">
                                {lodgment.client_type}
                              </Badge>
                              <Badge variant={getStatusColor(lodgment.status)}>{lodgment.status}</Badge>
                              {getUrgencyBadge(lodgment.due_date)}
                            </div>
                            <CardDescription className="space-y-1">
                              <div className="font-medium text-foreground">{lodgment.lodgment_type}</div>
                              <div className="text-xs mt-2">{lodgment.description}</div>
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Calendar className="h-4 w-4" />
                              Due: {format(new Date(lodgment.due_date), "PPP")}
                            </div>
                            {lodgment.work_started_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Started: {format(new Date(lodgment.work_started_at), "PP")}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            {lodgment.notes && <p>{lodgment.notes}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/clients/${lodgment.client_id}`}>Client Profile</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <p className="text-muted-foreground text-lg">No super fund lodgments found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Super fund lodgments will appear here once clients are assigned
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {dueDates && dueDates.length > 0 ? (
                dueDates.map((dueDate) => {
                  const client = dueDate.profiles as any
                  return (
                    <Card key={dueDate.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">Client ID: {dueDate.client_id}</CardTitle>
                              <Badge variant="outline" className="capitalize">
                                {dueDate.client_type}
                              </Badge>
                              <Badge variant={getStatusColor(dueDate.status)}>{dueDate.status}</Badge>
                              {getUrgencyBadge(dueDate.due_date)}
                            </div>
                            <CardDescription className="space-y-1">
                              <div className="font-medium text-foreground">{dueDate.lodgment_category}</div>
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Calendar className="h-4 w-4" />
                              Due: {format(new Date(dueDate.due_date), "PPP")}
                            </div>
                            {dueDate.work_started_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Started: {format(new Date(dueDate.work_started_at), "PP")}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">{dueDate.notes && <p>{dueDate.notes}</p>}</div>
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/ato-schedule/${dueDate.id}`}>View Details</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/clients/${dueDate.client_id}`}>Client Profile</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <p className="text-muted-foreground text-lg">No due dates found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Run the seed function to populate ATO due dates for all clients
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

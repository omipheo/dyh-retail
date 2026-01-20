import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bell, Calendar, Send, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/server"

export default async function RemindersPage() {
  const supabase = await createClient()

  // Get all reminders with due date and client info
  const { data: reminders } = await supabase
    .from("ato_reminders")
    .select(
      `
      *,
      ato_due_dates!inner(lodgment_category, due_date, client_type, status),
      profiles!ato_reminders_client_id_fkey(full_name, email)
    `,
    )
    .order("scheduled_for", { ascending: true })

  const scheduledCount = reminders?.filter((r) => r.status === "scheduled").length || 0
  const sentCount = reminders?.filter((r) => r.status === "sent").length || 0
  const cancelledCount = reminders?.filter((r) => r.status === "cancelled").length || 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin/ato-schedule">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to ATO Schedule
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">ATO Reminder History</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all automated client engagement reminders</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Total Reminders</CardDescription>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-3xl">{reminders?.length || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Scheduled</CardDescription>
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-3xl text-blue-600">{scheduledCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Sent</CardDescription>
                  <Send className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-3xl text-green-600">{sentCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Cancelled</CardDescription>
                  <Bell className="h-4 w-4 text-gray-600" />
                </div>
                <CardTitle className="text-3xl text-gray-600">{cancelledCount}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Reminders List */}
          {reminders && reminders.length > 0 ? (
            <div className="space-y-4">
              {reminders.map((reminder) => {
                const client = reminder.profiles as any
                const dueDate = reminder.ato_due_dates as any

                return (
                  <Card key={reminder.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{client?.full_name || "Unknown Client"}</CardTitle>
                            <Badge
                              variant={
                                reminder.status === "sent"
                                  ? "default"
                                  : reminder.status === "scheduled"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {reminder.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {reminder.reminder_type.replace("_", " ")}
                            </Badge>
                          </div>
                          <CardDescription className="space-y-1">
                            <div>{client?.email}</div>
                            <div className="font-medium text-foreground">
                              {dueDate?.lodgment_category} ({dueDate?.client_type})
                            </div>
                          </CardDescription>
                        </div>
                        <div className="text-right text-sm space-y-2">
                          <div className="flex items-center gap-2 justify-end">
                            <Calendar className="h-4 w-4" />
                            <span>Scheduled: {format(new Date(reminder.scheduled_for), "PP")}</span>
                          </div>
                          {reminder.sent_at && (
                            <div className="flex items-center gap-2 justify-end text-green-600">
                              <Send className="h-4 w-4" />
                              <span>Sent: {format(new Date(reminder.sent_at), "PP")}</span>
                            </div>
                          )}
                          <div className="text-muted-foreground">
                            Due Date: {format(new Date(dueDate.due_date), "PP")}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    {reminder.message_id && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Message sent to client</p>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No reminders found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Reminders will be generated automatically based on due dates
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

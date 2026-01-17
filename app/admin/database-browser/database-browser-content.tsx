"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Database, Table, Eye } from "lucide-react"
import Link from "next/link"

const TABLES = [
  { name: "ato_activity_reminders", description: "Activity statement reminders" },
  { name: "ato_activity_statements", description: "BAS/IAS activity statements" },
  { name: "ato_due_dates", description: "ATO lodgment due dates" },
  { name: "ato_fbt_reminders", description: "FBT return reminders" },
  { name: "ato_fbt_returns", description: "FBT return lodgments" },
  { name: "ato_registered_agents_lodgments", description: "ASIC registered agent lodgments" },
  { name: "ato_registered_agents_reminders", description: "ASIC agent reminders" },
  { name: "ato_reminders", description: "ATO lodgment reminders" },
  { name: "ato_super_fund_lodgments", description: "SMSF lodgments" },
  { name: "ato_super_fund_reminders", description: "SMSF lodgment reminders" },
  { name: "client_assessments", description: "Client assessment submissions" },
  { name: "client_followups", description: "Follow-up tasks and reminders" },
  { name: "client_group_members", description: "Client group memberships" },
  { name: "client_groups", description: "Client group definitions" },
  { name: "client_notes", description: "Client notes and history" },
  { name: "complaints", description: "Complaint records" },
  { name: "documents", description: "Uploaded documents" },
  { name: "dyh_explorer_prospects", description: "DYH Explorer prospects" },
  { name: "dyh_practice_clients", description: "Practice client records" },
  { name: "followup_documents", description: "Follow-up related documents" },
  { name: "form_sessions", description: "Form session state" },
  { name: "message_threads", description: "Message conversation threads" },
  { name: "messages", description: "Client messages" },
  { name: "profiles", description: "User profiles" },
  { name: "purchases", description: "Product purchases" },
  { name: "questionnaire_responses", description: "Questionnaire response data" },
  { name: "questionnaires", description: "Tax deduction questionnaires" },
  { name: "reports", description: "Generated tax reports" },
  { name: "subscriptions", description: "Subscription records" },
  { name: "todos", description: "To-do items and tasks" },
]

export function DatabaseBrowserContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { value: "all", label: "All Tables" },
    { value: "clients", label: "Clients & Prospects" },
    { value: "ato", label: "ATO Compliance" },
    { value: "communication", label: "Communication" },
    { value: "admin", label: "Administration" },
  ]

  const filteredTables = TABLES.filter((table) => {
    const matchesSearch =
      table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.description.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (selectedCategory === "all") return true
    if (selectedCategory === "clients") return table.name.includes("client") || table.name.includes("prospect")
    if (selectedCategory === "ato") return table.name.includes("ato_")
    if (selectedCategory === "communication") return table.name.includes("message") || table.name.includes("followup")
    if (selectedCategory === "admin")
      return ["profiles", "subscriptions", "purchases", "documents", "form_sessions"].includes(table.name)

    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Tables ({TABLES.length})
        </CardTitle>
        <CardDescription>Browse and search {TABLES.length} database tables</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map((table) => (
            <Link key={table.name} href={`/admin/database-browser/${table.name}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Table className="h-4 w-4" />
                    {table.name}
                  </CardTitle>
                  <CardDescription className="text-sm">{table.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Records
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-12">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tables found matching your search</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

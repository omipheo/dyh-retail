"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Download, Eye, FileText, Calendar } from "lucide-react"
import Link from "next/link"

interface SubmissionsContentProps {
  assessments: any[]
}

export function SubmissionsContent({ assessments }: SubmissionsContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Calculate statistics
  const totalSubmissions = assessments.length
  const submittedCount = assessments.filter((a) => a.status === "submitted").length
  const draftCount = assessments.filter((a) => a.status === "draft").length
  const archivedCount = assessments.filter((a) => a.status === "archived").length

  // Filter and sort assessments
  let filteredAssessments = assessments.filter((assessment) => {
    const profile = assessment.profiles as any
    const matchesSearch =
      searchQuery === "" ||
      profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.client_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || assessment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort assessments
  filteredAssessments = [...filteredAssessments].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else if (sortBy === "client") {
      const aProfile = a.profiles as any
      const bProfile = b.profiles as any
      const aName = aProfile?.full_name || a.client_name || ""
      const bName = bProfile?.full_name || b.client_name || ""
      return aName.localeCompare(bName)
    }
    return 0
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Submissions</CardDescription>
              <CardTitle className="text-3xl">{totalSubmissions}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Submitted</CardDescription>
              <CardTitle className="text-3xl text-green-600">{submittedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Drafts</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{draftCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Archived</CardDescription>
              <CardTitle className="text-3xl text-gray-600">{archivedCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client name or email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="client">Client Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        {filteredAssessments.length > 0 ? (
          <div className="space-y-4">
            {filteredAssessments.map((assessment) => {
              const profile = assessment.profiles as any
              const data = assessment.questionnaire_data as any

              // Extract key information from questionnaire_data
              const maritalStatus = data.q1_marital_status || "N/A"
              const annualIncome = data.q2_annual_income || "N/A"
              const hasStrategySelector = data.ss_q1_plant_equipment !== undefined

              return (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">
                            {profile?.full_name || assessment.client_name || "Unknown Client"}
                          </CardTitle>
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
                              Strategy Selector
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-4">
                          <span>{profile?.email || "No email"}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(assessment.created_at).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Updated: {new Date(assessment.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1 text-sm">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                          <div>
                            <span className="text-muted-foreground">Marital Status:</span>
                            <span className="ml-2 capitalize">{maritalStatus}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Annual Income:</span>
                            <span className="ml-2">
                              {annualIncome !== "N/A" ? `$${Number(annualIncome).toLocaleString()}` : "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Floor Space:</span>
                            <span className="ml-2">{data.q16_total_floor_space || "N/A"} sqm</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Business Space:</span>
                            <span className="ml-2">{data.q17_business_floor_space || "N/A"} sqm</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/submissions/${assessment.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/api/admin/submissions/${assessment.id}/export`}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                {searchQuery || statusFilter !== "all" ? "No matching submissions found" : "No submissions found"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Client submissions will appear here once they complete the questionnaires"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

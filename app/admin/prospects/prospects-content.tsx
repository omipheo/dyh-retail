"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Eye, Calendar, Mail, User } from "lucide-react"
import Link from "next/link"

interface ProspectsContentProps {
  prospects: any[]
}

export function ProspectsContent({ prospects }: ProspectsContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Calculate statistics
  const totalProspects = prospects.length
  const pendingCount = prospects.filter((p) => p.status === "pending").length
  const qualifiedCount = prospects.filter((p) => p.status === "qualified").length
  const convertedCount = prospects.filter((p) => p.status === "converted").length

  // Filter and sort prospects
  let filteredProspects = prospects.filter((prospect) => {
    const matchesSearch =
      searchQuery === "" ||
      prospect.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.client_email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || prospect.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort prospects
  filteredProspects = [...filteredProspects].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else if (sortBy === "name") {
      const aName = a.client_name || ""
      const bName = b.client_name || ""
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
              <CardDescription>Total Prospects</CardDescription>
              <CardTitle className="text-3xl">{totalProspects}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Qualified</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{qualifiedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Converted</CardDescription>
              <CardTitle className="text-3xl text-green-600">{convertedCount}</CardTitle>
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
                  placeholder="Search by name or email..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Prospects List */}
        {filteredProspects.length > 0 ? (
          <div className="space-y-4">
            {filteredProspects.map((prospect) => {
              const data = prospect.questionnaire_data as any

              return (
                <Card key={prospect.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{prospect.client_name || "Unknown Prospect"}</CardTitle>
                          <Badge
                            variant={
                              prospect.status === "converted"
                                ? "default"
                                : prospect.status === "qualified"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {prospect.status}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {prospect.client_email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(prospect.created_at).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Updated: {new Date(prospect.updated_at).toLocaleDateString()}</p>
                        {prospect.converted_at && (
                          <p>Converted: {new Date(prospect.converted_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1 text-sm">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                          {prospect.phone && (
                            <div>
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="ml-2">{prospect.phone}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Source:</span>
                            <span className="ml-2 capitalize">{prospect.source}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/prospects/${prospect.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
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
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                {searchQuery || statusFilter !== "all" ? "No matching prospects found" : "No prospects found"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Prospects from DYH Explorer will appear here"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

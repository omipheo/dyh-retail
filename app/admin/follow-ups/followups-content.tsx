"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Eye, Calendar, FileText, CheckCircle, Clock, Send } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface FollowUpsContentProps {
  followups: any[]
}

export function FollowUpsContent({ followups }: FollowUpsContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Calculate statistics
  const totalFollowups = followups.length
  const sentCount = followups.filter((f) => f.status === "sent").length
  const respondedCount = followups.filter((f) => f.status === "responded").length
  const completedCount = followups.filter((f) => f.status === "completed").length

  // Filter and sort followups
  let filteredFollowups = followups.filter((followup) => {
    const client = followup.client as any
    const matchesSearch =
      searchQuery === "" ||
      client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      followup.subject?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || followup.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort followups
  filteredFollowups = [...filteredFollowups].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else if (sortBy === "due_date") {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }
    return 0
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="secondary">Sent</Badge>
      case "viewed":
        return <Badge variant="outline">Viewed</Badge>
      case "responded":
        return <Badge variant="default">Responded</Badge>
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>
      case "high":
        return <Badge variant="default">High</Badge>
      case "normal":
        return <Badge variant="secondary">Normal</Badge>
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Follow-Ups</CardDescription>
              <CardTitle className="text-3xl">{totalFollowups}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Sent</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{sentCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Responded</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{respondedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl text-green-600">{completedCount}</CardTitle>
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
                  placeholder="Search by client name, email, or subject..."
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
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="due_date">Due Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Follow-Ups List */}
        {filteredFollowups.length > 0 ? (
          <div className="space-y-4">
            {filteredFollowups.map((followup) => {
              const client = followup.client as any

              return (
                <Card key={followup.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{followup.subject}</CardTitle>
                          {getStatusBadge(followup.status)}
                          {getPriorityBadge(followup.priority)}
                        </div>
                        <CardDescription className="flex items-center gap-4">
                          <span>Client: {client?.full_name || "Unknown"}</span>
                          <span>{client?.email || "No email"}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Sent: {format(new Date(followup.sent_at), "PP")}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {followup.due_date && (
                          <p className="flex items-center gap-1 justify-end">
                            <Clock className="h-3 w-3" />
                            Due: {format(new Date(followup.due_date), "PP")}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1 text-sm">
                        <div className="flex gap-4">
                          {followup.requires_documents && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              Requires Documents
                            </span>
                          )}
                          {followup.requires_signature && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <CheckCircle className="h-3 w-3" />
                              Requires Signature
                            </span>
                          )}
                          {followup.requires_information && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Send className="h-3 w-3" />
                              Requires Information
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground line-clamp-2">{followup.message_text}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/follow-ups/${followup.id}`}>
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
              <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                {searchQuery || statusFilter !== "all" ? "No matching follow-ups found" : "No follow-ups found"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create a new follow-up to get started"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

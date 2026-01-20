"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Eye, Calendar, FileText, User } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface GlobalSearchContentProps {
  followups: any[]
}

export function GlobalSearchContent({ followups }: GlobalSearchContentProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Enhanced search that looks through all fields including documents
  const filteredFollowups = followups.filter((followup) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    const client = followup.client as any
    const documents = followup.documents as any[]

    // Search in follow-up fields
    const matchesFollowup =
      followup.subject?.toLowerCase().includes(query) ||
      followup.message_text?.toLowerCase().includes(query) ||
      followup.response_text?.toLowerCase().includes(query) ||
      followup.notes?.toLowerCase().includes(query)

    // Search in client info
    const matchesClient =
      client?.full_name?.toLowerCase().includes(query) || client?.email?.toLowerCase().includes(query)

    // Search in dates
    const matchesDate =
      format(new Date(followup.created_at), "PP").toLowerCase().includes(query) ||
      (followup.due_date && format(new Date(followup.due_date), "PP").toLowerCase().includes(query)) ||
      (followup.responded_at && format(new Date(followup.responded_at), "PP").toLowerCase().includes(query))

    // Search in document names
    const matchesDocuments = documents?.some(
      (doc: any) => doc.file_name?.toLowerCase().includes(query) || doc.document_type?.toLowerCase().includes(query),
    )

    return matchesFollowup || matchesClient || matchesDate || matchesDocuments
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
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Box */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by client name, subject, message, dates, documents..."
                className="pl-10 text-lg h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Found {filteredFollowups.length} result{filteredFollowups.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredFollowups.length > 0 ? (
          <div className="space-y-4">
            {filteredFollowups.map((followup) => {
              const client = followup.client as any
              const documents = followup.documents as any[]

              return (
                <Card key={followup.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{followup.subject}</CardTitle>
                          {getStatusBadge(followup.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {client?.full_name || "Unknown"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(followup.created_at), "PP")}
                          </span>
                          {documents && documents.length > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {documents.length} document{documents.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-2">
                        <p className="text-sm line-clamp-2">{followup.message_text}</p>
                        {followup.response_text && (
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-xs text-muted-foreground mb-1">Client Response:</p>
                            <p className="text-sm line-clamp-2">{followup.response_text}</p>
                          </div>
                        )}
                      </div>
                      <Button asChild variant="outline" size="sm" className="ml-4 bg-transparent">
                        <Link href={`/admin/follow-ups/${followup.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                {searchQuery ? "No results found" : "Enter a search term to find communications"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Eye, Edit, Trash2, RotateCcw, AlertTriangle, Scale, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ComplaintsContentProps {
  complaints: any[]
  currentUserId: string
  isDeletedView: boolean
}

export function ComplaintsContent({ complaints, currentUserId, isDeletedView }: ComplaintsContentProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewType, setViewType] = useState<"active" | "deleted">(isDeletedView ? "deleted" : "active")

  // Calculate statistics
  const totalComplaints = complaints.filter((c) => !c.deleted_at).length
  const openComplaints = complaints.filter((c) => c.status === "open" && !c.deleted_at).length
  const tpbReferrals = complaints.filter((c) => c.referred_to_tpb && !c.deleted_at).length
  const ipaReferrals = complaints.filter((c) => c.referred_to_ipa && !c.deleted_at).length
  const litigationMatters = complaints.filter((c) => c.matter_in_litigation && !c.deleted_at).length

  // Filter complaints based on search and status
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      searchQuery === "" ||
      `${complaint.complainant_first_name} ${complaint.complainant_last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      complaint.complainant_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.complaint_details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(complaint.complaint_date).toLocaleDateString().includes(searchQuery)

    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this complaint? It will be moved to the deleted view.")) return

    const response = await fetch(`/api/admin/complaints/${id}/delete`, { method: "POST" })

    if (response.ok) {
      router.refresh()
    } else {
      alert("Failed to delete complaint")
    }
  }

  const handleRestore = async (id: string) => {
    const response = await fetch(`/api/admin/complaints/${id}/restore`, { method: "POST" })

    if (response.ok) {
      router.refresh()
    } else {
      alert("Failed to restore complaint")
    }
  }

  const handleViewChange = (view: "active" | "deleted") => {
    setViewType(view)
    router.push(`/admin/complaints${view === "deleted" ? "?view=deleted" : ""}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "resolved":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "closed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Statistics Cards - Only show for active view */}
        {!isDeletedView && (
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Complaints</CardDescription>
                <CardTitle className="text-3xl">{totalComplaints}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Open</CardDescription>
                <CardTitle className="text-3xl text-red-600">{openComplaints}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>TPB Referrals</CardDescription>
                <CardTitle className="text-3xl text-orange-600">{tpbReferrals}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>IPA Referrals</CardDescription>
                <CardTitle className="text-3xl text-purple-600">{ipaReferrals}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>In Litigation</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{litigationMatters}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* View Toggle Buttons */}
        <div className="flex gap-2">
          <Button
            variant={viewType === "active" ? "default" : "outline"}
            onClick={() => handleViewChange("active")}
            size="sm"
          >
            Active Complaints
          </Button>
          <Button
            variant={viewType === "deleted" ? "default" : "outline"}
            onClick={() => handleViewChange("deleted")}
            size="sm"
          >
            Deleted Complaints
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, date, or details..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {!isDeletedView && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        {filteredComplaints.length > 0 ? (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => {
              const profile = complaint.profiles as any
              const fullName = `${complaint.complainant_first_name} ${complaint.complainant_last_name}`

              return (
                <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{fullName}</CardTitle>
                          <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                          {complaint.referred_to_tpb && (
                            <Badge variant="outline" className="bg-orange-50">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              TPB
                            </Badge>
                          )}
                          {complaint.referred_to_ipa && (
                            <Badge variant="outline" className="bg-purple-50">
                              <FileText className="h-3 w-3 mr-1" />
                              IPA
                            </Badge>
                          )}
                          {complaint.matter_in_litigation && (
                            <Badge variant="outline" className="bg-blue-50">
                              <Scale className="h-3 w-3 mr-1" />
                              Litigation
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-4">
                          {complaint.complainant_email && <span>{complaint.complainant_email}</span>}
                          <span>Complaint Date: {new Date(complaint.complaint_date).toLocaleDateString()}</span>
                          {profile?.full_name && <span>Client: {profile.full_name}</span>}
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Created: {new Date(complaint.created_at).toLocaleDateString()}</p>
                        {complaint.deleted_at && (
                          <p className="text-red-600">Deleted: {new Date(complaint.deleted_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Complaint Details:</p>
                        <p className="text-sm line-clamp-2">{complaint.complaint_details}</p>
                      </div>

                      {complaint.our_response && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Our Response:</p>
                          <p className="text-sm line-clamp-2">{complaint.our_response}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-2">
                          {!isDeletedView ? (
                            <>
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/complaints/${complaint.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Link>
                              </Button>
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/complaints/${complaint.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(complaint.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </>
                          ) : (
                            <Button variant="default" size="sm" onClick={() => handleRestore(complaint.id)}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restore
                            </Button>
                          )}
                        </div>
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
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                {searchQuery || statusFilter !== "all"
                  ? "No matching complaints found"
                  : isDeletedView
                    ? "No deleted complaints"
                    : "No complaints registered"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : isDeletedView
                    ? "Deleted complaints will appear here"
                    : "Complaints will appear here once registered"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

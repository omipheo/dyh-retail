"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Eye, Calendar, Mail, DollarSign, Users, Archive, ArchiveRestore, ChevronDown } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PracticeClientsContentProps {
  clients: any[]
  clientGroups: any[]
}

export function PracticeClientsContent({ clients, clientGroups }: PracticeClientsContentProps) {
  console.log("[v0] Component render - clients count:", clients?.length || 0)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [clientTypeFilter, setClientTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [searchType, setSearchType] = useState<"all" | "active" | "archived" | "lastName">("all")
  const [lastNameSearch, setLastNameSearch] = useState("")
  const [localClients, setLocalClients] = useState(clients)
  const [deletingDuplicates, setDeletingDuplicates] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  if (!clients || !Array.isArray(clients)) {
    console.error("[v0] Invalid clients prop:", clients)
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-red-600">Error: Unable to load clients data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalClients = localClients.length
  const activeCount = localClients.filter((c) => c.status === "active").length
  const archivedCount = localClients.filter((c) => c.status === "archived").length

  console.log("[v0] Stats - Total:", totalClients, "Active:", activeCount, "Archived:", archivedCount)

  let filteredClients = localClients.filter((client) => {
    const fullName = client.full_name || ""
    const email = client.email || ""

    if (searchType === "active" && client.status !== "active") return false
    if (searchType === "archived" && client.status !== "archived") return false

    if (searchType === "lastName" && lastNameSearch) {
      const lastName = fullName.split(",")[0]?.trim().toLowerCase() || fullName.toLowerCase()
      if (!lastName.includes(lastNameSearch.toLowerCase())) return false
    }

    const matchesSearch =
      searchQuery === "" ||
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || client.status === statusFilter

    const clientType = client.questionnaire_data?.client_type || client.client_type
    const matchesClientType = clientTypeFilter === "all" || clientType === clientTypeFilter

    return matchesSearch && matchesStatus && matchesClientType
  })

  console.log("[v0] After filtering:", filteredClients.length, "clients")

  filteredClients = [...filteredClients].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else if (sortBy === "name") {
      const aName = a.full_name || ""
      const bName = b.full_name || ""
      return aName.localeCompare(bName)
    } else if (sortBy === "csv_order") {
      const aOrder = a.display_order || 999999
      const bOrder = b.display_order || 999999
      return aOrder - bOrder
    }
    return 0
  })

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedClients = filteredClients.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const formatClientType = (type: string | null) => {
    if (!type) return "Not specified"
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatClientName = (fullName: string, clientType?: string) => {
    if (!fullName) return "Unknown Client"

    // If already in "Last, First" format, return as-is
    const parts = fullName.split(",")
    if (parts.length === 2) {
      return fullName.trim()
    }

    // Don't reformat company names - only format individual person names
    // Check if this is a company by looking for company indicators
    const companyIndicators = ["Pty", "Ltd", "Limited", "Inc", "Corporation", "Corp", "LLC", "Trust", "Fund", "SMSF"]
    const isCompany = companyIndicators.some((indicator) => fullName.includes(indicator))

    // If it's a company, return the name as-is
    if (isCompany) {
      return fullName.trim()
    }

    // For individuals, format as "Last, First"
    const nameParts = fullName.trim().split(" ")
    if (nameParts.length === 1) return fullName
    const lastName = nameParts[nameParts.length - 1]
    const firstName = nameParts.slice(0, -1).join(" ")
    return `${lastName}, ${firstName}`
  }

  const handleStatusToggle = async (clientId: string, currentStatus: string, clientName: string) => {
    const newStatus = currentStatus === "archived" ? "active" : "archived"
    const action = newStatus === "archived" ? "archive" : "restore"

    console.log("[v0] Status toggle clicked:", { clientId, currentStatus, newStatus, clientName })

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${clientName}"?\n\nThis will ${
        newStatus === "archived" ? "move the client to the archived list" : "restore the client to the active list"
      }.`,
    )

    if (!confirmed) {
      console.log("[v0] User cancelled status change")
      return
    }

    setUpdatingStatus(clientId)

    try {
      console.log("[v0] Sending status update request to API")
      const response = await fetch(`/api/practice-clients/${clientId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API error response:", errorText)
        throw new Error("Failed to update status")
      }

      const result = await response.json()
      console.log("[v0] API success response:", result)

      setLocalClients((prevClients) =>
        prevClients.map((client) => (client.id === clientId ? { ...client, status: newStatus } : client)),
      )

      console.log("[v0] Local state updated successfully")
    } catch (error) {
      console.error("[v0] Error updating status:", error)
      alert("Failed to update client status. Please try again.")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleDeleteDuplicates = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete duplicate client entries?\n\n" +
        "This will keep the first occurrence of each client (by name and email) and delete any duplicates.\n\n" +
        "This action cannot be undone!",
    )

    if (!confirmed) return

    setDeletingDuplicates(true)

    try {
      const response = await fetch("/api/practice-clients/remove-duplicates", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to delete duplicates")
      }

      const result = await response.json()

      if (result.duplicates && result.duplicates.length > 0) {
        const duplicateList = result.duplicates.map((dup: any) => `• ${dup.name} (${dup.email})`).join("\n")

        alert(
          `Successfully deleted ${result.deleted} duplicate client(s):\n\n${duplicateList}\n\nRemaining clients: ${result.remaining}`,
        )
      } else {
        alert(`No duplicates found. Total clients: ${result.remaining}`)
      }

      window.location.reload()
    } catch (error) {
      console.error("[v0] Error deleting duplicates:", error)
      alert("Failed to delete duplicates. Please try again.")
    } finally {
      setDeletingDuplicates(false)
    }
  }

  console.log("[v0] About to render. Filtered clients:", filteredClients.length)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Clients</CardDescription>
              <CardTitle className="text-3xl">{totalClients}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Clients</CardDescription>
              <CardTitle className="text-3xl text-green-600">{activeCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ex-Clients</CardDescription>
              <CardTitle className="text-3xl text-gray-600">{archivedCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-transparent">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <span>
                          {searchType === "all" && "Search All"}
                          {searchType === "active" && "Clients"}
                          {searchType === "archived" && "Ex-Clients"}
                          {searchType === "lastName" && "Search by Last Name"}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[300px]">
                    <DropdownMenuItem
                      onClick={() => {
                        setSearchType("active")
                        setLastNameSearch("")
                        handleFilterChange()
                      }}
                    >
                      Clients
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSearchType("archived")
                        setLastNameSearch("")
                        handleFilterChange()
                      }}
                    >
                      Ex-Clients
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSearchType("lastName")
                        handleFilterChange()
                      }}
                    >
                      Last Name
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSearchType("all")
                        setLastNameSearch("")
                        handleFilterChange()
                      }}
                    >
                      Search All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {searchType === "lastName" && (
                <Input
                  placeholder="Enter last name..."
                  className="flex-1 min-w-[200px]"
                  value={lastNameSearch}
                  onChange={(e) => {
                    setLastNameSearch(e.target.value)
                    handleFilterChange()
                  }}
                />
              )}

              <Select
                value={clientTypeFilter}
                onValueChange={(value) => {
                  setClientTypeFilter(value)
                  handleFilterChange()
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Client Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="sole_trader">Sole Trader</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                  <SelectItem value="smsf">SMSF</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value)
                  handleFilterChange()
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Clients</SelectItem>
                  <SelectItem value="archived">Ex-Clients</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv_order">CSV Order</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="newest">Newest to Oldest</SelectItem>
                  <SelectItem value="oldest">Oldest to Newest</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="destructive" onClick={handleDeleteDuplicates} disabled={deletingDuplicates}>
                {deletingDuplicates ? "Deleting..." : "Delete Duplicates"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  {searchQuery || statusFilter !== "all" || clientTypeFilter !== "all" || searchType !== "all"
                    ? "No matching clients found"
                    : "No practice clients found"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchQuery || statusFilter !== "all" || clientTypeFilter !== "all" || searchType !== "all"
                    ? "Try adjusting your search or filters"
                    : "Import your client CSV files to see them here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedClients.map((client, index) => {
                console.log(`[v0] Rendering client ${index + 1}:`, client.full_name, client.id)

                if (!client || !client.id) {
                  console.error("[v0] Skipping invalid client at index", index, client)
                  return null
                }

                const clientGroupsData = client.client_group_members || []

                return (
                  <Card key={client.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <CardTitle className="text-xl">
                              {formatClientName(client.full_name, client.client_type)}
                            </CardTitle>
                            <Badge variant={client.status === "active" ? "default" : "outline"}>{client.status}</Badge>
                            {(client.questionnaire_data?.client_type || client.client_type) && (
                              <Badge variant="secondary">
                                {formatClientType(client.questionnaire_data?.client_type || client.client_type)}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="bg-green-50">
                              <DollarSign className="h-3 w-3 mr-1" />
                              Final Report Purchased
                            </Badge>
                            {clientGroupsData.length > 0 && (
                              <Badge variant="outline" className="bg-blue-50">
                                <Users className="h-3 w-3 mr-1" />
                                {clientGroupsData.length} Group{clientGroupsData.length > 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-4 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </span>
                            {client.phone_number && <span>Phone: {client.phone_number}</span>}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Client since: {new Date(client.created_at).toLocaleDateString()}
                            </span>
                          </CardDescription>
                          {clientGroupsData.length > 0 && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {clientGroupsData.map((member: any) => (
                                <Badge key={member.group_id} variant="outline" className="text-xs">
                                  {member.client_groups?.group_name}
                                  {member.role_in_group && ` • ${member.role_in_group}`}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant={client.status === "archived" ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            handleStatusToggle(
                              client.id,
                              client.status,
                              formatClientName(client.full_name, client.client_type),
                            )
                          }
                          disabled={updatingStatus === client.id}
                        >
                          {client.status === "archived" ? (
                            <>
                              <ArchiveRestore className="h-4 w-4 mr-2" />
                              {updatingStatus === client.id ? "Restoring..." : "Make Active Again"}
                            </>
                          ) : (
                            <>
                              <Archive className="h-4 w-4 mr-2" />
                              {updatingStatus === client.id ? "Archiving..." : "Add to Archive"}
                            </>
                          )}
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/practice-clients/${client.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {filteredClients.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Show:</span>
                        <Select
                          value={itemsPerPage.toString()}
                          onValueChange={(value) => {
                            setItemsPerPage(Number(value))
                            setCurrentPage(1)
                          }}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="200">200</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">
                          Showing {startIndex + 1}-{Math.min(endIndex, filteredClients.length)} of{" "}
                          {filteredClients.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

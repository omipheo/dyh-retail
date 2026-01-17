"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

interface Prospect {
  id: string
  email: string
  full_name: string
  phone_number: string
  status: string
  created_at: string
  last_activity_at: string
  questionnaire_data: any
}

export default function ProspectsContent() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [filteredProspects, setFilteredProspects] = useState<Prospect[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchProspects()
  }, [])

  useEffect(() => {
    filterProspects()
  }, [searchTerm, statusFilter, prospects])

  async function fetchProspects() {
    setLoading(true)
    const { data, error } = await supabase
      .from("dyh_explorer_prospects")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching prospects:", error)
    } else {
      setProspects(data || [])
    }
    setLoading(false)
  }

  function filterProspects() {
    let filtered = prospects

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredProspects(filtered)
  }

  const stats = {
    total: prospects.length,
    active: prospects.filter((p) => p.status === "prospect").length,
    interested: prospects.filter((p) => p.status === "interested").length,
    converted: prospects.filter((p) => p.status === "converted").length,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">DYH Explorer Prospects</h1>
          <p className="text-muted-foreground">Manage and track potential clients</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interested</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interested}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.converted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")}>
                All
              </Button>
              <Button
                variant={statusFilter === "prospect" ? "default" : "outline"}
                onClick={() => setStatusFilter("prospect")}
              >
                Prospects
              </Button>
              <Button
                variant={statusFilter === "interested" ? "default" : "outline"}
                onClick={() => setStatusFilter("interested")}
              >
                Interested
              </Button>
              <Button
                variant={statusFilter === "converted" ? "default" : "outline"}
                onClick={() => setStatusFilter("converted")}
              >
                Converted
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prospects List */}
      <Card>
        <CardHeader>
          <CardTitle>Prospects ({filteredProspects.length})</CardTitle>
          <CardDescription>View and manage all prospects from DYH Explorer</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading prospects...</div>
          ) : filteredProspects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No prospects found</div>
          ) : (
            <div className="space-y-4">
              {filteredProspects.map((prospect) => (
                <div
                  key={prospect.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{prospect.full_name || "No Name"}</h3>
                      <Badge
                        variant={
                          prospect.status === "converted"
                            ? "default"
                            : prospect.status === "interested"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {prospect.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{prospect.email}</p>
                    <p className="text-sm text-muted-foreground">{prospect.phone_number || "No phone"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {new Date(prospect.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/admin/prospects/${prospect.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

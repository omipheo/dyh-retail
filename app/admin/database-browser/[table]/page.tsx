import { getServiceRoleClient } from "@/lib/supabase/service-role"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Database, RefreshCw } from "lucide-react"
import Link from "next/link"
import { TableDataContent } from "./table-data-content"

export default async function TableViewPage({ params }: { params: { table: string } }) {
  const tableName = params.table
  const supabase = getServiceRoleClient()

  try {
    // Fetch records from the table - try ordering by created_at, fallback to no order
    const query = supabase.from(tableName).select("*", { count: "exact" }).limit(100)

    // Try to order by created_at if the column exists
    const {
      data: records,
      error,
      count,
    } = await query.order("created_at", { ascending: false, nullsFirst: false }).catch(async (err) => {
      // If ordering fails (column doesn't exist), fetch without ordering
      console.log(`[v0] Table ${tableName} doesn't have created_at column, fetching without order`)
      const result = await supabase.from(tableName).select("*", { count: "exact" }).limit(100)
      return result
    })

    if (error) {
      console.error("[v0] Error fetching table data:", error)
    }

    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin/database-browser">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tables
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8" />
              {tableName}
            </h1>
            <p className="text-muted-foreground mt-1">{count !== null ? `${count} total records` : "Loading..."}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Records</CardTitle>
            <CardDescription>Showing up to 100 most recent records from {tableName}</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-12">
                <p className="text-destructive">Error loading data: {error.message}</p>
              </div>
            ) : !records || records.length === 0 ? (
              <div className="text-center py-12">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No records found in this table</p>
              </div>
            ) : (
              <TableDataContent records={records} tableName={tableName} />
            )}
          </CardContent>
        </Card>
      </div>
    )
  } catch (error: any) {
    console.error("[v0] Error fetching table data:", error)
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/admin/database-browser">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tables
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{tableName}</CardTitle>
            <CardDescription>Error loading table</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-destructive">Error loading data: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}

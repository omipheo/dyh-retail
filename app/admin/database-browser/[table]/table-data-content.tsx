"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, ChevronRight } from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function TableDataContent({ records, tableName }: { records: any[]; tableName: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const sortedRecords = [...records].sort((a, b) => {
    const columns = Object.keys(a)
    if (columns.length === 0) return 0
    const firstCol = columns[0]
    const aVal = String(a[firstCol] || "")
    const bVal = String(b[firstCol] || "")
    return aVal.localeCompare(bVal)
  })

  const filteredRecords = sortedRecords.filter((record) => {
    const searchLower = searchQuery.toLowerCase()
    return Object.values(record).some((value) => String(value).toLowerCase().includes(searchLower))
  })

  const columns = records.length > 0 ? Object.keys(records[0]) : []

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records
      </div>

      <div className="space-y-2">
        {paginatedRecords.map((record, index) => (
          <div key={index} className="border rounded-lg">
            <div
              className="p-4 cursor-pointer hover:bg-muted/50 flex items-center justify-between"
              onClick={() => toggleRow(index)}
            >
              <div className="flex items-center gap-2">
                {expandedRows.has(index) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <div className="flex gap-4">
                  {columns.slice(0, 3).map((col) => (
                    <div key={col}>
                      <span className="font-medium text-sm">{col}: </span>
                      <span className="text-sm text-muted-foreground">
                        {String(record[col]).substring(0, 50)}
                        {String(record[col]).length > 50 ? "..." : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Badge variant="outline">{columns.length} fields</Badge>
            </div>

            {expandedRows.has(index) && (
              <div className="p-4 border-t bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {columns.map((col) => (
                    <div key={col} className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">{col}</div>
                      <div className="text-sm font-mono bg-background p-2 rounded border">
                        {typeof record[col] === "object" && record[col] !== null
                          ? JSON.stringify(record[col], null, 2)
                          : String(record[col] ?? "null")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRecords.length > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No records match your search</p>
        </div>
      )}
    </div>
  )
}

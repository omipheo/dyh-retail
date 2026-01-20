"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, CheckCircle2, Download, Upload, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type ImportResult = {
  success: number
  failed: number
  updated: number
  skipped: number
  skippedRows: { row: number; reason: string }[]
  errors: { row: number; email: string; error: string }[]
}

export function CSVImportForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [importMode, setImportMode] = useState<"new_only" | "update_only" | "both">("both")
  const [testingDB, setTestingDB] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [cleaning, setCleaning] = useState(false)

  // Added database test function
  const testDatabaseInsert = async () => {
    setTestingDB(true)
    setTestResult(null)
    setError(null)

    try {
      const response = await fetch("/api/practice-clients/test-insert", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        setTestResult({
          success: true,
          message: `✓ Database connection works! Test client created with ID: ${result.client?.id}`,
        })
      } else {
        setTestResult({
          success: false,
          message: `✗ Database insert failed: ${result.error}`,
        })
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setTestingDB(false)
    }
  }

  const handleCleanup = async () => {
    if (!confirm("Are you sure you want to delete ALL clients? This cannot be undone.")) {
      return
    }

    setCleaning(true)
    setError(null)

    try {
      const response = await fetch("/api/practice-clients/cleanup", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        alert("All clients have been deleted. You can now import fresh CSV files.")
        router.refresh()
      } else {
        throw new Error(result.error || "Cleanup failed")
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCleaning(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      await processFile(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      await processFile(droppedFile)
    }
  }

  const processFile = async (selectedFile: File) => {
    console.log("[v0] CSV Import - File selected:", selectedFile.name, "Size:", selectedFile.size)

    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      setError("Please select a valid CSV file")
      return
    }

    setFile(selectedFile)
    setImportResult(null)
    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("mode", importMode)

      const isArchivedFile =
        selectedFile.name.toLowerCase().includes("archived") || selectedFile.name.toLowerCase().includes("archive")
      console.log("[v0] CSV Import - Is archived file:", isArchivedFile)

      if (isArchivedFile) {
        formData.append("defaultStatus", "archived")
      }

      console.log("[v0] CSV Import - Sending request to API...")
      const response = await fetch("/api/practice-clients/import", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] CSV Import - API response status:", response.status)

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[v0] CSV Import - Non-JSON response:", text)
        throw new Error(`Server returned non-JSON response: ${text || "Empty response"}`)
      }

      const result = await response.json()
      console.log("[v0] CSV Import - API result:", result)

      if (!response.ok) {
        throw new Error(result.error || "Import failed")
      }

      setImportResult(result)

      if (result.success > 0 || result.updated > 0) {
        console.log("[v0] CSV Import - Success!")
      }
    } catch (err) {
      console.error("[v0] CSV Import - Error:", err)
      setError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template =
      "Name,Phone Number,Email,Type,Industry classification,Xero Plan,ABN,Status\nSmith, John,0400000000,john@example.com,Individual,,,12345678901,Active\n"
    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "client_import_template.csv"
    a.click()
  }

  return (
    <div className="space-y-6">
      <Card className="border-red-600">
        <CardHeader>
          <CardTitle className="text-red-600">Delete All Clients</CardTitle>
          <CardDescription>Remove all existing clients before importing fresh CSV files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleCleanup} disabled={cleaning} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            {cleaning ? "Deleting..." : "Delete All Clients"}
          </Button>
          <p className="text-sm text-muted-foreground">
            This will permanently delete all clients, notes, and group memberships. Use this before re-importing CSV
            files to ensure a clean import.
          </p>
        </CardContent>
      </Card>

      {/* Added test database button */}
      <Card className="border-blue-600">
        <CardHeader>
          <CardTitle>Diagnose Import Issues</CardTitle>
          <CardDescription>Test if the database connection is working properly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={testDatabaseInsert} disabled={testingDB} variant="outline">
            {testingDB ? "Testing..." : "Test Database Insert"}
          </Button>
          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            Click to insert a single test client. If this succeeds, the database is accessible and CSV imports should
            work.
          </p>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Format Requirements</CardTitle>
          <CardDescription>Your CSV file must include the following columns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <div className="text-sm">
              <strong>Required columns:</strong>
              <ul className="list-disc list-inside mt-1 text-muted-foreground">
                <li>Name - Full client name (format: "Last, First" or "First Last")</li>
                <li>Email - Client email address</li>
              </ul>
            </div>
            <div className="text-sm">
              <strong>Optional columns:</strong>
              <ul className="list-disc list-inside mt-1 text-muted-foreground">
                <li>Phone Number - Contact phone</li>
                <li>
                  Type - Client entity type (Individual, Sole Trader, Partnership, Company, Trust, SMSF, Self Managed
                  Superannuation Fund)
                </li>
                <li>Status - "Active" or "Archived" (auto-detected from filename if missing)</li>
                <li>Industry classification, Xero Plan, ABN - Additional metadata</li>
              </ul>
            </div>
            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
              <strong>Tip:</strong> If your filename contains "archived" or "archive", all clients without a Status
              column will be imported as Archived automatically.
            </div>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template CSV
          </Button>
        </CardContent>
      </Card>

      {/* Import Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Import Mode</CardTitle>
          <CardDescription>Choose how to handle existing clients</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={importMode} onValueChange={(v) => setImportMode(v as typeof importMode)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new_only" id="new_only" />
              <Label htmlFor="new_only" className="cursor-pointer">
                <div className="font-medium">Import new clients only</div>
                <div className="text-sm text-muted-foreground">Skip existing clients (match by email)</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="update_only" id="update_only" />
              <Label htmlFor="update_only" className="cursor-pointer">
                <div className="font-medium">Update existing clients only</div>
                <div className="text-sm text-muted-foreground">Update records for existing emails, skip new ones</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both" className="cursor-pointer">
                <div className="font-medium">Import new and update existing (Recommended)</div>
                <div className="text-sm text-muted-foreground">Add new clients and update existing ones</div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>Select or drag and drop a CSV file to import clients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25"
            } ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={uploading}
              id="csv-upload"
              className="hidden"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className={`h-12 w-12 text-muted-foreground ${uploading ? "animate-pulse" : ""}`} />
                <div className="text-sm font-medium">
                  {uploading
                    ? "Processing..."
                    : isDragging
                      ? "Drop CSV file here"
                      : "Click to select or drag and drop CSV file"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {uploading ? "Please wait..." : "File will be processed automatically"}
                </div>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Error Report */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Import Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {importResult &&
        importResult.success === 0 &&
        importResult.updated === 0 &&
        importResult.skipped === 0 &&
        importResult.failed > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">All Imports Failed!</p>
                <p className="text-sm">
                  The import reported {importResult.failed} clients processed, but NONE were saved to the database.
                </p>
                <p className="text-sm font-medium">Common causes:</p>
                <ul className="text-sm list-disc list-inside">
                  <li>Database permission errors (RLS policies blocking inserts)</li>
                  <li>Missing required fields in your CSV</li>
                  <li>Database constraints violated (unique email, etc.)</li>
                </ul>
                <p className="text-sm mt-2">
                  Check the error details below and your browser console (F12) for specific database error messages.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

      {importResult && importResult.success === 0 && importResult.updated === 0 && importResult.skipped > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">All Clients Already Exist</p>
              <p className="text-sm">
                All {importResult.skipped} clients from your CSV already exist in the database with the same status. No
                changes were made.
              </p>
              <p className="text-sm mt-2">
                If you want to re-import these clients, delete all existing clients first using the "Delete All Clients"
                button above.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Result */}
      {importResult && (importResult.success > 0 || importResult.updated > 0) && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-green-600">Import Successful!</p>
              <ul className="text-sm space-y-1">
                {importResult.success > 0 && <li>✓ {importResult.success} new clients added</li>}
                {importResult.updated > 0 && <li>✓ {importResult.updated} clients updated</li>}
                {importResult.failed > 0 && <li>⚠ {importResult.failed} rows failed</li>}
                {importResult.skipped > 0 && <li>⚠ {importResult.skipped} rows skipped (missing required data)</li>}
              </ul>
              {importResult.failed > 0 && importResult.errors.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm font-medium text-yellow-800">First error:</p>
                  <p className="text-xs text-yellow-700">{importResult.errors[0].error}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    See error table below for all {importResult.errors.length} failed rows
                  </p>
                </div>
              )}
              {/* Manual button to view clients */}
              <Button
                onClick={() => {
                  router.push("/admin/practice-clients")
                  router.refresh()
                }}
                className="mt-3"
              >
                View Imported Clients
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Skipped Rows Table */}
      {importResult && importResult.skippedRows && importResult.skippedRows.length > 0 && (
        <Card className="border-orange-600">
          <CardHeader>
            <CardTitle className="text-orange-600">Skipped Rows</CardTitle>
            <CardDescription>{importResult.skippedRows.length} rows were skipped due to missing data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importResult.skippedRows.map((skipped, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{skipped.row}</TableCell>
                      <TableCell className="text-sm text-orange-600">{skipped.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors Table */}
      {importResult && importResult.errors.length > 0 && (
        <Card className="border-yellow-600">
          <CardHeader>
            <CardTitle className="text-yellow-600">Some Rows Failed</CardTitle>
            <CardDescription>{importResult.errors.length} rows could not be imported</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importResult.errors.map((err, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{err.row}</TableCell>
                      <TableCell>{err.email}</TableCell>
                      <TableCell className="text-sm text-destructive">{err.error}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

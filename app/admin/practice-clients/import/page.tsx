import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CSVImportForm } from "./csv-import-form"

export default function ImportClientsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin/practice-clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Practice Clients
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Import Clients from CSV</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a CSV file to bulk import clients into Practice Manager
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <CSVImportForm />
      </div>
    </div>
  )
}

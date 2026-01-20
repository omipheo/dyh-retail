import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AddClientForm } from "./add-client-form"

export default async function AddClientPage() {
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
          <h1 className="text-3xl font-bold">Add New Client</h1>
          <p className="text-sm text-muted-foreground mt-1">Add a new practice client manually</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <AddClientForm />
        </div>
      </div>
    </div>
  )
}

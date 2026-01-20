import { Suspense } from "react"
import { DatabaseBrowserContent } from "./database-browser-content"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DatabaseBrowserPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Browser</h1>
          <p className="text-muted-foreground">View and search all database tables</p>
        </div>
        <Link href="/admin">
          <Button variant="outline">Back to Admin</Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <DatabaseBrowserContent />
      </Suspense>
    </div>
  )
}

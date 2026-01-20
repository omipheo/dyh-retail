import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ReferenceDocumentUploadForm } from "@/components/reference-document-upload-form"

export default async function UploadReferencePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin/reference-docs">← Back to Reference Documents</Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Upload Reference Document</h1>
            <p className="text-sm text-muted-foreground">Upload books, ATO correspondence, or guides</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ReferenceDocumentUploadForm />
        </div>
      </div>
    </div>
  )
}

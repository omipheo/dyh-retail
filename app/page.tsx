import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/intellisolve-20nothing-20compares.png"
            alt="Intellisolve - Nothing Compares"
            width={600}
            height={150}
            priority
            className="object-contain"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Practice Manager</h1>
          <p className="text-xl text-muted-foreground">Complete Practice Management & Client Database</p>
        </div>

        <div className="mt-16 pt-8 border-t">
          <h2 className="text-3xl font-semibold mb-6">Admin Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-base">
            <Link href="/admin/prospects" className="text-muted-foreground hover:text-foreground">
              DYH Prospects
            </Link>
            <Link href="/admin/practice-clients" className="text-muted-foreground hover:text-foreground">
              Practice Clients
            </Link>
            <Link href="/admin/ato-schedule" className="text-muted-foreground hover:text-foreground">
              ATO Schedule
            </Link>
            <Link href="/admin/todos" className="text-muted-foreground hover:text-foreground">
              To-Do List
            </Link>
            <Link href="/admin/complaints" className="text-muted-foreground hover:text-foreground">
              Complaints Register
            </Link>
            <Link href="/admin/follow-ups" className="text-muted-foreground hover:text-foreground">
              Client Follow-Ups
            </Link>
            <Link href="/admin/mail-merge" className="text-muted-foreground hover:text-foreground">
              Mail Merge
            </Link>
            <Link href="/admin/integration-status" className="text-muted-foreground hover:text-foreground">
              Integration Status
            </Link>
            <Link href="/admin/clients" className="text-muted-foreground hover:text-foreground">
              All Clients
            </Link>
            <Link href="/admin/quality-management" className="text-muted-foreground hover:text-foreground">
              Quality Management
            </Link>
            <Link href="/admin/database-browser" className="text-muted-foreground hover:text-foreground">
              Database Browser
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

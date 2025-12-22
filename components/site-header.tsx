import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Home Business Optimiser</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/messages">Messages</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/reference-docs/upload">Upload Documents</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/demo/questionnaire-download">Get Questionnaire</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/demo/scenarios">Demo Scenarios</Link>
            </Button>
            <Button asChild variant="default" size="sm">
              <Link href="/demo/final-report">Download Report</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}

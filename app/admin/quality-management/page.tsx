"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, FileText, Download, ChevronDown, ChevronRight } from "lucide-react"

export default function QualityManagementPage() {
  const [activeSection, setActiveSection] = useState<string>("overview")
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  const pdfUrl = "/images/quality-management-system-intellisolve-version-1.pdf"

  const sections = [
    { id: "overview", title: "Overview & Terms of Use", page: 1, isParent: false },
    {
      id: "section1",
      title: "1. Practice Details",
      page: 3,
      isParent: true,
      children: [
        { id: "section1-1", title: "1.1 Philosophy", page: 3 },
        { id: "section1-2", title: "1.2 Our Purpose", page: 3 },
        { id: "section1-3", title: "1.3 Core Values", page: 3 },
        { id: "section1-4", title: "1.4 Client Value Proposition", page: 4 },
        { id: "section1-5", title: "1.5 Goals", page: 4 },
        { id: "section1-7", title: "1.7 Our Services", page: 5 },
        { id: "section1-8", title: "1.8 Our Clients", page: 6 },
        { id: "section1-9", title: "1.9 Systems and Technology", page: 6 },
        { id: "section1-12", title: "1.12 History", page: 7 },
        { id: "section1-13", title: "1.13 Achievements", page: 7 },
      ],
    },
    {
      id: "section2",
      title: "2. Governance and Leadership",
      page: 8,
      isParent: true,
      children: [
        { id: "section2-1", title: "2.1 Policy", page: 8 },
        { id: "section2-2", title: "2.2 Responsibilities", page: 8 },
        { id: "section2-3", title: "2.3 Quality Objectives", page: 9 },
        { id: "section2-4", title: "2.4 Resources", page: 10 },
      ],
    },
    {
      id: "section3",
      title: "3. Professional and Ethical Standards",
      page: 11,
      isParent: true,
      children: [
        { id: "section3-1", title: "3.1 Ethical Requirements", page: 11 },
        { id: "section3-2", title: "3.2 Independence", page: 12 },
        { id: "section3-3", title: "3.3 Professional Competence", page: 13 },
      ],
    },
    {
      id: "section4",
      title: "4. Client Relationships",
      page: 15,
      isParent: true,
      children: [
        { id: "section4-1", title: "4.1 Client Acceptance", page: 15 },
        { id: "section4-2", title: "4.2 Client Continuance", page: 16 },
        { id: "section4-3", title: "4.3 Withdrawal from Engagement", page: 17 },
      ],
    },
    {
      id: "section5",
      title: "5. Engagement Performance",
      page: 18,
      isParent: true,
      children: [
        { id: "section5-1", title: "5.1 Engagement Process", page: 18 },
        { id: "section5-2", title: "5.2 Planning", page: 19 },
        { id: "section5-3", title: "5.3 Performance", page: 20 },
        { id: "section5-4", title: "5.4 Review", page: 21 },
      ],
    },
    {
      id: "section6",
      title: "6. Engagement Documentation",
      page: 22,
      isParent: true,
      children: [
        { id: "section6-1", title: "6.1 Documentation Requirements", page: 22 },
        { id: "section6-2", title: "6.2 Assembly and Retention", page: 23 },
      ],
    },
    {
      id: "section7",
      title: "7. Monitoring and Remediation",
      page: 24,
      isParent: true,
      children: [
        { id: "section7-1", title: "7.1 Monitoring Process", page: 24 },
        { id: "section7-2", title: "7.2 Evaluating Findings", page: 25 },
        { id: "section7-3", title: "7.3 Remedial Actions", page: 26 },
      ],
    },
    {
      id: "section8",
      title: "8. Complaints Management",
      page: 27,
      isParent: true,
      children: [
        { id: "section8-1", title: "8.1 Complaints Policy", page: 27 },
        { id: "section8-2", title: "8.2 Complaints Process", page: 28 },
        { id: "section8-3", title: "8.3 Resolution and Review", page: 29 },
      ],
    },
    {
      id: "section9",
      title: "9. Risk Management",
      page: 30,
      isParent: true,
      children: [
        { id: "section9-1", title: "9.1 Risk Framework", page: 30 },
        { id: "section9-2", title: "9.2 Risk Assessment", page: 31 },
        { id: "section9-3", title: "9.3 Risk Treatment", page: 32 },
      ],
    },
  ]

  const quickLinks = [
    { title: "Overview", sectionId: "overview" },
    { title: "Governance", sectionId: "section2" },
    { title: "Ethics", sectionId: "section3" },
    { title: "Complaints", sectionId: "section8" },
    { title: "Risk", sectionId: "section9" },
  ]

  const handleSectionClick = (sectionId: string, page: number) => {
    console.log("[v0] Section clicked:", sectionId, "Page:", page)
    setActiveSection(sectionId)
    const iframe = document.querySelector("iframe") as HTMLIFrameElement
    if (iframe) {
      iframe.src = `${pdfUrl}#page=${page}`
      console.log("[v0] Updated iframe src to:", iframe.src)
    } else {
      console.log("[v0] ERROR: iframe not found")
    }
  }

  const toggleSection = (sectionId: string) => {
    console.log("[v0] Toggle section:", sectionId)
    const newCollapsed = new Set(collapsedSections)
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId)
    } else {
      newCollapsed.add(sectionId)
    }
    setCollapsedSections(newCollapsed)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quality Management System</h1>
          <p className="text-muted-foreground mt-2">Intellisolve Quality Management Manual - Version 1.1</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href={pdfUrl} download="Intellisolve-QMS-Manual.pdf">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground flex items-center">Quick Jump:</span>
        {quickLinks.map((link) => {
          const section = sections.find((s) => s.id === link.sectionId)
          return (
            <Button
              key={link.sectionId}
              variant="secondary"
              size="sm"
              onClick={() => {
                console.log("[v0] Quick link clicked:", link.title)
                section && handleSectionClick(section.id, section.page)
              }}
            >
              {link.title}
            </Button>
          )
        })}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Table of Contents
              </CardTitle>
              <CardDescription>Navigate document sections</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-0.5 p-4">
                  {sections.map((section) => (
                    <div key={section.id}>
                      <button
                        onClick={() => {
                          console.log("[v0] TOC button clicked:", section.id)
                          if (section.isParent) {
                            toggleSection(section.id)
                          }
                          handleSectionClick(section.id, section.page)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all ${
                          activeSection === section.id
                            ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                            : "hover:bg-accent hover:text-accent-foreground font-medium"
                        }`}
                      >
                        <span className="flex-1 text-left">{section.title}</span>
                        {section.isParent && (
                          <span className="ml-2">
                            {collapsedSections.has(section.id) ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </button>

                      {section.isParent && !collapsedSections.has(section.id) && section.children && (
                        <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-border pl-2">
                          {section.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => {
                                console.log("[v0] Child section clicked:", child.id)
                                handleSectionClick(child.id, child.page)
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-all ${
                                activeSection === child.id
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              }`}
                            >
                              {child.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-12 lg:col-span-9">
          <CardContent className="p-0">
            <iframe
              src={pdfUrl}
              className="w-full h-[calc(100vh-200px)] rounded-lg border-0"
              title="Quality Management System Manual"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-primary/20">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-semibold">Need to log a complaint?</p>
            <p className="text-sm text-muted-foreground">Access the integrated Complaints Register system</p>
          </div>
          <Button asChild size="lg">
            <Link href="/admin/complaints">Go to Complaints Register</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

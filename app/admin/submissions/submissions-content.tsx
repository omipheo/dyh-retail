"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Eye, Search, Download } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Assessment {
  id: string
  client_id: string
  client_name: string
  status: string
  questionnaire_data: Record<string, any>
  created_at: string
  updated_at: string
  profiles: {
    id: string
    full_name: string
    email: string
  }
}

interface SubmissionsContentProps {
  assessments: Assessment[]
}

export function SubmissionsContent({ assessments }: SubmissionsContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const filteredAssessments = assessments.filter((assessment) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      assessment.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      assessment.profiles?.email?.toLowerCase().includes(searchLower) ||
      assessment.client_name?.toLowerCase().includes(searchLower)
    )
  })

  const handleView = (assessment: Assessment) => {
    setSelectedAssessment(assessment)
    setShowDialog(true)
  }

  const handleDownload = (assessment: Assessment) => {
    const dataStr = JSON.stringify(assessment.questionnaire_data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${assessment.profiles?.full_name || "client"}-${assessment.id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAssessments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "No submissions found matching your search." : "No submissions yet."}
            </p>
          </Card>
        ) : (
          filteredAssessments.map((assessment) => (
            <Card key={assessment.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {assessment.profiles?.full_name || assessment.client_name || "Unknown Client"}
                    </h3>
                    <Badge variant={assessment.status === "submitted" ? "default" : "secondary"}>
                      {assessment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{assessment.profiles?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(assessment.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleView(assessment)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(assessment)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAssessment?.profiles?.full_name || selectedAssessment?.client_name}</DialogTitle>
            <DialogDescription>
              Submitted on {selectedAssessment && new Date(selectedAssessment.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Contact Details</h4>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-muted-foreground">Name:</dt>
                <dd>{selectedAssessment?.questionnaire_data?.fullName}</dd>
                <dt className="text-muted-foreground">Email:</dt>
                <dd>{selectedAssessment?.questionnaire_data?.email}</dd>
                <dt className="text-muted-foreground">Phone:</dt>
                <dd>{selectedAssessment?.questionnaire_data?.phone}</dd>
                <dt className="text-muted-foreground">Address:</dt>
                <dd>
                  {selectedAssessment?.questionnaire_data?.streetAddress},{" "}
                  {selectedAssessment?.questionnaire_data?.suburb} {selectedAssessment?.questionnaire_data?.state}{" "}
                  {selectedAssessment?.questionnaire_data?.postcode}
                </dd>
              </dl>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Quick Questionnaire Responses</h4>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(
                    Object.entries(selectedAssessment?.questionnaire_data || {})
                      .filter(([key]) => key.startsWith("q") && !key.startsWith("ss_"))
                      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Strategy Selector Responses</h4>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(
                    Object.entries(selectedAssessment?.questionnaire_data || {})
                      .filter(([key]) => key.startsWith("ss_"))
                      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>

            {selectedAssessment?.questionnaire_data?.determinedStrategy && (
              <div>
                <h4 className="font-semibold mb-2">Recommended Strategy</h4>
                <Card className="p-4">
                  <h5 className="font-medium">{selectedAssessment.questionnaire_data.determinedStrategy.name}</h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedAssessment.questionnaire_data.determinedStrategy.description}
                  </p>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

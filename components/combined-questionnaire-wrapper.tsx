"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, FileText, ClipboardList } from "lucide-react"
import { DownloadReportButton } from "@/components/download-report-button"

interface CombinedQuestionnaireWrapperProps {
  userId: string
}

export function CombinedQuestionnaireWrapper({ userId }: CombinedQuestionnaireWrapperProps) {
  const [activeTab, setActiveTab] = useState<"quick" | "full">("quick")
  const [quickQuestionnaireData, setQuickQuestionnaireData] = useState<Record<string, any> | null>(null)
  const [fullQuestionnaireData, setFullQuestionnaireData] = useState<Record<string, any> | null>(null)

  const quickCompleted = quickQuestionnaireData !== null
  const fullCompleted = fullQuestionnaireData !== null
  const overallProgress = quickCompleted && fullCompleted ? 100 : quickCompleted || fullCompleted ? 50 : 0

  const combinedData = {
    questionnaire1: quickQuestionnaireData || {},
    questionnaire2: fullQuestionnaireData || {},
  }

  const canDownload = quickCompleted || fullCompleted

  return (
    <div className="container mx-auto max-w-7xl py-8 space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Questionnaire Progress</CardTitle>
          <CardDescription>Complete both questionnaires to generate your comprehensive 40-page report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Completion</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Quick Questionnaire Status */}
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              {quickCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">Quick Questionnaire</p>
                <p className="text-sm text-muted-foreground">29 essential questions</p>
                <p className={`text-xs mt-1 ${quickCompleted ? "text-green-600" : "text-muted-foreground"}`}>
                  {quickCompleted ? "Completed ✓" : "Not completed"}
                </p>
              </div>
            </div>

            {/* Full Questionnaire Status */}
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              {fullCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <ClipboardList className="h-5 w-5 text-muted-foreground mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">Full Questionnaire</p>
                <p className="text-sm text-muted-foreground">Comprehensive assessment</p>
                <p className={`text-xs mt-1 ${fullCompleted ? "text-green-600" : "text-muted-foreground"}`}>
                  {fullCompleted ? "Completed ✓" : "Not completed"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questionnaire Forms */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Questionnaires</CardTitle>
          <CardDescription>Fill out one or both questionnaires below</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "quick" | "full")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick" className="relative">
                Quick Questionnaire
                {quickCompleted && (
                  <CheckCircle2 className="ml-2 h-4 w-4 text-green-600 absolute right-2 top-1/2 -translate-y-1/2" />
                )}
              </TabsTrigger>
              <TabsTrigger value="full" className="relative">
                Full Questionnaire
                {fullCompleted && (
                  <CheckCircle2 className="ml-2 h-4 w-4 text-green-600 absolute right-2 top-1/2 -translate-y-1/2" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="mt-6">
              <QuestionnaireFormWrapper
                type="quick"
                userId={userId}
                onComplete={(data) => setQuickQuestionnaireData(data)}
              />
            </TabsContent>

            <TabsContent value="full" className="mt-6">
              <QuestionnaireFormWrapper
                type="full"
                userId={userId}
                onComplete={(data) => setFullQuestionnaireData(data)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Download Section */}
      {canDownload && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>
              Download your personalized 40-page HOME BASED, BUSINESS & TAXATION ADVICE report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!quickCompleted || !fullCompleted ? (
              <Alert>
                <AlertDescription>
                  {!quickCompleted && !fullCompleted
                    ? "Complete at least one questionnaire to generate a report. For best results, complete both."
                    : quickCompleted && !fullCompleted
                      ? "Quick questionnaire completed! Complete the full questionnaire for a more comprehensive report."
                      : "Full questionnaire completed! Complete the quick questionnaire for additional insights."}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col items-start gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your report will include detailed tax advice, strategy recommendations, and compliance information
                  based on your responses.
                </p>
                <p className="text-sm font-medium">
                  Completed sections: {quickCompleted && "Quick Questionnaire"}
                  {quickCompleted && fullCompleted && " + "}
                  {fullCompleted && "Full Questionnaire"}
                </p>
              </div>

              <DownloadReportButton
                questionnaireData={combinedData}
                buttonText="Download 40-Page Report"
                size="lg"
                className="w-full sm:w-auto"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface QuestionnaireFormWrapperProps {
  type: "quick" | "full"
  userId: string
  onComplete: (data: Record<string, any>) => void
}

function QuestionnaireFormWrapper({ type, userId, onComplete }: QuestionnaireFormWrapperProps) {
  if (type === "quick") {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            This is a simplified questionnaire form. Import and integrate your actual questionnaire form components
            here.
          </AlertDescription>
        </Alert>
        <p className="text-sm text-muted-foreground">
          To integrate: Import your <code>QuestionnaireForm</code> component and pass the <code>onComplete</code>{" "}
          callback to capture form data when submitted.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          This is the comprehensive questionnaire form. Import and integrate your actual full questionnaire form here.
        </AlertDescription>
      </Alert>
      <p className="text-sm text-muted-foreground">
        To integrate: Import your <code>QuestionnaireFormFull</code> component and pass the <code>onComplete</code>{" "}
        callback to capture form data when submitted.
      </p>
    </div>
  )
}

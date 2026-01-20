"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, Mail, FileText, Users, Target } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MailMergeContentProps {
  practiceClients: any[]
  prospects: any[]
  clientGroups: any[]
}

export function MailMergeContent({ practiceClients, prospects, clientGroups }: MailMergeContentProps) {
  const [exportType, setExportType] = useState<"practice_clients" | "prospects" | "custom">("practice_clients")
  const [selectedGroup, setSelectedGroup] = useState<string>("all")
  const [selectedClientType, setSelectedClientType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [templateType, setTemplateType] = useState<string>("general")
  const [includeQuestionnaire, setIncludeQuestionnaire] = useState(false)
  const [includePurchase, setIncludePurchase] = useState(false)

  const handleExport = async () => {
    const params = new URLSearchParams({
      type: exportType,
      group: selectedGroup,
      client_type: selectedClientType,
      status: selectedStatus,
      template: templateType,
      include_questionnaire: includeQuestionnaire.toString(),
      include_purchase: includePurchase.toString(),
    })

    window.location.href = `/api/mail-merge/export?${params.toString()}`
  }

  const getFilteredCount = () => {
    let clients = exportType === "practice_clients" ? practiceClients : exportType === "prospects" ? prospects : []

    if (selectedStatus !== "all") {
      clients = clients.filter((c) => c.status === selectedStatus)
    }

    if (selectedClientType !== "all" && exportType === "practice_clients") {
      clients = clients.filter((c) => c.client_type === selectedClientType)
    }

    if (selectedGroup !== "all" && exportType === "practice_clients") {
      clients = clients.filter((c) => c.client_group_members?.some((m: any) => m.group_id === selectedGroup))
    }

    return clients.length
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Instructions */}
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <strong>How to use with MS Outlook:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Configure your export options and click "Export for Outlook"</li>
              <li>Open the downloaded CSV file to verify the data</li>
              <li>
                In Outlook, go to{" "}
                <strong>
                  Mailings {">"} Start Mail Merge {">"} Letters
                </strong>{" "}
                (or Email Messages)
              </li>
              <li>
                Click <strong>Select Recipients {">"} Use an Existing List</strong> and select your CSV file
              </li>
              <li>
                Insert merge fields like {"{"}
                {"{"}Title{"}"}
                {"}"}, {"{"}
                {"{"}FirstName{"}"}
                {"}"}, {"{"}
                {"{"}Email{"}"}
                {"}"}, etc.
              </li>
              <li>
                Click <strong>Finish & Merge</strong> to send or print your personalized communications
              </li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Export Configuration</CardTitle>
            <CardDescription>Select which clients to include in your mail merge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Source</Label>
                <Select value={exportType} onValueChange={(v: any) => setExportType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practice_clients">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Practice Clients ({practiceClients.length})
                      </div>
                    </SelectItem>
                    <SelectItem value="prospects">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Prospects ({prospects.length})
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status Filter</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {exportType === "practice_clients" ? (
                      <>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {exportType === "practice_clients" && (
                <>
                  <div className="space-y-2">
                    <Label>Client Type</Label>
                    <Select value={selectedClientType} onValueChange={setSelectedClientType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="sole_trader">Sole Trader</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="trust">Trust</SelectItem>
                        <SelectItem value="smsf">SMSF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Client Group</Label>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
                        {clientGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.group_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label>Additional Fields</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="questionnaire"
                    checked={includeQuestionnaire}
                    onCheckedChange={(checked) => setIncludeQuestionnaire(!!checked)}
                  />
                  <Label htmlFor="questionnaire" className="font-normal cursor-pointer">
                    Include questionnaire data (income, marital status, children, etc.)
                  </Label>
                </div>
                {exportType === "practice_clients" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="purchase"
                      checked={includePurchase}
                      onCheckedChange={(checked) => setIncludePurchase(!!checked)}
                    />
                    <Label htmlFor="purchase" className="font-normal cursor-pointer">
                      Include purchase information (amount, date, payment details)
                    </Label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm font-medium">Records to export:</p>
                <p className="text-2xl font-bold text-primary">{getFilteredCount()}</p>
              </div>
              <Button onClick={handleExport} size="lg">
                <Download className="h-4 w-4 mr-2" />
                Export for Outlook
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mail Merge Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Pre-made Mail Merge Templates</CardTitle>
            <CardDescription>Download Word templates designed for common communications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4 justify-start bg-transparent" asChild>
                <a href="/api/mail-merge/template?type=tax_reminder" download>
                  <FileText className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">Tax Return Reminder</div>
                    <div className="text-xs text-muted-foreground">Annual tax lodgment notification</div>
                  </div>
                </a>
              </Button>

              <Button variant="outline" className="h-auto py-4 justify-start bg-transparent" asChild>
                <a href="/api/mail-merge/template?type=compliance_deadline" download>
                  <FileText className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">Compliance Deadline</div>
                    <div className="text-xs text-muted-foreground">ATO due dates and obligations</div>
                  </div>
                </a>
              </Button>

              <Button variant="outline" className="h-auto py-4 justify-start bg-transparent" asChild>
                <a href="/api/mail-merge/template?type=new_client_welcome" download>
                  <FileText className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">New Client Welcome</div>
                    <div className="text-xs text-muted-foreground">Onboarding letter template</div>
                  </div>
                </a>
              </Button>

              <Button variant="outline" className="h-auto py-4 justify-start bg-transparent" asChild>
                <a href="/api/mail-merge/template?type=quarterly_update" download>
                  <FileText className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">Quarterly Update</div>
                    <div className="text-xs text-muted-foreground">Regular client communications</div>
                  </div>
                </a>
              </Button>

              <Button variant="outline" className="h-auto py-4 justify-start bg-transparent" asChild>
                <a href="/api/mail-merge/template?type=fee_structure" download>
                  <FileText className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">Fee Structure Notice</div>
                    <div className="text-xs text-muted-foreground">Service pricing information</div>
                  </div>
                </a>
              </Button>

              <Button variant="outline" className="h-auto py-4 justify-start bg-transparent" asChild>
                <a href="/api/mail-merge/template?type=engagement_letter" download>
                  <FileText className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">Engagement Letter</div>
                    <div className="text-xs text-muted-foreground">Terms of service agreement</div>
                  </div>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Field Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Merge Field Reference</CardTitle>
            <CardDescription>Available fields for your Outlook mail merge documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Basic Fields</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <Badge variant="outline" className="font-mono text-xs mr-2">
                      ClientName
                    </Badge>
                    <span className="text-muted-foreground">Full name</span>
                  </div>
                  <div>
                    <Badge variant="outline" className="font-mono text-xs mr-2">
                      Email
                    </Badge>
                    <span className="text-muted-foreground">Email address</span>
                  </div>
                  <div>
                    <Badge variant="outline" className="font-mono text-xs mr-2">
                      Phone
                    </Badge>
                    <span className="text-muted-foreground">Phone number</span>
                  </div>
                  <div>
                    <Badge variant="outline" className="font-mono text-xs mr-2">
                      ClientType
                    </Badge>
                    <span className="text-muted-foreground">Individual, Company, etc.</span>
                  </div>
                  <div>
                    <Badge variant="outline" className="font-mono text-xs mr-2">
                      Status
                    </Badge>
                    <span className="text-muted-foreground">Active, Inactive, etc.</span>
                  </div>
                  <div>
                    <Badge variant="outline" className="font-mono text-xs mr-2">
                      ClientSince
                    </Badge>
                    <span className="text-muted-foreground">Date joined</span>
                  </div>
                </div>
              </div>

              {includeQuestionnaire && (
                <div>
                  <h4 className="font-semibold mb-2">Questionnaire Fields</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <Badge variant="outline" className="font-mono text-xs mr-2">
                        MaritalStatus
                      </Badge>
                    </div>
                    <div>
                      <Badge variant="outline" className="font-mono text-xs mr-2">
                        AnnualIncome
                      </Badge>
                    </div>
                    <div>
                      <Badge variant="outline" className="font-mono text-xs mr-2">
                        NumChildren
                      </Badge>
                    </div>
                    <div>
                      <Badge variant="outline" className="font-mono text-xs mr-2">
                        EmploymentStatus
                      </Badge>
                    </div>
                    <div>
                      <Badge variant="outline" className="font-mono text-xs mr-2">
                        GSTRegistered
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {includePurchase && exportType === "practice_clients" && (
                <div>
                  <h4 className="font-semibold mb-2">Purchase Fields</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <Badge variant="outline" className="font-mono text-xs mr-2">
                        PurchaseDate
                      </Badge>
                    </div>
                    <div>
                      <Badge variant="outline" className="font-mono text-xs mr-2">
                        PurchaseAmount
                      </Badge>
                    </div>
                    <div>
                      <Badge variant="outline" className="font-mono text-xs mr-2">
                        ReportType
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

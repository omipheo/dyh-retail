import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConsentManager } from '@/components/consent-manager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, FileText, AlertTriangle, Lock } from 'lucide-react'

export default async function CompliancePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Privacy & Compliance</h1>
        <p className="text-muted-foreground mt-2">
          Australian regulatory compliance and data protection
        </p>
      </div>

      {/* Regulatory Compliance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Privacy Act 1988</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">APPs</div>
            <p className="text-xs text-muted-foreground">
              13 Australian Privacy Principles compliant
            </p>
            <Badge variant="outline" className="mt-2">
              Compliant
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ATO Requirements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Years</div>
            <p className="text-xs text-muted-foreground">
              Tax record retention period
            </p>
            <Badge variant="outline" className="mt-2">
              Enforced
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Security</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AES-256</div>
            <p className="text-xs text-muted-foreground">
              Encryption at rest and in transit
            </p>
            <Badge variant="outline" className="mt-2">
              Active
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Consent Management */}
      <Suspense fallback={<div>Loading...</div>}>
        <ConsentManager />
      </Suspense>

      {/* Compliance Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Regulatory Compliance</CardTitle>
          </div>
          <CardDescription>
            How we comply with Australian tax and privacy regulations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2">Tax Practitioners Board (TPB)</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>All tax agents verified with TPB registration numbers</li>
              <li>Professional indemnity insurance ($1.5M minimum) validated</li>
              <li>Code of Professional Conduct enforced</li>
              <li>Continuing Professional Development (CPD) tracking</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">Australian Taxation Office (ATO)</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Tax File Numbers (TFN) encrypted with AES-256</li>
              <li>5-year record retention for tax documents</li>
              <li>Secure transmission of tax data</li>
              <li>Compliance with digital security obligations</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">
              Australian Securities & Investments Commission (ASIC)
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Cyber resilience framework implemented</li>
              <li>Incident response procedures in place</li>
              <li>Regular security assessments conducted</li>
              <li>Third-party risk management</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">Notifiable Data Breaches (NDB) Scheme</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Automated breach detection and logging</li>
              <li>30-day notification to OAIC for eligible breaches</li>
              <li>Affected individuals notified promptly</li>
              <li>Comprehensive incident response plan</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Data Rights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>Your Data Rights</CardTitle>
          </div>
          <CardDescription>Rights under Australian Privacy Law</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Right to Access:</strong> Request a copy of your personal information
            </div>
            <div>
              <strong>Right to Correction:</strong> Request corrections to inaccurate data
            </div>
            <div>
              <strong>Right to Erasure:</strong> Request deletion of your data (subject to legal
              retention requirements)
            </div>
            <div>
              <strong>Right to Data Portability:</strong> Receive your data in a structured format
            </div>
            <div>
              <strong>Right to Object:</strong> Object to certain types of data processing
            </div>
            <div>
              <strong>Right to Complain:</strong> Lodge complaints with the Office of the Australian
              Information Commissioner (OAIC)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

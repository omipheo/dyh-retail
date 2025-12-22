'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, CheckCircle2, XCircle } from 'lucide-react'

interface Consent {
  id: string
  consent_type: string
  consent_given: boolean
  consent_date: string | null
  purpose: string
}

const CONSENT_DETAILS = {
  data_collection: {
    title: 'Data Collection',
    description: 'We collect your personal and financial information to provide tax deduction calculations.',
    purpose: 'Processing tax calculations and assessments',
  },
  data_processing: {
    title: 'Data Processing',
    description: 'We process your information to generate accurate tax deduction reports.',
    purpose: 'Automated tax calculation and report generation',
  },
  data_disclosure: {
    title: 'Data Disclosure to Tax Agent',
    description: 'Your data may be shared with your registered tax agent if you work with one.',
    purpose: 'Facilitating tax agent-client relationship',
  },
  marketing: {
    title: 'Marketing Communications',
    description: 'Receive updates about tax tips, new features, and service improvements.',
    purpose: 'Service updates and tax education',
  },
}

export function ConsentManager() {
  const [consents, setConsents] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchConsents()
  }, [])

  async function fetchConsents() {
    try {
      const response = await fetch('/api/compliance/consent')
      const data = await response.json()

      if (data.consents) {
        const consentMap: Record<string, boolean> = {}
        data.consents.forEach((c: Consent) => {
          consentMap[c.consent_type] = c.consent_given
        })
        setConsents(consentMap)
      }
    } catch (error) {
      console.error('Failed to fetch consents:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateConsent(consentType: string, given: boolean) {
    setSaving(true)
    setMessage(null)

    try {
      const details = CONSENT_DETAILS[consentType as keyof typeof CONSENT_DETAILS]
      const response = await fetch('/api/compliance/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentType,
          consentGiven: given,
          purpose: details.purpose,
        }),
      })

      if (response.ok) {
        setConsents(prev => ({ ...prev, [consentType]: given }))
        setMessage({ type: 'success', text: 'Consent preferences updated' })
      } else {
        throw new Error('Failed to update consent')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update consent preferences' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading consent preferences...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Privacy & Consent Management</CardTitle>
        </div>
        <CardDescription>
          Manage your data privacy preferences in accordance with the Australian Privacy Principles (APPs)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {Object.entries(CONSENT_DETAILS).map(([key, details]) => (
          <div key={key} className="flex items-start space-x-3 rounded-lg border p-4">
            <Checkbox
              id={key}
              checked={consents[key] || false}
              onCheckedChange={(checked) => updateConsent(key, checked as boolean)}
              disabled={saving || (key === 'data_collection' && consents[key])} // Can't revoke core consent while using service
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor={key}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {details.title}
              </Label>
              <p className="text-sm text-muted-foreground">{details.description}</p>
              <p className="text-xs text-muted-foreground italic">Purpose: {details.purpose}</p>
            </div>
          </div>
        ))}

        <Alert>
          <AlertDescription className="text-xs">
            <strong>Your Rights:</strong> Under the Privacy Act 1988, you have the right to access,
            correct, and delete your personal information. You can withdraw consent at any time
            (except for data_collection which is required for service provision). For data deletion
            requests, please contact our privacy officer.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

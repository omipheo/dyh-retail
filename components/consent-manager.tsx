"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConsentRecord {
  id: string
  consent_type: string
  purpose: string
  granted: boolean
  granted_at: string | null
  revoked_at: string | null
  expiry_date: string | null
  version: string
  created_at: string
}

const consentTypes = [
  {
    type: "data_collection",
    title: "Data Collection",
    description: "Consent to collect personal and financial information for tax assessment purposes",
    required: true,
  },
  {
    type: "data_processing",
    title: "Data Processing",
    description: "Consent to process your data to generate reports and tax calculations",
    required: true,
  },
  {
    type: "data_sharing",
    title: "Data Sharing with Tax Agents",
    description: "Consent to share your information with registered tax agents",
    required: false,
  },
  {
    type: "analytics",
    title: "Analytics",
    description: "Consent to use anonymized data for improving our services",
    required: false,
  },
  {
    type: "marketing",
    title: "Marketing Communications",
    description: "Consent to receive updates and promotional materials",
    required: false,
  },
]

export function ConsentManager() {
  const [consents, setConsents] = useState<Record<string, ConsentRecord | null>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadConsents()
  }, [])

  async function loadConsents() {
    try {
      setIsLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("Not authenticated")
        return
      }

      const { data, error: fetchError } = await supabase
        .from("consent_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      // Map consents by type (latest record per type)
      const consentMap: Record<string, ConsentRecord | null> = {}
      consentTypes.forEach((ct) => {
        const record = data?.find((c) => c.consent_type === ct.type)
        consentMap[ct.type] = record || null
      })

      setConsents(consentMap)
    } catch (err) {
      console.error("[v0] Error loading consents:", err)
      setError("Failed to load consent records")
    } finally {
      setIsLoading(false)
    }
  }

  async function updateConsent(consentType: string, granted: boolean, purpose: string) {
    try {
      setIsSaving(consentType)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("Not authenticated")
        return
      }

      const now = new Date().toISOString()

      const { data, error: insertError } = await supabase
        .from("consent_records")
        .insert({
          user_id: user.id,
          consent_type: consentType,
          purpose,
          granted,
          granted_at: granted ? now : null,
          revoked_at: granted ? null : now,
          version: "1.0",
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Update local state
      setConsents((prev) => ({
        ...prev,
        [consentType]: data,
      }))
    } catch (err) {
      console.error("[v0] Error updating consent:", err)
      setError("Failed to update consent. Please try again.")
    } finally {
      setIsSaving(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consent Management</CardTitle>
          <CardDescription>Loading your consent preferences...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consent Management</CardTitle>
        <CardDescription>
          Manage your data processing consents under Australian Privacy Principles (APPs)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have the right to grant, modify, or revoke consent at any time. Required consents are necessary for core
            functionality.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {consentTypes.map((consentType) => {
            const record = consents[consentType.type]
            const isGranted = record?.granted ?? false
            const isSavingThis = isSaving === consentType.type

            return (
              <div key={consentType.type} className="flex items-start justify-between space-x-4 rounded-lg border p-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={consentType.type} className="text-base font-medium">
                      {consentType.title}
                    </Label>
                    {consentType.required && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{consentType.description}</p>
                  {record && (
                    <div className="flex items-center gap-2 pt-1">
                      {isGranted ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-gray-400" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {isGranted
                          ? `Granted on ${new Date(record.granted_at!).toLocaleDateString()}`
                          : record.revoked_at
                            ? `Revoked on ${new Date(record.revoked_at).toLocaleDateString()}`
                            : "Not granted"}
                      </span>
                    </div>
                  )}
                </div>
                <Switch
                  id={consentType.type}
                  checked={isGranted}
                  disabled={isSavingThis || (consentType.required && isGranted)}
                  onCheckedChange={(checked) => updateConsent(consentType.type, checked, consentType.description)}
                />
              </div>
            )
          })}
        </div>

        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-medium">Your Rights:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Request a copy of all consent records</li>
            <li>Withdraw consent at any time (subject to legal obligations)</li>
            <li>Complain to the Office of the Australian Information Commissioner (OAIC)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

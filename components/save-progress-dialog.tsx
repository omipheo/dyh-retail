"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Copy, CheckCircle2 } from "lucide-react"
import { saveFormSession } from "@/lib/form-session"

interface SaveProgressDialogProps {
  email: string
  questionnaireType: string
  formData: Record<string, any>
  currentStep: number
  existingToken?: string
  onSaved?: (token: string) => void
}

export function SaveProgressDialog({
  email,
  questionnaireType,
  formData,
  currentStep,
  existingToken,
  onSaved,
}: SaveProgressDialogProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedToken, setSavedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editableEmail, setEditableEmail] = useState(email)

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const result = await saveFormSession(editableEmail, questionnaireType, formData, currentStep, existingToken)

    if (result.success && result.token) {
      setSavedToken(result.token)
      onSaved?.(result.token)
    } else {
      setError(result.error || "Failed to save progress")
    }

    setSaving(false)
  }

  const handleCopy = () => {
    if (savedToken) {
      navigator.clipboard.writeText(savedToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSavedToken(null)
    setCopied(false)
    setError(null)
    setEditableEmail(email)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Save className="h-4 w-4" />
          Save & Continue Later
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Your Progress</DialogTitle>
          <DialogDescription>
            Save your progress and return later to complete the questionnaire. We'll generate a secure access code for
            you.
          </DialogDescription>
        </DialogHeader>

        {!savedToken ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={editableEmail}
                onChange={(e) => setEditableEmail(e.target.value)}
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground mt-1">Your progress will be saved to this email address</p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button onClick={handleSave} disabled={saving || !editableEmail} className="w-full">
              {saving ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="font-semibold text-green-900">Progress Saved Successfully!</p>
              </div>
              <p className="text-sm text-green-800">Your access code has been generated.</p>
            </div>

            <div>
              <Label htmlFor="access-code">Your Access Code</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="access-code"
                  value={savedToken}
                  readOnly
                  className="font-mono text-lg text-center tracking-wider"
                />
                <Button onClick={handleCopy} variant="outline" size="icon">
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Keep this code safe. You'll need it to resume your progress.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Important:</strong> This code expires in 30 days. Make sure to complete your questionnaire
                before then.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

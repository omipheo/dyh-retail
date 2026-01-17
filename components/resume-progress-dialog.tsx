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
import { RotateCcw } from "lucide-react"
import { loadFormSession } from "@/lib/form-session"

interface ResumeProgressDialogProps {
  onResumed: (formData: Record<string, any>, currentStep: number, token: string) => void
}

export function ResumeProgressDialog({ onResumed }: ResumeProgressDialogProps) {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResume = async () => {
    if (!token.trim()) {
      setError("Please enter your access code")
      return
    }

    setLoading(true)
    setError(null)

    const result = await loadFormSession(token.trim())

    if (result.success && result.session) {
      onResumed(result.session.form_data, result.session.current_step, result.session.session_token)
      setOpen(false)
      setToken("")
    } else {
      setError(result.error || "Invalid access code")
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <RotateCcw className="h-4 w-4" />
          Resume Saved Progress
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resume Your Progress</DialogTitle>
          <DialogDescription>Enter your access code to continue where you left off.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="token">Access Code</Label>
            <Input
              id="token"
              placeholder="AB12-CD34"
              value={token}
              onChange={(e) => {
                setToken(e.target.value.toUpperCase())
                setError(null)
              }}
              className="font-mono text-lg text-center tracking-wider"
              maxLength={9}
            />
            <p className="text-sm text-muted-foreground mt-1">Enter the 8-character code you received when you saved</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button onClick={handleResume} disabled={loading || !token} className="w-full">
            {loading ? "Loading..." : "Resume Progress"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

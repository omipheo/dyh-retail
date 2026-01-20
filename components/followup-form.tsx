"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase-client"
import { Loader2 } from "lucide-react"

interface FollowUpFormProps {
  clients: Array<{ id: string; full_name: string; email: string }>
  taxAgentId: string
}

export function FollowUpForm({ clients, taxAgentId }: FollowUpFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    clientId: "",
    subject: "",
    messageText: "",
    dueDate: "",
    priority: "normal",
    requiresDocuments: false,
    requiresSignature: false,
    requiresInformation: false,
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      // Create the follow-up
      const { data: followup, error: followupError } = await supabase
        .from("client_followups")
        .insert({
          tax_agent_id: taxAgentId,
          client_id: formData.clientId,
          subject: formData.subject,
          message_text: formData.messageText,
          due_date: formData.dueDate || null,
          priority: formData.priority,
          requires_documents: formData.requiresDocuments,
          requires_signature: formData.requiresSignature,
          requires_information: formData.requiresInformation,
          notes: formData.notes || null,
          status: "sent",
        })
        .select()
        .single()

      if (followupError) throw followupError

      if (followup) {
        const response = await fetch("/api/follow-ups/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followupId: followup.id }),
        })

        if (!response.ok) {
          console.error("[v0] Failed to send email notification")
          // Don't throw error - follow-up was created successfully
        }
      }

      router.push("/admin/follow-ups")
    } catch (err: any) {
      console.error("[v0] Error creating follow-up:", err)
      setError(err.message || "Failed to create follow-up")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Follow-Up Details</CardTitle>
        <CardDescription>
          Enter the details for the client follow-up request. An email with a secure link will be sent automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.full_name} ({client.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Additional documents required for tax return"
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.messageText}
              onChange={(e) => setFormData({ ...formData, messageText: e.target.value })}
              placeholder="Enter your message to the client..."
              rows={6}
              required
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <Label>What does the client need to provide?</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresDocuments"
                  checked={formData.requiresDocuments}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresDocuments: checked as boolean })}
                />
                <Label htmlFor="requiresDocuments" className="font-normal cursor-pointer">
                  Document Upload
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresSignature"
                  checked={formData.requiresSignature}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresSignature: checked as boolean })}
                />
                <Label htmlFor="requiresSignature" className="font-normal cursor-pointer">
                  Document Signing
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresInformation"
                  checked={formData.requiresInformation}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresInformation: checked as boolean })}
                />
                <Label htmlFor="requiresInformation" className="font-normal cursor-pointer">
                  Information Provision
                </Label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any internal notes about this follow-up..."
              rows={3}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Follow-Up
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

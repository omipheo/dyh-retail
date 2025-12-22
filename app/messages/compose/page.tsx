"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"

export default function ComposeMessagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const replyToId = searchParams.get("replyTo")

  const [formData, setFormData] = useState({
    subject: "",
    messageText: "",
    messageType: "general",
    priority: "normal",
    assessmentId: "",
    recipientId: "",
  })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError("")

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        router.push("/messages")
      } else {
        setError(data.error || "Failed to send message")
      }
    } catch (err) {
      setError("Failed to send message")
      console.error("[v0] Error sending message:", err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/messages">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Messages
          </Link>
        </Button>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
          <CardDescription>Send a message to a tax agent or client</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter message subject"
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="messageType">Message Type</Label>
                <Select
                  value={formData.messageType}
                  onValueChange={(value) => setFormData({ ...formData, messageType: value })}
                >
                  <SelectTrigger id="messageType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="client_query">Client Query</SelectItem>
                    <SelectItem value="tax_agent_response">Tax Agent Response</SelectItem>
                    <SelectItem value="system_alert">System Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessmentId">Assessment ID (Optional)</Label>
              <Input
                id="assessmentId"
                value={formData.assessmentId}
                onChange={(e) => setFormData({ ...formData, assessmentId: e.target.value })}
                placeholder="Link to specific assessment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageText">Message *</Label>
              <Textarea
                id="messageText"
                value={formData.messageText}
                onChange={(e) => setFormData({ ...formData, messageText: e.target.value })}
                placeholder="Enter your message here..."
                rows={10}
                required
              />
            </div>

            {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

            <div className="flex gap-4">
              <Button type="submit" disabled={sending}>
                <Send className="mr-2 h-4 w-4" />
                {sending ? "Sending..." : "Send Message"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/messages">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

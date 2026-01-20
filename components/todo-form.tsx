"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase-client"
import { Clock, Save } from "lucide-react"

interface TodoFormProps {
  clients: Array<{ id: string; full_name: string | null; email: string }>
  currentUserId: string
  initialData?: {
    id: string
    title: string
    description: string | null
    notes: string | null
    urgency: string
    client_id: string | null
    status: string
  }
}

export function TodoForm({ clients, currentUserId, initialData }: TodoFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    notes: initialData?.notes || "",
    urgency: initialData?.urgency || "24_hours",
    client_id: initialData?.client_id || "none",
    status: initialData?.status || "pending",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const todoData = {
        ...formData,
        assigned_by: currentUserId,
        client_id: formData.client_id === "none" ? null : formData.client_id,
      }

      if (initialData) {
        const { error } = await supabase.from("todos").update(todoData).eq("id", initialData.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("todos").insert([todoData])

        if (error) throw error
      }

      router.push("/admin/todos")
      router.refresh()
    } catch (error) {
      console.error("Error saving todo:", error)
      alert("Failed to save task. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? "Edit Task" : "New Task"}</CardTitle>
          <CardDescription>
            {initialData ? "Update task details and urgency" : "Create a new task with urgency level and notes"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Task Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">Assign to Client (Optional)</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => setFormData({ ...formData, client_id: value })}
            >
              <SelectTrigger id="client">
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No client (general task)</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.full_name || client.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Urgency Level with Radio Buttons */}
          <div className="space-y-3">
            <Label>
              Urgency Level <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.urgency}
              onValueChange={(value) => setFormData({ ...formData, urgency: value })}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors">
                  <RadioGroupItem value="8_hours" id="8_hours" />
                  <Label htmlFor="8_hours" className="font-normal cursor-pointer flex-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Within 8 hours</span>
                    <span className="text-sm text-muted-foreground">(Urgent)</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors">
                  <RadioGroupItem value="24_hours" id="24_hours" />
                  <Label htmlFor="24_hours" className="font-normal cursor-pointer flex-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Within 24 hours</span>
                    <span className="text-sm text-muted-foreground">(High priority)</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors">
                  <RadioGroupItem value="72_hours" id="72_hours" />
                  <Label htmlFor="72_hours" className="font-normal cursor-pointer flex-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Within 72 hours</span>
                    <span className="text-sm text-muted-foreground">(3 days)</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors">
                  <RadioGroupItem value="7_days" id="7_days" />
                  <Label htmlFor="7_days" className="font-normal cursor-pointer flex-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Within 7 days</span>
                    <span className="text-sm text-muted-foreground">(1 week)</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors">
                  <RadioGroupItem value="14_days" id="14_days" />
                  <Label htmlFor="14_days" className="font-normal cursor-pointer flex-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Within 14 days</span>
                    <span className="text-sm text-muted-foreground">(2 weeks)</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="font-normal cursor-pointer flex-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Other</span>
                    <span className="text-sm text-muted-foreground">(Custom timeframe)</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or context for this task..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Use this field to add context, reminders, or important details about the task.
            </p>
          </div>

          {/* Status (only show when editing) */}
          {initialData && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting || !formData.title} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : initialData ? "Update Task" : "Create Task"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

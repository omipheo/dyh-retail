"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function ManualTimestamp({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState("")
  const [customDate, setCustomDate] = useState("")
  const [customTime, setCustomTime] = useState("")
  const router = useRouter()

  const handleSubmit = async () => {
    if (!note.trim()) return

    setLoading(true)

    try {
      let timestamp = new Date()

      if (customDate && customTime) {
        timestamp = new Date(`${customDate}T${customTime}`)
      } else if (customDate) {
        timestamp = new Date(customDate)
      }

      const response = await fetch(`/api/practice-clients/${clientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note,
          custom_timestamp: timestamp.toISOString(),
        }),
      })

      if (response.ok) {
        setNote("")
        setCustomDate("")
        setCustomTime("")
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error adding timestamped note:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Add Timestamped Entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Timestamped Entry</DialogTitle>
          <DialogDescription>Create a manual timestamp entry for this client.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Enter your note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date (optional)</Label>
              <Input id="date" type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="time">Time (optional)</Label>
              <Input id="time" type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Leave date/time empty to use current time.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !note.trim()}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

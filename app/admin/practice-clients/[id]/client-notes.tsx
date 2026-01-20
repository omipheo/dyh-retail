"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ClientNote {
  id: string
  note_text: string
  created_at: string
  updated_at: string
}

interface ClientNotesProps {
  clientId: string
  initialNotes: ClientNote[]
}

export function ClientNotes({ clientId, initialNotes }: ClientNotesProps) {
  const router = useRouter()
  const [notes, setNotes] = useState<ClientNote[]>(initialNotes)
  const [newNote, setNewNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/practice-clients/${clientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_text: newNote }),
      })

      if (response.ok) {
        const { note } = await response.json()
        setNotes([note, ...notes])
        setNewNote("")
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to add note:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new note */}
        <div className="space-y-3">
          <Textarea
            placeholder="Add a new note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button onClick={handleAddNote} disabled={isSubmitting || !newNote.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </>
            )}
          </Button>
        </div>

        {/* Notes list */}
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border-l-4 border-primary pl-4 py-3 bg-muted/50 rounded-r-lg">
                <p className="text-sm whitespace-pre-wrap mb-2">{note.note_text}</p>
                <p className="text-xs text-muted-foreground">{formatDate(note.created_at)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No notes yet. Add your first note above.</p>
        )}
      </CardContent>
    </Card>
  )
}

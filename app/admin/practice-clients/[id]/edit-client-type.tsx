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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"

export function EditClientType({
  clientId,
  currentType,
}: {
  clientId: string
  currentType: string
}) {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState(currentType)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const clientTypes = ["individual", "sole_trader", "partnership", "company", "trust", "smsf"]

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/practice-clients/${clientId}/type`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientType: selectedType }),
      })

      if (!response.ok) throw new Error("Failed to update client type")

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating client type:", error)
      alert("Failed to update client type")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client Type</DialogTitle>
          <DialogDescription>Change the classification for this client</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Select client type" />
            </SelectTrigger>
            <SelectContent>
              {clientTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

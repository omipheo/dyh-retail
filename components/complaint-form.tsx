"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Save } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

interface ComplaintFormProps {
  initialData?: any
  clients: Array<{ id: string; full_name: string | null; email: string }>
  currentUserId: string
}

export function ComplaintForm({ initialData, clients, currentUserId }: ComplaintFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    complainant_first_name: initialData?.complainant_first_name || "",
    complainant_last_name: initialData?.complainant_last_name || "",
    complainant_email: initialData?.complainant_email || "",
    complainant_phone: initialData?.complainant_phone || "",
    client_id: initialData?.client_id || "",
    complaint_date: initialData?.complaint_date || new Date().toISOString().split("T")[0],
    complaint_details: initialData?.complaint_details || "",
    our_response: initialData?.our_response || "",
    response_date: initialData?.response_date || "",
    referred_to_tpb: initialData?.referred_to_tpb || false,
    tpb_reference_number: initialData?.tpb_reference_number || "",
    tpb_date: initialData?.tpb_date || "",
    referred_to_ipa: initialData?.referred_to_ipa || false,
    ipa_reference_number: initialData?.ipa_reference_number || "",
    ipa_date: initialData?.ipa_date || "",
    matter_in_litigation: initialData?.matter_in_litigation || false,
    litigation_details: initialData?.litigation_details || "",
    notes: initialData?.notes || "",
    status: initialData?.status || "open",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const dataToSubmit = {
        ...formData,
        client_id: formData.client_id || null,
        response_date: formData.response_date || null,
        tpb_date: formData.tpb_date || null,
        ipa_date: formData.ipa_date || null,
        assigned_to: currentUserId,
      }

      if (initialData) {
        const { error } = await supabase.from("complaints").update(dataToSubmit).eq("id", initialData.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("complaints").insert([dataToSubmit])

        if (error) throw error
      }

      router.push("/admin/complaints")
      router.refresh()
    } catch (error) {
      console.error("Error saving complaint:", error)
      alert("Failed to save complaint. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Complainant Information */}
        <Card>
          <CardHeader>
            <CardTitle>Complainant Information</CardTitle>
            <CardDescription>Details of the person making the complaint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="complainant_first_name">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="complainant_first_name"
                  placeholder="Enter first name"
                  value={formData.complainant_first_name}
                  onChange={(e) => setFormData({ ...formData, complainant_first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complainant_last_name">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="complainant_last_name"
                  placeholder="Enter last name"
                  value={formData.complainant_last_name}
                  onChange={(e) => setFormData({ ...formData, complainant_last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="complainant_email">Email</Label>
                <Input
                  id="complainant_email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.complainant_email}
                  onChange={(e) => setFormData({ ...formData, complainant_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complainant_phone">Phone</Label>
                <Input
                  id="complainant_phone"
                  type="tel"
                  placeholder="Phone number"
                  value={formData.complainant_phone}
                  onChange={(e) => setFormData({ ...formData, complainant_phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Associated Client (Optional)</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger id="client_id">
                  <SelectValue placeholder="Select a client (if applicable)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No associated client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name || client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaint Details */}
        <Card>
          <CardHeader>
            <CardTitle>Complaint Details</CardTitle>
            <CardDescription>Information about the complaint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="complaint_date">
                  Date of Complaint <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="complaint_date"
                  type="date"
                  value={formData.complaint_date}
                  onChange={(e) => setFormData({ ...formData, complaint_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint_details">
                Details of Complaint <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="complaint_details"
                placeholder="Describe the complaint in detail..."
                value={formData.complaint_details}
                onChange={(e) => setFormData({ ...formData, complaint_details: e.target.value })}
                rows={5}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Our Response */}
        <Card>
          <CardHeader>
            <CardTitle>Our Response</CardTitle>
            <CardDescription>Details of how we responded to the complaint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="our_response">Copy of Our Response</Label>
              <Textarea
                id="our_response"
                placeholder="Paste or type our response to the complainant..."
                value={formData.our_response}
                onChange={(e) => setFormData({ ...formData, our_response: e.target.value })}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="response_date">Response Date</Label>
              <Input
                id="response_date"
                type="date"
                value={formData.response_date}
                onChange={(e) => setFormData({ ...formData, response_date: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Referrals and Litigation */}
        <Card>
          <CardHeader>
            <CardTitle>Referrals & Litigation</CardTitle>
            <CardDescription>External escalation and legal matters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* TPB Referral */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="referred_to_tpb"
                  checked={formData.referred_to_tpb}
                  onCheckedChange={(checked) => setFormData({ ...formData, referred_to_tpb: checked as boolean })}
                />
                <Label htmlFor="referred_to_tpb" className="text-base font-semibold">
                  Referred to TPB (Tax Practitioners Board)
                </Label>
              </div>

              {formData.referred_to_tpb && (
                <div className="grid md:grid-cols-2 gap-4 ml-7">
                  <div className="space-y-2">
                    <Label htmlFor="tpb_reference_number">TPB Reference Number</Label>
                    <Input
                      id="tpb_reference_number"
                      placeholder="Enter TPB reference"
                      value={formData.tpb_reference_number}
                      onChange={(e) => setFormData({ ...formData, tpb_reference_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tpb_date">TPB Referral Date</Label>
                    <Input
                      id="tpb_date"
                      type="date"
                      value={formData.tpb_date}
                      onChange={(e) => setFormData({ ...formData, tpb_date: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* IPA Referral */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="referred_to_ipa"
                  checked={formData.referred_to_ipa}
                  onCheckedChange={(checked) => setFormData({ ...formData, referred_to_ipa: checked as boolean })}
                />
                <Label htmlFor="referred_to_ipa" className="text-base font-semibold">
                  Referred to IPA (Institute of Public Accountants)
                </Label>
              </div>

              {formData.referred_to_ipa && (
                <div className="grid md:grid-cols-2 gap-4 ml-7">
                  <div className="space-y-2">
                    <Label htmlFor="ipa_reference_number">IPA Reference Number</Label>
                    <Input
                      id="ipa_reference_number"
                      placeholder="Enter IPA reference"
                      value={formData.ipa_reference_number}
                      onChange={(e) => setFormData({ ...formData, ipa_reference_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ipa_date">IPA Referral Date</Label>
                    <Input
                      id="ipa_date"
                      type="date"
                      value={formData.ipa_date}
                      onChange={(e) => setFormData({ ...formData, ipa_date: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Litigation */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="matter_in_litigation"
                  checked={formData.matter_in_litigation}
                  onCheckedChange={(checked) => setFormData({ ...formData, matter_in_litigation: checked as boolean })}
                />
                <Label htmlFor="matter_in_litigation" className="text-base font-semibold">
                  Matter In Litigation
                </Label>
              </div>

              {formData.matter_in_litigation && (
                <div className="ml-7 space-y-2">
                  <Label htmlFor="litigation_details">Litigation Details</Label>
                  <Textarea
                    id="litigation_details"
                    placeholder="Provide details about the litigation (court, case number, status, etc.)"
                    value={formData.litigation_details}
                    onChange={(e) => setFormData({ ...formData, litigation_details: e.target.value })}
                    rows={4}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Additional internal notes and comments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any internal notes, follow-up actions, or additional context..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !formData.complainant_first_name ||
              !formData.complainant_last_name ||
              !formData.complaint_details
            }
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : initialData ? "Update Complaint" : "Save Complaint"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}

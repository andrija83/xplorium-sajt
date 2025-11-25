"use client"

import { useState } from "react"
import { FileText, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { updateCustomerNotes } from "@/app/actions/loyalty"

interface CustomerNotesCardProps {
  userId: string
  notes: string
}

export function CustomerNotesCard({ userId, notes }: CustomerNotesCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [notesValue, setNotesValue] = useState(notes)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const result = await updateCustomerNotes(userId, notesValue)

      if (result.success) {
        toast.success(result.message)
        setIsEditing(false)
      } else {
        toast.error(result.error || "Failed to update notes")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setNotesValue(notes)
    setIsEditing(false)
  }

  return (
    <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Admin Notes
        </h3>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            variant="ghost"
            className="text-cyan-400 hover:bg-cyan-400/10"
          >
            <Edit className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleCancel}
              size="sm"
              variant="ghost"
              className="text-red-400 hover:bg-red-400/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <Textarea
          value={notesValue}
          onChange={(e) => setNotesValue(e.target.value)}
          placeholder="Add notes about this customer (preferences, special requests, etc.)"
          className="bg-black/40 border-cyan-400/30 text-white min-h-[150px]"
        />
      ) : (
        <div className="text-sm text-cyan-100/70 whitespace-pre-wrap">
          {notes || (
            <span className="text-cyan-100/40 italic">
              No notes yet. Click edit to add notes about this customer.
            </span>
          )}
        </div>
      )}
    </div>
  )
}

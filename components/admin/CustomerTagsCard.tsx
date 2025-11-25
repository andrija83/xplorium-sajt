"use client"

import { useState } from "react"
import { Tag, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { addCustomerTag, removeCustomerTag } from "@/app/actions/loyalty"

interface CustomerTagsCardProps {
  userId: string
  tags: string[]
}

export function CustomerTagsCard({ userId, tags }: CustomerTagsCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddTag = async () => {
    if (!newTag.trim()) {
      toast.error("Please enter a tag name")
      return
    }

    setIsLoading(true)

    try {
      const result = await addCustomerTag(userId, newTag.trim())

      if (result.success) {
        toast.success(result.message)
        setNewTag("")
        setIsAdding(false)
      } else {
        toast.error(result.error || "Failed to add tag")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveTag = async (tag: string) => {
    setIsLoading(true)

    try {
      const result = await removeCustomerTag(userId, tag)

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error || "Failed to remove tag")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Customer Tags
        </h3>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            variant="ghost"
            className="text-cyan-400 hover:bg-cyan-400/10"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Add Tag Form */}
      {isAdding && (
        <div className="mb-4 space-y-2">
          <Input
            placeholder="Enter tag name"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            className="bg-black/40 border-cyan-400/30 text-white"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleAddTag}
              disabled={isLoading}
              size="sm"
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isLoading ? "Adding..." : "Add Tag"}
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false)
                setNewTag("")
              }}
              size="sm"
              variant="outline"
              className="border-cyan-400/30 text-cyan-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Tags List */}
      <div className="flex flex-wrap gap-2">
        {tags && tags.length > 0 ? (
          tags.map((tag, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-400/20 text-purple-400 border border-purple-400/30 text-sm group"
            >
              <Tag className="w-3 h-3" />
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                disabled={isLoading}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-sm text-cyan-100/40 py-4 text-center w-full">
            No tags yet. Add tags to categorize this customer.
          </div>
        )}
      </div>

      {/* Tag Suggestions */}
      {isAdding && (
        <div className="mt-4 pt-4 border-t border-cyan-400/10">
          <div className="text-xs font-medium text-cyan-100/60 mb-2">SUGGESTED TAGS</div>
          <div className="flex flex-wrap gap-2">
            {['vip', 'regular', 'party-regular', 'birthday-regular', 'high-value', 'new-customer'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setNewTag(suggestion)}
                className="px-2 py-1 rounded text-xs bg-purple-400/10 text-purple-400 border border-purple-400/20 hover:bg-purple-400/20 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

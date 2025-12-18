'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, X, Calendar, Clock, MapPin, Users, DollarSign, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createEvent, updateEvent } from '@/app/actions/events'
import { type CreateEventInput } from '@/lib/validations/events'
import { format } from 'date-fns'

/**
 * EventForm Component
 *
 * Form for creating/editing events
 * - Event details (title, description, date/time)
 * - Category selection
 * - Capacity and pricing
 * - Tags and location
 * - Status management
 */

interface EventFormProps {
  event?: any
  onSuccess?: () => void
  onCancel?: () => void
}

const EVENT_CATEGORIES = [
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'PARTY', label: 'Party' },
  { value: 'SPECIAL_EVENT', label: 'Special Event' },
  { value: 'HOLIDAY', label: 'Holiday' },
  { value: 'SEASONAL', label: 'Seasonal' },
  { value: 'CLASS', label: 'Class' },
  { value: 'TOURNAMENT', label: 'Tournament' },
  { value: 'OTHER', label: 'Other' }
] as const

const EVENT_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' }
] as const

const EVENT_THEMES = [
  { value: 'AUTO', label: 'Auto (from tags/category)' },
  { value: 'WINTER', label: '❄️ Winter' },
  { value: 'CHRISTMAS', label: '🎄 Christmas' },
  { value: 'HALLOWEEN', label: '🎃 Halloween' },
  { value: 'EASTER', label: '🐰 Easter' },
  { value: 'SUMMER', label: '☀️ Summer' },
  { value: 'SPACE', label: '🚀 Space' },
  { value: 'UNICORN', label: '🦄 Unicorn' },
  { value: 'DINOSAUR', label: '🦕 Dinosaur' },
  { value: 'DEFAULT', label: '🎉 Default (Party)' }
] as const

export function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: event?.title || '',
    slug: event?.slug || '',
    description: event?.description || '',
    date: event?.date ? format(new Date(event.date), 'yyyy-MM-dd') : '',
    time: event?.time || '10:00',
    endTime: event?.endTime || '',
    category: event?.category || 'WORKSHOP',
    status: event?.status || 'DRAFT',
    theme: event?.theme || 'AUTO',
    capacity: event?.capacity || '',
    price: event?.price || '',
    currency: event?.currency || 'RSD',
    location: event?.location || '',
    image: event?.image || '',
    tags: event?.tags?.join(', ') || '',
    isRecurring: event?.isRecurring || false,
    recurrenceRule: event?.recurrenceRule || ''
  })

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data: CreateEventInput = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        date: new Date(formData.date),
        time: formData.time,
        endTime: formData.endTime || null,
        category: formData.category as any,
        status: formData.status as any,
        theme: formData.theme === 'AUTO' ? null : formData.theme as any,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        price: formData.price ? parseFloat(formData.price) : null,
        currency: formData.currency,
        location: formData.location || null,
        image: formData.image || null,
        tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        isRecurring: formData.isRecurring,
        recurrenceRule: formData.recurrenceRule || null
      }

      const result = event
        ? await updateEvent(event.id, data)
        : await createEvent(data)

      if (result.success) {
        toast.success(result.message)
        onSuccess?.()
      } else {
        toast.error(result.error || 'Failed to save event')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-cyan-400">
            Event Title *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Birthday Party Bonanza"
            required
            className="bg-black/20 border-cyan-400/30 text-cyan-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug" className="text-cyan-400">
            Slug (URL) *
          </Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="birthday-party-bonanza"
            required
            className="bg-black/20 border-cyan-400/30 text-cyan-100"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-cyan-400">
          Description *
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="A fun-filled birthday celebration with games, activities, and more..."
          required
          rows={4}
          className="bg-black/20 border-cyan-400/30 text-cyan-100"
        />
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-cyan-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date *
          </Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
            className="bg-black/20 border-cyan-400/30 text-cyan-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time" className="text-cyan-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Start Time *
          </Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            required
            className="bg-black/20 border-cyan-400/30 text-cyan-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime" className="text-cyan-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            End Time
          </Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
            className="bg-black/20 border-cyan-400/30 text-cyan-100"
          />
        </div>
      </div>

      {/* Category & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-cyan-400">
            Category *
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="bg-black/20 border-cyan-400/30 text-cyan-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-cyan-400">
            Status *
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="bg-black/20 border-cyan-400/30 text-cyan-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="space-y-2">
        <Label htmlFor="theme" className="text-cyan-400">
          Card Theme
        </Label>
        <Select
          value={formData.theme}
          onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
        >
          <SelectTrigger className="bg-black/20 border-cyan-400/30 text-cyan-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_THEMES.map(theme => (
              <SelectItem key={theme.value} value={theme.value}>
                {theme.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-cyan-100/50">
          Choose the visual theme for the event card animations. "Auto" will determine theme from tags/category.
        </p>
      </div>

      {/* Capacity & Price */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity" className="text-cyan-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Capacity
          </Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
            placeholder="30"
            className="bg-black/20 border-cyan-400/30 text-cyan-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-cyan-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Price
          </Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
            className="bg-black/20 border-cyan-400/30 text-cyan-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency" className="text-cyan-400">
            Currency
          </Label>
          <Input
            id="currency"
            value={formData.currency}
            onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
            placeholder="RSD"
            maxLength={3}
            className="bg-black/20 border-cyan-400/30 text-cyan-100"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-cyan-400 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location
        </Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="Xplorium Main Hall"
          className="bg-black/20 border-cyan-400/30 text-cyan-100"
        />
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <Label htmlFor="image" className="text-cyan-400">
          Image URL
        </Label>
        <Input
          id="image"
          type="url"
          value={formData.image}
          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
          placeholder="https://example.com/image.jpg"
          className="bg-black/20 border-cyan-400/30 text-cyan-100"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags" className="text-cyan-400 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Tags (comma-separated)
        </Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="birthday, kids, fun, games"
          className="bg-black/20 border-cyan-400/30 text-cyan-100"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
    </motion.form>
  )
}

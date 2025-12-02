"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Calendar as CalendarIcon, LayoutList, MapPin, Edit, Trash2, Eye, EyeOff, Archive, Loader2, Send, Users } from "lucide-react"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { EventCalendar } from "@/components/admin/EventCalendar"
import { EventForm } from "@/components/admin/EventForm"
import { getEvents, deleteEvent, publishEvent, archiveEvent } from "@/app/actions/events"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import Link from "next/link"
import { logger } from "@/lib/logger"

/**
 * Events Management Page
 *
 * Features:
 * - List all events
 * - Filter by status and category
 * - Search by title
 * - Create new event
 * - Edit/Delete actions
 */

interface Event {
  id: string
  title: string
  slug: string
  date: Date
  time: string
  endTime?: string
  category: string
  status: string
  capacity?: number
  registeredCount: number
  image: string | null
  createdAt: Date
  _count?: { attendees: number }
}

const STATUS_COLORS = {
  DRAFT: "bg-yellow-400/20 text-yellow-400 border-yellow-400/50",
  PUBLISHED: "bg-green-400/20 text-green-400 border-green-400/50",
  CANCELLED: "bg-red-400/20 text-red-400 border-red-400/50",
  COMPLETED: "bg-blue-400/20 text-blue-400 border-blue-400/50",
  ARCHIVED: "bg-gray-400/20 text-gray-400 border-gray-400/50",
}

function EventsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table')
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")

  // Fetch events
  const fetchEvents = async (page = 1) => {
    try {
      setIsLoading(true)

      const result = await getEvents({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
        search: searchQuery || undefined,
        limit: pagination.limit,
        offset: (page - 1) * pagination.limit,
      })

      if (result.success && result.events) {
        setEvents(result.events as Event[])
        const total = result.total || 0
        setPagination(prev => ({
          ...prev,
          page,
          total,
          totalPages: Math.ceil(total / prev.limit),
        }))
      }
    } catch (error) {
      logger.error("Failed to fetch events", error instanceof Error ? error : new Error(String(error)))
      toast.error("Failed to load events")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents(1)
  }, [statusFilter, categoryFilter])

  // Handle search
  const handleSearch = () => {
    fetchEvents(1)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchEvents(page)
  }

  // Handle delete
  const handleDelete = async (event: Event) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) return

    try {
      const result = await deleteEvent(event.id)
      if (result.success) {
        toast.success("Event deleted successfully")
        fetchEvents(pagination.page)
      } else {
        toast.error(result.error || "Failed to delete event")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  // Handle publish
  const handlePublish = async (event: Event) => {
    try {
      const result = await publishEvent(event.id)
      if (result.success) {
        toast.success("Event published successfully")
        fetchEvents(pagination.page)
      } else {
        toast.error(result.error || "Failed to publish event")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  // Handle archive
  const handleArchive = async (event: Event) => {
    if (!confirm(`Archive "${event.title}"?`)) return

    try {
      const result = await archiveEvent(event.id)
      if (result.success) {
        toast.success("Event archived successfully")
        fetchEvents(pagination.page)
      } else {
        toast.error(result.error || "Failed to archive event")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  // Handle edit
  const handleEdit = (event: Event) => {
    setSelectedEvent(event)
    setShowEventForm(true)
  }

  // Handle row click
  const handleRowClick = (event: Event) => {
    handleEdit(event)
  }

  // Table columns
  const columns: Column<Event>[] = [
    {
      header: "Event",
      accessor: (event) => (
        <div className="flex items-center gap-3">
          {event.image ? (
            <div className="w-10 h-10 rounded-lg bg-cyan-400/10 overflow-hidden">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="font-medium text-cyan-300">{event.title}</div>
            <div className="text-xs text-cyan-100/50">/{event.slug}</div>
          </div>
        </div>
      ),
      width: "w-64",
    },
    {
      header: "Date & Time",
      accessor: (event) => (
        <div>
          <div className="font-medium text-cyan-300">
            {format(new Date(event.date), "MMM dd, yyyy")}
          </div>
          <div className="text-xs text-cyan-100/50">
            {event.time}{event.endTime && ` - ${event.endTime}`}
          </div>
        </div>
      ),
      width: "w-40",
    },
    {
      header: "Category",
      accessor: (event) => (
        <span className="text-cyan-100/70 capitalize text-sm">
          {event.category.replace('_', ' ')}
        </span>
      ),
      width: "w-32",
    },
    {
      header: "Attendees",
      accessor: (event) => {
        const count = event._count?.attendees || event.registeredCount
        const isFull = event.capacity && count >= event.capacity
        return (
          <div className="flex items-center gap-1 text-sm">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className={cn(
              "font-medium",
              isFull ? "text-red-400" : "text-cyan-300"
            )}>
              {count}
              {event.capacity && `/${event.capacity}`}
            </span>
          </div>
        )
      },
      width: "w-24",
      center: true,
    },
    {
      header: "Status",
      accessor: (event) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border",
            STATUS_COLORS[event.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.DRAFT
          )}
        >
          {event.status === "DRAFT" && <EyeOff className="w-3 h-3" />}
          {event.status === "PUBLISHED" && <Eye className="w-3 h-3" />}
          {event.status === "ARCHIVED" && <Archive className="w-3 h-3" />}
          {event.status}
        </span>
      ),
      width: "w-32",
      center: true,
    },
    {
      header: "Actions",
      accessor: (event) => (
        <div className="flex items-center justify-end gap-1">
          {event.status === 'DRAFT' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-400/10"
              onClick={(e) => {
                e.stopPropagation()
                handlePublish(event)
              }}
              title="Publish"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(event)
            }}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(event)
            }}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      width: "w-32",
      center: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">
            Events Management
          </h1>
          <p className="text-sm text-cyan-100/60 mt-1">
            Workshops, parties, and special events ({pagination.total} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border border-cyan-400/30 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('table')}
              className={cn(
                "rounded-none",
                viewMode === 'table'
                  ? "bg-cyan-500 text-black hover:bg-cyan-600"
                  : "text-cyan-400 hover:bg-cyan-400/10"
              )}
            >
              <LayoutList className="w-4 h-4 mr-2" />
              Table
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={cn(
                "rounded-none",
                viewMode === 'calendar'
                  ? "bg-cyan-500 text-black hover:bg-cyan-600"
                  : "text-cyan-400 hover:bg-cyan-400/10"
              )}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </Button>
          </div>

          <Button
            onClick={() => {
              setSelectedEvent(null)
              setShowEventForm(true)
            }}
            className="bg-cyan-500 hover:bg-cyan-600 text-black gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-black/40 border-cyan-400/30 text-white
                           placeholder:text-cyan-100/30 focus:border-cyan-400"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Search
            </Button>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-black/40 border-cyan-400/30 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 bg-black/40 border-cyan-400/30 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="WORKSHOP">Workshop</SelectItem>
              <SelectItem value="PARTY">Party</SelectItem>
              <SelectItem value="SPECIAL_EVENT">Special Event</SelectItem>
              <SelectItem value="HOLIDAY">Holiday</SelectItem>
              <SelectItem value="SEASONAL">Seasonal</SelectItem>
              <SelectItem value="CLASS">Class</SelectItem>
              <SelectItem value="TOURNAMENT">Tournament</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Table or Calendar View */}
      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DataTable
              data={events}
              columns={columns}
              pagination={pagination}
              onPageChange={handlePageChange}
              isLoading={isLoading}
              emptyMessage="No events found"
              onRowClick={handleRowClick}
            />
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EventCalendar
              events={events}
              onEventClick={handleEdit}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPublish={handlePublish}
              onArchive={handleArchive}
              onDateClick={() => {
                setSelectedEvent(null)
                setShowEventForm(true)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Form Dialog */}
      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 border-2 border-cyan-400/40">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-cyan-400">
              {selectedEvent ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
          </DialogHeader>
          <EventForm
            event={selectedEvent}
            onSuccess={() => {
              setShowEventForm(false)
              setSelectedEvent(null)
              fetchEvents(pagination.page)
            }}
            onCancel={() => {
              setShowEventForm(false)
              setSelectedEvent(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    }>
      <EventsContent />
    </Suspense>
  )
}

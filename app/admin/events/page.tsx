"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Plus, Calendar, MapPin, Edit, Trash2, Eye, EyeOff, Archive, Loader2 } from "lucide-react"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { getEvents, deleteEvent } from "@/app/actions/events"
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
import { toast } from "sonner"
import Link from "next/link"

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
  category: string
  status: string
  image: string | null
  createdAt: Date
}

const STATUS_COLORS = {
  DRAFT: "bg-yellow-400/20 text-yellow-400 border-yellow-400/50",
  PUBLISHED: "bg-green-400/20 text-green-400 border-green-400/50",
  ARCHIVED: "bg-gray-400/20 text-gray-400 border-gray-400/50",
}

function EventsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
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
        // Note: Pagination not fully implemented in getEvents yet, mocking total for now
        // In a real app, getEvents should return total count
        setPagination(prev => ({
          ...prev,
          page,
          total: result.events?.length || 0, // This should be total count from DB
          totalPages: 1, // This should be calculated from total count
        }))
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
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
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent row click
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const result = await deleteEvent(id)
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

  // Handle row click
  const handleRowClick = (event: Event) => {
    router.push(`/admin/events/${event.id}/edit`)
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
              <Calendar className="w-5 h-5" />
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
          <div className="text-xs text-cyan-100/50">{event.time}</div>
        </div>
      ),
      width: "w-32",
    },
    {
      header: "Category",
      accessor: (event) => (
        <span className="text-cyan-100/70 capitalize">
          {event.category}
        </span>
      ),
      width: "w-32",
    },
    {
      header: "Status",
      accessor: (event) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border",
            STATUS_COLORS[event.status as keyof typeof STATUS_COLORS]
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
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/admin/events/${event.id}/edit`)
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
            onClick={(e) => handleDelete(e, event.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      width: "w-24",
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
            Create and manage public events
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </Link>
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
              <SelectItem value="EDUCATION">Education</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Table */}
      <DataTable
        data={events}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage="No events found"
        onRowClick={handleRowClick}
      />
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

"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Filter, Calendar, CheckCircle, XCircle, Clock, Trash2, Loader2, LayoutList, CalendarDays } from "lucide-react"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { AdminBookingCalendar } from "@/components/admin/AdminBookingCalendar"
import type { AdminBookingEvent } from "@/components/admin/AdminBookingCalendar"
import { getBookings, deleteBooking, approveBooking, rejectBooking } from "@/app/actions/bookings"
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
import { logger } from "@/lib/logger"
import { ExportButton } from "@/components/admin/ExportButton"
import { exportBookings } from "@/app/actions/exports"

/**
 * Bookings Management Page
 *
 * Features:
 * - List all bookings with filtering
 * - Search by email, phone, or title
 * - Filter by status and type
 * - Pagination
 * - Click to view/edit booking
 * - Status badges with colors
 */

interface Booking {
  id: string
  title: string
  date: Date
  time: string
  type: string
  guestCount: number
  phone: string
  email: string
  status: string
  createdAt: Date
}

const STATUS_COLORS = {
  PENDING: "bg-yellow-400/20 text-yellow-400 border-yellow-400/50",
  APPROVED: "bg-green-400/20 text-green-400 border-green-400/50",
  REJECTED: "bg-red-400/20 text-red-400 border-red-400/50",
  CANCELLED: "bg-gray-400/20 text-gray-400 border-gray-400/50",
  COMPLETED: "bg-blue-400/20 text-blue-400 border-blue-400/50",
}

const TYPE_LABELS = {
  CAFE: "Cafe",
  SENSORY_ROOM: "Sensory Room",
  PLAYGROUND: "Playground",
  PARTY: "Party",
  EVENT: "Event",
}

function BookingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  })

  // View mode
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table')

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")

  // Fetch bookings
  const fetchBookings = async (page = 1) => {
    try {
      setIsLoading(true)

      const result = await getBookings({
        status: statusFilter !== "ALL" ? statusFilter as any : undefined,
        type: typeFilter !== "ALL" ? typeFilter as any : undefined,
        search: searchQuery || undefined,
        limit: pagination.limit,
        offset: (page - 1) * pagination.limit,
      })

      if (result.success && result.bookings) {
        setBookings(result.bookings as Booking[])
        const total = result.total || 0
        setPagination(prev => ({
          ...prev,
          page,
          total,
          totalPages: Math.ceil(total / prev.limit),
        }))
      }
    } catch (error) {
      logger.error("Failed to fetch bookings", error instanceof Error ? error : new Error(String(error)))
      toast.error("Failed to load bookings")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings(1)
  }, [statusFilter, typeFilter])

  // Handle search
  const handleSearch = () => {
    fetchBookings(1)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchBookings(page)
  }

  // Handle row click
  const handleRowClick = (booking: Booking) => {
    router.push(`/admin/bookings/${booking.id}`)
  }

  // Handle approve
  const handleApprove = async (bookingId: string) => {
    try {
      const result = await approveBooking(bookingId)
      if (result.success) {
        toast.success("Booking approved successfully")
        fetchBookings(pagination.page)
      } else {
        toast.error(result.error || "Failed to approve booking")
      }
    } catch (error) {
      logger.error("Failed to approve booking", error instanceof Error ? error : new Error(String(error)))
      toast.error("Failed to approve booking")
    }
  }

  // Handle reject
  const handleReject = async (bookingId: string) => {
    const reason = prompt("Please provide a reason for rejection (optional):")

    try {
      const result = await rejectBooking(bookingId, reason || "Rejected by admin")
      if (result.success) {
        toast.success("Booking rejected")
        fetchBookings(pagination.page)
      } else {
        toast.error(result.error || "Failed to reject booking")
      }
    } catch (error) {
      logger.error("Failed to reject booking", error instanceof Error ? error : new Error(String(error)))
      toast.error("Failed to reject booking")
    }
  }

  // Handle delete
  const handleDelete = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return

    try {
      const result = await deleteBooking(bookingId)
      if (result.success) {
        toast.success("Booking deleted")
        fetchBookings(pagination.page)
      } else {
        toast.error(result.error || "Failed to delete booking")
      }
    } catch (error) {
      logger.error("Failed to delete booking", error instanceof Error ? error : new Error(String(error)))
      toast.error("Failed to delete booking")
    }
  }

  // Transform bookings for calendar view
  const calendarEvents: AdminBookingEvent[] = bookings.map(booking => ({
    id: booking.id,
    title: booking.title,
    date: new Date(booking.date),
    time: booking.time,
    type: booking.type as AdminBookingEvent['type'],
    status: booking.status as AdminBookingEvent['status'],
    guestCount: booking.guestCount,
    phone: booking.phone,
    email: booking.email,
  }))

  // Table columns
  const columns: Column<Booking>[] = [
    {
      header: "Date & Time",
      accessor: (booking) => (
        <div>
          <div className="font-medium text-cyan-300">
            {format(new Date(booking.date), "MMM dd, yyyy")}
          </div>
          <div className="text-xs text-cyan-100/50">{booking.time}</div>
        </div>
      ),
      width: "w-32",
    },
    {
      header: "Title",
      accessor: (booking) => (
        <div>
          <div className="font-medium text-cyan-300">{booking.title}</div>
          <div className="text-xs text-cyan-100/50">
            {booking.guestCount} {booking.guestCount === 1 ? "guest" : "guests"}
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (booking) => (
        <span className="text-cyan-100/70">
          {TYPE_LABELS[booking.type as keyof typeof TYPE_LABELS] || booking.type}
        </span>
      ),
      width: "w-32",
    },
    {
      header: "Contact",
      accessor: (booking) => (
        <div>
          <div className="text-sm text-cyan-300">{booking.email}</div>
          <div className="text-xs text-cyan-100/50">{booking.phone}</div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (booking) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border",
            STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS]
          )}
        >
          {booking.status === "PENDING" && <Clock className="w-3 h-3" />}
          {booking.status === "APPROVED" && <CheckCircle className="w-3 h-3" />}
          {booking.status === "REJECTED" && <XCircle className="w-3 h-3" />}
          {booking.status}
        </span>
      ),
      width: "w-32",
      center: true,
    },
    {
      header: "Created",
      accessor: (booking) => (
        <span className="text-xs text-cyan-100/50">
          {format(new Date(booking.createdAt), "MMM dd, yyyy")}
        </span>
      ),
      width: "w-28",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">
            Bookings Management
          </h1>
          <p className="text-sm text-cyan-100/60 mt-1">
            Manage all venue bookings and reservations
          </p>
        </div>
        <div className="flex gap-3">
          {/* View Toggle */}
          <div className="flex gap-1 p-1 rounded-lg bg-black/20 border border-cyan-400/20">
            <motion.button
              onClick={() => setViewMode('table')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded text-sm transition-all",
                viewMode === 'table'
                  ? "bg-cyan-500 text-white"
                  : "text-cyan-400 hover:bg-cyan-400/10"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LayoutList className="w-4 h-4" />
              Table
            </motion.button>
            <motion.button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded text-sm transition-all",
                viewMode === 'calendar'
                  ? "bg-cyan-500 text-white"
                  : "text-cyan-400 hover:bg-cyan-400/10"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CalendarDays className="w-4 h-4" />
              Calendar
            </motion.button>
          </div>

          <ExportButton
            onExport={() => exportBookings({
              status: statusFilter !== "ALL" ? statusFilter : undefined,
              type: typeFilter !== "ALL" ? typeFilter : undefined,
            })}
            filename="bookings"
            label="Export to CSV"
            variant="outline"
            className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
          />
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
                placeholder="Search by email, phone, or title..."
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
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 bg-black/40 border-cyan-400/30 text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="CAFE">Cafe</SelectItem>
              <SelectItem value="SENSORY_ROOM">Sensory Room</SelectItem>
              <SelectItem value="PLAYGROUND">Playground</SelectItem>
              <SelectItem value="PARTY">Party</SelectItem>
              <SelectItem value="EVENT">Event</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Content - Table or Calendar */}
      {viewMode === 'table' ? (
        <DataTable
          data={bookings}
          columns={columns}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          emptyMessage="No bookings found"
          onRowClick={handleRowClick}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : (
            <AdminBookingCalendar
              events={calendarEvents}
              onEventClick={(event) => router.push(`/admin/bookings/${event.id}`)}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
            />
          )}
        </motion.div>
      )}
    </div>
  )
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    }>
      <BookingsContent />
    </Suspense>
  )
}

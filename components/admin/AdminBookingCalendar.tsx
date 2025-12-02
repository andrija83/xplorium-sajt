'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Plus, MoreVertical, CheckCircle, XCircle, Eye, Trash2,
  Calendar as CalendarIcon, Download, Printer
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { exportToICS } from '@/lib/calendar-utils'

export interface AdminBookingEvent {
  id: string
  title: string
  date: Date
  time: string
  type: 'CAFE' | 'SENSORY_ROOM' | 'PLAYGROUND' | 'PARTY' | 'EVENT'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  guestCount?: number
  phone?: string
  email?: string
  description?: string
}

interface AdminBookingCalendarProps {
  events: AdminBookingEvent[]
  onEventClick?: (event: AdminBookingEvent) => void
  onDateClick?: (date: Date) => void
  onApprove?: (eventId: string) => void
  onReject?: (eventId: string) => void
  onDelete?: (eventId: string) => void
  showAddButton?: boolean
}

type ViewMode = 'month' | 'week' | 'day'

/**
 * AdminBookingCalendar Component
 *
 * Enhanced admin calendar with advanced features
 * - Multiple views: Month, Week, Day
 * - ICS export
 * - Print-friendly view
 * - Color-coded by type and status
 * - Quick actions: View, Approve, Reject, Delete
 */
export const AdminBookingCalendar = ({
  events,
  onEventClick,
  onDateClick,
  onApprove,
  onReject,
  onDelete,
  showAddButton = false
}: AdminBookingCalendarProps) => {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState<AdminBookingEvent[] | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  // Get week days
  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 0 })
    const end = endOfWeek(date, { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)
  const weekDays = getWeekDays(currentDate)

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Navigation
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(addDays(currentDate, -7))
    } else {
      setCurrentDate(addDays(currentDate, -1))
    }
  }

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(addDays(currentDate, 7))
    } else {
      setCurrentDate(addDays(currentDate, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Event type colors
  const eventTypeColors = {
    CAFE: { bg: 'bg-cyan-500/80', text: 'text-white', border: 'border-cyan-500', label: 'Café' },
    SENSORY_ROOM: { bg: 'bg-purple-500/80', text: 'text-white', border: 'border-purple-500', label: 'Sensory' },
    PLAYGROUND: { bg: 'bg-pink-500/80', text: 'text-white', border: 'border-pink-500', label: 'Playground' },
    PARTY: { bg: 'bg-fuchsia-500/80', text: 'text-white', border: 'border-fuchsia-500', label: 'Party' },
    EVENT: { bg: 'bg-emerald-500/80', text: 'text-white', border: 'border-emerald-500', label: 'Event' },
  }

  // Status styling (opacity overlay)
  const statusStyles = {
    PENDING: 'ring-2 ring-yellow-400/50',
    APPROVED: 'ring-2 ring-green-400/50',
    REJECTED: 'opacity-50 line-through',
    CANCELLED: 'opacity-50 line-through',
    COMPLETED: 'opacity-60',
  }

  // Handle quick actions
  const handleApprove = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation()
    onApprove?.(eventId)
  }

  const handleReject = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation()
    onReject?.(eventId)
  }

  const handleDelete = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation()
    onDelete?.(eventId)
  }

  const handleView = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation()
    router.push(`/admin/bookings/${eventId}`)
  }

  // Export to ICS
  const handleExportICS = () => {
    exportToICS(events, `xplorium-bookings-${format(currentDate, 'yyyy-MM')}.ics`)
  }

  // Print view
  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setTimeout(() => setIsPrinting(false), 100)
    }, 100)
  }

  // Render event card
  const renderEventCard = (event: AdminBookingEvent, idx: number) => {
    const colors = eventTypeColors[event.type]

    return (
      <div
        key={event.id}
        className={cn(
          'relative group/event',
          statusStyles[event.status]
        )}
      >
        <motion.div
          onClick={() => onEventClick?.(event)}
          className={cn(
            'w-full text-left px-2 py-1 rounded text-[10px] leading-tight cursor-pointer',
            colors.bg, colors.text, 'border', colors.border,
            'hover:opacity-90 transition-all truncate'
          )}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ scale: 1.02 }}
          title={`${event.time} - ${event.title} (${event.status})`}
        >
          <div className="flex items-center justify-between gap-1">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{event.time}</div>
              <div className="truncate opacity-90">{event.title}</div>
            </div>

            {/* Quick Actions Menu */}
            {!isPrinting && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  onClick={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover/event:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900 border-cyan-400/30">
                  <DropdownMenuItem onClick={(e) => handleView(e, event.id)}>
                    <Eye className="w-3 h-3 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {event.status === 'PENDING' && (
                    <>
                      <DropdownMenuItem onClick={(e) => handleApprove(e, event.id)}>
                        <CheckCircle className="w-3 h-3 mr-2 text-green-400" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleReject(e, event.id)}>
                        <XCircle className="w-3 h-3 mr-2 text-red-400" />
                        Reject
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={(e) => handleDelete(e, event.id)}
                    className="text-red-400"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  // Render day cell
  const renderDayCell = (date: Date, isCurrentMonth = true) => {
    const day = date.getDate()
    const dayEvents = getEventsForDate(date)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const isHovered = hoveredDay === day && date.getMonth() === month

    const pendingCount = dayEvents.filter(e => e.status === 'PENDING').length
    const approvedCount = dayEvents.filter(e => e.status === 'APPROVED').length

    return (
      <div
        key={format(date, 'yyyy-MM-dd')}
        className={cn(
          'min-h-[140px] border border-cyan-400/10 p-1 relative group transition-all',
          isToday && 'bg-cyan-400/5 ring-2 ring-cyan-400/30 ring-inset',
          isPast ? 'bg-black/10 opacity-60' : 'bg-black/5',
          !isCurrentMonth && 'opacity-30',
          isHovered && !isPast && 'bg-cyan-400/5',
          !isPast && 'hover:bg-cyan-400/5'
        )}
        onMouseEnter={() => !isPast && setHoveredDay(day)}
        onMouseLeave={() => setHoveredDay(null)}
      >
          {/* Day Number & Stats */}
          <div className="flex justify-between items-start mb-1">
            <span className={cn(
              'text-xs font-medium',
              isToday ? 'text-cyan-400 font-bold' : isPast ? 'text-white/30' : 'text-cyan-100/70'
            )}>
              {day}
            </span>

            {/* Status badges */}
            <div className="flex gap-1">
              {pendingCount > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-400 border border-yellow-400/50">
                  {pendingCount}
                </span>
              )}
              {approvedCount > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-400/20 text-green-400 border border-green-400/50">
                  {approvedCount}
                </span>
              )}
            </div>

            {/* Add Event Button (shows on hover) */}
            {!isPrinting && showAddButton && isHovered && onDateClick && !isPast && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onDateClick(date)}
                className="w-5 h-5 rounded bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center hover:bg-cyan-400/30"
                title="Add booking"
              >
                <Plus className="w-3 h-3 text-cyan-400" />
              </motion.button>
            )}
          </div>

          {/* Events List */}
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event, idx) => renderEventCard(event, idx))}

            {/* More events indicator */}
            {dayEvents.length > 2 && (
              <motion.button
                onClick={() => {
                  setSelectedDayEvents(dayEvents)
                  setSelectedDate(date)
                }}
                className="text-[9px] text-cyan-400 px-2 py-0.5 hover:text-cyan-300 underline w-full text-left"
                whileHover={{ scale: 1.05 }}
              >
                +{dayEvents.length - 2} more
              </motion.button>
            )}
          </div>
        </div>
    )
  }

  // Render month view
  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1 border-2 border-cyan-400/20 rounded-lg overflow-hidden">
      {/* Empty cells for days before month starts */}
      {Array.from({ length: startingDayOfWeek }).map((_, i) => (
        <div key={`empty-${i}`} className="min-h-[140px] bg-black/10 border border-cyan-400/10" />
      ))}

      {/* Days of the month */}
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const date = new Date(year, month, i + 1)
        return renderDayCell(date)
      })}
    </div>
  )

  // Render week view
  const renderWeekView = () => (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map(date => (
        <div key={date.toISOString()}>
          <div className="text-center mb-2">
            <div className="text-xs text-cyan-400/60 font-medium">{format(date, 'EEE')}</div>
            <div className="text-sm text-cyan-100/70">{format(date, 'd')}</div>
          </div>
          {renderDayCell(date, date.getMonth() === month)}
        </div>
      ))}
    </div>
  )

  // Render day view
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate)
    const sortedEvents = [...dayEvents].sort((a, b) => a.time.localeCompare(b.time))

    return (
      <div className="space-y-3">
        <h3 className="text-xl text-cyan-400 font-semibold mb-4">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h3>

        {sortedEvents.length === 0 ? (
          <div className="text-center py-20 text-cyan-100/50">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No bookings for this day</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {sortedEvents.map((event, idx) => {
              const colors = eventTypeColors[event.type]
              return (
                <motion.div
                  key={event.id}
                  className={cn(
                    'p-4 rounded-lg border-2',
                    colors.border, colors.bg, colors.text,
                    statusStyles[event.status]
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-lg">{event.title}</h4>
                      <p className="text-sm opacity-90">{colors.label} - {event.status}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{event.time}</div>
                      {event.guestCount && (
                        <div className="text-sm opacity-90">{event.guestCount} guests</div>
                      )}
                    </div>
                  </div>

                  {(event.phone || event.email) && (
                    <div className="text-sm opacity-80 space-y-1 border-t border-white/20 pt-2 mt-2">
                      {event.phone && <div>📞 {event.phone}</div>}
                      {event.email && <div>📧 {event.email}</div>}
                    </div>
                  )}

                  {!isPrinting && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => router.push(`/admin/bookings/${event.id}`)}
                        className="flex-1"
                        size="sm"
                      >
                        View Details
                      </Button>

                      {event.status === 'PENDING' && (
                        <>
                          <Button
                            onClick={(e) => handleApprove(e as any, event.id)}
                            variant="outline"
                            size="sm"
                            className="border-green-400/30 text-green-400 hover:bg-green-400/10"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={(e) => handleReject(e as any, event.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("w-full", isPrinting && "print-mode")}>
        {/* Calendar Header */}
        <div className={cn("flex items-center justify-between mb-6", isPrinting && "print:hidden")}>
          <div className="flex gap-2">
            <motion.button
              onClick={goToPrevious}
              className="p-2 rounded-lg bg-black/20 border border-cyan-400/30 hover:bg-cyan-400/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5 text-cyan-400" />
            </motion.button>

            <motion.button
              onClick={goToNext}
              className="p-2 rounded-lg bg-black/20 border border-cyan-400/30 hover:bg-cyan-400/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5 text-cyan-400" />
            </motion.button>

            <motion.button
              onClick={goToToday}
              className="px-4 py-2 rounded-lg bg-black/20 border border-cyan-400/30 hover:bg-cyan-400/10 transition-all text-cyan-400 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Today
            </motion.button>
          </div>

          <h3 className="text-2xl text-cyan-400 font-semibold">
            {viewMode === 'day'
              ? format(currentDate, 'MMMM d, yyyy')
              : viewMode === 'week'
              ? `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`
              : `${monthNames[month]} ${year}`
            }
          </h3>

          <div className="flex gap-2">
            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-black/20 p-1 rounded-lg border border-cyan-400/20">
              <button
                onClick={() => setViewMode('month')}
                className={cn(
                  'px-3 py-1 rounded text-sm transition-all',
                  viewMode === 'month'
                    ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-cyan-100/50 hover:text-cyan-100/70'
                )}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={cn(
                  'px-3 py-1 rounded text-sm transition-all',
                  viewMode === 'week'
                    ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-cyan-100/50 hover:text-cyan-100/70'
                )}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={cn(
                  'px-3 py-1 rounded text-sm transition-all',
                  viewMode === 'day'
                    ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-cyan-100/50 hover:text-cyan-100/70'
                )}
              >
                Day
              </button>
            </div>

            {/* Export & Print */}
            <Button
              onClick={handleExportICS}
              variant="outline"
              size="sm"
              className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export ICS
            </Button>

            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Day Names (for month/week view) */}
        {viewMode !== 'day' && (
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-cyan-400/60 text-xs font-medium py-2">
                {day}
              </div>
            ))}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}

        {/* Legend */}
        <div className={cn("mt-6 space-y-3", isPrinting && "print:mt-2")}>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-cyan-100/70">Café</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-cyan-100/70">Sensory Room</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-cyan-100/70">Playground</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-fuchsia-500" />
              <span className="text-cyan-100/70">Party</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-cyan-100/70">Event</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400/50 ring-2 ring-yellow-400/50" />
              <span className="text-cyan-100/70">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400/50 ring-2 ring-green-400/50" />
              <span className="text-cyan-100/70">Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/50" />
              <span className="text-cyan-100/70">Rejected</span>
            </div>
          </div>
        </div>

        {/* All Events Modal */}
        <AnimatePresence>
          {selectedDayEvents && selectedDate && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedDayEvents(null)
                setSelectedDate(null)
              }}
            >
              <motion.div
                className="bg-gray-900 border-2 border-cyan-400/40 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)'
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl text-cyan-400 font-semibold">
                    Bookings - {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  <motion.button
                    onClick={() => {
                      setSelectedDayEvents(null)
                      setSelectedDate(null)
                    }}
                    className="text-white/70 hover:text-white text-2xl leading-none"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ×
                  </motion.button>
                </div>

                <div className="space-y-3">
                  {selectedDayEvents.map((event, idx) => {
                    const colors = eventTypeColors[event.type]
                    return (
                      <motion.div
                        key={event.id}
                        className={cn(
                          'p-4 rounded-lg border-2',
                          colors.border, colors.bg, colors.text,
                          statusStyles[event.status]
                        )}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-lg">{event.title}</h4>
                            <p className="text-sm opacity-90">{colors.label} - {event.status}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{event.time}</div>
                            {event.guestCount && (
                              <div className="text-sm opacity-90">{event.guestCount} guests</div>
                            )}
                          </div>
                        </div>

                        {(event.phone || event.email) && (
                          <div className="text-sm opacity-80 space-y-1 border-t border-white/20 pt-2 mt-2">
                            {event.phone && <div>📞 {event.phone}</div>}
                            {event.email && <div>📧 {event.email}</div>}
                          </div>
                        )}

                        <div className="flex gap-2 mt-3">
                          <motion.button
                            onClick={() => {
                              router.push(`/admin/bookings/${event.id}`)
                              setSelectedDayEvents(null)
                              setSelectedDate(null)
                            }}
                            className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded text-sm transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            View Details
                          </motion.button>

                          {event.status === 'PENDING' && (
                            <>
                              <motion.button
                                onClick={(e) => {
                                  handleApprove(e, event.id)
                                  setSelectedDayEvents(null)
                                  setSelectedDate(null)
                                }}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-sm transition-all"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Approve
                              </motion.button>
                              <motion.button
                                onClick={(e) => {
                                  handleReject(e, event.id)
                                  setSelectedDayEvents(null)
                                  setSelectedDate(null)
                                }}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-sm transition-all"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Reject
                              </motion.button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body {
              background: white !important;
            }
            .print-mode {
              color: black !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            @page {
              margin: 1cm;
            }
          }
        `}</style>
      </div>
  )
}

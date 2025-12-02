'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Eye, Edit, Trash2, Archive, Send } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * EventCalendar Component
 *
 * Calendar view for events management
 * - Monthly calendar grid
 * - Event badges on dates
 * - Color-coded by category
 * - Quick actions dropdown
 */

interface Event {
  id: string
  title: string
  date: Date
  time: string
  category: string
  status: string
  capacity?: number
  registeredCount: number
  _count?: { attendees: number }
}

interface EventCalendarProps {
  events: Event[]
  onEventClick?: (event: Event) => void
  onDateClick?: (date: Date) => void
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
  onArchive?: (event: Event) => void
  onPublish?: (event: Event) => void
  showAddButton?: boolean
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  WORKSHOP: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-400/50' },
  PARTY: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-400/50' },
  SPECIAL_EVENT: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-400/50' },
  HOLIDAY: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-400/50' },
  SEASONAL: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-400/50' },
  CLASS: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-400/50' },
  TOURNAMENT: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-400/50' },
  OTHER: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-400/50' }
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400' },
  PUBLISHED: { label: 'Live', color: 'bg-green-500/20 text-green-400' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400' },
  COMPLETED: { label: 'Done', color: 'bg-blue-500/20 text-blue-400' },
  ARCHIVED: { label: 'Archived', color: 'bg-gray-500/20 text-gray-600' }
}

export function EventCalendar({
  events,
  onEventClick,
  onDateClick,
  onEdit,
  onDelete,
  onArchive,
  onPublish,
  showAddButton = true
}: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Get days in current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get starting day of week (0 = Sunday)
  const startingDayOfWeek = monthStart.getDay()

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>()
    events.forEach(event => {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd')
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(event)
    })
    return map
  }, [events])

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))
  const handleToday = () => setCurrentMonth(new Date())

  const getEventsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return eventsByDate.get(dateKey) || []
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrevMonth}
            variant="outline"
            size="sm"
            className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleToday}
            variant="outline"
            size="sm"
            className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
          >
            Today
          </Button>

          <Button
            onClick={handleNextMonth}
            variant="outline"
            size="sm"
            className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <h3 className="text-xl font-semibold text-cyan-400">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>

        {showAddButton && onDateClick && (
          <Button
            onClick={() => onDateClick(new Date())}
            size="sm"
            className="bg-cyan-500 hover:bg-cyan-600 text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="bg-black/20 backdrop-blur-sm border border-cyan-400/20 rounded-lg overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-cyan-400/20">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="p-3 text-center text-sm font-semibold text-cyan-400/70 border-r border-cyan-400/10 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[120px] border-r border-b border-cyan-400/10 bg-black/10"
            />
          ))}

          {/* Days of the month */}
          {daysInMonth.map((date, i) => {
            const dayEvents = getEventsForDate(date)
            const isToday = isSameDay(date, new Date())

            return (
              <motion.div
                key={date.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
                className={cn(
                  'min-h-[120px] border-r border-b border-cyan-400/10 p-2',
                  'hover:bg-cyan-400/5 transition-colors cursor-pointer',
                  !isSameMonth(date, currentMonth) && 'opacity-40',
                  isToday && 'bg-cyan-400/10'
                )}
                onClick={() => onDateClick?.(date)}
              >
                {/* Date Number */}
                <div className={cn(
                  'text-sm font-medium mb-1',
                  isToday ? 'text-cyan-400 font-bold' : 'text-cyan-100/70'
                )}>
                  {format(date, 'd')}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => {
                    const colors = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.OTHER
                    const attendeeCount = event._count?.attendees || event.registeredCount
                    const isFull = event.capacity && attendeeCount >= event.capacity

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEvent(event)
                          onEventClick?.(event)
                        }}
                        className={cn(
                          'text-xs px-2 py-1 rounded border truncate',
                          colors.bg, colors.text, colors.border,
                          'hover:scale-105 transition-transform cursor-pointer'
                        )}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate font-medium">
                            {event.time} {event.title}
                          </span>
                          {isFull && (
                            <span className="text-[10px] bg-red-500/20 text-red-400 px-1 rounded">
                              FULL
                            </span>
                          )}
                        </div>
                        {event.capacity && (
                          <div className="text-[10px] opacity-70 mt-0.5">
                            {attendeeCount}/{event.capacity}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}

                  {dayEvents.length > 3 && (
                    <div className="text-xs text-cyan-400/50 px-2">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="font-semibold text-cyan-400">Categories:</div>
        {Object.entries(CATEGORY_COLORS).map(([key, colors]) => (
          <div key={key} className="flex items-center gap-1">
            <div className={cn('w-3 h-3 rounded border', colors.bg, colors.border)} />
            <span className="text-cyan-100/60">{key.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedEvent(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                         w-full max-w-md bg-gray-900 border-2 border-cyan-400/40 rounded-lg p-6"
              style={{ boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)' }}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-cyan-400">{selectedEvent.title}</h3>
                    <p className="text-sm text-cyan-100/60 mt-1">
                      {format(new Date(selectedEvent.date), 'MMM d, yyyy')} at {selectedEvent.time}
                    </p>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded',
                    STATUS_BADGES[selectedEvent.status]?.color || 'bg-gray-500/20 text-gray-400'
                  )}>
                    {STATUS_BADGES[selectedEvent.status]?.label || selectedEvent.status}
                  </span>
                </div>

                {selectedEvent.capacity && (
                  <div className="text-sm text-cyan-100/70">
                    Attendees: {selectedEvent._count?.attendees || selectedEvent.registeredCount}/{selectedEvent.capacity}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {onEdit && (
                    <Button
                      onClick={() => {
                        onEdit(selectedEvent)
                        setSelectedEvent(null)
                      }}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}

                  {onPublish && selectedEvent.status === 'DRAFT' && (
                    <Button
                      onClick={() => {
                        onPublish(selectedEvent)
                        setSelectedEvent(null)
                      }}
                      size="sm"
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Publish
                    </Button>
                  )}

                  {onArchive && selectedEvent.status !== 'ARCHIVED' && (
                    <Button
                      onClick={() => {
                        onArchive(selectedEvent)
                        setSelectedEvent(null)
                      }}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-gray-400/30 text-gray-400 hover:bg-gray-400/10"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                  )}

                  {onDelete && (
                    <Button
                      onClick={() => {
                        onDelete(selectedEvent)
                        setSelectedEvent(null)
                      }}
                      size="sm"
                      variant="outline"
                      className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  time: string
  type: 'CAFE' | 'SENSORY_ROOM' | 'PLAYGROUND' | 'PARTY' | 'EVENT'
  guestCount?: number
  phone?: string
  email?: string
}

interface EventCalendarProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  showAddButton?: boolean
}

/**
 * EventCalendar Component
 *
 * Mobiscroll-style event calendar with events displayed inside cells
 * - Shows current month with day grid
 * - Events appear as labels within day cells
 * - Click dates or events to interact
 * - Supports adding new events
 */
export const EventCalendar = ({ events, onEventClick, onDateClick, showAddButton = false }: EventCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[] | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)

  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      )
    })
  }

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthNames = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ]

  const dayNames = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub']

  const eventTypeColors = {
    CAFE: { bg: 'bg-cyan-500', text: 'text-white', border: 'border-cyan-500', label: 'Café' },
    SENSORY_ROOM: { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-500', label: 'Sensory Soba' },
    PLAYGROUND: { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-500', label: 'Igraonica' },
    PARTY: { bg: 'bg-fuchsia-500', text: 'text-white', border: 'border-fuchsia-500', label: 'Rođendan' },
    EVENT: { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-500', label: 'Događaj' },
  }

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <motion.button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg bg-white/5 border border-cyan-400/30 hover:bg-cyan-400/10 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5 text-cyan-400" />
          </motion.button>

          <motion.button
            onClick={goToNextMonth}
            className="p-2 rounded-lg bg-white/5 border border-cyan-400/30 hover:bg-cyan-400/10 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-5 h-5 text-cyan-400" />
          </motion.button>
        </div>

        <h3 className="text-2xl text-cyan-400 font-['Great_Vibes']">
          {monthNames[month]} {year}
        </h3>

        <motion.button
          onClick={goToToday}
          className="px-4 py-2 rounded-lg bg-white/5 border border-cyan-400/30 hover:bg-cyan-400/10 transition-all text-cyan-400 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Danas
        </motion.button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-cyan-400/60 text-xs font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - Mobiscroll Style */}
      <div className="grid grid-cols-7 gap-1 border-2 border-white/10 rounded-lg overflow-hidden">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[120px] bg-white/[0.02] border border-white/5" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayEvents = getEventsForDate(day)
          const dateObj = new Date(year, month, day)
          const today = new Date()
          const isToday = dateObj.toDateString() === today.toDateString()
          const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const isHovered = hoveredDay === day

          return (
            <div
              key={day}
              className={`
                min-h-[120px] border border-white/5 p-1 relative group
                ${isToday ? 'bg-cyan-400/5' : isPast ? 'bg-white/[0.01]' : 'bg-white/[0.02]'}
                ${isHovered && !isPast ? 'bg-white/5' : ''}
                ${isPast ? 'opacity-50' : 'hover:bg-white/5'}
                transition-all
              `}
              onMouseEnter={() => !isPast && setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {/* Day Number */}
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-medium ${isToday ? 'text-cyan-400' : isPast ? 'text-white/30' : 'text-white/70'}`}>
                  {day}
                </span>

                {/* Add Event Button (shows on hover, disabled for past dates) */}
                {showAddButton && isHovered && onDateClick && !isPast && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => onDateClick(new Date(year, month, day))}
                    className="w-5 h-5 rounded bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center hover:bg-cyan-400/30"
                    title="Dodaj događaj"
                  >
                    <Plus className="w-3 h-3 text-cyan-400" />
                  </motion.button>
                )}
              </div>

              {/* Events List */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event, idx) => {
                  const colors = eventTypeColors[event.type]
                  return (
                    <motion.button
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className={`
                        w-full text-left px-2 py-1 rounded text-[10px] leading-tight
                        ${colors.bg} ${colors.text} border ${colors.border}
                        hover:opacity-80 transition-all truncate
                      `}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      title={`${event.time} - ${event.title}`}
                    >
                      <div className="font-medium truncate">{event.time}</div>
                      <div className="truncate opacity-90">{event.title}</div>
                    </motion.button>
                  )
                })}

                {/* More events indicator */}
                {dayEvents.length > 3 && (
                  <motion.button
                    onClick={() => {
                      setSelectedDayEvents(dayEvents)
                      setSelectedDate(new Date(year, month, day))
                    }}
                    className="text-[9px] text-cyan-400 px-2 py-0.5 hover:text-cyan-300 underline w-full text-left"
                    whileHover={{ scale: 1.05 }}
                  >
                    +{dayEvents.length - 3} više (klikni za sve)
                  </motion.button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500" />
          <span className="text-white/70">Café</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-white/70">Sensory Soba</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500" />
          <span className="text-white/70">Igraonica</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-fuchsia-500" />
          <span className="text-white/70">Rođendan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-white/70">Događaj</span>
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
                <h3 className="text-2xl text-cyan-400 font-['Great_Vibes']">
                  Događaji - {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
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
                      className={`p-4 rounded-lg border-2 ${colors.border} ${colors.bg} ${colors.text}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-lg">{event.title}</h4>
                          <p className="text-sm opacity-90">{colors.label}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{event.time}</div>
                          {event.guestCount && (
                            <div className="text-sm opacity-90">{event.guestCount} gostiju</div>
                          )}
                        </div>
                      </div>
                      {(event.phone || event.email) && (
                        <div className="text-sm opacity-80 space-y-1 border-t border-white/20 pt-2 mt-2">
                          {event.phone && <div>📞 {event.phone}</div>}
                          {event.email && <div>📧 {event.email}</div>}
                        </div>
                      )}
                      {onEventClick && (
                        <motion.button
                          onClick={() => {
                            onEventClick(event)
                            setSelectedDayEvents(null)
                            setSelectedDate(null)
                          }}
                          className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded border border-white/30 text-sm w-full transition-all"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Pogledaj detalje
                        </motion.button>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

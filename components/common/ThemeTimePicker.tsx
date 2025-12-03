'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { getBookingsForDay } from '@/app/actions/bookings'
import { Loader2 } from 'lucide-react'

// Helper function to check if two time ranges overlap
function checkTimeOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return (
    (start1 >= start2 && start1 < end2) ||
    (end1 > start2 && end1 <= end2) ||
    (start1 <= start2 && end1 >= end2)
  )
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000)
}

function subMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60000)
}

interface ThemeTimePickerProps {
  value: string | null              // Selected time (HH:MM format)
  onChange: (time: string) => void  // Callback when time selected
  variant: 'birthday' | 'playroom'  // Theme variant
  onClose?: () => void              // Optional close callback
  startHour?: number                // Start hour (default: 9)
  endHour?: number                  // End hour (default: 22)
  interval?: number                 // Interval in minutes (default: 30)
  selectedDate?: string             // Selected date (YYYY-MM-DD format) for availability checking
  duration?: number                 // Booking duration in minutes (default: 120)
}

/**
 * ThemeTimePicker Component
 *
 * Custom interactive time picker with neon theme support (cyan/pink)
 * Matches the website's glass morphism and neon design system
 *
 * Features:
 * - Scrollable time slots (9:00 AM - 10:00 PM by default)
 * - 30-minute intervals (customizable)
 * - Theme variants (birthday=cyan, playroom=pink)
 * - Smooth Framer Motion animations
 * - Click outside to close
 * - Auto-scroll to selected time
 */
export function ThemeTimePicker({
  value,
  onChange,
  variant,
  onClose,
  startHour = 9,
  endHour = 22,
  interval = 30,
  selectedDate,
  duration = 120
}: ThemeTimePickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)
  const [unavailableTimes, setUnavailableTimes] = useState<Set<string>>(new Set())
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  // Theme configuration
  const theme = {
    birthday: {
      borderColor: 'border-cyan-400/40',
      textColor: 'text-cyan-400',
      hoverBg: 'hover:bg-cyan-400/20',
      hoverText: 'hover:text-cyan-400',
      selectedBg: 'bg-cyan-400/40',
      selectedBorder: 'border-cyan-400',
      glow: '0 0 20px rgba(34, 211, 238, 0.2)'
    },
    playroom: {
      borderColor: 'border-pink-400/40',
      textColor: 'text-pink-400',
      hoverBg: 'hover:bg-pink-400/20',
      hoverText: 'hover:text-pink-400',
      selectedBg: 'bg-pink-400/40',
      selectedBorder: 'border-pink-400',
      glow: '0 0 20px rgba(236, 72, 153, 0.2)'
    }
  }

  const currentTheme = theme[variant]

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Generate time slots (memoized to prevent infinite loops)
  const timeSlots = useMemo(() => {
    const slots: string[] = []
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        if (hour === endHour && minute > 0) break // Don't go past end hour
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    return slots
  }, [startHour, endHour, interval])

  // Auto-scroll to selected time on mount
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [])

  // Check availability for all time slots when date is selected
  useEffect(() => {
    if (!selectedDate) {
      setUnavailableTimes(new Set())
      return
    }

    const checkAllTimeSlots = async () => {
      setIsCheckingAvailability(true)
      const unavailable = new Set<string>()

      try {
        const dateObj = new Date(selectedDate)

        // Single API call to get all bookings for the day
        const result = await getBookingsForDay(dateObj)

        if (!result.success || !result.bookings) {
          console.error('Failed to get bookings:', result.error)
          setIsCheckingAvailability(false)
          return
        }

        const bufferMinutes = result.bufferTimeMinutes || 45

        // Check each time slot against all bookings (client-side)
        for (const timeSlot of timeSlots) {
          const [hours, minutes] = timeSlot.split(':').map(Number)
          const slotStart = new Date(dateObj)
          slotStart.setHours(hours, minutes, 0, 0)

          // Check against each existing booking
          for (const booking of result.bookings) {
            const bookingStart = new Date(booking.datetime)

            // Buffer time = minimum time between booking start times
            // If booking is at 9:00 with 45min buffer, next available is 9:45
            const bufferZoneEnd = addMinutes(bookingStart, bufferMinutes)

            // If this time slot is before the buffer zone ends, it's unavailable
            if (slotStart >= bookingStart && slotStart < bufferZoneEnd) {
              unavailable.add(timeSlot)
              break
            }
          }
        }

        setUnavailableTimes(unavailable)
      } catch (error) {
        console.error('Failed to check availability:', error)
      } finally {
        setIsCheckingAvailability(false)
      }
    }

    checkAllTimeSlots()
  }, [selectedDate, duration, timeSlots])

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    onChange(time)
  }

  return (
    <motion.div
      ref={pickerRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute z-50 mt-2 bg-gray-900 border-2 ${currentTheme.borderColor} rounded-lg p-4 shadow-xl max-h-64 overflow-y-auto`}
      style={{ boxShadow: currentTheme.glow }}
    >
      {/* Loading State */}
      {isCheckingAvailability && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className={`w-5 h-5 animate-spin ${currentTheme.textColor}`} />
          <span className={`ml-2 text-sm ${currentTheme.textColor}`}>Checking availability...</span>
        </div>
      )}

      {/* Time Slots */}
      {!isCheckingAvailability && (
        <div className="space-y-1">
          {timeSlots.map(time => {
            const isSelected = time === value
            const isUnavailable = unavailableTimes.has(time)

            return (
              <button
                key={time}
                ref={isSelected ? selectedRef : null}
                type="button"
                onClick={() => !isUnavailable && handleTimeSelect(time)}
                disabled={isUnavailable}
                className={`
                  w-full px-4 py-2 text-left rounded text-sm transition-all
                  ${isUnavailable
                    ? 'bg-red-400/10 text-red-400/50 border border-red-400/30 cursor-not-allowed line-through'
                    : isSelected
                      ? `${currentTheme.selectedBg} ${currentTheme.selectedBorder} border ${currentTheme.textColor} font-medium`
                      : `text-white/70 ${currentTheme.hoverBg} ${currentTheme.hoverText}`
                  }
                `}
                aria-label={`${isUnavailable ? 'Unavailable' : 'Select'} ${time}`}
                aria-pressed={isSelected}
                aria-disabled={isUnavailable}
              >
                <div className="flex items-center justify-between">
                  <span>{time}</span>
                  {isUnavailable && (
                    <span className="text-xs text-red-400/70">Booked</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Scroll indicator hint (optional) */}
      {timeSlots.length > 8 && (
        <div className={`mt-2 pt-2 border-t ${currentTheme.borderColor} text-center`}>
          <p className="text-white/40 text-[10px]">Scroll for more times</p>
        </div>
      )}
    </motion.div>
  )
}

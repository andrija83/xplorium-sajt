'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ThemeCalendarPickerProps {
  value: string | null              // Selected date (YYYY-MM-DD format)
  onChange: (date: string) => void  // Callback when date selected
  minDate?: string                  // Minimum selectable date (YYYY-MM-DD)
  variant: 'birthday' | 'playroom'  // Theme variant
  onClose?: () => void              // Optional close callback
}

/**
 * ThemeCalendarPicker Component
 *
 * Custom interactive calendar picker with neon theme support (cyan/pink)
 * Matches the website's glass morphism and neon design system
 *
 * Features:
 * - Month/year navigation
 * - Disable past dates
 * - Highlight today
 * - Theme variants (birthday=cyan, playroom=pink)
 * - Serbian month/day names
 * - Smooth Framer Motion animations
 * - Click outside to close
 */
export function ThemeCalendarPicker({
  value,
  onChange,
  minDate,
  variant,
  onClose
}: ThemeCalendarPickerProps) {
  // Parse initial date or default to current month
  const initialDate = value ? new Date(value) : new Date()
  const [calendarDate, setCalendarDate] = useState(initialDate)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Serbian month names
  const monthNames = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ]

  // Serbian day names (short)
  const dayNames = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub']

  // Theme configuration
  const theme = {
    birthday: {
      borderColor: 'border-cyan-400/40',
      textColor: 'text-cyan-400',
      textDim: 'text-cyan-400/60',
      hoverBg: 'hover:bg-cyan-400/20',
      hoverText: 'hover:text-cyan-400',
      selectedBg: 'bg-cyan-400/40',
      selectedBorder: 'border-cyan-400',
      todayBorder: 'border-cyan-400/40',
      glow: '0 0 20px rgba(34, 211, 238, 0.2)'
    },
    playroom: {
      borderColor: 'border-pink-400/40',
      textColor: 'text-pink-400',
      textDim: 'text-pink-400/60',
      hoverBg: 'hover:bg-pink-400/20',
      hoverText: 'hover:text-pink-400',
      selectedBg: 'bg-pink-400/40',
      selectedBorder: 'border-pink-400',
      todayBorder: 'border-pink-400/40',
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

  // Get days in month and starting day of week
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    return {
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay(),
      year,
      month
    }
  }

  // Navigate to previous month
  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))
  }

  // Navigate to next month
  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))
  }

  // Handle day selection
  const handleDateSelect = (day: number) => {
    const { year, month } = getDaysInMonth(calendarDate)
    const selectedDate = new Date(year, month, day)

    // Format as YYYY-MM-DD
    const yearStr = selectedDate.getFullYear()
    const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(selectedDate.getDate()).padStart(2, '0')
    const dateString = `${yearStr}-${monthStr}-${dayStr}`

    onChange(dateString)
  }

  // Check if a date is today
  const isToday = (year: number, month: number, day: number) => {
    const today = new Date()
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    )
  }

  // Check if a date is selected
  const isSelected = (year: number, month: number, day: number) => {
    if (!value) return false
    const selectedDate = new Date(value)
    return (
      year === selectedDate.getFullYear() &&
      month === selectedDate.getMonth() &&
      day === selectedDate.getDate()
    )
  }

  // Check if a date is in the past
  const isPastDate = (year: number, month: number, day: number) => {
    const dateObj = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dateObj.setHours(0, 0, 0, 0)
    return dateObj < today
  }

  // Check if a date is before minDate
  const isBeforeMinDate = (year: number, month: number, day: number) => {
    if (!minDate) return false
    const dateObj = new Date(year, month, day)
    const minDateObj = new Date(minDate)
    dateObj.setHours(0, 0, 0, 0)
    minDateObj.setHours(0, 0, 0, 0)
    return dateObj < minDateObj
  }

  // Check if a date is disabled
  const isDateDisabled = (year: number, month: number, day: number) => {
    return isPastDate(year, month, day) || isBeforeMinDate(year, month, day)
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(calendarDate)

  return (
    <motion.div
      ref={pickerRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute z-50 mt-2 bg-gray-900 border-2 ${currentTheme.borderColor} rounded-lg p-4 shadow-xl`}
      style={{ boxShadow: currentTheme.glow }}
    >
      {/* Calendar Header - Month/Year Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className={`${currentTheme.textColor} hover:opacity-80 text-lg px-2 transition-opacity`}
          aria-label="Previous month"
        >
          ←
        </button>
        <div className={`${currentTheme.textColor} font-['Great_Vibes'] text-lg`}>
          {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className={`${currentTheme.textColor} hover:opacity-80 text-lg px-2 transition-opacity`}
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Day Names Row */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div
            key={day}
            className={`text-center ${currentTheme.textDim} text-[10px] font-medium uppercase`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="w-8 h-8" />
        ))}

        {/* Actual days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const today = isToday(year, month, day)
          const selected = isSelected(year, month, day)
          const disabled = isDateDisabled(year, month, day)

          return (
            <button
              key={day}
              type="button"
              onClick={() => !disabled && handleDateSelect(day)}
              disabled={disabled}
              className={`
                w-8 h-8 rounded text-xs transition-all
                ${disabled
                  ? 'text-white/20 cursor-not-allowed'
                  : `text-white/70 ${currentTheme.hoverBg} ${currentTheme.hoverText}`
                }
                ${today && !selected ? `border ${currentTheme.todayBorder}` : ''}
                ${selected ? `${currentTheme.selectedBg} ${currentTheme.selectedBorder} border` : ''}
              `}
              aria-label={`Select ${day} ${monthNames[month]} ${year}`}
              aria-pressed={selected}
              aria-disabled={disabled}
            >
              {day}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

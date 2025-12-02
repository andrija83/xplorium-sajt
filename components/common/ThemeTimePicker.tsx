'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ThemeTimePickerProps {
  value: string | null              // Selected time (HH:MM format)
  onChange: (time: string) => void  // Callback when time selected
  variant: 'birthday' | 'playroom'  // Theme variant
  onClose?: () => void              // Optional close callback
  startHour?: number                // Start hour (default: 9)
  endHour?: number                  // End hour (default: 22)
  interval?: number                 // Interval in minutes (default: 30)
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
  interval = 30
}: ThemeTimePickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

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

  // Auto-scroll to selected time on mount
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [])

  // Generate time slots
  const generateTimeSlots = () => {
    const slots: string[] = []
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        if (hour === endHour && minute > 0) break // Don't go past end hour
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

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
      {/* Time Slots */}
      <div className="space-y-1">
        {timeSlots.map(time => {
          const isSelected = time === value

          return (
            <button
              key={time}
              ref={isSelected ? selectedRef : null}
              type="button"
              onClick={() => handleTimeSelect(time)}
              className={`
                w-full px-4 py-2 text-left rounded text-sm transition-all
                ${isSelected
                  ? `${currentTheme.selectedBg} ${currentTheme.selectedBorder} border ${currentTheme.textColor} font-medium`
                  : `text-white/70 ${currentTheme.hoverBg} ${currentTheme.hoverText}`
                }
              `}
              aria-label={`Select ${time}`}
              aria-pressed={isSelected}
            >
              {time}
            </button>
          )
        })}
      </div>

      {/* Scroll indicator hint (optional) */}
      {timeSlots.length > 8 && (
        <div className={`mt-2 pt-2 border-t ${currentTheme.borderColor} text-center`}>
          <p className="text-white/40 text-[10px]">Scroll for more times</p>
        </div>
      )}
    </motion.div>
  )
}

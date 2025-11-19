'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock } from 'lucide-react'
import type { CalendarEvent } from './EventCalendar'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

interface BookingFormProps {
  onSubmit: (event: Omit<CalendarEvent, 'id'> & { specialRequests?: string }) => void | Promise<void>
  onCancel?: () => void
  existingEvents?: CalendarEvent[]
  initialDate?: Date | null
  isLoading?: boolean
}

/**
 * BookingForm Component
 *
 * Form for creating new event bookings
 * Collects: name, email, phone, date, time, guest count, event type, and notes
 * Prevents double-booking by checking existing events
 * Can accept an initial date from calendar click
 */
export const BookingForm = ({ onSubmit, onCancel, existingEvents = [], initialDate = null, isLoading = false }: BookingFormProps) => {
  // Helper to format date without timezone issues
  const formatDateForInput = (date: Date | null) => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [formData, setFormData] = useState({
    title: '',
    email: '',
    phone: '',
    date: formatDateForInput(initialDate),
    time: '',
    guestCount: '',
    type: 'PARTY' as 'CAFE' | 'SENSORY_ROOM' | 'PLAYGROUND' | 'PARTY' | 'EVENT',
    notes: ''
  })

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [calendarDate, setCalendarDate] = useState(initialDate || new Date())
  const [conflictError, setConflictError] = useState<string>('')
  const datePickerRef = useRef<HTMLDivElement>(null)
  const timePickerRef = useRef<HTMLDivElement>(null)

  // Update calendar date when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setCalendarDate(initialDate)
    }
  }, [initialDate])

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setShowTimePicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate title
    if (!formData.title.trim()) {
      setConflictError('Naziv događaja je obavezan.')
      return
    }

    if (formData.title.trim().length < 3) {
      setConflictError('Naziv događaja mora imati najmanje 3 karaktera.')
      return
    }

    // Validate email
    if (!formData.email.trim()) {
      setConflictError('Email je obavezan.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setConflictError('Unesite validnu email adresu.')
      return
    }

    // Validate phone
    if (!formData.phone.trim()) {
      setConflictError('Telefon je obavezan.')
      return
    }

    if (formData.phone.trim().length < 10) {
      setConflictError('Unesite kompletan broj telefona sa pozivnim brojem.')
      return
    }

    // Validate date
    if (!formData.date) {
      setConflictError('Morate izabrati datum za rezervaciju.')
      return
    }

    // Check if date is in the past
    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      setConflictError('Ne možete rezervisati datum u prošlosti.')
      return
    }

    // Validate time
    if (!formData.time) {
      setConflictError('Morate izabrati vreme za rezervaciju.')
      return
    }

    // Validate guest count if provided
    if (formData.guestCount) {
      const count = parseInt(formData.guestCount)
      if (isNaN(count) || count < 1) {
        setConflictError('Broj gostiju mora biti najmanje 1.')
        return
      }
      if (count > 100) {
        setConflictError('Maksimalan broj gostiju je 100.')
        return
      }
    }

    // Check for time conflicts
    const conflict = existingEvents.find(existingEvent => {
      const existingDate = new Date(existingEvent.date)
      return (
        existingDate.toDateString() === selectedDate.toDateString() &&
        existingEvent.time === formData.time
      )
    })

    if (conflict) {
      setConflictError(`Već postoji rezervacija za ${formData.time} na ovaj datum. Molimo izaberite drugo vreme.`)
      return
    }

    // Clear any previous errors
    setConflictError('')

    const event: Omit<CalendarEvent, 'id'> & { specialRequests?: string } = {
      title: formData.title,
      date: new Date(formData.date),
      time: formData.time,
      type: formData.type,
      guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      specialRequests: formData.notes || undefined,
    }

    onSubmit(event)

    // Reset form
    setFormData({
      title: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      guestCount: '',
      type: 'PARTY',
      notes: ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handlePhoneChange = (value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      phone: value || ''
    }))
  }

  // Calendar helper functions
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

  const handleDateSelect = (day: number) => {
    const { year, month } = getDaysInMonth(calendarDate)
    const selectedDate = new Date(year, month, day)
    const dateString = formatDateForInput(selectedDate)
    setFormData(prev => ({ ...prev, date: dateString }))
    setShowDatePicker(false)
    setConflictError('') // Clear error when date changes
  }

  const handleTimeSelect = (hour: number, minute: number) => {
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    setFormData(prev => ({ ...prev, time: timeString }))
    setShowTimePicker(false)
    setConflictError('') // Clear error when time changes
  }

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Izaberite datum'
    const date = new Date(dateString)
    const monthNames = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
  }

  // Check if a specific time is already booked for the selected date
  const isTimeBooked = (timeString: string) => {
    if (!formData.date) return false

    const selectedDate = new Date(formData.date)
    return existingEvents.some(event => {
      const eventDate = new Date(event.date)
      return (
        eventDate.toDateString() === selectedDate.toDateString() &&
        event.time === timeString
      )
    })
  }

  const monthNames = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']
  const dayNames = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub']

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Conflict Error Message */}
      <AnimatePresence>
        {conflictError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border-2 border-red-500/40 rounded-lg"
          >
            <p className="text-red-400 text-sm font-medium">⚠️ {conflictError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <div>
        <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
          Naziv događaja *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
          placeholder="Npr. Rođendan Marka"
        />
      </div>

      {/* Email and Phone Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Email */}
        <div>
          <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
            placeholder="vas@email.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
            Telefon *
          </label>
          <PhoneInput
            international
            defaultCountry="RS"
            value={formData.phone}
            onChange={handlePhoneChange}
            className="phone-input-wrapper"
            numberInputProps={{
              className: "w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all",
              required: true
            }}
          />
        </div>
      </div>

      {/* Date and Time Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Date Picker */}
        <div className="relative" ref={datePickerRef}>
          <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
            Datum *
          </label>
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all flex items-center justify-between"
          >
            <span className={formData.date ? 'text-white' : 'text-white/50'}>
              {formatDisplayDate(formData.date)}
            </span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Mini Calendar Picker */}
          <AnimatePresence>
            {showDatePicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 mt-2 bg-gray-900 border-2 border-cyan-400/40 rounded-lg p-4 shadow-xl"
                style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' }}
              >
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                    className="text-cyan-400 hover:text-cyan-300 text-lg px-2"
                  >
                    ←
                  </button>
                  <div className="text-cyan-400 font-['Great_Vibes'] text-lg">
                    {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                    className="text-cyan-400 hover:text-cyan-300 text-lg px-2"
                  >
                    →
                  </button>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-cyan-400/60 text-[10px] font-medium">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: getDaysInMonth(calendarDate).startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: getDaysInMonth(calendarDate).daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const { year, month } = getDaysInMonth(calendarDate)
                    const dateObj = new Date(year, month, day)
                    const today = new Date()
                    const isToday = dateObj.toDateString() === today.toDateString()
                    const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => !isPast && handleDateSelect(day)}
                        disabled={isPast}
                        className={`
                          w-8 h-8 rounded text-xs transition-all
                          ${isPast ? 'text-white/20 cursor-not-allowed' : 'text-white/70 hover:bg-cyan-400/20 hover:text-cyan-400'}
                          ${isToday ? 'border border-cyan-400/40' : ''}
                        `}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Time Picker */}
        <div className="relative" ref={timePickerRef}>
          <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
            Vreme *
          </label>
          <button
            type="button"
            onClick={() => setShowTimePicker(!showTimePicker)}
            className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all flex items-center justify-between"
          >
            <span className={formData.time ? 'text-white' : 'text-white/50'}>
              {formData.time || 'Izaberite vreme'}
            </span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Time Picker Dropdown */}
          <AnimatePresence>
            {showTimePicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 mt-2 bg-gray-900 border-2 border-cyan-400/40 rounded-lg p-4 shadow-xl max-h-64 overflow-y-auto"
                style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' }}
              >
                <div className="space-y-1">
                  {Array.from({ length: 12 }, (_, i) => i + 9).map(hour => (
                    <div key={hour}>
                      {[0, 30].map(minute => {
                        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
                        const isBooked = isTimeBooked(timeString)

                        return (
                          <button
                            key={timeString}
                            type="button"
                            onClick={() => !isBooked && handleTimeSelect(hour, minute)}
                            disabled={isBooked}
                            className={`
                              w-full px-3 py-2 text-left rounded text-sm transition-all
                              ${isBooked
                                ? 'bg-red-500/10 text-red-400 border border-red-500/30 cursor-not-allowed line-through'
                                : 'text-white/70 hover:bg-cyan-400/20 hover:text-cyan-400'
                              }
                            `}
                            title={isBooked ? 'Već zauzeto' : ''}
                          >
                            {timeString}
                            {isBooked && <span className="ml-2 text-[10px]">(Zauzeto)</span>}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Event Type and Guest Count Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Event Type */}
        <div>
          <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
            Tip rezervacije *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
          >
            <option value="CAFE" className="bg-gray-900">Café</option>
            <option value="SENSORY_ROOM" className="bg-gray-900">Sensory Soba</option>
            <option value="PLAYGROUND" className="bg-gray-900">Igraonica</option>
            <option value="PARTY" className="bg-gray-900">Rođendan</option>
            <option value="EVENT" className="bg-gray-900">Događaj</option>
          </select>
        </div>

        {/* Number of Guests */}
        <div>
          <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
            Broj gostiju
          </label>
          <input
            type="number"
            name="guestCount"
            value={formData.guestCount}
            onChange={handleChange}
            min="1"
            className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
            placeholder="Npr. 10"
          />
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
          Posebni zahtevi
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all resize-none"
          placeholder="Napomene ili posebni zahtevi..."
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <motion.button
          type="submit"
          disabled={isLoading}
          className={`flex-1 py-3 bg-cyan-400/20 border-2 border-cyan-400/40 rounded-lg text-cyan-400 font-['Great_Vibes'] text-2xl transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-400/30 hover:border-cyan-400/60'}`}
          style={{
            textShadow: '0 0 10px #22d3ee',
          }}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
        >
          {isLoading ? 'Šalje se...' : 'Potvrdi rezervaciju'}
        </motion.button>

        {onCancel && (
          <motion.button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-white/5 border-2 border-white/20 rounded-lg text-white/70 text-sm hover:bg-white/10 hover:border-white/30 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Otkaži
          </motion.button>
        )}
      </div>
    </form>
  )
}

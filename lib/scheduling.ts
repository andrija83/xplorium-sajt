import { addMinutes, subMinutes, isWithinInterval } from 'date-fns'

/**
 * Scheduling Utilities
 *
 * Handles booking conflicts, buffer times, and scheduling optimization
 */

/**
 * Buffer time in minutes between bookings
 * This ensures adequate time for cleanup and preparation
 */
export const BUFFER_TIME_MINUTES = 45

/**
 * Booking conflict interface
 */
export interface BookingConflict {
  hasConflict: boolean
  conflictType?: 'overlap' | 'buffer_violation' | 'double_booking'
  conflictingBookingId?: string
  message?: string
  suggestedTimes?: Date[]
}

/**
 * Existing booking interface (simplified)
 */
export interface ExistingBooking {
  id: string
  date: Date
  startTime?: string
  endTime?: string
  duration?: number // in minutes
}

/**
 * Check if a new booking conflicts with existing bookings
 *
 * @param newBookingDate - The date and time of the new booking
 * @param duration - Duration of the new booking in minutes
 * @param existingBookings - Array of existing bookings to check against
 * @param excludeBookingId - Optional booking ID to exclude (for updates)
 * @param bufferTimeMinutes - Optional buffer time in minutes (defaults to BUFFER_TIME_MINUTES)
 * @returns BookingConflict object with details
 */
export function checkBookingConflict(
  newBookingDate: Date,
  duration: number,
  existingBookings: ExistingBooking[],
  excludeBookingId?: string,
  bufferTimeMinutes: number = BUFFER_TIME_MINUTES
): BookingConflict {
  const newBookingStart = new Date(newBookingDate)

  // Check each existing booking
  for (const existing of existingBookings) {
    // Skip if this is the same booking (for updates)
    if (excludeBookingId && existing.id === excludeBookingId) {
      continue
    }

    const existingStart = new Date(existing.date)

    // Calculate the time difference in minutes between the two bookings
    const timeDiffMinutes = Math.abs((newBookingStart.getTime() - existingStart.getTime()) / (1000 * 60))

    // Check if bookings are too close (within buffer time)
    // Buffer time = minimum minutes required between booking start times
    if (timeDiffMinutes < bufferTimeMinutes) {
      // Determine if it's the same time (double booking) or just too close (buffer violation)
      if (timeDiffMinutes === 0) {
        return {
          hasConflict: true,
          conflictType: 'double_booking',
          conflictingBookingId: existing.id,
          message: `This time slot is already booked at ${formatTime(existingStart)}`
        }
      } else {
        return {
          hasConflict: true,
          conflictType: 'buffer_violation',
          conflictingBookingId: existing.id,
          message: `This booking is too close to an existing booking at ${formatTime(existingStart)}. Please allow at least ${bufferTimeMinutes} minutes between bookings.`
        }
      }
    }
  }

  return {
    hasConflict: false
  }
}

/**
 * Check if two time ranges overlap
 */
function checkTimeOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return (
    (start1 >= start2 && start1 < end2) || // start1 is within range2
    (end1 > start2 && end1 <= end2) ||     // end1 is within range2
    (start1 <= start2 && end1 >= end2)     // range1 encompasses range2
  )
}

/**
 * Format time for display
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

/**
 * Suggest alternative booking times when there's a conflict
 *
 * @param preferredDate - User's preferred date/time
 * @param duration - Booking duration in minutes
 * @param existingBookings - Array of existing bookings
 * @param numberOfSuggestions - How many alternatives to suggest (default: 3)
 * @param bufferTimeMinutes - Optional buffer time in minutes (defaults to BUFFER_TIME_MINUTES)
 * @returns Array of suggested Date objects
 */
export function suggestAlternativeTimes(
  preferredDate: Date,
  duration: number,
  existingBookings: ExistingBooking[],
  numberOfSuggestions: number = 3,
  bufferTimeMinutes: number = BUFFER_TIME_MINUTES
): Date[] {
  const suggestions: Date[] = []
  const baseDate = new Date(preferredDate)

  // Try slots after the preferred time
  let nextSlot = addMinutes(baseDate, duration + bufferTimeMinutes)
  let attempts = 0
  const maxAttempts = 20 // Prevent infinite loops

  while (suggestions.length < numberOfSuggestions && attempts < maxAttempts) {
    const conflict = checkBookingConflict(nextSlot, duration, existingBookings, undefined, bufferTimeMinutes)

    if (!conflict.hasConflict) {
      suggestions.push(new Date(nextSlot))
    } else {
      // Jump past the conflicting booking
      const conflictingBooking = existingBookings.find(
        b => b.id === conflict.conflictingBookingId
      )
      if (conflictingBooking) {
        const conflictEnd = addMinutes(
          new Date(conflictingBooking.date),
          conflictingBooking.duration || 120
        )
        nextSlot = addMinutes(conflictEnd, bufferTimeMinutes)
      } else {
        nextSlot = addMinutes(nextSlot, 30) // Move forward by 30 min increments
      }
    }

    // Try next 30-minute slot
    if (suggestions.length < numberOfSuggestions) {
      nextSlot = addMinutes(nextSlot, 30)
    }
    attempts++
  }

  return suggestions
}

/**
 * Get the next available time slot
 *
 * @param startSearchFrom - Date to start searching from
 * @param duration - Booking duration in minutes
 * @param existingBookings - Array of existing bookings
 * @returns Next available Date or null if none found
 */
export function getNextAvailableSlot(
  startSearchFrom: Date,
  duration: number,
  existingBookings: ExistingBooking[]
): Date | null {
  const suggestions = suggestAlternativeTimes(startSearchFrom, duration, existingBookings, 1)
  return suggestions.length > 0 ? suggestions[0] : null
}

/**
 * Calculate the recommended booking window including buffer
 *
 * @param bookingDate - The booking date/time
 * @param duration - Booking duration in minutes
 * @returns Object with start and end times including buffer
 */
export function getBookingWindow(bookingDate: Date, duration: number) {
  const bookingStart = new Date(bookingDate)
  const bookingEnd = addMinutes(bookingStart, duration)
  const windowStart = subMinutes(bookingStart, BUFFER_TIME_MINUTES)
  const windowEnd = addMinutes(bookingEnd, BUFFER_TIME_MINUTES)

  return {
    bookingStart,
    bookingEnd,
    windowStart,
    windowEnd,
    totalDuration: duration + (BUFFER_TIME_MINUTES * 2)
  }
}

/**
 * Validate if a booking time is within business hours
 *
 * @param bookingDate - The booking date/time
 * @param businessHoursStart - Business hours start (e.g., 9 for 9 AM)
 * @param businessHoursEnd - Business hours end (e.g., 20 for 8 PM)
 * @returns true if within business hours
 */
export function isWithinBusinessHours(
  bookingDate: Date,
  businessHoursStart: number = 9,
  businessHoursEnd: number = 20
): boolean {
  const hour = bookingDate.getHours()
  return hour >= businessHoursStart && hour < businessHoursEnd
}

/**
 * Get available slots for a specific day
 *
 * @param date - The date to check
 * @param existingBookings - Existing bookings for that day
 * @param slotDuration - Duration of each slot in minutes (default: 120)
 * @param businessHoursStart - Start hour (default: 9)
 * @param businessHoursEnd - End hour (default: 20)
 * @returns Array of available time slots
 */
export function getAvailableSlots(
  date: Date,
  existingBookings: ExistingBooking[],
  slotDuration: number = 120,
  businessHoursStart: number = 9,
  businessHoursEnd: number = 20
): Date[] {
  const availableSlots: Date[] = []
  const dayStart = new Date(date)
  dayStart.setHours(businessHoursStart, 0, 0, 0)

  // Generate 30-minute intervals throughout the day
  let currentSlot = new Date(dayStart)
  const dayEnd = new Date(date)
  dayEnd.setHours(businessHoursEnd, 0, 0, 0)

  while (currentSlot < dayEnd) {
    // Check if this slot + duration fits within business hours
    const slotEnd = addMinutes(currentSlot, slotDuration)
    if (slotEnd <= dayEnd) {
      // Check for conflicts
      const conflict = checkBookingConflict(
        currentSlot,
        slotDuration,
        existingBookings
      )

      if (!conflict.hasConflict) {
        availableSlots.push(new Date(currentSlot))
      }
    }

    // Move to next 30-minute slot
    currentSlot = addMinutes(currentSlot, 30)
  }

  return availableSlots
}

import { createEvents, EventAttributes } from 'ics'
import type { AdminBookingEvent } from '@/components/admin/AdminBookingCalendar'

/**
 * Calendar Utilities
 *
 * Helper functions for calendar operations
 * - ICS file export
 * - Event formatting
 */

/**
 * Export bookings to ICS file for calendar import
 * Creates a downloadable .ics file compatible with Google Calendar, Outlook, Apple Calendar, etc.
 *
 * @param events - Array of booking events to export
 * @param filename - Name of the downloaded .ics file (default: 'bookings.ics')
 *
 * @example
 * ```typescript
 * const bookings = await getAdminBookings()
 * exportToICS(bookings, 'xplorium-bookings.ics')
 * ```
 *
 * @remarks
 * - Assumes 1-hour duration for all events
 * - Sets status to CONFIRMED for approved bookings, TENTATIVE for others
 * - Includes booking details (type, guests, contact info) in description
 */
export function exportToICS(events: AdminBookingEvent[], filename: string = 'bookings.ics') {
  const icsEvents: EventAttributes[] = events.map(event => {
    const eventDate = new Date(event.date)
    const [hours, minutes] = event.time.split(':').map(Number)

    // Set start time
    const start: [number, number, number, number, number] = [
      eventDate.getFullYear(),
      eventDate.getMonth() + 1,  // ICS months are 1-indexed
      eventDate.getDate(),
      hours,
      minutes
    ]

    // Set end time (assume 1 hour duration by default)
    const endHours = hours + 1
    const end: [number, number, number, number, number] = [
      eventDate.getFullYear(),
      eventDate.getMonth() + 1,
      eventDate.getDate(),
      endHours,
      minutes
    ]

    // Build description
    let description = `Type: ${event.type}\nStatus: ${event.status}`
    if (event.guestCount) {
      description += `\nGuests: ${event.guestCount}`
    }
    if (event.phone) {
      description += `\nPhone: ${event.phone}`
    }
    if (event.email) {
      description += `\nEmail: ${event.email}`
    }
    if (event.description) {
      description += `\n\n${event.description}`
    }

    return {
      title: event.title,
      description,
      start,
      end,
      status: event.status === 'APPROVED' ? 'CONFIRMED' : 'TENTATIVE',
      organizer: { name: 'Xplorium', email: 'bookings@xplorium.com' },
      categories: [event.type],
      location: 'Xplorium - Family Entertainment Center',
    }
  })

  createEvents(icsEvents, (error, value) => {
    if (error) {
      console.error('Error creating ICS file:', error)
      return
    }

    // Create download link
    const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  })
}

/**
 * Parse time string and combine with date to create Date object
 *
 * @param date - Base date to use
 * @param timeString - Time in "HH:MM" format (24-hour)
 * @returns New Date object with time applied
 *
 * @example
 * ```typescript
 * const date = new Date('2024-12-04')
 * const eventTime = parseTimeToDate(date, '14:30') // 2:30 PM on Dec 4, 2024
 * ```
 */
export function parseTimeToDate(date: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number)
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

/**
 * Format date and time for user-friendly display
 *
 * @param date - Event date
 * @param time - Event time in "HH:MM" format
 * @returns Formatted string like "Wed, Dec 4, 2024, 2:30 PM"
 *
 * @example
 * ```typescript
 * const formatted = formatEventDate(new Date('2024-12-04'), '14:30')
 * // Returns: "Wed, Dec 4, 2024, 2:30 PM"
 * ```
 */
export function formatEventDate(date: Date, time: string): string {
  const eventDate = parseTimeToDate(date, time)
  return eventDate.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

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
 * Export bookings to ICS file
 * Creates a downloadable .ics file for calendar import
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
 * Parse time string to Date object
 */
export function parseTimeToDate(date: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number)
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

/**
 * Format date for display
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

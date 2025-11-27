/**
 * useBookings Hook
 *
 * React Query hook for fetching approved bookings.
 * Transforms database bookings to calendar event format.
 */

import { useQuery } from '@tanstack/react-query'
import { getApprovedBookings } from '@/app/actions/bookings'
import type { CalendarEvent } from '@/components/common'

/**
 * Fetch and cache approved bookings
 *
 * Automatically transforms database bookings to CalendarEvent format
 * for use with the EventCalendar component
 */
export function useBookings() {
  return useQuery({
    queryKey: ['bookings', 'approved'],
    queryFn: async () => {
      const result = await getApprovedBookings()

      if (!result.success) {
        throw new Error('Failed to fetch bookings')
      }

      // Transform database bookings to CalendarEvent format
      const calendarEvents: CalendarEvent[] = result.bookings.map((booking) => ({
        id: booking.id,
        title: booking.title,
        date: new Date(booking.date),
        time: booking.time,
        type: booking.type as CalendarEvent['type'],
        guestCount: booking.guestCount || undefined,
        phone: booking.phone || undefined,
        email: booking.email || undefined,
      }))

      return calendarEvents
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * usePublishedEvents Hook
 *
 * React Query hook for fetching published future events.
 * Automatically filters to show only upcoming events.
 */

import { useQuery } from '@tanstack/react-query'
import { getPublishedEvents } from '@/app/actions/events'

/**
 * Fetch and cache published events
 *
 * Automatically filters to show only future events (today and later)
 *
 * @param limit - Maximum number of events to fetch (default: 10)
 */
export function usePublishedEvents(limit: number = 10) {
  return useQuery({
    queryKey: ['events', 'published', limit],
    queryFn: async () => {
      const result = await getPublishedEvents(limit)

      if (!result.success || !result.events) {
        throw new Error(result.error || 'Failed to fetch events')
      }

      // Filter only future events (compare by date only, not time)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const futureEvents = result.events.filter(event => {
        const eventDate = new Date(event.date)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate >= today
      })

      return futureEvents
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

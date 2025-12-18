import { getPublishedEvents } from '@/app/actions/events'
import { EventsPage } from './EventsPage'
import type { Event } from './EventCard'

/**
 * Server component wrapper that fetches events from database
 * and passes them to the client EventsPage component
 */
export async function EventsPageWrapper() {
  const result = await getPublishedEvents(50) // Fetch up to 50 events

  // Transform the database events to match our Event interface
  const events: Event[] = result.success && result.events
    ? result.events.map(event => ({
        id: event.id,
        slug: event.slug,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        endTime: event.endTime,
        image: event.image,
        category: event.category,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
        price: event.price,
        currency: event.currency,
        location: event.location,
        tags: event.tags,
        theme: event.theme,
      }))
    : []

  return <EventsPage events={events} />
}

'use server'

import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { logger } from '@/lib/logger'
import { requireAdmin } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { notifyAllAdmins } from './notifications'
import {
  createEventSchema,
  updateEventSchema,
  reorderEventsSchema,
  rsvpSchema,
  type CreateEventInput,
  type UpdateEventInput,
  type ReorderEventsInput,
  type RSVPInput
} from '@/lib/validations/events'

/**
 * Get all events with optional filtering (Admin only)
 * @param filters - Filter options
 * @returns Array of events
 */
export async function getEvents({
  status,
  category,
  search,
  limit = 50,
  offset = 0,
}: {
  status?: string
  category?: string
  search?: string
  limit?: number
  offset?: number
} = {}) {
  try {
    await requireAdmin()

    const where = {
      ...(status && { status: status as any }),
      ...(category && { category: category as any }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          _count: {
            select: { attendees: true }
          }
        },
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
        take: limit,
        skip: offset,
      }),
      prisma.event.count({ where }),
    ])

    return { success: true, events, total }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message, events: [], total: 0 }
    }
    return { success: false, error: 'Unauthorized', events: [], total: 0 }
  }
}

/**
 * Get a single event by ID (Admin only)
 * @param id - Event ID
 * @returns Event data
 */
export async function getEventById(id: string) {
  try {
    await requireAdmin()

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        attendees: {
          orderBy: { registeredAt: 'desc' }
        }
      }
    })

    if (!event) {
      return { error: 'Event not found' }
    }

    return { success: true, event }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Unauthorized' }
  }
}

/**
 * Get a single event by slug (public)
 * @param slug - Event slug
 * @returns Event data
 */
export async function getEventBySlug(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug, status: 'PUBLISHED' },
  })

  if (!event) {
    return { error: 'Event not found' }
  }

  return { success: true, event }
}

/**
 * Get published events for public display
 * @param limit - Maximum number of events to return
 * @returns Array of published events
 */
export async function getPublishedEvents(limit = 10) {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ date: 'asc' }],
      take: limit,
    })

    return { success: true, events }
  } catch (error) {
    logger.serverActionError('getPublishedEvents', error)
    return { success: false, events: [] }
  }
}

/**
 * Create a new event
 * @param data - Event data
 * @returns Created event
 */
export async function createEvent(data: CreateEventInput) {
  try {
    const session = await requireAdmin()

    // Validate input
    const validatedData = createEventSchema.parse(data)

    // Check if slug already exists
    const existingEvent = await prisma.event.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingEvent) {
      return { error: 'An event with this slug already exists' }
    }

    // Get max order for new event
    const maxOrder = await prisma.event.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    // Create event
    const event = await prisma.event.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
        tags: validatedData.tags || [],
        registeredCount: 0,
        order: (maxOrder?.order || 0) + 1,
      },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'Event',
      entityId: event.id,
      changes: validatedData,
    })

    revalidatePath('/admin/events')
    revalidatePath('/', 'page') // Revalidate main page with Cafe section

    return {
      success: true,
      event,
      message: 'Event created successfully',
    }
  } catch (error) {
    logger.serverActionError('createEvent', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to create event',
    }
  }
}

/**
 * Update an event
 * @param id - Event ID
 * @param data - Updated event data
 * @returns Updated event
 */
export async function updateEvent(id: string, data: UpdateEventInput) {
  try {
    const session = await requireAdmin()

    // Validate input
    const validatedData = updateEventSchema.parse(data)

    // If slug is being updated, check if it already exists
    if (validatedData.slug) {
      const existingEvent = await prisma.event.findUnique({
        where: { slug: validatedData.slug },
      })

      if (existingEvent && existingEvent.id !== id) {
        return { error: 'An event with this slug already exists' }
      }
    }

    // Update event
    const event = await prisma.event.update({
      where: { id },
      data: validatedData,
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Event',
      entityId: id,
      changes: validatedData,
    })

    revalidatePath('/admin/events')
    revalidatePath(`/admin/events/${id}`)
    revalidatePath('/', 'page') // Revalidate main page with Cafe section

    return {
      success: true,
      event,
      message: 'Event updated successfully',
    }
  } catch (error) {
    logger.serverActionError('updateEvent', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to update event',
    }
  }
}

/**
 * Delete an event
 * @param id - Event ID
 * @returns Success status
 */
export async function deleteEvent(id: string) {
  try {
    const session = await requireAdmin()

    // Check if event has attendees
    const event = await prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { attendees: true } } }
    })

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    if (event._count.attendees > 0) {
      return {
        success: false,
        error: 'Cannot delete event with registered attendees. Archive it instead.'
      }
    }

    await prisma.event.delete({
      where: { id },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'DELETE',
      entity: 'Event',
      entityId: id,
    })

    revalidatePath('/admin/events')
    revalidatePath('/', 'page') // Revalidate main page with Cafe section

    return {
      success: true,
      message: 'Event deleted successfully',
    }
  } catch (error) {
    logger.serverActionError('deleteEvent', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to delete event',
    }
  }
}

/**
 * Reorder events (drag and drop)
 * @param data - Array of event IDs in new order
 * @returns Success status
 */
export async function reorderEvents(data: ReorderEventsInput) {
  try {
    const session = await requireAdmin()

    // Validate input
    const validatedData = reorderEventsSchema.parse(data)

    // Update each event's order
    await Promise.all(
      validatedData.eventIds.map((id, index) =>
        prisma.event.update({
          where: { id },
          data: { order: index },
        })
      )
    )

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Event',
      entityId: 'multiple',
      changes: { newOrder: validatedData.eventIds },
    })

    revalidatePath('/admin/events')

    return {
      success: true,
      message: 'Events reordered successfully',
    }
  } catch (error) {
    logger.serverActionError('reorderEvents', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to reorder events',
    }
  }
}

/**
 * Publish an event
 * @param id - Event ID
 * @returns Success status
 */
export async function publishEvent(id: string) {
  try {
    const session = await requireAdmin()

    const event = await prisma.event.update({
      where: { id },
      data: { status: 'PUBLISHED' }
    })

    await logAudit({
      userId: session.user.id,
      action: 'PUBLISH',
      entity: 'Event',
      entityId: id
    })

    // Notify admins about published event
    try {
      await notifyAllAdmins({
        type: 'EVENT_PUBLISHED',
        title: 'Event Published',
        message: `"${event.title}" is now live and accepting registrations`,
        data: { eventId: event.id }
      })
    } catch (notifError) {
      logger.error('Failed to send event published notification', notifError instanceof Error ? notifError : new Error(String(notifError)))
    }

    revalidatePath('/admin/events')
    revalidatePath('/events') // Public events page

    return {
      success: true,
      event,
      message: 'Event published successfully'
    }
  } catch (error) {
    logger.serverActionError('publishEvent', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish event'
    }
  }
}

/**
 * Archive an event
 * @param id - Event ID
 * @returns Success status
 */
export async function archiveEvent(id: string) {
  try {
    const session = await requireAdmin()

    const event = await prisma.event.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    })

    await logAudit({
      userId: session.user.id,
      action: 'ARCHIVE',
      entity: 'Event',
      entityId: id
    })

    revalidatePath('/admin/events')

    return {
      success: true,
      event,
      message: 'Event archived successfully'
    }
  } catch (error) {
    logger.serverActionError('archiveEvent', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive event'
    }
  }
}

/**
 * Register for an event (RSVP) - Public
 * @param data - RSVP data
 * @returns Success status
 */
export async function registerForEvent(data: RSVPInput) {
  try {
    const validatedData = rsvpSchema.parse(data)

    // Check if event exists and has capacity
    const event = await prisma.event.findUnique({
      where: { id: validatedData.eventId },
      include: { _count: { select: { attendees: true } } }
    })

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    if (event.status !== 'PUBLISHED') {
      return { success: false, error: 'Event is not available for registration' }
    }

    if (event.capacity && event._count.attendees >= event.capacity) {
      return { success: false, error: 'Event is full' }
    }

    // Check if already registered
    const existingRSVP = await prisma.eventAttendee.findUnique({
      where: {
        eventId_email: {
          eventId: validatedData.eventId,
          email: validatedData.email
        }
      }
    })

    if (existingRSVP) {
      return { success: false, error: 'You are already registered for this event' }
    }

    // Create attendee
    const attendee = await prisma.eventAttendee.create({
      data: {
        ...validatedData,
        status: 'CONFIRMED'
      }
    })

    // Update registered count
    const updatedEvent = await prisma.event.update({
      where: { id: validatedData.eventId },
      data: { registeredCount: { increment: 1 } },
      include: { _count: { select: { attendees: true } } }
    })

    // Notify admins of new registration
    try {
      await notifyAllAdmins({
        type: 'NEW_EVENT_REGISTRATION',
        title: 'New Event Registration',
        message: `${validatedData.name} registered for "${event.title}" (${validatedData.guestCount} guest${validatedData.guestCount > 1 ? 's' : ''})`,
        data: { eventId: event.id, attendeeId: attendee.id }
      })

      // Check if event is now full
      if (event.capacity && updatedEvent._count.attendees >= event.capacity) {
        await notifyAllAdmins({
          type: 'EVENT_FULL',
          title: 'Event Full',
          message: `"${event.title}" has reached capacity (${event.capacity}/${event.capacity})`,
          data: { eventId: event.id }
        })
      }
    } catch (notifError) {
      logger.error('Failed to send event registration notification', notifError instanceof Error ? notifError : new Error(String(notifError)))
    }

    revalidatePath(`/events/${event.slug}`)
    revalidatePath('/admin/events')

    return {
      success: true,
      attendee,
      message: 'Successfully registered for event'
    }
  } catch (error) {
    logger.serverActionError('registerForEvent', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register for event'
    }
  }
}

/**
 * Cancel event registration
 * @param attendeeId - Attendee ID
 * @returns Success status
 */
export async function cancelRegistration(attendeeId: string) {
  try {
    const attendee = await prisma.eventAttendee.findUnique({
      where: { id: attendeeId },
      include: { event: true }
    })

    if (!attendee) {
      return { success: false, error: 'Registration not found' }
    }

    await prisma.eventAttendee.delete({
      where: { id: attendeeId }
    })

    // Update registered count
    await prisma.event.update({
      where: { id: attendee.eventId },
      data: { registeredCount: { decrement: 1 } }
    })

    revalidatePath('/admin/events')
    revalidatePath(`/events/${attendee.event.slug}`)

    return {
      success: true,
      message: 'Registration cancelled successfully'
    }
  } catch (error) {
    logger.serverActionError('cancelRegistration', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel registration'
    }
  }
}

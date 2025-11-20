'use server'

import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { requireAdmin } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import {
  createEventSchema,
  updateEventSchema,
  reorderEventsSchema,
  type CreateEventInput,
  type UpdateEventInput,
  type ReorderEventsInput,
} from '@/lib/validations'

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
      ...(category && { category }),
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
        orderBy: [{ order: 'asc' }, { date: 'desc' }],
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
    console.error('Get published events error:', error)
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
    console.error('Create event error:', error)

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
    console.error('Update event error:', error)

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
    console.error('Delete event error:', error)

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
    console.error('Reorder events error:', error)

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

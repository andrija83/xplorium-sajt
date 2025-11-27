'use server'

import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { logger } from '@/lib/logger'
import { requireAdmin, requireAuth } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import {
  createBookingSchema,
  updateBookingSchema,
  approveBookingSchema,
  rejectBookingSchema,
  type CreateBookingInput,
  type UpdateBookingInput,
} from '@/lib/validations'

/**
 * Get all bookings with optional filtering
 * @param filters - Filter options
 * @returns Array of bookings
 */
export async function getBookings({
  status,
  type,
  search,
  limit = 50,
  offset = 0,
}: {
  status?: string
  type?: string
  search?: string
  limit?: number
  offset?: number
} = {}) {
  try {
    await requireAdmin()

    const where = {
      ...(status && { status: status as any }),
      ...(type && { type: type as any }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { title: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      }),
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.booking.count({ where }),
    ])

    return { success: true, bookings, total }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Unauthorized' }
  }
}

/**
 * Get a single booking by ID
 * @param id - Booking ID
 * @returns Booking data
 */
export async function getBookingById(id: string) {
  try {
    await requireAdmin()

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!booking) {
      return { error: 'Booking not found' }
    }

    return { success: true, booking }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Unauthorized' }
  }
}

/**
 * Create a new booking (requires authentication)
 * @param data - Booking data
 * @returns Created booking
 */
export async function createBooking(data: CreateBookingInput) {
  try {
    const session = await requireAuth()

    // Validate input
    const validatedData = createBookingSchema.parse(data)

    // Create booking
    // Combine date and time into scheduledAt timestamp
    const [hours, minutes] = validatedData.time.split(':').map(Number)
    const scheduledAt = new Date(validatedData.date)
    scheduledAt.setHours(hours, minutes, 0, 0)

    const booking = await prisma.booking.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        status: 'PENDING',
        scheduledAt,
      },
    })

    revalidatePath('/admin/bookings')

    return {
      success: true,
      booking,
      message: 'Booking created successfully',
    }
  } catch (error) {
    logger.serverActionError('createBooking', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to create booking',
    }
  }
}

/**
 * Update a booking
 * @param id - Booking ID
 * @param data - Updated booking data
 * @returns Updated booking
 */
export async function updateBooking(id: string, data: UpdateBookingInput) {
  try {
    const session = await requireAdmin()

    // Validate input
    const validatedData = updateBookingSchema.parse(data)

    // Get original booking for audit log
    const originalBooking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!originalBooking) {
      return { error: 'Booking not found' }
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id },
      data: validatedData,
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Booking',
      entityId: id,
      changes: validatedData,
    })

    revalidatePath('/admin/bookings')
    revalidatePath(`/admin/bookings/${id}`)

    return {
      success: true,
      booking,
      message: 'Booking updated successfully',
    }
  } catch (error) {
    logger.serverActionError('updateBooking', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to update booking',
    }
  }
}

/**
 * Approve a booking
 * @param bookingId - Booking ID
 * @param adminNotes - Admin notes
 * @returns Updated booking
 */
export async function approveBooking(bookingId: string, adminNotes?: string) {
  try {
    const session = await requireAdmin()

    // Validate input
    const validatedData = approveBookingSchema.parse({ bookingId, adminNotes })

    // Update booking
    const booking = await prisma.booking.update({
      where: { id: validatedData.bookingId },
      data: {
        status: 'APPROVED',
        adminNotes: validatedData.adminNotes,
      },
      include: {
        user: true,
      },
    })

    // TODO: Send email notification in Phase 5
    // await sendEmail({
    //   to: booking.email,
    //   template: 'booking-approved',
    //   data: booking,
    // })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'APPROVE',
      entity: 'Booking',
      entityId: validatedData.bookingId,
      changes: { status: 'APPROVED', adminNotes: validatedData.adminNotes },
    })

    revalidatePath('/admin/bookings')
    revalidatePath(`/admin/bookings/${validatedData.bookingId}`)

    return {
      success: true,
      booking,
      message: 'Booking approved successfully',
    }
  } catch (error) {
    logger.serverActionError('approveBooking', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to approve booking',
    }
  }
}

/**
 * Reject a booking
 * @param bookingId - Booking ID
 * @param reason - Rejection reason
 * @returns Updated booking
 */
export async function rejectBooking(bookingId: string, reason: string) {
  try {
    const session = await requireAdmin()

    // Validate input
    const validatedData = rejectBookingSchema.parse({ bookingId, reason })

    // Update booking
    const booking = await prisma.booking.update({
      where: { id: validatedData.bookingId },
      data: {
        status: 'REJECTED',
        adminNotes: validatedData.reason,
      },
      include: {
        user: true,
      },
    })

    // TODO: Send email notification in Phase 5
    // await sendEmail({
    //   to: booking.email,
    //   template: 'booking-rejected',
    //   data: { ...booking, reason: validatedData.reason },
    // })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'REJECT',
      entity: 'Booking',
      entityId: validatedData.bookingId,
      changes: { status: 'REJECTED', reason: validatedData.reason },
    })

    revalidatePath('/admin/bookings')
    revalidatePath(`/admin/bookings/${validatedData.bookingId}`)

    return {
      success: true,
      booking,
      message: 'Booking rejected',
    }
  } catch (error) {
    logger.serverActionError('rejectBooking', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to reject booking',
    }
  }
}

/**
 * Delete a booking
 * @param id - Booking ID
 * @returns Success status
 */
export async function deleteBooking(id: string) {
  try {
    const session = await requireAdmin()

    await prisma.booking.delete({
      where: { id },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'DELETE',
      entity: 'Booking',
      entityId: id,
    })

    revalidatePath('/admin/bookings')

    return {
      success: true,
      message: 'Booking deleted successfully',
    }
  } catch (error) {
    logger.serverActionError('deleteBooking', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to delete booking',
    }
  }
}

/**
 * Get approved bookings for public calendar display
 * Public endpoint - no auth required
 * @returns Array of approved bookings
 */
export async function getApprovedBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'APPROVED',
      },
      select: {
        id: true,
        title: true,
        date: true,
        time: true,
        type: true,
        guestCount: true,
        email: true,
        phone: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    return {
      success: true,
      bookings,
    }
  } catch (error) {
    logger.serverActionError('getApprovedBookings', error)
    return {
      success: false,
      bookings: [],
    }
  }
}

/**
 * Get current user's bookings
 * Requires authentication
 * @returns Array of user's bookings
 */
export async function getUserBookings() {
  try {
    const session = await requireAuth()

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return {
      success: true,
      bookings,
    }
  } catch (error) {
    logger.serverActionError('getUserBookings', error)
    return {
      success: false,
      error: 'Failed to load bookings',
      bookings: [],
    }
  }
}

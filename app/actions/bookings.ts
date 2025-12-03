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
import { notifyAllAdmins, createNotification } from './notifications'
import { checkBookingConflict, suggestAlternativeTimes, type ExistingBooking } from '@/lib/scheduling'
import { getBufferTime } from './settings'
import { startOfDay, endOfDay, format } from 'date-fns'
import {
  sendBookingConfirmationEmail,
  sendBookingApprovedEmail,
  sendBookingRejectedEmail
} from '@/lib/email'

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
 * Check for booking conflicts
 * @param date - Booking date
 * @param time - Booking time (HH:MM format)
 * @param duration - Booking duration in minutes (default: 120)
 * @param excludeBookingId - Optional booking ID to exclude from conflict check (for updates)
 * @returns Conflict information with suggestions
 */
export async function checkBookingConflicts(
  date: Date,
  time: string,
  duration: number = 120,
  excludeBookingId?: string
) {
  try {
    // Get dynamic buffer time from settings
    const bufferResult = await getBufferTime()
    const bufferTimeMinutes = bufferResult.bufferTime

    // Combine date and time
    const [hours, minutes] = time.split(':').map(Number)
    const bookingDateTime = new Date(date)
    bookingDateTime.setHours(hours, minutes, 0, 0)

    // Get all bookings for the same day
    const dayStart = startOfDay(new Date(date))
    const dayEnd = endOfDay(new Date(date))

    const existingBookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd
        },
        status: {
          in: ['PENDING', 'APPROVED', 'COMPLETED']
        }
      },
      select: {
        id: true,
        date: true,
        time: true, // Need time to reconstruct full DateTime
        title: true,
        type: true
      }
    })

    // Convert to ExistingBooking format
    // IMPORTANT: Combine date + time to get the actual booking DateTime
    // Note: Duration field doesn't exist in database, defaulting to 120 minutes
    const formattedBookings: ExistingBooking[] = existingBookings.map(b => {
      const bookingDateTime = new Date(b.date)
      const [hours, minutes] = b.time.split(':').map(Number)
      bookingDateTime.setHours(hours, minutes, 0, 0)

      return {
        id: b.id,
        date: bookingDateTime, // Full DateTime including the actual time
        duration: 120 // Default duration since field doesn't exist in schema
      }
    })

    // Check for conflicts with dynamic buffer time
    const conflict = checkBookingConflict(
      bookingDateTime,
      duration,
      formattedBookings,
      excludeBookingId,
      bufferTimeMinutes // Pass dynamic buffer time
    )

    // If there's a conflict, suggest alternatives with dynamic buffer time
    let suggestedTimes: Date[] = []
    if (conflict.hasConflict) {
      suggestedTimes = suggestAlternativeTimes(
        bookingDateTime,
        duration,
        formattedBookings,
        3, // Suggest 3 alternative times
        bufferTimeMinutes // Pass dynamic buffer time
      )
    }

    return {
      success: true,
      conflict: {
        ...conflict,
        suggestedTimes
      },
      bufferTimeMinutes // Return buffer time for display
    }
  } catch (error) {
    logger.serverActionError('checkBookingConflicts', error)
    return {
      success: false,
      error: 'Failed to check booking conflicts'
    }
  }
}

/**
 * Get all bookings for a specific day (optimized for availability checking)
 * @param date - The date to check
 * @returns Array of bookings with time and duration
 */
export async function getBookingsForDay(date: Date) {
  try {
    const dayStart = startOfDay(new Date(date))
    const dayEnd = endOfDay(new Date(date))

    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd
        },
        status: {
          in: ['PENDING', 'APPROVED', 'COMPLETED']
        }
      },
      select: {
        id: true,
        date: true,
        time: true,
        title: true,
        type: true
      }
    })

    // Get buffer time
    const bufferResult = await getBufferTime()
    const bufferTimeMinutes = bufferResult.bufferTime

    // Convert to format with full DateTime
    const formattedBookings = bookings.map(b => {
      const bookingDateTime = new Date(b.date)
      const [hours, minutes] = b.time.split(':').map(Number)
      bookingDateTime.setHours(hours, minutes, 0, 0)

      return {
        id: b.id,
        datetime: bookingDateTime.toISOString(),
        time: b.time,
        duration: 120, // Default duration
        title: b.title,
        type: b.type
      }
    })

    return {
      success: true,
      bookings: formattedBookings,
      bufferTimeMinutes
    }
  } catch (error) {
    logger.serverActionError('getBookingsForDay', error)
    return {
      success: false,
      error: 'Failed to get bookings'
    }
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

    // Check for booking conflicts (default 120 minute duration)
    const conflictCheck = await checkBookingConflicts(
      validatedData.date,
      validatedData.time,
      120 // Default duration in minutes
    )

    if (conflictCheck.success && conflictCheck.conflict?.hasConflict) {
      return {
        success: false,
        error: conflictCheck.conflict.message || 'Booking conflicts with existing bookings',
        conflictType: conflictCheck.conflict.conflictType,
        suggestedTimes: conflictCheck.conflict.suggestedTimes
      }
    }

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

    // Notify all admins of new booking
    try {
      const notifResult = await notifyAllAdmins({
        type: 'NEW_BOOKING',
        title: 'New Booking Received',
        message: `${booking.title} - ${validatedData.type} on ${new Date(booking.date).toLocaleDateString()}`,
        data: { bookingId: booking.id }
      })
      if (notifResult.success) {
        logger.info('Notification sent to admins for new booking', { bookingId: booking.id, count: notifResult.count })
      } else {
        logger.error('Failed to send notification for new booking', new Error(notifResult.error || 'Unknown error'))
      }
    } catch (notifError) {
      logger.error('Exception while sending notification for new booking', notifError instanceof Error ? notifError : new Error(String(notifError)))
      // Don't fail the booking creation if notification fails
    }

    // Send confirmation email to customer
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true }
      })

      if (user && user.email) {
        const emailResult = await sendBookingConfirmationEmail({
          to: user.email,
          customerName: user.name || 'Customer',
          bookingId: booking.id,
          bookingTitle: booking.title,
          bookingDate: format(new Date(booking.date), 'MMMM d, yyyy'),
          bookingTime: booking.time,
          guestCount: booking.guestCount,
          specialRequests: booking.specialRequests || undefined
        })

        if (emailResult.success) {
          logger.info('Confirmation email sent to customer', { bookingId: booking.id, email: user.email })
        } else {
          logger.error('Failed to send confirmation email', new Error(emailResult.error || 'Unknown error'))
        }
      }
    } catch (emailError) {
      logger.error('Exception while sending confirmation email', emailError instanceof Error ? emailError : new Error(String(emailError)))
      // Don't fail the booking creation if email fails
    }

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

    // If date or time is being changed, check for conflicts
    if (validatedData.date || validatedData.time) {
      const checkDate = validatedData.date || originalBooking.date
      const checkTime = validatedData.time || originalBooking.time
      const checkDuration = 120 // Default duration in minutes

      const conflictCheck = await checkBookingConflicts(
        checkDate,
        checkTime,
        checkDuration,
        id // Exclude this booking from conflict check
      )

      if (conflictCheck.success && conflictCheck.conflict?.hasConflict) {
        return {
          success: false,
          error: conflictCheck.conflict.message || 'Booking conflicts with existing bookings',
          conflictType: conflictCheck.conflict.conflictType,
          suggestedTimes: conflictCheck.conflict.suggestedTimes
        }
      }
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

    // Notify the user
    await createNotification({
      userId: booking.userId,
      type: 'BOOKING_APPROVED',
      title: 'Booking Approved',
      message: `Your booking "${booking.title}" has been approved!`,
      data: { bookingId: booking.id }
    })

    // Send approval email to customer
    try {
      if (booking.user && booking.user.email) {
        const emailResult = await sendBookingApprovedEmail({
          to: booking.user.email,
          customerName: booking.user.name || 'Customer',
          bookingId: booking.id,
          bookingTitle: booking.title,
          bookingDate: format(new Date(booking.date), 'MMMM d, yyyy'),
          bookingTime: booking.time,
          adminNotes: validatedData.adminNotes || undefined
        })

        if (emailResult.success) {
          logger.info('Approval email sent to customer', { bookingId: booking.id, email: booking.user.email })
        } else {
          logger.error('Failed to send approval email', new Error(emailResult.error || 'Unknown error'))
        }
      }
    } catch (emailError) {
      logger.error('Exception while sending approval email', emailError instanceof Error ? emailError : new Error(String(emailError)))
      // Don't fail the approval if email fails
    }

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

    // Send rejection email to customer
    try {
      if (booking.user && booking.user.email) {
        const emailResult = await sendBookingRejectedEmail({
          to: booking.user.email,
          customerName: booking.user.name || 'Customer',
          bookingId: booking.id,
          bookingTitle: booking.title,
          bookingDate: format(new Date(booking.date), 'MMMM d, yyyy'),
          bookingTime: booking.time,
          reason: validatedData.reason || undefined
        })

        if (emailResult.success) {
          logger.info('Rejection email sent to customer', { bookingId: booking.id, email: booking.user.email })
        } else {
          logger.error('Failed to send rejection email', new Error(emailResult.error || 'Unknown error'))
        }
      }
    } catch (emailError) {
      logger.error('Exception while sending rejection email', emailError instanceof Error ? emailError : new Error(String(emailError)))
      // Don't fail the rejection if email fails
    }

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
 * NOTE: PII (email, phone) excluded for GDPR compliance
 * @returns Array of approved bookings (without PII)
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
        // PII removed for GDPR compliance - public endpoint should not expose:
        // email: true,
        // phone: true,
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

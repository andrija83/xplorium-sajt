'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'
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
  const session = await auth()

  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: 'Unauthorized' }
  }

  const bookings = await prisma.booking.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(type && { type: type as any }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }),
    },
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
  })

  return { success: true, bookings }
}

/**
 * Get a single booking by ID
 * @param id - Booking ID
 * @returns Booking data
 */
export async function getBookingById(id: string) {
  const session = await auth()

  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: 'Unauthorized' }
  }

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
}

/**
 * Create a new booking (requires authentication)
 * @param data - Booking data
 * @returns Created booking
 */
export async function createBooking(data: CreateBookingInput) {
  try {
    const session = await auth()

    // Require authentication
    if (!session?.user) {
      return {
        success: false,
        error: 'You must be signed in to create a booking',
      }
    }

    // Validate input
    const validatedData = createBookingSchema.parse(data)

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        status: 'PENDING',
      },
    })

    revalidatePath('/admin/bookings')

    return {
      success: true,
      booking,
      message: 'Booking created successfully',
    }
  } catch (error) {
    console.error('Create booking error:', error)

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
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

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
    console.error('Update booking error:', error)

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
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

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
    console.error('Approve booking error:', error)

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
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

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
    console.error('Reject booking error:', error)

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
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

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
    console.error('Delete booking error:', error)

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
    console.error('Get approved bookings error:', error)
    return {
      success: false,
      bookings: [],
    }
  }
}

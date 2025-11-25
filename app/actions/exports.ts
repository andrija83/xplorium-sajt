'use server'

import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { requireAdmin } from '@/lib/auth-utils'
import { formatDateForCSV, formatDateTimeForCSV } from '@/lib/csv-export'

/**
 * Export all bookings to CSV-ready format
 * @param filters - Optional filters (status, date range, type)
 * @returns Bookings data ready for CSV export
 */
export async function exportBookings(filters?: {
  status?: string
  startDate?: string
  endDate?: string
  type?: string
}) {
  try {
    await requireAdmin()

    // Build where clause
    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {}
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate)
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Format data for CSV
    const exportData = bookings.map((booking) => ({
      'Booking ID': booking.id,
      'Title': booking.title,
      'Date': formatDateForCSV(booking.date),
      'Time': booking.time,
      'Type': booking.type,
      'Status': booking.status,
      'Guest Count': booking.guestCount,
      'Contact Name': booking.user?.name || 'Guest',
      'Contact Email': booking.email,
      'Contact Phone': booking.phone,
      'Special Requests': booking.specialRequests || '',
      'Admin Notes': booking.adminNotes || '',
      'Created At': formatDateTimeForCSV(booking.createdAt),
      'Updated At': formatDateTimeForCSV(booking.updatedAt),
    }))

    logger.info('Bookings exported', {
      count: exportData.length,
      filters: filters || 'none',
    })

    return {
      success: true,
      data: exportData,
      count: exportData.length,
    }
  } catch (error) {
    logger.serverActionError('exportBookings', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export bookings',
    }
  }
}

/**
 * Export customer database (unique customers from bookings)
 * @returns Customer data ready for CSV export
 */
export async function exportCustomers() {
  try {
    await requireAdmin()

    // Get all unique customers from bookings
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Create unique customer list
    const customerMap = new Map()

    bookings.forEach((booking) => {
      const key = booking.email.toLowerCase()

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          'Customer Name': booking.user?.name || 'Guest',
          'Email': booking.email,
          'Phone': booking.phone,
          'Total Bookings': 1,
          'First Booking': formatDateForCSV(booking.createdAt),
          'Last Booking': formatDateForCSV(booking.createdAt),
          'Account Status': booking.user ? 'Registered' : 'Guest',
          'User Role': booking.user?.role || 'N/A',
        })
      } else {
        const customer = customerMap.get(key)
        customer['Total Bookings']++
        customer['Last Booking'] = formatDateForCSV(booking.createdAt)
      }
    })

    const exportData = Array.from(customerMap.values())

    logger.info('Customers exported', { count: exportData.length })

    return {
      success: true,
      data: exportData,
      count: exportData.length,
    }
  } catch (error) {
    logger.serverActionError('exportCustomers', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export customers',
    }
  }
}

/**
 * Export event attendance data
 * @param eventId - Optional event ID to filter by
 * @returns Event attendance data ready for CSV export
 */
export async function exportEventAttendance(eventId?: string) {
  try {
    await requireAdmin()

    const where = eventId ? { id: eventId } : {}

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    })

    const exportData = events.map((event) => ({
      'Event ID': event.id,
      'Event Title': event.title,
      'Date': formatDateForCSV(event.date),
      'Time': event.time,
      'Category': event.category,
      'Status': event.status,
      'Description': event.description.substring(0, 200), // Truncate for CSV
      'Created At': formatDateTimeForCSV(event.createdAt),
    }))

    logger.info('Event attendance exported', { count: exportData.length })

    return {
      success: true,
      data: exportData,
      count: exportData.length,
    }
  } catch (error) {
    logger.serverActionError('exportEventAttendance', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export event attendance',
    }
  }
}

/**
 * Export monthly revenue report
 * Note: This is a placeholder until revenue tracking is implemented in the Booking model
 * @param year - Year for the report
 * @param month - Month for the report (1-12)
 * @returns Monthly revenue data
 */
export async function exportMonthlyRevenue(year: number, month: number) {
  try {
    await requireAdmin()

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'APPROVED', // Only count approved bookings
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Group by type and status
    const byType: Record<string, number> = {}
    const byStatus: Record<string, number> = {}

    bookings.forEach((booking) => {
      byType[booking.type] = (byType[booking.type] || 0) + 1
      byStatus[booking.status] = (byStatus[booking.status] || 0) + 1
    })

    const exportData = [
      {
        'Report Period': `${year}-${String(month).padStart(2, '0')}`,
        'Total Bookings': bookings.length,
        'Cafe Bookings': byType.CAFE || 0,
        'Sensory Room Bookings': byType.SENSORY_ROOM || 0,
        'Playground Bookings': byType.PLAYGROUND || 0,
        'Party Bookings': byType.PARTY || 0,
        'Pending': byStatus.PENDING || 0,
        'Approved': byStatus.APPROVED || 0,
        'Rejected': byStatus.REJECTED || 0,
        'Note': 'Revenue tracking requires adding price field to Booking model',
      },
    ]

    logger.info('Monthly revenue exported', { year, month, count: bookings.length })

    return {
      success: true,
      data: exportData,
      count: exportData.length,
      totalBookings: bookings.length,
    }
  } catch (error) {
    logger.serverActionError('exportMonthlyRevenue', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export monthly revenue',
    }
  }
}

/**
 * Export all users
 * @returns Users data ready for CSV export
 */
export async function exportUsers() {
  try {
    await requireAdmin()

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    const exportData = users.map((user) => ({
      'User ID': user.id,
      'Name': user.name || '',
      'Email': user.email,
      'Role': user.role,
      'Status': user.blocked ? 'Blocked' : 'Active',
      'Email Verified': user.emailVerified ? 'Yes' : 'No',
      'Created At': formatDateTimeForCSV(user.createdAt),
      'Updated At': formatDateTimeForCSV(user.updatedAt),
    }))

    logger.info('Users exported', { count: exportData.length })

    return {
      success: true,
      data: exportData,
      count: exportData.length,
    }
  } catch (error) {
    logger.serverActionError('exportUsers', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export users',
    }
  }
}

/**
 * Export pricing packages
 * @returns Pricing packages ready for CSV export
 */
export async function exportPricingPackages() {
  try {
    await requireAdmin()

    const packages = await prisma.pricingPackage.findMany({
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
      ],
    })

    const exportData = packages.map((pkg) => ({
      'Package ID': pkg.id,
      'Name': pkg.name,
      'Price': pkg.price,
      'Category': pkg.category,
      'Description': pkg.description || '',
      'Popular': pkg.popular ? 'Yes' : 'No',
      'Status': pkg.status,
      'Order': pkg.order,
      'Created At': formatDateTimeForCSV(pkg.createdAt),
      'Updated At': formatDateTimeForCSV(pkg.updatedAt),
    }))

    logger.info('Pricing packages exported', { count: exportData.length })

    return {
      success: true,
      data: exportData,
      count: exportData.length,
    }
  } catch (error) {
    logger.serverActionError('exportPricingPackages', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export pricing packages',
    }
  }
}

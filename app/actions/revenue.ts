'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, endOfDay } from 'date-fns'

/**
 * Revenue Analytics Server Actions
 *
 * Handles all revenue-related analytics and reporting
 */

export interface RevenueStats {
  totalRevenue: number
  paidRevenue: number
  pendingRevenue: number
  totalBookings: number
  paidBookings: number
  pendingBookings: number
  averageBookingValue: number
  currency: string
  thisMonth: number
  lastMonth: number
  monthGrowth: number
}

export interface RevenueByType {
  type: string
  revenue: number
  bookings: number
  averageValue: number
}

export interface RevenueOverTime {
  date: string
  revenue: number
  bookings: number
}

export interface PaymentStats {
  totalPaid: number
  totalPending: number
  partialPayments: number
  fullPayments: number
  unpaidBookings: number
}

/**
 * Get comprehensive revenue statistics
 */
export async function getRevenueStats(startDate?: Date, endDate?: Date) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized - Admin access required' }
    }

    // Default to last 30 days if no dates provided
    const start = startDate || subMonths(new Date(), 1)
    const end = endDate || new Date()

    // Get all bookings in date range
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        },
        status: {
          in: ['APPROVED', 'COMPLETED']
        }
      },
      select: {
        totalAmount: true,
        paidAmount: true,
        isPaid: true,
        currency: true,
        type: true,
        paymentDate: true
      }
    })

    // Calculate totals
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    const paidRevenue = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0)
    const pendingRevenue = totalRevenue - paidRevenue

    const paidBookings = bookings.filter(b => b.isPaid).length
    const pendingBookings = bookings.length - paidBookings

    const averageBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0

    // This month vs last month
    const thisMonthStart = startOfMonth(new Date())
    const thisMonthEnd = endOfMonth(new Date())
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1))
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1))

    const thisMonthBookings = await prisma.booking.findMany({
      where: {
        date: { gte: thisMonthStart, lte: thisMonthEnd },
        status: { in: ['APPROVED', 'COMPLETED'] }
      },
      select: { totalAmount: true }
    })

    const lastMonthBookings = await prisma.booking.findMany({
      where: {
        date: { gte: lastMonthStart, lte: lastMonthEnd },
        status: { in: ['APPROVED', 'COMPLETED'] }
      },
      select: { totalAmount: true }
    })

    const thisMonth = thisMonthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    const lastMonth = lastMonthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    const monthGrowth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

    const stats: RevenueStats = {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      totalBookings: bookings.length,
      paidBookings,
      pendingBookings,
      averageBookingValue,
      currency: bookings[0]?.currency || 'RSD',
      thisMonth,
      lastMonth,
      monthGrowth
    }

    return {
      success: true,
      stats
    }
  } catch (error) {
    logger.serverActionError('getRevenueStats', error)
    return {
      success: false,
      error: 'Failed to fetch revenue statistics'
    }
  }
}

/**
 * Get revenue breakdown by booking type
 */
export async function getRevenueByType(startDate?: Date, endDate?: Date) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized - Admin access required' }
    }

    const start = startDate || subMonths(new Date(), 1)
    const end = endDate || new Date()

    // Get bookings grouped by type
    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { in: ['APPROVED', 'COMPLETED'] }
      },
      select: {
        type: true,
        totalAmount: true
      }
    })

    // Group by type
    const byType = bookings.reduce((acc, booking) => {
      const type = booking.type
      if (!acc[type]) {
        acc[type] = { revenue: 0, bookings: 0 }
      }
      acc[type].revenue += booking.totalAmount || 0
      acc[type].bookings += 1
      return acc
    }, {} as Record<string, { revenue: number; bookings: number }>)

    // Convert to array
    const revenueByType: RevenueByType[] = Object.entries(byType).map(([type, data]) => ({
      type,
      revenue: data.revenue,
      bookings: data.bookings,
      averageValue: data.bookings > 0 ? data.revenue / data.bookings : 0
    }))

    return {
      success: true,
      revenueByType
    }
  } catch (error) {
    logger.serverActionError('getRevenueByType', error)
    return {
      success: false,
      error: 'Failed to fetch revenue by type'
    }
  }
}

/**
 * Get revenue over time (daily/weekly/monthly)
 */
export async function getRevenueOverTime(
  startDate?: Date,
  endDate?: Date,
  interval: 'day' | 'week' | 'month' = 'day'
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized - Admin access required' }
    }

    const start = startDate || subMonths(new Date(), 1)
    const end = endDate || new Date()

    // Get all bookings in range
    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { in: ['APPROVED', 'COMPLETED'] }
      },
      select: {
        date: true,
        totalAmount: true
      },
      orderBy: { date: 'asc' }
    })

    // Group by interval
    const grouped: Record<string, { revenue: number; bookings: number }> = {}

    bookings.forEach(booking => {
      let key: string
      const bookingDate = new Date(booking.date)

      if (interval === 'day') {
        key = format(bookingDate, 'yyyy-MM-dd')
      } else if (interval === 'week') {
        key = format(startOfDay(bookingDate), 'yyyy-MM-dd')
      } else {
        key = format(bookingDate, 'yyyy-MM')
      }

      if (!grouped[key]) {
        grouped[key] = { revenue: 0, bookings: 0 }
      }
      grouped[key].revenue += booking.totalAmount || 0
      grouped[key].bookings += 1
    })

    // Convert to array
    const revenueOverTime: RevenueOverTime[] = Object.entries(grouped).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      bookings: data.bookings
    }))

    return {
      success: true,
      revenueOverTime
    }
  } catch (error) {
    logger.serverActionError('getRevenueOverTime', error)
    return {
      success: false,
      error: 'Failed to fetch revenue over time'
    }
  }
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(startDate?: Date, endDate?: Date) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized - Admin access required' }
    }

    const start = startDate || subMonths(new Date(), 1)
    const end = endDate || new Date()

    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { in: ['APPROVED', 'COMPLETED'] }
      },
      select: {
        totalAmount: true,
        paidAmount: true,
        isPaid: true
      }
    })

    const totalPaid = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0)
    const totalPending = bookings.reduce((sum, b) => {
      const pending = (b.totalAmount || 0) - (b.paidAmount || 0)
      return sum + (pending > 0 ? pending : 0)
    }, 0)

    const fullPayments = bookings.filter(b => b.isPaid && (b.paidAmount || 0) >= (b.totalAmount || 0)).length
    const partialPayments = bookings.filter(b =>
      (b.paidAmount || 0) > 0 && (b.paidAmount || 0) < (b.totalAmount || 0)
    ).length
    const unpaidBookings = bookings.filter(b => !b.paidAmount || b.paidAmount === 0).length

    const stats: PaymentStats = {
      totalPaid,
      totalPending,
      fullPayments,
      partialPayments,
      unpaidBookings
    }

    return {
      success: true,
      stats
    }
  } catch (error) {
    logger.serverActionError('getPaymentStats', error)
    return {
      success: false,
      error: 'Failed to fetch payment statistics'
    }
  }
}

/**
 * Get top revenue sources (by customer)
 */
export async function getTopCustomers(limit: number = 10, startDate?: Date, endDate?: Date) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized - Admin access required' }
    }

    const start = startDate || subMonths(new Date(), 6)
    const end = endDate || new Date()

    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { in: ['APPROVED', 'COMPLETED'] }
      },
      select: {
        userId: true,
        totalAmount: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Group by user
    const byUser: Record<string, { name: string | null; email: string; revenue: number; bookings: number }> = {}

    bookings.forEach(booking => {
      const userId = booking.userId
      if (!byUser[userId]) {
        byUser[userId] = {
          name: booking.user.name,
          email: booking.user.email,
          revenue: 0,
          bookings: 0
        }
      }
      byUser[userId].revenue += booking.totalAmount || 0
      byUser[userId].bookings += 1
    })

    // Convert to array and sort by revenue
    const topCustomers = Object.values(byUser)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)

    return {
      success: true,
      customers: topCustomers
    }
  } catch (error) {
    logger.serverActionError('getTopCustomers', error)
    return {
      success: false,
      error: 'Failed to fetch top customers'
    }
  }
}

/**
 * Export revenue data to CSV
 */
export async function exportRevenueData(startDate?: Date, endDate?: Date) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized - Admin access required' }
    }

    const start = startDate || subMonths(new Date(), 1)
    const end = endDate || new Date()

    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { in: ['APPROVED', 'COMPLETED'] }
      },
      select: {
        id: true,
        title: true,
        date: true,
        type: true,
        totalAmount: true,
        paidAmount: true,
        isPaid: true,
        currency: true,
        paymentDate: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    // Convert to CSV
    const headers = ['ID', 'Title', 'Date', 'Type', 'Customer', 'Email', 'Total Amount', 'Paid Amount', 'Status', 'Payment Date', 'Currency']
    const rows = bookings.map(b => [
      b.id,
      b.title,
      format(new Date(b.date), 'yyyy-MM-dd'),
      b.type,
      b.user.name || 'N/A',
      b.user.email,
      b.totalAmount?.toString() || '0',
      b.paidAmount?.toString() || '0',
      b.isPaid ? 'Paid' : 'Pending',
      b.paymentDate ? format(new Date(b.paymentDate), 'yyyy-MM-dd') : 'N/A',
      b.currency || 'RSD'
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return {
      success: true,
      csv,
      filename: `revenue-${format(start, 'yyyy-MM-dd')}-to-${format(end, 'yyyy-MM-dd')}.csv`
    }
  } catch (error) {
    logger.serverActionError('exportRevenueData', error)
    return {
      success: false,
      error: 'Failed to export revenue data'
    }
  }
}

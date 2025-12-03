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
 * Revenue Forecast Interface
 */
export interface RevenueForecast {
  month: string
  forecastedRevenue: number
  confidence: 'high' | 'medium' | 'low'
}

/**
 * Get revenue forecast for next 3 months using linear regression
 */
export async function getRevenueForecast() {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized - Admin access required' }
    }

    // Get last 12 months of revenue data
    const twelveMonthsAgo = subMonths(new Date(), 12)
    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: twelveMonthsAgo },
        status: { in: ['APPROVED', 'COMPLETED'] }
      },
      select: {
        date: true,
        totalAmount: true
      },
      orderBy: { date: 'asc' }
    })

    // Group by month
    const monthlyRevenue: Record<string, number> = {}
    bookings.forEach(booking => {
      const monthKey = format(new Date(booking.date), 'yyyy-MM')
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = 0
      }
      monthlyRevenue[monthKey] += booking.totalAmount || 0
    })

    // Convert to array with indices for regression
    const dataPoints: Array<{ x: number; y: number; month: string }> = []
    let index = 0
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i)
      const monthKey = format(monthDate, 'yyyy-MM')
      dataPoints.push({
        x: index++,
        y: monthlyRevenue[monthKey] || 0,
        month: monthKey
      })
    }

    // Simple linear regression: y = mx + b
    const n = dataPoints.length
    const sumX = dataPoints.reduce((sum, p) => sum + p.x, 0)
    const sumY = dataPoints.reduce((sum, p) => sum + p.y, 0)
    const sumXY = dataPoints.reduce((sum, p) => sum + p.x * p.y, 0)
    const sumXX = dataPoints.reduce((sum, p) => sum + p.x * p.x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calculate R-squared for confidence
    const yMean = sumY / n
    const ssTotal = dataPoints.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0)
    const ssResidual = dataPoints.reduce((sum, p) => {
      const predicted = slope * p.x + intercept
      return sum + Math.pow(p.y - predicted, 2)
    }, 0)
    const rSquared = 1 - (ssResidual / ssTotal)

    // Determine confidence based on R-squared
    let confidence: 'high' | 'medium' | 'low'
    if (rSquared > 0.7) confidence = 'high'
    else if (rSquared > 0.4) confidence = 'medium'
    else confidence = 'low'

    // Forecast next 3 months
    const forecast: RevenueForecast[] = []
    for (let i = 1; i <= 3; i++) {
      const futureMonth = format(subMonths(new Date(), -i), 'yyyy-MM')
      const forecastedRevenue = Math.max(0, slope * (index + i - 1) + intercept)
      forecast.push({
        month: futureMonth,
        forecastedRevenue: Math.round(forecastedRevenue),
        confidence
      })
    }

    return {
      success: true,
      forecast,
      historicalData: dataPoints.map(p => ({
        month: p.month,
        revenue: p.y
      })),
      rSquared
    }
  } catch (error) {
    logger.serverActionError('getRevenueForecast', error)
    return {
      success: false,
      error: 'Failed to generate revenue forecast'
    }
  }
}

/**
 * Popular Services Interface
 */
export interface PopularService {
  type: string
  bookings: number
  revenue: number
  averageValue: number
  percentage: number
}

/**
 * Get most popular services/packages
 */
export async function getPopularServices(startDate?: Date, endDate?: Date) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized - Admin access required' }
    }

    const start = startDate || subMonths(new Date(), 3)
    const end = endDate || new Date()

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
    const byType: Record<string, { bookings: number; revenue: number }> = {}
    let totalBookings = 0

    bookings.forEach(booking => {
      const type = booking.type
      if (!byType[type]) {
        byType[type] = { bookings: 0, revenue: 0 }
      }
      byType[type].bookings += 1
      byType[type].revenue += booking.totalAmount || 0
      totalBookings += 1
    })

    // Convert to array with percentages
    const popularServices: PopularService[] = Object.entries(byType)
      .map(([type, data]) => ({
        type,
        bookings: data.bookings,
        revenue: data.revenue,
        averageValue: data.bookings > 0 ? data.revenue / data.bookings : 0,
        percentage: totalBookings > 0 ? (data.bookings / totalBookings) * 100 : 0
      }))
      .sort((a, b) => b.bookings - a.bookings)

    return {
      success: true,
      services: popularServices,
      totalBookings
    }
  } catch (error) {
    logger.serverActionError('getPopularServices', error)
    return {
      success: false,
      error: 'Failed to fetch popular services'
    }
  }
}

/**
 * Cancellation Metrics Interface
 */
export interface CancellationMetrics {
  totalCancelled: number
  cancellationRate: number
  cancelledRevenue: number
  cancelledByType: Array<{ type: string; count: number }>
  monthlyTrend: Array<{ month: string; cancelled: number; total: number; rate: number }>
}

/**
 * Get cancellation rate and metrics
 */
export async function getCancellationMetrics(startDate?: Date, endDate?: Date) {
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

    // Get all bookings (including cancelled)
    const allBookings = await prisma.booking.findMany({
      where: {
        date: { gte: start, lte: end }
      },
      select: {
        status: true,
        type: true,
        totalAmount: true,
        date: true
      }
    })

    const totalBookings = allBookings.length
    const cancelledBookings = allBookings.filter(
      b => b.status === 'CANCELLED' || b.status === 'REJECTED'
    )
    const totalCancelled = cancelledBookings.length
    const cancellationRate = totalBookings > 0 ? (totalCancelled / totalBookings) * 100 : 0
    const cancelledRevenue = cancelledBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)

    // Cancelled by type
    const cancelledByTypeMap: Record<string, number> = {}
    cancelledBookings.forEach(booking => {
      const type = booking.type
      cancelledByTypeMap[type] = (cancelledByTypeMap[type] || 0) + 1
    })

    const cancelledByType = Object.entries(cancelledByTypeMap).map(([type, count]) => ({
      type,
      count
    }))

    // Monthly trend (last 6 months)
    const monthlyMap: Record<string, { cancelled: number; total: number }> = {}
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i)
      const monthKey = format(monthDate, 'yyyy-MM')
      monthlyMap[monthKey] = { cancelled: 0, total: 0 }
    }

    allBookings.forEach(booking => {
      const monthKey = format(new Date(booking.date), 'yyyy-MM')
      if (monthlyMap[monthKey]) {
        monthlyMap[monthKey].total += 1
        if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') {
          monthlyMap[monthKey].cancelled += 1
        }
      }
    })

    const monthlyTrend = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      cancelled: data.cancelled,
      total: data.total,
      rate: data.total > 0 ? (data.cancelled / data.total) * 100 : 0
    }))

    const metrics: CancellationMetrics = {
      totalCancelled,
      cancellationRate,
      cancelledRevenue,
      cancelledByType,
      monthlyTrend
    }

    return {
      success: true,
      metrics
    }
  } catch (error) {
    logger.serverActionError('getCancellationMetrics', error)
    return {
      success: false,
      error: 'Failed to fetch cancellation metrics'
    }
  }
}

/**
 * Time-to-Approval Metrics Interface
 */
export interface TimeToApprovalMetrics {
  averageHours: number
  medianHours: number
  fastest: number
  slowest: number
  within24Hours: number
  within48Hours: number
  totalMeasured: number
  byType: Array<{ type: string; averageHours: number }>
}

/**
 * Get time-to-approval metrics for bookings
 */
export async function getTimeToApprovalMetrics(startDate?: Date, endDate?: Date) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized - Admin access required' }
    }

    const start = startDate || subMonths(new Date(), 3)
    const end = endDate || new Date()

    // Get approved bookings with creation and update timestamps
    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: start, lte: end },
        status: 'APPROVED'
      },
      select: {
        type: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (bookings.length === 0) {
      return {
        success: true,
        metrics: {
          averageHours: 0,
          medianHours: 0,
          fastest: 0,
          slowest: 0,
          within24Hours: 0,
          within48Hours: 0,
          totalMeasured: 0,
          byType: []
        }
      }
    }

    // Calculate time-to-approval for each booking (in hours)
    const approvalTimes = bookings.map(b => {
      const created = new Date(b.createdAt)
      const updated = new Date(b.updatedAt)
      const hours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60)
      return {
        type: b.type,
        hours: Math.max(0, hours) // Ensure non-negative
      }
    })

    // Calculate statistics
    const hours = approvalTimes.map(at => at.hours).sort((a, b) => a - b)
    const averageHours = hours.reduce((sum, h) => sum + h, 0) / hours.length
    const medianHours = hours[Math.floor(hours.length / 2)]
    const fastest = hours[0]
    const slowest = hours[hours.length - 1]

    const within24Hours = hours.filter(h => h <= 24).length
    const within48Hours = hours.filter(h => h <= 48).length

    // Group by type
    const byTypeMap: Record<string, number[]> = {}
    approvalTimes.forEach(at => {
      if (!byTypeMap[at.type]) {
        byTypeMap[at.type] = []
      }
      byTypeMap[at.type].push(at.hours)
    })

    const byType = Object.entries(byTypeMap).map(([type, times]) => ({
      type,
      averageHours: times.reduce((sum, t) => sum + t, 0) / times.length
    }))

    const metrics: TimeToApprovalMetrics = {
      averageHours: Math.round(averageHours * 100) / 100,
      medianHours: Math.round(medianHours * 100) / 100,
      fastest: Math.round(fastest * 100) / 100,
      slowest: Math.round(slowest * 100) / 100,
      within24Hours,
      within48Hours,
      totalMeasured: bookings.length,
      byType
    }

    return {
      success: true,
      metrics
    }
  } catch (error) {
    logger.serverActionError('getTimeToApprovalMetrics', error)
    return {
      success: false,
      error: 'Failed to fetch time-to-approval metrics'
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

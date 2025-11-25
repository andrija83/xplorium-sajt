'use server'

import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { requireAdmin } from '@/lib/auth-utils'

/**
 * Get enhanced dashboard statistics with analytics
 * @returns Dashboard stats with revenue, trends, and breakdowns
 */
export async function getDashboardStats() {
  try {
    await requireAdmin()

    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get counts and analytics data
    const [
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      totalUsers,
      upcomingEvents,
      todayBookings,
      weekBookings,
      monthBookings,
      lastMonthBookingsCount,
    ] = await Promise.all([
      // Total bookings
      prisma.booking.count(),

      // Pending bookings
      prisma.booking.count({
        where: { status: 'PENDING' },
      }),

      // Approved bookings
      prisma.booking.count({
        where: { status: 'APPROVED' },
      }),

      // Rejected bookings
      prisma.booking.count({
        where: { status: 'REJECTED' },
      }),

      // Total users
      prisma.user.count(),

      // Upcoming published events
      prisma.event.count({
        where: {
          status: 'PUBLISHED',
          date: {
            gte: new Date(),
          },
        },
      }),

      // Today's bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: todayStart,
          },
        },
      }),

      // This week's bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: weekAgo,
          },
        },
      }),

      // This month's bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: monthStart,
          },
        },
      }),

      // Last month's bookings (for trend calculation)
      prisma.booking.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      }),
    ])

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Get upcoming events
    const recentEvents = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        date: {
          gte: new Date(),
        },
      },
      take: 3,
      orderBy: {
        date: 'asc',
      },
    })

    // Get bookings by type
    const bookingsByType = await prisma.booking.groupBy({
      by: ['type'],
      _count: {
        type: true,
      },
    })

    // Get bookings over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const bookingsOverTime = await prisma.booking.groupBy({
      by: ['date'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Get bookings by status (for status breakdown)
    const bookingsByStatus = [
      { status: 'PENDING', count: pendingBookings },
      { status: 'APPROVED', count: approvedBookings },
      { status: 'REJECTED', count: rejectedBookings },
    ]

    // Get peak booking days (day of week analysis)
    const allBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
      select: {
        date: true,
        time: true,
      },
    })

    // Analyze peak days of week
    const dayOfWeekCounts: Record<number, number> = {}
    allBookings.forEach((booking) => {
      const dayOfWeek = new Date(booking.date).getDay()
      dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1
    })

    const peakDays = Object.entries(dayOfWeekCounts)
      .map(([day, count]) => ({
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][Number(day)],
        count,
      }))
      .sort((a, b) => b.count - a.count)

    // Analyze peak times
    const timeSlotCounts: Record<string, number> = {}
    allBookings.forEach((booking) => {
      const hour = booking.time.split(':')[0]
      timeSlotCounts[hour] = (timeSlotCounts[hour] || 0) + 1
    })

    const peakTimes = Object.entries(timeSlotCounts)
      .map(([hour, count]) => ({
        time: `${hour}:00`,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 time slots

    // Calculate trends
    const lastWeekBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: twoWeeksAgo,
          lt: weekAgo,
        },
      },
    })

    const bookingsTrend =
      lastWeekBookings === 0
        ? 100
        : Math.round(((weekBookings - lastWeekBookings) / lastWeekBookings) * 100)

    const monthTrend =
      lastMonthBookingsCount === 0
        ? 100
        : Math.round(((monthBookings - lastMonthBookingsCount) / lastMonthBookingsCount) * 100)

    return {
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        totalUsers,
        upcomingEvents,
        todayBookings,
        weekBookings,
        monthBookings,
        bookingsTrend,
        monthTrend,
      },
      recentBookings,
      recentEvents,
      bookingsByType: bookingsByType.map((item) => ({
        type: item.type,
        count: item._count.type,
      })),
      bookingsByStatus,
      peakDays,
      peakTimes,
      bookingsOverTime: bookingsOverTime.map((item) => ({
        date: item.date,
        count: item._count.id,
      })),
    }
  } catch (error) {
    logger.serverActionError('getDashboardStats', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to load dashboard stats',
    }
  }
}

/**
 * Get recent activity (audit logs)
 * @param limit - Number of logs to return
 * @returns Recent activity
 */
export async function getRecentActivity(limit = 10) {
  try {
    await requireAdmin()

    const activity = await prisma.auditLog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return { success: true, activity }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Unauthorized' }
  }
}

/**
 * Get popular pricing packages analytics
 * @returns Most viewed and most selected pricing packages
 */
export async function getPopularPricingPackages() {
  try {
    await requireAdmin()

    // Get all pricing packages with their stats
    const packages = await prisma.pricingPackage.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: [
        { popular: 'desc' },
        { order: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        popular: true,
      },
    })

    // Group by category
    const packagesByCategory = packages.reduce((acc, pkg) => {
      const category = pkg.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(pkg)
      return acc
    }, {} as Record<string, typeof packages>)

    // Get package statistics (most popular marked packages)
    const popularPackages = packages.filter(pkg => pkg.popular).slice(0, 5)

    return {
      success: true,
      packages,
      packagesByCategory,
      popularPackages,
      stats: {
        totalPackages: packages.length,
        byCategory: {
          PLAYGROUND: packagesByCategory.PLAYGROUND?.length || 0,
          SENSORY_ROOM: packagesByCategory.SENSORY_ROOM?.length || 0,
          CAFE: packagesByCategory.CAFE?.length || 0,
          PARTY: packagesByCategory.PARTY?.length || 0,
        },
      },
    }
  } catch (error) {
    logger.serverActionError('getPopularPricingPackages', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load pricing packages',
    }
  }
}

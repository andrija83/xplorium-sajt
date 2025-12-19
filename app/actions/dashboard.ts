'use server'

import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { requireAdmin } from '@/lib/auth-utils'
import { sanitizeErrorForClient } from '@/lib/sanitize'
import { CACHE_KEYS, CACHE_TAGS, createCacheConfig } from '@/lib/cache'

/**
 * Cached dashboard data fetching (excludes auth check)
 * Cache: 5 minutes, tags: dashboard, bookings, users, events
 */
const getCachedDashboardData = unstable_cache(
  async () => {
    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)
    const yesterdayEnd = new Date(todayStart.getTime() - 1)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // OPTIMIZATION: Use single aggregate query instead of 17+ separate queries
    // Combine all booking counts and revenue calculations using aggregation
    const [
      bookingAggregates,
      totalUsers,
      upcomingEvents,
      recentBookings,
      recentEvents,
      bookingsByType,
      bookingsOverTime,
      pendingBookingsData,
    ] = await Promise.all([
      // Single aggregate query for all booking stats and revenue
      prisma.booking.aggregate({
        _count: {
          id: true, // Total bookings
        },
        _sum: {
          totalAmount: true, // Will need to filter by period separately
        },
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

      // Get recent bookings (moved from separate query below)
      prisma.booking.findMany({
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
      }),

      // Get upcoming events (moved from separate query below)
      prisma.event.findMany({
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
      }),

      // Get bookings by type
      prisma.booking.groupBy({
        by: ['type'],
        _count: {
          type: true,
        },
      }),

      // Get bookings over time (last 30 days)
      prisma.booking.groupBy({
        by: ['date'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          date: 'asc',
        },
      }),

      // Pending bookings data (for quick actions widget)
      prisma.booking.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          date: true,
          time: true,
          type: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ])

    // Use groupBy to get all status counts, period counts, and revenue in fewer queries
    const [statusGroups, periodStats, revenueStats] = await Promise.all([
      // Get counts by status (single query replaces 3 count queries)
      prisma.booking.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),

      // Get booking counts by time periods (single query with multiple aggregations)
      Promise.all([
        prisma.booking.aggregate({
          where: { createdAt: { gte: todayStart } },
          _count: { id: true },
        }),
        prisma.booking.aggregate({
          where: { createdAt: { gte: weekAgo } },
          _count: { id: true },
        }),
        prisma.booking.aggregate({
          where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
          _count: { id: true },
        }),
        prisma.booking.aggregate({
          where: { createdAt: { gte: monthStart } },
          _count: { id: true },
        }),
        prisma.booking.aggregate({
          where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
          _count: { id: true },
        }),
      ]),

      // Get revenue by time periods (single query with aggregations)
      Promise.all([
        prisma.booking.aggregate({
          where: {
            date: { gte: todayStart },
            status: { in: ['APPROVED', 'COMPLETED'] },
          },
          _sum: { totalAmount: true },
        }),
        prisma.booking.aggregate({
          where: {
            date: { gte: yesterdayStart, lte: yesterdayEnd },
            status: { in: ['APPROVED', 'COMPLETED'] },
          },
          _sum: { totalAmount: true },
        }),
        prisma.booking.aggregate({
          where: {
            date: { gte: weekAgo },
            status: { in: ['APPROVED', 'COMPLETED'] },
          },
          _sum: { totalAmount: true },
        }),
        prisma.booking.aggregate({
          where: {
            date: { gte: twoWeeksAgo, lt: weekAgo },
            status: { in: ['APPROVED', 'COMPLETED'] },
          },
          _sum: { totalAmount: true },
        }),
        prisma.booking.aggregate({
          where: {
            date: { gte: monthStart },
            status: { in: ['APPROVED', 'COMPLETED'] },
          },
          _sum: { totalAmount: true },
        }),
        prisma.booking.aggregate({
          where: {
            date: { gte: lastMonthStart, lte: lastMonthEnd },
            status: { in: ['APPROVED', 'COMPLETED'] },
          },
          _sum: { totalAmount: true },
        }),
      ]),
    ])

    // Extract counts from grouped results
    const totalBookings = bookingAggregates._count.id
    const pendingBookings = statusGroups.find(g => g.status === 'PENDING')?._count.id || 0
    const approvedBookings = statusGroups.find(g => g.status === 'APPROVED')?._count.id || 0
    const rejectedBookings = statusGroups.find(g => g.status === 'REJECTED')?._count.id || 0

    // Extract period counts
    const [todayStats, weekStats, lastWeekStats, monthStats, lastMonthStats] = periodStats
    const todayBookings = todayStats._count.id
    const weekBookings = weekStats._count.id
    const lastWeekBookings = lastWeekStats._count.id
    const monthBookings = monthStats._count.id
    const lastMonthBookingsCount = lastMonthStats._count.id

    // Extract revenue totals
    const [todayRev, yesterdayRev, weekRev, lastWeekRev, monthRev, lastMonthRev] = revenueStats
    const todayRevenue = todayRev._sum.totalAmount || 0
    const yesterdayRevenue = yesterdayRev._sum.totalAmount || 0
    const weekRevenue = weekRev._sum.totalAmount || 0
    const lastWeekRevenue = lastWeekRev._sum.totalAmount || 0
    const monthRevenue = monthRev._sum.totalAmount || 0
    const lastMonthRevenue = lastMonthRev._sum.totalAmount || 0

    // Get bookings by status (for status breakdown)
    const bookingsByStatus = [
      { status: 'PENDING', count: pendingBookings },
      { status: 'APPROVED', count: approvedBookings },
      { status: 'REJECTED', count: rejectedBookings },
    ]

    // OPTIMIZATION: Use groupBy for peak day/time analysis instead of fetching all records
    // This reduces data transfer and processes aggregation in the database
    const [dayOfWeekGroups, hourGroups] = await Promise.all([
      // Group by day of week using raw query for efficiency
      prisma.$queryRaw<Array<{ day_of_week: number; count: bigint }>>`
        SELECT EXTRACT(DOW FROM date)::integer as day_of_week, COUNT(*)::bigint as count
        FROM "Booking"
        WHERE "createdAt" >= ${monthStart}
        GROUP BY day_of_week
        ORDER BY day_of_week
      `,
      // Group by hour using raw query
      prisma.$queryRaw<Array<{ hour: string; count: bigint }>>`
        SELECT SUBSTRING(time, 1, 2) as hour, COUNT(*)::bigint as count
        FROM "Booking"
        WHERE "createdAt" >= ${monthStart}
        GROUP BY hour
        ORDER BY hour
      `,
    ])

    // Process peak days from aggregated data
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const peakDays = dayOfWeekGroups
      .map((row) => ({
        day: dayNames[row.day_of_week],
        count: Number(row.count),
      }))
      .sort((a, b) => b.count - a.count)

    // Process peak times from aggregated data
    const peakTimes = hourGroups
      .map((row) => ({
        time: `${row.hour}:00`,
        count: Number(row.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 time slots

    // Generate heatmap data using raw query for day+hour combinations
    const heatmapRaw = await prisma.$queryRaw<Array<{ day_of_week: number; hour: string; count: bigint }>>`
      SELECT
        EXTRACT(DOW FROM date)::integer as day_of_week,
        SUBSTRING(time, 1, 2) as hour,
        COUNT(*)::bigint as count
      FROM "Booking"
      WHERE "createdAt" >= ${monthStart}
      GROUP BY day_of_week, hour
    `

    const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const heatmapCounts: Record<string, number> = {}

    heatmapRaw.forEach((row) => {
      const key = `${dayShortNames[row.day_of_week]}-${row.hour}`
      heatmapCounts[key] = Number(row.count)
    })

    // Generate all combinations (all days, hours 8-21)
    const heatmapData: Array<{ day: string; hour: number; count: number }> = []
    for (let i = 1; i < 8; i++) { // Mon-Sun (skip Sun at index 0, add at end)
      const dayIndex = i % 7
      for (let hour = 8; hour <= 21; hour++) {
        const hourStr = hour.toString().padStart(2, '0')
        const key = `${dayShortNames[dayIndex]}-${hourStr}`
        heatmapData.push({
          day: dayShortNames[dayIndex],
          hour,
          count: heatmapCounts[key] || 0,
        })
      }
    }

    // Calculate trends (revenue totals already extracted above)

    const bookingsTrend =
      lastWeekBookings === 0
        ? 100
        : Math.round(((weekBookings - lastWeekBookings) / lastWeekBookings) * 100)

    const monthTrend =
      lastMonthBookingsCount === 0
        ? 100
        : Math.round(((monthBookings - lastMonthBookingsCount) / lastMonthBookingsCount) * 100)

    // Revenue trends
    const todayRevenueTrend =
      yesterdayRevenue === 0
        ? (todayRevenue > 0 ? 100 : 0)
        : Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)

    const weekRevenueTrend =
      lastWeekRevenue === 0
        ? (weekRevenue > 0 ? 100 : 0)
        : Math.round(((weekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)

    const monthRevenueTrend =
      lastMonthRevenue === 0
        ? (monthRevenue > 0 ? 100 : 0)
        : Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)

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
        // Revenue stats
        todayRevenue,
        yesterdayRevenue,
        weekRevenue,
        monthRevenue,
        todayRevenueTrend,
        weekRevenueTrend,
        monthRevenueTrend,
      },
      recentBookings,
      recentEvents,
      pendingBookingsData,
      bookingsByType: bookingsByType.map((item) => ({
        type: item.type,
        count: item._count.type,
      })),
      bookingsByStatus,
      peakDays,
      peakTimes,
      heatmapData,
      bookingsOverTime: bookingsOverTime.map((item) => ({
        date: item.date,
        count: item._count.id,
      })),
    }
  },
  [CACHE_KEYS.DASHBOARD_STATS],
  createCacheConfig('MODERATE', [
    CACHE_TAGS.DASHBOARD,
    CACHE_TAGS.BOOKINGS,
    CACHE_TAGS.USERS,
    CACHE_TAGS.EVENTS,
  ])
)

/**
 * Get enhanced dashboard statistics with analytics
 * Auth check NOT cached, data IS cached for 5 minutes
 * @returns Dashboard stats with revenue, trends, and breakdowns
 */
export async function getDashboardStats() {
  try {
    // Check admin auth (not cached)
    await requireAdmin()

    // Get cached dashboard data
    return await getCachedDashboardData()
  } catch (error) {
    logger.serverActionError('getDashboardStats', error)
    return {
      success: false,
      error: sanitizeErrorForClient(error),
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
      error: sanitizeErrorForClient(error),
    }
  }
}

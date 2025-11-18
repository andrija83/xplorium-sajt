'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * Get dashboard statistics
 * @returns Dashboard stats
 */
export async function getDashboardStats() {
  const session = await auth()

  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get counts
    const [
      totalBookings,
      pendingBookings,
      totalUsers,
      upcomingEvents,
      todayBookings,
      weekBookings,
      monthBookings,
    ] = await Promise.all([
      // Total bookings
      prisma.booking.count(),

      // Pending bookings
      prisma.booking.count({
        where: { status: 'PENDING' },
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
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),

      // This week's bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // This month's bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
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

    // Calculate trends
    const lastWeekBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    })

    const bookingsTrend =
      lastWeekBookings === 0
        ? 100
        : Math.round(((weekBookings - lastWeekBookings) / lastWeekBookings) * 100)

    return {
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        totalUsers,
        upcomingEvents,
        todayBookings,
        weekBookings,
        monthBookings,
        bookingsTrend,
      },
      recentBookings,
      recentEvents,
      bookingsByType: bookingsByType.map((item) => ({
        type: item.type,
        count: item._count.type,
      })),
      bookingsOverTime: bookingsOverTime.map((item) => ({
        date: item.date,
        count: item._count.id,
      })),
    }
  } catch (error) {
    console.error('Get dashboard stats error:', error)

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
  const session = await auth()

  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: 'Unauthorized' }
  }

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
}

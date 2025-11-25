'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

/**
 * Get marketing list based on filters
 * Returns customers who have opted into marketing
 */
export async function getMarketingList(filters?: {
  loyaltyTier?: string
  tags?: string[]
  minBookings?: number
  minSpent?: number
  marketingOptIn?: boolean
  smsOptIn?: boolean
}) {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    const where: any = {}

    // Only include customers who opted in (unless explicitly filtering)
    if (filters?.marketingOptIn !== false) {
      where.marketingOptIn = true
    }

    if (filters?.loyaltyTier) {
      where.loyaltyTier = filters.loyaltyTier
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      }
    }

    if (filters?.minBookings) {
      where.totalBookings = {
        gte: filters.minBookings,
      }
    }

    if (filters?.minSpent) {
      where.totalSpent = {
        gte: filters.minSpent,
      }
    }

    if (filters?.smsOptIn !== undefined) {
      where.smsOptIn = filters.smsOptIn
    }

    const customers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        loyaltyTier: true,
        loyaltyPoints: true,
        totalBookings: true,
        totalSpent: true,
        tags: true,
        marketingOptIn: true,
        smsOptIn: true,
        preferredContactMethod: true,
      },
      orderBy: {
        totalSpent: 'desc',
      },
    })

    logger.info('Marketing list generated', {
      count: customers.length,
      filters,
    })

    return {
      success: true,
      customers,
      count: customers.length,
      filters,
    }
  } catch (error) {
    logger.serverActionError('getMarketingList', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to generate marketing list',
    }
  }
}

/**
 * Get all unique tags from customers
 */
export async function getCustomerTags() {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    const users = await prisma.user.findMany({
      select: {
        tags: true,
      },
    })

    // Flatten and deduplicate tags
    const allTags = users.flatMap((u) => u.tags || [])
    const uniqueTags = Array.from(new Set(allTags)).sort()

    return {
      success: true,
      tags: uniqueTags,
    }
  } catch (error) {
    logger.serverActionError('getCustomerTags', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to get customer tags',
    }
  }
}

/**
 * Export marketing list to CSV
 */
export async function exportMarketingList(filters?: {
  loyaltyTier?: string
  tags?: string[]
  minBookings?: number
  minSpent?: number
}) {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    const result = await getMarketingList(filters)

    if (!result.success || !result.customers) {
      return { error: result.error || 'Failed to get marketing list' }
    }

    // Format for CSV export
    const exportData = result.customers.map((customer) => ({
      email: customer.email,
      name: customer.name || '',
      phone: customer.phone || '',
      loyaltyTier: customer.loyaltyTier,
      loyaltyPoints: customer.loyaltyPoints,
      totalBookings: customer.totalBookings,
      totalSpent: customer.totalSpent,
      tags: customer.tags?.join(', ') || '',
      preferredContact: customer.preferredContactMethod,
    }))

    logger.info('Marketing list exported', {
      count: exportData.length,
      filters,
    })

    return {
      success: true,
      data: exportData,
      count: exportData.length,
    }
  } catch (error) {
    logger.serverActionError('exportMarketingList', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to export marketing list',
    }
  }
}

/**
 * Get marketing statistics
 */
export async function getMarketingStats() {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    const [
      totalCustomers,
      emailOptIn,
      smsOptIn,
      tierCounts,
      avgBookings,
      avgSpent,
    ] = await Promise.all([
      // Total customers
      prisma.user.count(),

      // Email opt-in count
      prisma.user.count({
        where: { marketingOptIn: true },
      }),

      // SMS opt-in count
      prisma.user.count({
        where: { smsOptIn: true },
      }),

      // Count by tier
      prisma.user.groupBy({
        by: ['loyaltyTier'],
        _count: true,
      }),

      // Average bookings
      prisma.user.aggregate({
        _avg: {
          totalBookings: true,
        },
      }),

      // Average spent
      prisma.user.aggregate({
        _avg: {
          totalSpent: true,
        },
      }),
    ])

    const tierDistribution = tierCounts.reduce(
      (acc, item) => {
        acc[item.loyaltyTier] = item._count
        return acc
      },
      {} as Record<string, number>
    )

    return {
      success: true,
      stats: {
        totalCustomers,
        emailOptIn,
        smsOptIn,
        emailOptInRate: totalCustomers > 0 ? (emailOptIn / totalCustomers) * 100 : 0,
        smsOptInRate: totalCustomers > 0 ? (smsOptIn / totalCustomers) * 100 : 0,
        tierDistribution,
        avgBookings: avgBookings._avg.totalBookings || 0,
        avgSpent: avgSpent._avg.totalSpent || 0,
      },
    }
  } catch (error) {
    logger.serverActionError('getMarketingStats', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to get marketing statistics',
    }
  }
}

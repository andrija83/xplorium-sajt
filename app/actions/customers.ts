'use server'

import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { requireAdmin } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { sanitizeErrorForClient } from '@/lib/sanitize'
import { upsertCustomerSchema, addCustomerTagSchema } from '@/lib/validations'

/**
 * Get all customers with stats
 * @returns List of customers
 */
export async function getCustomers(filters?: {
  search?: string
  loyaltyTier?: string
  marketingOptIn?: boolean
  page?: number
  limit?: number
}) {
  try {
    await requireAdmin()

    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
      ]
    }

    if (filters?.loyaltyTier) {
      where.loyaltyTier = filters.loyaltyTier
    }

    if (filters?.marketingOptIn !== undefined) {
      where.marketingOptIn = filters.marketingOptIn
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          lastBookingDate: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ])

    return {
      success: true,
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    logger.serverActionError('getCustomers', error)
    return {
      success: false,
      error: sanitizeErrorForClient(error),
    }
  }
}

/**
 * Get customer by ID with full history
 * @param id - Customer ID
 * @returns Customer with booking history
 */
export async function getCustomerById(id: string) {
  try {
    await requireAdmin()

    const customer = await prisma.user.findUnique({
      where: { id },
    })

    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
      }
    }

    // Get booking history for this customer
    const bookings = await prisma.booking.findMany({
      where: {
        email: customer.email,
      },
      orderBy: {
        date: 'desc',
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

    return {
      success: true,
      customer,
      bookings,
    }
  } catch (error) {
    logger.serverActionError('getCustomerById', error)
    return {
      success: false,
      error: sanitizeErrorForClient(error),
    }
  }
}

/**
 * Create or update customer profile
 * @param data - Customer data
 * @returns Created/updated customer
 */
export async function upsertCustomer(data: {
  email: string
  name?: string
  phone?: string
  marketingOptIn?: boolean
  smsOptIn?: boolean
  notes?: string
  tags?: string[]
}) {
  try {
    await requireAdmin()

    // Validate input
    const validation = upsertCustomerSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      }
    }

    const validatedData = validation.data

    const customer = await prisma.user.upsert({
      where: { email: validatedData.email },
      create: {
        email: validatedData.email,
        name: validatedData.name,
        phone: validatedData.phone,
        marketingOptIn: validatedData.marketingOptIn ?? true,
        smsOptIn: validatedData.smsOptIn ?? false,
        customerNotes: validatedData.notes,
        tags: validatedData.tags || [],
        password: '', // Required field, will be set if user registers
      },
      update: {
        name: validatedData.name,
        phone: validatedData.phone,
        marketingOptIn: validatedData.marketingOptIn,
        smsOptIn: validatedData.smsOptIn,
        customerNotes: validatedData.notes,
        tags: validatedData.tags,
      },
    })

    logger.info('Customer upserted', { customerId: customer.id, email: customer.email })
    revalidatePath('/admin/customers')

    return {
      success: true,
      customer,
    }
  } catch (error) {
    logger.serverActionError('upsertCustomer', error)
    return {
      success: false,
      error: sanitizeErrorForClient(error),
    }
  }
}

/**
 * Update customer loyalty points
 * @param id - Customer ID
 * @param points - Points to add (negative to subtract)
 * @returns Updated customer
 */
export async function updateLoyaltyPoints(id: string, points: number) {
  try {
    await requireAdmin()

    const customer = await prisma.user.update({
      where: { id },
      data: {
        loyaltyPoints: {
          increment: points,
        },
      },
    })

    // Update loyalty tier based on points
    let newTier = customer.loyaltyTier
    if (customer.loyaltyPoints >= 6000) {
      newTier = 'PLATINUM'
    } else if (customer.loyaltyPoints >= 3000) {
      newTier = 'GOLD'
    } else if (customer.loyaltyPoints >= 1000) {
      newTier = 'SILVER'
    } else {
      newTier = 'BRONZE'
    }

    if (newTier !== customer.loyaltyTier) {
      await prisma.user.update({
        where: { id },
        data: { loyaltyTier: newTier },
      })
    }

    logger.info('Loyalty points updated', { customerId: id, points, newTier })
    revalidatePath('/admin/customers')

    return {
      success: true,
      customer: { ...customer, loyaltyTier: newTier },
    }
  } catch (error) {
    logger.serverActionError('updateLoyaltyPoints', error)
    return {
      success: false,
      error: sanitizeErrorForClient(error),
    }
  }
}

/**
 * Add tag to customer
 * @param id - Customer ID
 * @param tag - Tag to add
 * @returns Updated customer
 */
export async function addCustomerTag(id: string, tag: string) {
  try {
    await requireAdmin()

    // Validate input
    const validation = addCustomerTagSchema.safeParse({ id, tag })
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      }
    }

    const { id: validatedId, tag: validatedTag } = validation.data

    const customer = await prisma.user.findUnique({
      where: { id: validatedId },
    })

    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
      }
    }

    const tags = customer.tags || []
    if (!tags.includes(validatedTag)) {
      tags.push(validatedTag)
    }

    const updated = await prisma.user.update({
      where: { id: validatedId },
      data: { tags },
    })

    logger.info('Customer tag added', { customerId: validatedId, tag: validatedTag })
    revalidatePath('/admin/customers')

    return {
      success: true,
      customer: updated,
    }
  } catch (error) {
    logger.serverActionError('addCustomerTag', error)
    return {
      success: false,
      error: sanitizeErrorForClient(error),
    }
  }
}

/**
 * Remove tag from customer
 * @param id - Customer ID
 * @param tag - Tag to remove
 * @returns Updated customer
 */
export async function removeCustomerTag(id: string, tag: string) {
  try {
    await requireAdmin()

    const customer = await prisma.user.findUnique({
      where: { id },
    })

    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
      }
    }

    const tags = (customer.tags || []).filter((t) => t !== tag)

    const updated = await prisma.user.update({
      where: { id },
      data: { tags },
    })

    logger.info('Customer tag removed', { customerId: id, tag })
    revalidatePath('/admin/customers')

    return {
      success: true,
      customer: updated,
    }
  } catch (error) {
    logger.serverActionError('removeCustomerTag', error)
    return {
      success: false,
      error: sanitizeErrorForClient(error),
    }
  }
}

/**
 * Sync customer data from bookings
 * Updates customer stats based on booking history
 */
export async function syncCustomerData() {
  try {
    await requireAdmin()

    // Get all unique customer emails from bookings
    const bookings = await prisma.booking.findMany({
      select: {
        email: true,
        phone: true,
        date: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Group by email
    const customerMap = new Map()

    for (const booking of bookings) {
      const email = booking.email.toLowerCase()

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email,
          name: booking.user?.name || null,
          phone: booking.phone,
          totalBookings: 1,
          firstBookingDate: booking.createdAt,
          lastBookingDate: booking.createdAt,
          userId: booking.user?.id || null,
        })
      } else {
        const customer = customerMap.get(email)
        customer.totalBookings++
        customer.lastBookingDate = booking.createdAt
        if (!customer.name && booking.user?.name) {
          customer.name = booking.user.name
        }
      }
    }

    // Batch fetch all existing users - single query instead of N queries
    const customerEmails = Array.from(customerMap.keys())
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: customerEmails,
        },
      },
      select: {
        email: true,
        name: true,
        phone: true,
      },
    })

    // Create lookup map for existing users
    const existingUserMap = new Map(
      existingUsers.map(user => [user.email.toLowerCase(), user])
    )

    // Separate new customers from existing ones
    const newCustomers: any[] = []
    const updateOperations: any[] = []

    for (const customerData of customerMap.values()) {
      const existing = existingUserMap.get(customerData.email)

      if (existing) {
        // Prepare batch update
        updateOperations.push(
          prisma.user.update({
            where: { email: customerData.email },
            data: {
              totalBookings: customerData.totalBookings,
              firstBookingDate: customerData.firstBookingDate,
              lastBookingDate: customerData.lastBookingDate,
              name: customerData.name || existing.name,
              phone: customerData.phone || existing.phone,
            },
          })
        )
      } else {
        // Prepare for batch creation
        newCustomers.push({
          email: customerData.email,
          name: customerData.name,
          phone: customerData.phone,
          totalBookings: customerData.totalBookings,
          firstBookingDate: customerData.firstBookingDate,
          lastBookingDate: customerData.lastBookingDate,
          password: '', // Required field, will be set if user registers
        })
      }
    }

    // Execute all operations in a transaction for atomicity
    let created = 0
    let updated = 0

    await prisma.$transaction(async (tx) => {
      // Batch create new customers
      if (newCustomers.length > 0) {
        await tx.user.createMany({
          data: newCustomers,
          skipDuplicates: true,
        })
        created = newCustomers.length
      }

      // Execute all updates in parallel within transaction
      if (updateOperations.length > 0) {
        await Promise.all(updateOperations)
        updated = updateOperations.length
      }
    })

    logger.info('Customer data synced', { created, updated })
    revalidatePath('/admin/customers')

    return {
      success: true,
      created,
      updated,
      total: customerMap.size,
    }
  } catch (error) {
    logger.serverActionError('syncCustomerData', error)
    return {
      success: false,
      error: sanitizeErrorForClient(error),
    }
  }
}

/**
 * Get marketing list based on filters
 * @returns Customers who opted into marketing
 */
export async function getMarketingList(filters?: {
  loyaltyTier?: string
  tags?: string[]
  minBookings?: number
}) {
  try {
    await requireAdmin()

    const where: any = {
      marketingOptIn: true,
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

    const customers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        loyaltyTier: true,
        totalBookings: true,
        tags: true,
      },
      orderBy: {
        lastBookingDate: 'desc',
      },
    })

    logger.info('Marketing list generated', { count: customers.length, filters })

    return {
      success: true,
      customers,
      count: customers.length,
    }
  } catch (error) {
    logger.serverActionError('getMarketingList', error)
    return {
      success: false,
      error: sanitizeErrorForClient(error),
    }
  }
}

/**
 * Get Customer Insights Analytics
 * Comprehensive customer analytics including CLV, segmentation, churn, etc.
 */
export async function getCustomerInsights() {
  try {
    await requireAdmin()

    const now = new Date()
    const _thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Reserved for future use
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

    // Get all customers and bookings
    const [
      allCustomers,
      allBookings,
      repeatCustomers,
      recentActiveCustomers,
      churnedCustomers,
    ] = await Promise.all([
      // All customers
      prisma.user.count(),

      // All bookings with revenue data
      prisma.booking.findMany({
        select: {
          email: true,
          totalAmount: true,
          isPaid: true,
          date: true,
          createdAt: true,
          status: true,
        },
        where: {
          status: {
            in: ['APPROVED', 'COMPLETED'],
          },
        },
      }),

      // Repeat customers (more than 1 booking)
      prisma.user.count({
        where: {
          totalBookings: {
            gt: 1,
          },
        },
      }),

      // Active customers (booked in last 90 days)
      prisma.user.count({
        where: {
          lastBookingDate: {
            gte: ninetyDaysAgo,
          },
        },
      }),

      // Churned customers (last booking >90 days ago, but has bookings)
      prisma.user.count({
        where: {
          AND: [
            {
              lastBookingDate: {
                lt: ninetyDaysAgo,
              },
            },
            {
              totalBookings: {
                gt: 0,
              },
            },
          ],
        },
      }),
    ])

    // Calculate Customer Lifetime Value (CLV)
    const customerRevenue = new Map<string, number>()
    const customerBookingCount = new Map<string, number>()
    let totalRevenue = 0
    let paidBookingsCount = 0

    allBookings.forEach((booking) => {
      const email = booking.email.toLowerCase()
      const revenue = booking.totalAmount || 0

      if (booking.isPaid) {
        customerRevenue.set(email, (customerRevenue.get(email) || 0) + revenue)
        totalRevenue += revenue
        paidBookingsCount++
      }

      customerBookingCount.set(email, (customerBookingCount.get(email) || 0) + 1)
    })

    // Calculate averages
    const uniqueCustomersWithRevenue = customerRevenue.size
    const averageCustomerLifetimeValue =
      uniqueCustomersWithRevenue > 0 ? totalRevenue / uniqueCustomersWithRevenue : 0
    const averageBookingValue = paidBookingsCount > 0 ? totalRevenue / paidBookingsCount : 0

    // Calculate repeat customer rate
    const repeatCustomerRate = allCustomers > 0 ? (repeatCustomers / allCustomers) * 100 : 0

    // Customer Segmentation
    const segmentation = {
      vip: 0,
      regular: 0,
      firstTime: 0,
    }

    customerBookingCount.forEach((count) => {
      if (count >= 5) {
        segmentation.vip++
      } else if (count > 1) {
        segmentation.regular++
      } else {
        segmentation.firstTime++
      }
    })

    // Churn analysis
    const churnRate =
      recentActiveCustomers + churnedCustomers > 0
        ? (churnedCustomers / (recentActiveCustomers + churnedCustomers)) * 100
        : 0

    // Get top customers by revenue
    const topCustomersByRevenue = Array.from(customerRevenue.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([email, revenue]) => ({
        email,
        revenue,
        bookings: customerBookingCount.get(email) || 0,
      }))

    // Get top customers by booking count
    const topCustomersByBookings = Array.from(customerBookingCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([email, count]) => ({
        email,
        bookings: count,
        revenue: customerRevenue.get(email) || 0,
      }))

    // Birthday reminders - For now, we'll return empty array as birthday field needs to be added to schema
    // TODO: Add birthday field to User schema in future migration
    const birthdaysNext30Days: any[] = []

    // Monthly trends (last 12 months)
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthBookings = allBookings.filter((b) => {
        const bookingDate = new Date(b.createdAt)
        return bookingDate >= monthStart && bookingDate <= monthEnd
      })

      const monthRevenue = monthBookings.reduce(
        (sum, b) => sum + (b.isPaid ? b.totalAmount || 0 : 0),
        0
      )
      const uniqueCustomers = new Set(monthBookings.map((b) => b.email.toLowerCase())).size

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        customers: uniqueCustomers,
        bookings: monthBookings.length,
      })
    }

    return {
      success: true,
      insights: {
        // Overview metrics
        totalCustomers: allCustomers,
        activeCustomers: recentActiveCustomers,
        repeatCustomers,
        repeatCustomerRate: Math.round(repeatCustomerRate * 10) / 10,
        churnRate: Math.round(churnRate * 10) / 10,
        churnedCustomers,

        // Financial metrics
        averageCustomerLifetimeValue: Math.round(averageCustomerLifetimeValue),
        averageBookingValue: Math.round(averageBookingValue),
        totalRevenue: Math.round(totalRevenue),

        // Segmentation
        segmentation,

        // Top customers
        topCustomersByRevenue,
        topCustomersByBookings,

        // Birthday reminders
        upcomingBirthdays: birthdaysNext30Days,

        // Trends
        monthlyTrends: monthlyData,
      },
    }
  } catch (error) {
    logger.serverActionError('getCustomerInsights', error)
    return {
      success: false,
      error: sanitizeErrorForClient(error),
    }
  }
}

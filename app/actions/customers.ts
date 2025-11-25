'use server'

import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { requireAdmin } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

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
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          lastBookingDate: 'desc',
        },
      }),
      prisma.customer.count({ where }),
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
      error: error instanceof Error ? error.message : 'Failed to load customers',
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

    const customer = await prisma.customer.findUnique({
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
      error: error instanceof Error ? error.message : 'Failed to load customer',
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

    const customer = await prisma.customer.upsert({
      where: { email: data.email },
      create: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        marketingOptIn: data.marketingOptIn ?? true,
        smsOptIn: data.smsOptIn ?? false,
        notes: data.notes,
        tags: data.tags || [],
      },
      update: {
        name: data.name,
        phone: data.phone,
        marketingOptIn: data.marketingOptIn,
        smsOptIn: data.smsOptIn,
        notes: data.notes,
        tags: data.tags,
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
      error: error instanceof Error ? error.message : 'Failed to save customer',
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

    const customer = await prisma.customer.update({
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
      await prisma.customer.update({
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
      error: error instanceof Error ? error.message : 'Failed to update loyalty points',
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

    const customer = await prisma.customer.findUnique({
      where: { id },
    })

    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
      }
    }

    const tags = customer.tags || []
    if (!tags.includes(tag)) {
      tags.push(tag)
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: { tags },
    })

    logger.info('Customer tag added', { customerId: id, tag })
    revalidatePath('/admin/customers')

    return {
      success: true,
      customer: updated,
    }
  } catch (error) {
    logger.serverActionError('addCustomerTag', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add tag',
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

    const customer = await prisma.customer.findUnique({
      where: { id },
    })

    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
      }
    }

    const tags = (customer.tags || []).filter((t) => t !== tag)

    const updated = await prisma.customer.update({
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
      error: error instanceof Error ? error.message : 'Failed to remove tag',
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

    // Upsert customers
    let created = 0
    let updated = 0

    for (const customerData of customerMap.values()) {
      const existing = await prisma.customer.findUnique({
        where: { email: customerData.email },
      })

      if (existing) {
        await prisma.customer.update({
          where: { email: customerData.email },
          data: {
            totalBookings: customerData.totalBookings,
            firstBookingDate: customerData.firstBookingDate,
            lastBookingDate: customerData.lastBookingDate,
            name: customerData.name || existing.name,
            phone: customerData.phone || existing.phone,
          },
        })
        updated++
      } else {
        await prisma.customer.create({
          data: {
            email: customerData.email,
            name: customerData.name,
            phone: customerData.phone,
            totalBookings: customerData.totalBookings,
            firstBookingDate: customerData.firstBookingDate,
            lastBookingDate: customerData.lastBookingDate,
            userId: customerData.userId,
          },
        })
        created++
      }
    }

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
      error: error instanceof Error ? error.message : 'Failed to sync customer data',
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

    const customers = await prisma.customer.findMany({
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
      error: error instanceof Error ? error.message : 'Failed to generate marketing list',
    }
  }
}

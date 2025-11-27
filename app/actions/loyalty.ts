'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

/**
 * Calculate loyalty tier based on points
 */
function calculateTier(points: number): 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'VIP' {
  if (points >= 6000) return 'PLATINUM'
  if (points >= 3000) return 'GOLD'
  if (points >= 1000) return 'SILVER'
  return 'BRONZE'
}

/**
 * Update customer loyalty points
 * @param userId - Customer user ID
 * @param points - Points to add (negative to subtract)
 * @param reason - Reason for point adjustment
 * @returns Updated customer
 */
export async function updateLoyaltyPoints(
  userId: string,
  points: number,
  reason?: string
) {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        loyaltyPoints: true,
        loyaltyTier: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      return { error: 'Customer not found' }
    }

    const oldPoints = user.loyaltyPoints
    const newPoints = Math.max(0, oldPoints + points) // Don't allow negative points

    // Calculate new tier
    const newTier = calculateTier(newPoints)

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        loyaltyPoints: newPoints,
        loyaltyTier: newTier,
      },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: userId,
      changes: {
        loyaltyPoints: { from: oldPoints, to: newPoints },
        loyaltyTier: { from: user.loyaltyTier, to: newTier },
        reason: reason || 'Manual adjustment',
      },
    })

    logger.info('Loyalty points updated', {
      customerId: userId,
      points,
      oldPoints,
      newPoints,
      oldTier: user.loyaltyTier,
      newTier,
      reason,
    })

    revalidatePath('/admin/customers')
    revalidatePath(`/admin/customers/${userId}`)

    return {
      success: true,
      user: updatedUser,
      tierChanged: user.loyaltyTier !== newTier,
      message:
        user.loyaltyTier !== newTier
          ? `Points updated and customer promoted to ${newTier} tier!`
          : 'Loyalty points updated successfully',
    }
  } catch (error) {
    logger.serverActionError('updateLoyaltyPoints', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to update loyalty points',
    }
  }
}

/**
 * Add tag to customer
 * @param userId - Customer user ID
 * @param tag - Tag to add
 * @returns Updated customer
 */
export async function addCustomerTag(userId: string, tag: string) {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, tags: true },
    })

    if (!user) {
      return { error: 'Customer not found' }
    }

    const tags = user.tags || []
    if (tags.includes(tag)) {
      return { error: 'Tag already exists' }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        tags: [...tags, tag],
      },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: userId,
      changes: { tags: { added: tag } },
    })

    logger.info('Customer tag added', { customerId: userId, tag })

    revalidatePath('/admin/customers')
    revalidatePath(`/admin/customers/${userId}`)

    return {
      success: true,
      user: updatedUser,
      message: 'Tag added successfully',
    }
  } catch (error) {
    logger.serverActionError('addCustomerTag', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to add tag',
    }
  }
}

/**
 * Remove tag from customer
 * @param userId - Customer user ID
 * @param tag - Tag to remove
 * @returns Updated customer
 */
export async function removeCustomerTag(userId: string, tag: string) {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, tags: true },
    })

    if (!user) {
      return { error: 'Customer not found' }
    }

    const tags = (user.tags || []).filter((t) => t !== tag)

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { tags },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: userId,
      changes: { tags: { removed: tag } },
    })

    logger.info('Customer tag removed', { customerId: userId, tag })

    revalidatePath('/admin/customers')
    revalidatePath(`/admin/customers/${userId}`)

    return {
      success: true,
      user: updatedUser,
      message: 'Tag removed successfully',
    }
  } catch (error) {
    logger.serverActionError('removeCustomerTag', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to remove tag',
    }
  }
}

/**
 * Update customer notes
 * @param userId - Customer user ID
 * @param notes - Admin notes
 * @returns Updated customer
 */
export async function updateCustomerNotes(userId: string, notes: string) {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        customerNotes: notes,
      },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: userId,
      changes: { customerNotes: 'updated' },
    })

    logger.info('Customer notes updated', { customerId: userId })

    revalidatePath('/admin/customers')
    revalidatePath(`/admin/customers/${userId}`)

    return {
      success: true,
      user: updatedUser,
      message: 'Notes updated successfully',
    }
  } catch (error) {
    logger.serverActionError('updateCustomerNotes', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to update notes',
    }
  }
}

/**
 * Update customer marketing preferences
 * @param userId - Customer user ID
 * @param marketingOptIn - Email marketing opt-in
 * @param smsOptIn - SMS marketing opt-in
 * @returns Updated customer
 */
export async function updateMarketingPreferences(
  userId: string,
  marketingOptIn?: boolean,
  smsOptIn?: boolean
) {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    const data: any = {}
    if (marketingOptIn !== undefined) data.marketingOptIn = marketingOptIn
    if (smsOptIn !== undefined) data.smsOptIn = smsOptIn

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: userId,
      changes: { marketingPreferences: data },
    })

    logger.info('Marketing preferences updated', { customerId: userId, data })

    revalidatePath('/admin/customers')
    revalidatePath(`/admin/customers/${userId}`)

    return {
      success: true,
      user: updatedUser,
      message: 'Marketing preferences updated successfully',
    }
  } catch (error) {
    logger.serverActionError('updateMarketingPreferences', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to update marketing preferences',
    }
  }
}

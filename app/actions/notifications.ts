'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

/**
 * Notification Server Actions
 *
 * Handles all notification-related operations
 */

export type NotificationType =
  | 'NEW_BOOKING'
  | 'BOOKING_APPROVED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'NEW_EVENT_REGISTRATION'
  | 'EVENT_PUBLISHED'
  | 'EVENT_CANCELLED'
  | 'EVENT_FULL'
  | 'LOW_INVENTORY'
  | 'MAINTENANCE_DUE'
  | 'NEW_USER'
  | 'PAYMENT_RECEIVED'
  | 'SYSTEM_ALERT'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data: any
  read: boolean
  createdAt: Date
}

/**
 * Get notifications for current user
 */
export async function getNotifications(limit: number = 50, unreadOnly: boolean = false) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly && { read: false })
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return {
      success: true,
      notifications: notifications as Notification[]
    }
  } catch (error) {
    logger.serverActionError('getNotifications', error)
    return {
      success: false,
      error: 'Failed to fetch notifications'
    }
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const count = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false
      }
    })

    return {
      success: true,
      count
    }
  } catch (error) {
    logger.serverActionError('getUnreadCount', error)
    return {
      success: false,
      error: 'Failed to fetch unread count'
    }
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id // Ensure user owns this notification
      },
      data: { read: true }
    })

    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    logger.serverActionError('markAsRead', error)
    return {
      success: false,
      error: 'Failed to mark notification as read'
    }
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false
      },
      data: { read: true }
    })

    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    logger.serverActionError('markAllAsRead', error)
    return {
      success: false,
      error: 'Failed to mark all as read'
    }
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: session.user.id
      }
    })

    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    logger.serverActionError('deleteNotification', error)
    return {
      success: false,
      error: 'Failed to delete notification'
    }
  }
}

/**
 * Create a notification (internal use - called by other server actions)
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  data
}: {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.parse(JSON.stringify(data)) : {}
      }
    })

    logger.info('Notification created successfully', { notificationId: notification.id, userId, type })

    return {
      success: true,
      notification: notification as Notification
    }
  } catch (error) {
    logger.serverActionError('createNotification', error)
    return {
      success: false,
      error: 'Failed to create notification'
    }
  }
}

/**
 * Create notification for all admins
 */
export async function notifyAllAdmins({
  type,
  title,
  message,
  data
}: {
  type: NotificationType
  title: string
  message: string
  data?: any
}) {
  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: { id: true, email: true }
    })

    logger.info(`Found ${admins.length} admins to notify`, { adminEmails: admins.map(a => a.email) })

    if (admins.length === 0) {
      logger.warn('No admins found to notify')
      return {
        success: false,
        error: 'No admins found'
      }
    }

    // Create notification for each admin
    const notifications = await Promise.all(
      admins.map(admin =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type,
            title,
            message,
            data: data ? JSON.parse(JSON.stringify(data)) : {}
          }
        })
      )
    )

    logger.info(`Successfully created ${notifications.length} notifications for admins`, { type, title })

    return {
      success: true,
      count: notifications.length
    }
  } catch (error) {
    logger.serverActionError('notifyAllAdmins', error)
    return {
      success: false,
      error: 'Failed to notify admins'
    }
  }
}

/**
 * Delete old read notifications (cleanup)
 */
export async function deleteOldNotifications(daysOld: number = 30) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await prisma.notification.deleteMany({
      where: {
        userId: session.user.id,
        read: true,
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    return {
      success: true,
      deletedCount: result.count
    }
  } catch (error) {
    logger.serverActionError('deleteOldNotifications', error)
    return {
      success: false,
      error: 'Failed to delete old notifications'
    }
  }
}

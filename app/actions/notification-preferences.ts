'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

/**
 * Notification Preferences Server Actions
 *
 * Manages user notification preferences
 */

export interface NotificationPreferences {
  id: string
  userId: string
  emailNotifications: boolean
  newBooking: boolean
  bookingApproved: boolean
  bookingRejected: boolean
  bookingCancelled: boolean
  newEventRegistration: boolean
  eventPublished: boolean
  eventCancelled: boolean
  eventFull: boolean
  lowInventory: boolean
  maintenanceDue: boolean
  newUser: boolean
  paymentReceived: boolean
  systemAlert: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Get notification preferences for current user
 */
export async function getNotificationPreferences() {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id }
    })

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: { userId: session.user.id }
      })
    }

    return {
      success: true,
      preferences: preferences as unknown as NotificationPreferences
    }
  } catch (error) {
    logger.serverActionError('getNotificationPreferences', error)
    return {
      success: false,
      error: 'Failed to fetch notification preferences'
    }
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  updates: Partial<Omit<NotificationPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Upsert preferences (create if not exists, update if exists)
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...updates
      },
      update: updates
    })

    revalidatePath('/admin/notifications/preferences')

    return {
      success: true,
      preferences: preferences as unknown as NotificationPreferences
    }
  } catch (error) {
    logger.serverActionError('updateNotificationPreferences', error)
    return {
      success: false,
      error: 'Failed to update notification preferences'
    }
  }
}

/**
 * Enable all notifications
 */
export async function enableAllNotifications() {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        emailNotifications: true,
        newBooking: true,
        bookingApproved: true,
        bookingRejected: true,
        bookingCancelled: true,
        newEventRegistration: true,
        eventPublished: true,
        eventCancelled: true,
        eventFull: true,
        lowInventory: true,
        maintenanceDue: true,
        newUser: true,
        paymentReceived: true,
        systemAlert: true
      },
      update: {
        emailNotifications: true,
        newBooking: true,
        bookingApproved: true,
        bookingRejected: true,
        bookingCancelled: true,
        newEventRegistration: true,
        eventPublished: true,
        eventCancelled: true,
        eventFull: true,
        lowInventory: true,
        maintenanceDue: true,
        newUser: true,
        paymentReceived: true,
        systemAlert: true
      }
    })

    revalidatePath('/admin/notifications/preferences')

    return {
      success: true,
      preferences: preferences as unknown as NotificationPreferences
    }
  } catch (error) {
    logger.serverActionError('enableAllNotifications', error)
    return {
      success: false,
      error: 'Failed to enable all notifications'
    }
  }
}

/**
 * Disable all notifications (except system alerts)
 */
export async function disableAllNotifications() {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        emailNotifications: false,
        newBooking: false,
        bookingApproved: false,
        bookingRejected: false,
        bookingCancelled: false,
        newEventRegistration: false,
        eventPublished: false,
        eventCancelled: false,
        eventFull: false,
        lowInventory: false,
        maintenanceDue: false,
        newUser: false,
        paymentReceived: false,
        systemAlert: true // Keep system alerts enabled
      },
      update: {
        emailNotifications: false,
        newBooking: false,
        bookingApproved: false,
        bookingRejected: false,
        bookingCancelled: false,
        newEventRegistration: false,
        eventPublished: false,
        eventCancelled: false,
        eventFull: false,
        lowInventory: false,
        maintenanceDue: false,
        newUser: false,
        paymentReceived: false,
        systemAlert: true // Keep system alerts enabled
      }
    })

    revalidatePath('/admin/notifications/preferences')

    return {
      success: true,
      preferences: preferences as unknown as NotificationPreferences
    }
  } catch (error) {
    logger.serverActionError('disableAllNotifications', error)
    return {
      success: false,
      error: 'Failed to disable all notifications'
    }
  }
}

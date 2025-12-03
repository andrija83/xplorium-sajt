'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

/**
 * Settings Server Actions
 *
 * Handles all settings-related operations
 * - Get settings by key or category
 * - Update settings
 * - Initialize default settings
 */

export interface SettingValue {
  [key: string]: any
}

export interface Setting {
  id: string
  key: string
  value: SettingValue
  category: string
  updatedAt: Date
  updatedBy: string | null
}

/**
 * Get a specific setting by key
 */
export async function getSetting(key: string) {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key }
    })

    return {
      success: true,
      setting: setting as Setting | null
    }
  } catch (error) {
    logger.serverActionError('getSetting', error)
    return {
      success: false,
      error: 'Failed to fetch setting'
    }
  }
}

/**
 * Get all settings by category
 */
export async function getSettingsByCategory(category: string) {
  try {
    const settings = await prisma.siteSettings.findMany({
      where: { category },
      orderBy: { key: 'asc' }
    })

    return {
      success: true,
      settings: settings as Setting[]
    }
  } catch (error) {
    logger.serverActionError('getSettingsByCategory', error)
    return {
      success: false,
      error: 'Failed to fetch settings'
    }
  }
}

/**
 * Get all settings
 */
export async function getAllSettings() {
  try {
    const settings = await prisma.siteSettings.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }]
    })

    return {
      success: true,
      settings: settings as Setting[]
    }
  } catch (error) {
    logger.serverActionError('getAllSettings', error)
    return {
      success: false,
      error: 'Failed to fetch settings'
    }
  }
}

/**
 * Update or create a setting
 */
export async function updateSetting(key: string, value: SettingValue, category: string) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized - Admin access required' }
    }

    // Upsert setting
    const setting = await prisma.siteSettings.upsert({
      where: { key },
      update: {
        value,
        category,
        updatedBy: session.user.id
      },
      create: {
        key,
        value,
        category,
        updatedBy: session.user.id
      }
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Content',
      entityId: setting.id,
      changes: {
        key,
        value
      }
    })

    revalidatePath('/admin/settings')

    return {
      success: true,
      setting: setting as Setting
    }
  } catch (error) {
    logger.serverActionError('updateSetting', error)
    return {
      success: false,
      error: 'Failed to update setting'
    }
  }
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(settings: Array<{ key: string; value: SettingValue; category: string }>) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized - Admin access required' }
    }

    // Update all settings
    const results = await Promise.all(
      settings.map(({ key, value, category }) =>
        prisma.siteSettings.upsert({
          where: { key },
          update: {
            value,
            category,
            updatedBy: session.user.id
          },
          create: {
            key,
            value,
            category,
            updatedBy: session.user.id
          }
        })
      )
    )

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Content',
      entityId: 'bulk',
      changes: {
        count: settings.length,
        keys: settings.map(s => s.key)
      }
    })

    revalidatePath('/admin/settings')

    return {
      success: true,
      settings: results as Setting[]
    }
  } catch (error) {
    logger.serverActionError('updateSettings', error)
    return {
      success: false,
      error: 'Failed to update settings'
    }
  }
}

/**
 * Initialize default settings
 */
export async function initializeDefaultSettings() {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized - Super Admin access required' }
    }

    const defaultSettings = [
      // General Settings
      {
        key: 'site.name',
        value: { text: 'Xplorium' },
        category: 'general'
      },
      {
        key: 'site.tagline',
        value: { text: 'Family Entertainment Venue' },
        category: 'general'
      },
      {
        key: 'site.description',
        value: { text: 'Experience the magic of Xplorium - your family entertainment destination' },
        category: 'general'
      },
      {
        key: 'site.logo',
        value: { url: '' },
        category: 'general'
      },

      // Contact Settings
      {
        key: 'contact.email',
        value: { text: 'info@xplorium.com' },
        category: 'contact'
      },
      {
        key: 'contact.phone',
        value: { text: '+381 11 123 4567' },
        category: 'contact'
      },
      {
        key: 'contact.address',
        value: { text: 'Street Name 123, Belgrade, Serbia' },
        category: 'contact'
      },
      {
        key: 'contact.googleMapsUrl',
        value: { text: '' },
        category: 'contact'
      },

      // Business Hours
      {
        key: 'hours.monday',
        value: { open: '09:00', close: '21:00', closed: false },
        category: 'hours'
      },
      {
        key: 'hours.tuesday',
        value: { open: '09:00', close: '21:00', closed: false },
        category: 'hours'
      },
      {
        key: 'hours.wednesday',
        value: { open: '09:00', close: '21:00', closed: false },
        category: 'hours'
      },
      {
        key: 'hours.thursday',
        value: { open: '09:00', close: '21:00', closed: false },
        category: 'hours'
      },
      {
        key: 'hours.friday',
        value: { open: '09:00', close: '22:00', closed: false },
        category: 'hours'
      },
      {
        key: 'hours.saturday',
        value: { open: '10:00', close: '22:00', closed: false },
        category: 'hours'
      },
      {
        key: 'hours.sunday',
        value: { open: '10:00', close: '20:00', closed: false },
        category: 'hours'
      },

      // Social Media
      {
        key: 'social.facebook',
        value: { url: '' },
        category: 'social'
      },
      {
        key: 'social.instagram',
        value: { url: '' },
        category: 'social'
      },
      {
        key: 'social.twitter',
        value: { url: '' },
        category: 'social'
      },
      {
        key: 'social.youtube',
        value: { url: '' },
        category: 'social'
      },

      // Email Notifications
      {
        key: 'email.bookingConfirmation',
        value: { enabled: true },
        category: 'notifications'
      },
      {
        key: 'email.bookingApproved',
        value: { enabled: true },
        category: 'notifications'
      },
      {
        key: 'email.bookingRejected',
        value: { enabled: true },
        category: 'notifications'
      },
      {
        key: 'email.lowInventory',
        value: { enabled: true, threshold: 10 },
        category: 'notifications'
      },

      // Features
      {
        key: 'features.onlineBooking',
        value: { enabled: true },
        category: 'features'
      },
      {
        key: 'features.loyaltyProgram',
        value: { enabled: true },
        category: 'features'
      },
      {
        key: 'features.payments',
        value: { enabled: false },
        category: 'features'
      },

      // Scheduling Settings
      {
        key: 'scheduling.bufferTime',
        value: { minutes: 45 },
        category: 'scheduling'
      }
    ]

    // Only create settings that don't exist
    const results = await Promise.all(
      defaultSettings.map(({ key, value, category }) =>
        prisma.siteSettings.upsert({
          where: { key },
          update: {}, // Don't update existing settings
          create: {
            key,
            value,
            category,
            updatedBy: session.user.id
          }
        })
      )
    )

    return {
      success: true,
      count: results.length
    }
  } catch (error) {
    logger.serverActionError('initializeDefaultSettings', error)
    return {
      success: false,
      error: 'Failed to initialize settings'
    }
  }
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized - Super Admin access required' }
    }

    await prisma.siteSettings.delete({
      where: { key }
    })

    await logAudit({
      userId: session.user.id,
      action: 'DELETE',
      entity: 'Content',
      entityId: key,
      changes: { key }
    })

    revalidatePath('/admin/settings')

    return { success: true }
  } catch (error) {
    logger.serverActionError('deleteSetting', error)
    return {
      success: false,
      error: 'Failed to delete setting'
    }
  }
}

/**
 * Get buffer time setting in minutes
 */
export async function getBufferTime() {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: 'scheduling.bufferTime' }
    })

    // Default to 45 minutes if not set
    const bufferMinutes = setting?.value && typeof setting.value === 'object' && 'minutes' in setting.value
      ? (setting.value as { minutes: number }).minutes
      : 45

    return {
      success: true,
      bufferTime: bufferMinutes
    }
  } catch (error) {
    logger.serverActionError('getBufferTime', error)
    return {
      success: false,
      error: 'Failed to fetch buffer time',
      bufferTime: 45 // Return default on error
    }
  }
}

/**
 * Update buffer time setting
 */
export async function updateBufferTime(minutes: number) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized - Admin access required' }
    }

    // Validate: buffer time must be between 0 and 180 minutes (3 hours)
    if (minutes < 0 || minutes > 180) {
      return {
        success: false,
        error: 'Buffer time must be between 0 and 180 minutes'
      }
    }

    const setting = await prisma.siteSettings.upsert({
      where: { key: 'scheduling.bufferTime' },
      update: {
        value: { minutes },
        updatedBy: session.user.id
      },
      create: {
        key: 'scheduling.bufferTime',
        value: { minutes },
        category: 'scheduling',
        updatedBy: session.user.id
      }
    })

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Settings',
      entityId: 'scheduling.bufferTime',
      changes: { minutes }
    })

    revalidatePath('/admin/scheduling')
    revalidatePath('/admin/settings')

    return {
      success: true,
      bufferTime: minutes,
      message: `Buffer time updated to ${minutes} minutes`
    }
  } catch (error) {
    logger.serverActionError('updateBufferTime', error)
    return {
      success: false,
      error: 'Failed to update buffer time'
    }
  }
}

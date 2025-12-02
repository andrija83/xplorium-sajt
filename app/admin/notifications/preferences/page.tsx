"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Bell, Check, X, Save, RotateCcw } from "lucide-react"
import Link from "next/link"
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  enableAllNotifications,
  disableAllNotifications,
  type NotificationPreferences
} from "@/app/actions/notification-preferences"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { logger } from "@/lib/logger"
import { cn } from "@/lib/utils"

/**
 * Notification Preferences Page
 *
 * Configure which notifications the user wants to receive
 * Features:
 * - Toggle email notifications
 * - Toggle individual notification types
 * - Enable/disable all
 * - Save preferences
 */

interface NotificationType {
  key: keyof Omit<NotificationPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  label: string
  description: string
  category: 'Bookings' | 'Events' | 'Inventory' | 'System'
  icon: string
}

const NOTIFICATION_TYPES: NotificationType[] = [
  // Bookings
  { key: 'newBooking', label: 'New Booking', description: 'When a new booking is created', category: 'Bookings', icon: '📅' },
  { key: 'bookingApproved', label: 'Booking Approved', description: 'When a booking is approved', category: 'Bookings', icon: '✅' },
  { key: 'bookingRejected', label: 'Booking Rejected', description: 'When a booking is rejected', category: 'Bookings', icon: '❌' },
  { key: 'bookingCancelled', label: 'Booking Cancelled', description: 'When a booking is cancelled', category: 'Bookings', icon: '🚫' },

  // Events
  { key: 'newEventRegistration', label: 'New Event Registration', description: 'When someone registers for an event', category: 'Events', icon: '🎫' },
  { key: 'eventPublished', label: 'Event Published', description: 'When a new event is published', category: 'Events', icon: '🎉' },
  { key: 'eventCancelled', label: 'Event Cancelled', description: 'When an event is cancelled', category: 'Events', icon: '🚫' },
  { key: 'eventFull', label: 'Event Full', description: 'When an event reaches capacity', category: 'Events', icon: '👥' },

  // Inventory & Maintenance
  { key: 'lowInventory', label: 'Low Inventory', description: 'When inventory is running low', category: 'Inventory', icon: '📦' },
  { key: 'maintenanceDue', label: 'Maintenance Due', description: 'When maintenance is due', category: 'Inventory', icon: '🔧' },

  // System
  { key: 'newUser', label: 'New User', description: 'When a new user registers', category: 'System', icon: '👤' },
  { key: 'paymentReceived', label: 'Payment Received', description: 'When a payment is received', category: 'System', icon: '💰' },
  { key: 'systemAlert', label: 'System Alert', description: 'Important system notifications', category: 'System', icon: '⚠️' },
]

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch preferences
  const fetchPreferences = async () => {
    try {
      setIsLoading(true)
      const result = await getNotificationPreferences()

      if (result.success && result.preferences) {
        setPreferences(result.preferences)
      } else {
        toast.error('Failed to load preferences')
      }
    } catch (error) {
      logger.error('Failed to fetch notification preferences', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to load preferences')
    } finally {
      setIsLoading(false)
    }
  }

  // Save preferences
  const handleSave = async () => {
    if (!preferences) return

    try {
      setIsSaving(true)
      const { id, userId, createdAt, updatedAt, ...updates } = preferences
      const result = await updateNotificationPreferences(updates)

      if (result.success) {
        toast.success('Preferences saved successfully')
        setHasChanges(false)
        if (result.preferences) {
          setPreferences(result.preferences)
        }
      } else {
        toast.error('Failed to save preferences')
      }
    } catch (error) {
      logger.error('Failed to save notification preferences', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  // Enable all
  const handleEnableAll = async () => {
    try {
      setIsSaving(true)
      const result = await enableAllNotifications()

      if (result.success && result.preferences) {
        setPreferences(result.preferences)
        toast.success('All notifications enabled')
      } else {
        toast.error('Failed to enable all notifications')
      }
    } catch (error) {
      logger.error('Failed to enable all notifications', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to enable all notifications')
    } finally {
      setIsSaving(false)
    }
  }

  // Disable all
  const handleDisableAll = async () => {
    try {
      setIsSaving(true)
      const result = await disableAllNotifications()

      if (result.success && result.preferences) {
        setPreferences(result.preferences)
        toast.success('All notifications disabled (except system alerts)')
      } else {
        toast.error('Failed to disable all notifications')
      }
    } catch (error) {
      logger.error('Failed to disable all notifications', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to disable all notifications')
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle preference
  const handleToggle = (key: keyof Omit<NotificationPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!preferences) return

    setPreferences({
      ...preferences,
      [key]: !preferences[key]
    })
    setHasChanges(true)
  }

  // Fetch on mount
  useEffect(() => {
    fetchPreferences()
  }, [])

  // Group notifications by category
  const groupedNotifications = NOTIFICATION_TYPES.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = []
    }
    acc[type.category].push(type)
    return acc
  }, {} as Record<string, NotificationType[]>)

  const categories = ['Bookings', 'Events', 'Inventory', 'System'] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/notifications"
            className="text-cyan-400 hover:text-cyan-300 text-sm mb-2 inline-block"
          >
            ← Back to Notifications
          </Link>
          <h1
            className="text-3xl font-bold text-cyan-400 mb-2"
            style={{
              textShadow: "0 0 30px rgba(34, 211, 238, 0.6)"
            }}
          >
            Notification Preferences
          </h1>
          <p className="text-cyan-100/60">
            Customize which notifications you want to receive
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleDisableAll}
            variant="outline"
            disabled={isSaving}
            className="border-red-400/30 text-red-400 hover:bg-red-400/10"
          >
            <X className="w-4 h-4 mr-2" />
            Disable All
          </Button>

          <Button
            onClick={handleEnableAll}
            variant="outline"
            disabled={isSaving}
            className="border-green-400/30 text-green-400 hover:bg-green-400/10"
          >
            <Check className="w-4 h-4 mr-2" />
            Enable All
          </Button>
        </div>
      </div>

      {isLoading || !preferences ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : (
        <>
          {/* Email Notifications Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/20 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6"
            style={{
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center text-2xl">
                  📧
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-cyan-300">Email Notifications</h3>
                  <p className="text-sm text-cyan-100/60">Receive notifications via email</p>
                </div>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
                className="data-[state=checked]:bg-cyan-500"
              />
            </div>
          </motion.div>

          {/* Notification Categories */}
          {categories.map((category, categoryIndex) => {
            const types = groupedNotifications[category] || []

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (categoryIndex + 1) * 0.1 }}
                className="bg-black/20 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6"
                style={{
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
                }}
              >
                <h3 className="text-lg font-semibold text-cyan-300 mb-4">{category}</h3>
                <div className="space-y-4">
                  {types.map((type, index) => (
                    <motion.div
                      key={type.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (categoryIndex + 1) * 0.1 + index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-black/10 hover:bg-black/20 transition-colors border border-cyan-400/10"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{type.icon}</span>
                        <div>
                          <h4 className="text-sm font-medium text-cyan-100">{type.label}</h4>
                          <p className="text-xs text-cyan-100/50">{type.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences[type.key] as boolean}
                        onCheckedChange={() => handleToggle(type.key)}
                        className="data-[state=checked]:bg-cyan-500"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}

          {/* Save Button */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-6 flex justify-end gap-3"
            >
              <Button
                onClick={() => {
                  fetchPreferences()
                  setHasChanges(false)
                }}
                variant="outline"
                disabled={isSaving}
                className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-400/30"
              >
                {isSaving ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Preferences
              </Button>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

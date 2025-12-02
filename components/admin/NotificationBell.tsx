'use client'

import { useEffect, useState } from 'react'
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification
} from '@/app/actions/notifications'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'

/**
 * NotificationBell Component
 *
 * Notification center dropdown for admin header
 * - Shows unread count badge
 * - Dropdown with recent notifications
 * - Mark as read/unread
 * - Delete notifications
 * - Auto-refresh
 */

const NOTIFICATION_ICONS: Record<string, string> = {
  NEW_BOOKING: '📅',
  BOOKING_APPROVED: '✅',
  BOOKING_REJECTED: '❌',
  BOOKING_CANCELLED: '🚫',
  NEW_EVENT_REGISTRATION: '🎫',
  EVENT_PUBLISHED: '🎉',
  EVENT_CANCELLED: '🚫',
  EVENT_FULL: '👥',
  LOW_INVENTORY: '📦',
  MAINTENANCE_DUE: '🔧',
  NEW_USER: '👤',
  PAYMENT_RECEIVED: '💰',
  SYSTEM_ALERT: '⚠️'
}

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const [notifResult, countResult] = await Promise.all([
        getNotifications(20, false),
        getUnreadCount()
      ])

      if (notifResult.success && notifResult.notifications) {
        setNotifications(notifResult.notifications)
      }

      if (countResult.success && countResult.count !== undefined) {
        setUnreadCount(countResult.count)
      }
    } catch (error) {
      logger.error('Failed to fetch notifications', error instanceof Error ? error : new Error(String(error)))
    }
  }

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markAsRead(notificationId)
    if (result.success) {
      fetchNotifications()
    } else {
      toast.error('Failed to mark as read')
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    setIsLoading(true)
    const result = await markAllAsRead()
    if (result.success) {
      toast.success('All notifications marked as read')
      fetchNotifications()
    } else {
      toast.error('Failed to mark all as read')
    }
    setIsLoading(false)
  }

  // Delete notification
  const handleDelete = async (notificationId: string) => {
    const result = await deleteNotification(notificationId)
    if (result.success) {
      toast.success('Notification deleted')
      fetchNotifications()
    } else {
      toast.error('Failed to delete notification')
    }
  }

  // Fetch on mount and periodically
  useEffect(() => {
    fetchNotifications()

    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [])

  // Fetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-cyan-400/10 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5 text-cyan-400" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            style={{
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-96 max-h-[600px] flex flex-col
                         bg-gray-900 border-2 border-cyan-400/40 rounded-lg shadow-2xl z-50
                         overflow-hidden"
              style={{
                boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)'
              }}
            >
              {/* Header */}
              <div className="p-4 border-b border-cyan-400/20 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400">Notifications</h3>
                  <p className="text-xs text-cyan-100/50">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      onClick={handleMarkAllAsRead}
                      disabled={isLoading}
                      size="sm"
                      variant="ghost"
                      className="text-cyan-400 hover:bg-cyan-400/10"
                    >
                      <CheckCheck className="w-4 h-4 mr-1" />
                      Mark all
                    </Button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-cyan-100/50 hover:text-cyan-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-cyan-100/50">
                    <Bell className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-cyan-400/10">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'p-4 hover:bg-cyan-400/5 transition-colors group relative',
                          !notification.read && 'bg-cyan-400/10'
                        )}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className="text-2xl flex-shrink-0">
                            {NOTIFICATION_ICONS[notification.type] || '📢'}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={cn(
                                'text-sm font-medium',
                                notification.read ? 'text-cyan-100/70' : 'text-cyan-300'
                              )}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className={cn(
                              'text-xs mt-1',
                              notification.read ? 'text-cyan-100/50' : 'text-cyan-100/70'
                            )}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-cyan-100/40 mt-2">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>

                        {/* Actions (show on hover) */}
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-cyan-400/20 text-center">
                  <Link
                    href="/admin/notifications"
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors block"
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

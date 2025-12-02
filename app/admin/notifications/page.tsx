"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Bell, Check, CheckCheck, Trash2, Filter, Search, Settings } from "lucide-react"
import Link from "next/link"
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification
} from "@/app/actions/notifications"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow, format } from "date-fns"
import { toast } from "sonner"
import { logger } from "@/lib/logger"
import { cn } from "@/lib/utils"

/**
 * Notification History Page
 *
 * Full notification history for the last 30 days with filtering
 * Features:
 * - Filter by read/unread
 * - Search notifications
 * - Mark as read/unread
 * - Delete notifications
 * - Mark all as read
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const result = await getNotifications(100, false) // Last 100 notifications

      if (result.success && result.notifications) {
        setNotifications(result.notifications)
        setFilteredNotifications(result.notifications)
      }
    } catch (error) {
      logger.error('Failed to fetch notifications', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and search notifications
  useEffect(() => {
    let filtered = notifications

    // Apply read/unread filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read)
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.read)
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredNotifications(filtered)
  }, [filter, searchQuery, notifications])

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markAsRead(notificationId)
    if (result.success) {
      toast.success('Marked as read')
      fetchNotifications()
    } else {
      toast.error('Failed to mark as read')
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead()
    if (result.success) {
      toast.success('All notifications marked as read')
      fetchNotifications()
    } else {
      toast.error('Failed to mark all as read')
    }
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

  // Fetch on mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-cyan-400 mb-2"
            style={{
              textShadow: "0 0 30px rgba(34, 211, 238, 0.6)"
            }}
          >
            Notifications
          </h1>
          <p className="text-cyan-100/60">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/admin/notifications/preferences">
            <Button variant="outline" className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10">
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </Button>
          </Link>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-400/30"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/50" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="pl-10 bg-black/20 border-cyan-400/20 text-cyan-100 placeholder:text-cyan-100/30
                     focus:border-cyan-400/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-black/20 p-1 rounded-lg border border-cyan-400/20">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              filter === 'all'
                ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                : 'text-cyan-100/50 hover:text-cyan-100/70'
            )}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              filter === 'unread'
                ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                : 'text-cyan-100/50 hover:text-cyan-100/70'
            )}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              filter === 'read'
                ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                : 'text-cyan-100/50 hover:text-cyan-100/70'
            )}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 backdrop-blur-sm border border-cyan-400/20 rounded-xl overflow-hidden"
        style={{
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-cyan-100/50">
            <Bell className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">
              {searchQuery ? 'No notifications found' : filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-sm mt-2">
              {searchQuery ? 'Try a different search term' : filter === 'unread' ? 'All caught up!' : 'Notifications will appear here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-cyan-400/10">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  'p-6 hover:bg-cyan-400/5 transition-colors group relative',
                  !notification.read && 'bg-cyan-400/10'
                )}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0">
                    {NOTIFICATION_ICONS[notification.type] || '📢'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={cn(
                            'text-base font-semibold',
                            notification.read ? 'text-cyan-100/70' : 'text-cyan-300'
                          )}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className={cn(
                          'text-sm',
                          notification.read ? 'text-cyan-100/50' : 'text-cyan-100/70'
                        )}>
                          {notification.message}
                        </p>
                      </div>

                      {/* Actions (always visible on mobile, hover on desktop) */}
                      <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-cyan-100/40 mt-3">
                      <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                      <span>•</span>
                      <span>{format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

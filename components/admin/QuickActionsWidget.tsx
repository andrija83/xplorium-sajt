"use client"

import { memo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Check, X, ExternalLink, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import Link from "next/link"

/**
 * QuickActionsWidget Component
 *
 * Displays pending bookings with inline approve/reject actions
 * Features:
 * - Shows 5 most recent pending bookings
 * - Inline approve/reject buttons
 * - Optimistic updates
 * - Empty state when no pending bookings
 * - Links to full bookings page
 */

interface PendingBooking {
  id: string
  title: string
  date: Date | string
  time: string
  type: string
  user: {
    name: string | null
    email?: string
  }
}

interface QuickActionsWidgetProps {
  /** Pending bookings to display */
  pendingBookings: PendingBooking[]
  /** Callback for approving a booking */
  onApprove: (id: string) => Promise<void>
  /** Callback for rejecting a booking */
  onReject: (id: string) => Promise<void>
  /** Loading state */
  isLoading?: boolean
}

const BOOKING_TYPE_COLORS: Record<string, string> = {
  PLAYGROUND: 'text-pink-400 bg-pink-400/10 border-pink-400/30',
  SENSORY_ROOM: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  CAFE: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  PARTY: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  EVENT: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
}

export const QuickActionsWidget = memo(function QuickActionsWidget({
  pendingBookings,
  onApprove,
  onReject,
  isLoading = false
}: QuickActionsWidgetProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      await onApprove(id)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setProcessingId(id)
    try {
      await onReject(id)
    } finally {
      setProcessingId(null)
    }
  }

  const getTypeLabel = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group rounded-xl p-6 bg-black/20 backdrop-blur-sm border border-cyan-400/20
                 hover:border-cyan-400/40 transition-all duration-300"
      style={{
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
      }}
    >
      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                   transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: "0 0 24px rgba(34, 211, 238, 0.2), inset 0 0 24px rgba(34, 211, 238, 0.05)"
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div>
          <h3
            className="text-lg font-semibold text-cyan-300"
            style={{
              textShadow: "0 0 20px rgba(34, 211, 238, 0.4)"
            }}
          >
            Quick Actions
          </h3>
          <p className="text-sm text-cyan-100/50 mt-1">
            Approve or reject pending bookings
          </p>
        </div>

        <Link
          href="/admin/bookings?status=PENDING"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                     text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20
                     border border-cyan-400/30 transition-colors"
        >
          View All
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : pendingBookings.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-400/10 border-2 border-green-400/30
                          flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-cyan-100/60 text-center">
              No pending bookings!<br />
              <span className="text-sm text-cyan-100/40">All caught up</span>
            </p>
          </div>
        ) : (
          // Bookings list
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {pendingBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-cyan-400/10
                           hover:border-cyan-400/30 transition-all duration-200"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/30
                                flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-cyan-100 truncate">
                        {booking.user.name || 'Anonymous'}
                      </p>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium border",
                          BOOKING_TYPE_COLORS[booking.type] || 'text-gray-400 bg-gray-400/10 border-gray-400/30'
                        )}
                      >
                        {getTypeLabel(booking.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-cyan-100/50">
                      <Clock className="w-3 h-3" />
                      <span>
                        {format(new Date(booking.date), 'MMM d, yyyy')} at {booking.time}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => handleApprove(booking.id)}
                      disabled={processingId === booking.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-8 h-8 rounded-lg bg-green-400/10 hover:bg-green-400/20
                               border border-green-400/30 hover:border-green-400/50
                               text-green-400 hover:text-green-300
                               flex items-center justify-center
                               transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        boxShadow: "0 0 12px rgba(34, 197, 94, 0.2)"
                      }}
                      aria-label="Approve booking"
                    >
                      {processingId === booking.id ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </motion.button>

                    <motion.button
                      onClick={() => handleReject(booking.id)}
                      disabled={processingId === booking.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-8 h-8 rounded-lg bg-red-400/10 hover:bg-red-400/20
                               border border-red-400/30 hover:border-red-400/50
                               text-red-400 hover:text-red-300
                               flex items-center justify-center
                               transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        boxShadow: "0 0 12px rgba(239, 68, 68, 0.2)"
                      }}
                      aria-label="Reject booking"
                    >
                      {processingId === booking.id ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Decorative corner accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-xl opacity-20
                   bg-gradient-to-br from-cyan-400/40 to-transparent
                   pointer-events-none"
      />
    </motion.div>
  )
})

QuickActionsWidget.displayName = 'QuickActionsWidget'

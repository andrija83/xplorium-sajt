"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { Shield, Calendar, Users, FileText, Trash, Check, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

/**
 * RecentActivity Component
 *
 * Timeline-style activity feed showing recent audit logs
 * Features:
 * - Action-specific icons and colors
 * - User attribution
 * - Relative timestamps
 * - Smooth animations
 */

interface Activity {
  id: string
  action: string
  entity: string
  entityId: string
  user: {
    name: string | null
    email: string
    role: string
  }
  createdAt: Date
}

interface RecentActivityProps {
  /** Array of recent audit log activities */
  activities: Activity[]
  /** Maximum number of items to show */
  limit?: number
}

const getActionIcon = (action: string, entity: string) => {
  switch (action) {
    case 'CREATE':
      return { Icon: Check, color: "text-green-400", bg: "bg-green-400/20" }
    case 'UPDATE':
      return { Icon: FileText, color: "text-blue-400", bg: "bg-blue-400/20" }
    case 'DELETE':
      return { Icon: Trash, color: "text-red-400", bg: "bg-red-400/20" }
    case 'APPROVE':
      return { Icon: Check, color: "text-green-400", bg: "bg-green-400/20" }
    case 'REJECT':
      return { Icon: X, color: "text-red-400", bg: "bg-red-400/20" }
    default:
      return { Icon: Shield, color: "text-cyan-400", bg: "bg-cyan-400/20" }
  }
}

const getEntityIcon = (entity: string) => {
  switch (entity) {
    case 'Booking':
      return Calendar
    case 'User':
      return Users
    case 'Event':
      return Calendar
    case 'Content':
      return FileText
    default:
      return Shield
  }
}

const getActionText = (action: string, entity: string) => {
  const entityLower = entity.toLowerCase()
  switch (action) {
    case 'CREATE':
      return `created a new ${entityLower}`
    case 'UPDATE':
      return `updated ${entityLower}`
    case 'DELETE':
      return `deleted ${entityLower}`
    case 'APPROVE':
      return `approved ${entityLower}`
    case 'REJECT':
      return `rejected ${entityLower}`
    default:
      return `performed action on ${entityLower}`
  }
}

export const RecentActivity = memo(function RecentActivity({
  activities,
  limit = 10
}: RecentActivityProps) {
  const displayedActivities = activities.slice(0, limit)

  if (displayedActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-cyan-100/40">
        <Shield className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {displayedActivities.map((activity, index) => {
        const { Icon: ActionIcon, color, bg } = getActionIcon(activity.action, activity.entity)
        const EntityIcon = getEntityIcon(activity.entity)
        const actionText = getActionText(activity.action, activity.entity)

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-4 group"
          >
            {/* Timeline line */}
            {index < displayedActivities.length - 1 && (
              <div
                className="absolute left-5 top-12 bottom-0 w-px bg-gradient-to-b
                           from-cyan-400/30 via-cyan-400/10 to-transparent"
              />
            )}

            {/* Icon */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-lg ${bg} border border-current/30
                           flex items-center justify-center`}
                style={{
                  boxShadow: "0 0 12px rgba(34, 211, 238, 0.2)"
                }}
              >
                <ActionIcon className={`w-5 h-5 ${color}`} />
              </div>
            </div>

            {/* Content */}
            <div
              className="flex-1 pb-6 rounded-lg p-4 bg-black/20 border border-cyan-400/10
                         hover:border-cyan-400/30 hover:bg-black/30 transition-all duration-300
                         group-hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Action description */}
                  <div className="flex items-center gap-2 mb-1">
                    <EntityIcon className="w-4 h-4 text-cyan-400/60 flex-shrink-0" />
                    <p className="text-sm text-cyan-100/90">
                      <span className="font-medium text-cyan-300">
                        {activity.user.name || activity.user.email}
                      </span>
                      {' '}
                      <span className="text-cyan-100/70">{actionText}</span>
                    </p>
                  </div>

                  {/* User role badge */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs
                                   bg-cyan-400/10 text-cyan-400/80 border border-cyan-400/20">
                      {activity.user.role === 'SUPER_ADMIN' && (
                        <Shield className="w-3 h-3" />
                      )}
                      {activity.user.role}
                    </span>
                    <span className="text-xs text-cyan-100/40">
                      {activity.entity} #{activity.entityId.slice(0, 8)}
                    </span>
                  </div>
                </div>

                {/* Timestamp */}
                <time className="text-xs text-cyan-100/50 whitespace-nowrap">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </time>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
})

RecentActivity.displayName = 'RecentActivity'

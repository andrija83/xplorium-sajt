"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * StatsCard Component
 *
 * Reusable statistics card for the admin dashboard
 * Features:
 * - Icon with neon glow effect
 * - Title and value display
 * - Trend indicator (up/down/neutral)
 * - Glass morphism design
 * - Hover animation
 */

interface StatsCardProps {
  /** Card title */
  title: string
  /** Main stat value */
  value: string | number
  /** Icon component */
  icon: LucideIcon
  /** Trend percentage (positive = up, negative = down, 0 = neutral) */
  trend?: number
  /** Trend label (e.g., "vs last week") */
  trendLabel?: string
  /** Icon color class */
  iconColor?: string
  /** Icon background color class */
  iconBgColor?: string
  /** Custom className */
  className?: string
}

export const StatsCard = memo(function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = "vs last week",
  iconColor = "text-cyan-400",
  iconBgColor = "bg-cyan-400/20",
  className
}: StatsCardProps) {
  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return "text-gray-400"
    return trend > 0 ? "text-green-400" : "text-red-400"
  }

  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return "─"
    return trend > 0 ? "↑" : "↓"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative group rounded-xl p-6",
        "bg-black/20 backdrop-blur-sm border border-cyan-400/20",
        "hover:border-cyan-400/40 transition-all duration-300",
        className
      )}
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

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "p-3 rounded-lg",
              iconBgColor,
              "border border-current/30"
            )}
            style={{
              boxShadow: "0 0 16px rgba(34, 211, 238, 0.3)"
            }}
          >
            <Icon
              className={cn("w-6 h-6", iconColor)}
              style={{
                filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))"
              }}
            />
          </div>

          {/* Trend indicator */}
          {trend !== undefined && (
            <div className={cn("flex items-center gap-1 text-sm font-medium", getTrendColor())}>
              <span className="text-lg">{getTrendIcon()}</span>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-cyan-100/60 mb-2">
          {title}
        </h3>

        {/* Value */}
        <p
          className="text-3xl font-bold text-cyan-300"
          style={{
            textShadow: "0 0 20px rgba(34, 211, 238, 0.4)"
          }}
        >
          {value}
        </p>

        {/* Trend label */}
        {trend !== undefined && trendLabel && (
          <p className="text-xs text-cyan-100/40 mt-2">
            {trendLabel}
          </p>
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

StatsCard.displayName = 'StatsCard'

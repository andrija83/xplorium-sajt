"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * RevenueStatsCard Component
 *
 * Enhanced revenue display card showing today, week, and month revenue with trends
 * Features:
 * - Today's revenue with trend vs yesterday
 * - Week's revenue with trend vs last week
 * - Month's revenue with trend vs last month
 * - Currency formatting (RSD suffix with thousand separators)
 * - Color-coded trend indicators
 */

interface RevenueStatsCardProps {
  /** Today's total revenue */
  todayRevenue: number
  /** Yesterday's total revenue */
  yesterdayRevenue?: number
  /** This week's total revenue */
  weekRevenue: number
  /** This month's total revenue */
  monthRevenue: number
  /** Today's revenue trend percentage */
  todayTrend?: number
  /** Week's revenue trend percentage */
  weekTrend?: number
  /** Month's revenue trend percentage */
  monthTrend?: number
  /** Currency code */
  currency?: string
}

export const RevenueStatsCard = memo(function RevenueStatsCard({
  todayRevenue,
  yesterdayRevenue = 0,
  weekRevenue,
  monthRevenue,
  todayTrend = 0,
  weekTrend = 0,
  monthTrend = 0,
  currency = 'RSD'
}: RevenueStatsCardProps) {

  /**
   * Format number with thousand separators and currency
   */
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('en-US')} ${currency}`
  }

  /**
   * Get trend color based on value
   */
  const getTrendColor = (trend: number) => {
    if (trend === 0) return "text-gray-400"
    return trend > 0 ? "text-green-400" : "text-red-400"
  }

  /**
   * Get trend icon based on value
   */
  const getTrendIcon = (trend: number) => {
    if (trend === 0) return Minus
    return trend > 0 ? TrendingUp : TrendingDown
  }

  /**
   * Render a stat row
   */
  const StatRow = ({
    label,
    value,
    trend,
    trendLabel
  }: {
    label: string
    value: number
    trend?: number
    trendLabel?: string
  }) => {
    const TrendIcon = trend !== undefined ? getTrendIcon(trend) : null
    const trendColor = trend !== undefined ? getTrendColor(trend) : ''

    return (
      <div className="flex items-center justify-between py-3 border-b border-cyan-400/10 last:border-0">
        <div className="flex-1">
          <p className="text-sm text-cyan-100/60 mb-1">{label}</p>
          <p
            className="text-2xl font-bold text-cyan-300"
            style={{
              textShadow: "0 0 15px rgba(34, 211, 238, 0.3)"
            }}
          >
            {formatCurrency(value)}
          </p>
        </div>

        {trend !== undefined && TrendIcon && (
          <div className={cn("flex items-center gap-1.5 ml-4", trendColor)}>
            <TrendIcon className="w-5 h-5" />
            <div className="text-right">
              <p className="text-lg font-semibold">
                {trend > 0 ? '+' : ''}{trend}%
              </p>
              {trendLabel && (
                <p className="text-xs opacity-70">
                  {trendLabel}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
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
            Revenue Overview
          </h3>
          <p className="text-sm text-cyan-100/50 mt-1">
            Total revenue from approved bookings
          </p>
        </div>

        {/* Icon */}
        <div
          className="p-3 rounded-lg bg-emerald-400/20 border border-emerald-400/30"
          style={{
            boxShadow: "0 0 16px rgba(52, 211, 153, 0.3)"
          }}
        >
          <DollarSign
            className="w-6 h-6 text-emerald-400"
            style={{
              filter: "drop-shadow(0 0 8px rgba(52, 211, 153, 0.6))"
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 space-y-1">
        <StatRow
          label="Today"
          value={todayRevenue}
          trend={todayTrend}
          trendLabel="vs yesterday"
        />

        <StatRow
          label="This Week"
          value={weekRevenue}
          trend={weekTrend}
          trendLabel="vs last week"
        />

        <StatRow
          label="This Month"
          value={monthRevenue}
          trend={monthTrend}
          trendLabel="vs last month"
        />
      </div>

      {/* Decorative corner accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-xl opacity-20
                   bg-gradient-to-br from-emerald-400/40 to-transparent
                   pointer-events-none"
      />
    </motion.div>
  )
})

RevenueStatsCard.displayName = 'RevenueStatsCard'

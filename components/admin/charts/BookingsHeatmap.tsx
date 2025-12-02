'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * BookingsHeatmap Component
 *
 * Displays a heatmap of booking density by day of week and time of day
 * Features:
 * - Color-coded cells based on booking count
 * - Tooltip showing exact count on hover
 * - Legend for understanding the color scale
 * - Responsive grid layout
 */

interface HeatmapData {
  day: string
  hour: number
  count: number
}

interface BookingsHeatmapProps {
  data: HeatmapData[]
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8) // 8 AM to 9 PM

/**
 * Get color intensity based on booking count
 * Uses a gradient from transparent to bright cyan
 */
const getHeatColor = (count: number, max: number): string => {
  if (count === 0) return 'bg-white/5'

  const intensity = count / max

  if (intensity <= 0.2) return 'bg-cyan-400/20'
  if (intensity <= 0.4) return 'bg-cyan-400/40'
  if (intensity <= 0.6) return 'bg-cyan-400/60'
  if (intensity <= 0.8) return 'bg-cyan-400/80'
  return 'bg-cyan-400'
}

/**
 * Get text color for cell based on intensity
 */
const getTextColor = (count: number, max: number): string => {
  if (count === 0) return 'text-cyan-100/30'

  const intensity = count / max

  if (intensity <= 0.6) return 'text-cyan-100'
  return 'text-black'
}

export const BookingsHeatmap = memo(function BookingsHeatmap({ data }: BookingsHeatmapProps) {
  // Create a map for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, number>()
    data.forEach(item => {
      const key = `${item.day}-${item.hour}`
      map.set(key, item.count)
    })
    return map
  }, [data])

  // Find max count for color scaling
  const maxCount = useMemo(() => {
    return Math.max(...data.map(d => d.count), 1)
  }, [data])

  // Get booking count for a specific day and hour
  const getCount = (day: string, hour: number): number => {
    return dataMap.get(`${day}-${hour}`) || 0
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-cyan-100/60">Booking Density</span>
        <div className="flex items-center gap-2">
          <span className="text-cyan-100/60">Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-white/5" />
            <div className="w-4 h-4 rounded bg-cyan-400/20" />
            <div className="w-4 h-4 rounded bg-cyan-400/40" />
            <div className="w-4 h-4 rounded bg-cyan-400/60" />
            <div className="w-4 h-4 rounded bg-cyan-400/80" />
            <div className="w-4 h-4 rounded bg-cyan-400" />
          </div>
          <span className="text-cyan-100/60">More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header - Hours */}
          <div className="grid gap-1" style={{ gridTemplateColumns: `60px repeat(${HOURS.length}, 1fr)` }}>
            {/* Empty corner cell */}
            <div />

            {/* Hour labels */}
            {HOURS.map(hour => (
              <div
                key={hour}
                className="text-center text-xs text-cyan-100/60 pb-2"
              >
                {hour % 12 || 12}{hour >= 12 ? 'PM' : 'AM'}
              </div>
            ))}

            {/* Days and cells */}
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="contents">
                {/* Day label */}
                <div className="flex items-center justify-end pr-3 text-xs text-cyan-100/60">
                  {day}
                </div>

                {/* Hour cells for this day */}
                {HOURS.map((hour, hourIndex) => {
                  const count = getCount(day, hour)
                  const colorClass = getHeatColor(count, maxCount)
                  const textColorClass = getTextColor(count, maxCount)

                  return (
                    <motion.div
                      key={`${day}-${hour}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (dayIndex * HOURS.length + hourIndex) * 0.005 }}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      className={cn(
                        'relative group aspect-square rounded border border-cyan-400/10',
                        'hover:border-cyan-400/50 transition-all duration-200',
                        'cursor-pointer flex items-center justify-center',
                        colorClass
                      )}
                      style={{
                        boxShadow: count > 0 ? '0 0 8px rgba(34, 211, 238, 0.2)' : 'none'
                      }}
                    >
                      {/* Count display (only show if count > 0) */}
                      {count > 0 && (
                        <span className={cn('text-xs font-semibold', textColorClass)}>
                          {count}
                        </span>
                      )}

                      {/* Tooltip */}
                      <div
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                                   opacity-0 group-hover:opacity-100 pointer-events-none
                                   transition-opacity duration-200 z-20"
                      >
                        <div
                          className="px-3 py-2 rounded-lg bg-black/90 border border-cyan-400/50
                                     backdrop-blur-sm whitespace-nowrap"
                          style={{
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                          }}
                        >
                          <p className="text-xs text-cyan-300 font-semibold">
                            {day} at {hour % 12 || 12}{hour >= 12 ? 'PM' : 'AM'}
                          </p>
                          <p className="text-xs text-cyan-100/80">
                            {count} {count === 1 ? 'booking' : 'bookings'}
                          </p>
                        </div>
                        {/* Tooltip arrow */}
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 -mt-px
                                     w-0 h-0 border-l-4 border-r-4 border-t-4
                                     border-l-transparent border-r-transparent border-t-cyan-400/50"
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex items-center justify-between pt-4 border-t border-cyan-400/10">
        <div className="text-sm">
          <span className="text-cyan-100/60">Peak Time: </span>
          <span className="text-cyan-300 font-semibold">
            {(() => {
              const peak = data.reduce((max, item) => item.count > max.count ? item : max, data[0] || { day: 'N/A', hour: 0, count: 0 })
              return peak.count > 0
                ? `${peak.day} at ${peak.hour % 12 || 12}${peak.hour >= 12 ? 'PM' : 'AM'} (${peak.count} bookings)`
                : 'No data'
            })()}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-cyan-100/60">Total Bookings: </span>
          <span className="text-cyan-300 font-semibold">
            {data.reduce((sum, item) => sum + item.count, 0)}
          </span>
        </div>
      </div>
    </div>
  )
})

BookingsHeatmap.displayName = 'BookingsHeatmap'

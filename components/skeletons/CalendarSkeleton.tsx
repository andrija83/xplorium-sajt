'use client'

import { Skeleton } from '@/components/ui/skeleton'

/**
 * CalendarSkeleton Component
 *
 * Loading placeholder for calendar while bookings are being fetched.
 * Displays a grid of skeleton cells mimicking calendar structure.
 */
export function CalendarSkeleton() {
  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    </div>
  )
}

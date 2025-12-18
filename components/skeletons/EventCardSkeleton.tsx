'use client'

import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

interface EventCardSkeletonProps {
  index?: number
}

/**
 * EventCardSkeleton Component
 *
 * Loading placeholder for event cards while events are being fetched.
 * Mimics the structure of the actual EventCard component.
 */
export function EventCardSkeleton({ index = 0 }: EventCardSkeletonProps) {
  const rotation = (index % 3 - 1) * 2 // -2, 0, or 2 degrees (matches EventCard)

  return (
    <motion.div
      className="relative p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border-4 border-white/20 shadow-2xl overflow-hidden"
      style={{ rotate: `${rotation}deg` }}
      initial={{ opacity: 0, y: 50, rotate: rotation }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Sticker shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50 pointer-events-none" />

      {/* Badge Skeleton */}
      <div className="absolute top-4 right-4 z-10">
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>

      {/* Emoji Icon Skeleton */}
      <div className="mb-4">
        <Skeleton className="w-16 h-16 rounded-full mx-auto" />
      </div>

      {/* Title Skeleton */}
      <Skeleton className="h-8 w-3/4 mx-auto mb-3" />

      {/* Event Details Skeletons */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
      </div>

      {/* Description Skeleton */}
      <div className="mb-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>

      {/* Button Skeleton */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </motion.div>
  )
}

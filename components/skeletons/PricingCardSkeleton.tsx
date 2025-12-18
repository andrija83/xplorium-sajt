'use client'

import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

interface PricingCardSkeletonProps {
  index?: number
}

/**
 * PricingCardSkeleton Component
 *
 * Loading placeholder for pricing cards while packages are being fetched.
 * Matches the structure of PricingCard component.
 */
export function PricingCardSkeleton({ index = 0 }: PricingCardSkeletonProps) {
  return (
    <motion.div
      className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Package Name Skeleton */}
      <Skeleton className="h-8 w-3/4 mb-4" />

      {/* Description Skeleton */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/5" />
      </div>

      {/* Features List Skeleton */}
      <div className="mb-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-2">
            <Skeleton className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>

      {/* Price Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-1/2 mx-auto" />
        <Skeleton className="h-3 w-1/3 mx-auto mt-2" />
      </div>

      {/* Button Skeleton */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </motion.div>
  )
}

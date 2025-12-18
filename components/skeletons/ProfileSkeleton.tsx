'use client'

import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * ProfileSkeleton Component
 *
 * Loading placeholder for profile page while user data and bookings are being fetched.
 * Mimics the layout of ProfilePage with ProfileHeader, LoyaltyCard, and BookingHistory.
 */
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Loyalty Skeletons */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Header Skeleton */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
            >
              {/* Avatar */}
              <div className="flex flex-col items-center mb-4">
                <Skeleton className="w-24 h-24 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>

              {/* Stats */}
              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </motion.div>

            {/* Loyalty Card Skeleton */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-400/20"
            >
              <Skeleton className="h-5 w-32 mb-4" />

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              <Skeleton className="h-2 w-full rounded-full" />
            </motion.div>
          </div>

          {/* Right Column - Booking History Skeleton */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20">
              <Skeleton className="h-6 w-40 mb-6" />

              {/* Booking Card Skeletons */}
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="p-4 rounded-lg bg-black/30 border border-cyan-400/10"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

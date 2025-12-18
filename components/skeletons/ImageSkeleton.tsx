'use client'

import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

interface ImageSkeletonProps {
  index?: number
  aspectRatio?: 'square' | 'video' | 'portrait'
}

/**
 * ImageSkeleton Component
 *
 * Loading placeholder for images in galleries.
 * Used in SensorySection and other image-heavy components.
 */
export function ImageSkeleton({ index = 0, aspectRatio = 'square' }: ImageSkeletonProps) {
  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  }[aspectRatio]

  return (
    <motion.div
      className={`${aspectClass} rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10`}
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Skeleton className="w-full h-full" />
    </motion.div>
  )
}

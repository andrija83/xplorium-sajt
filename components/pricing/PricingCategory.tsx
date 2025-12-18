/**
 * PricingCategory Component
 *
 * Wraps a category of pricing packages with consistent styling,
 * loading states, and empty states.
 */

'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { PricingCard, type PricingPackage, type PricingCategory as Category } from './PricingCard'
import { PricingCardSkeleton } from '@/components/skeletons'

interface PricingCategoryProps {
  title: string
  packages: PricingPackage[]
  category: Category
  isLoading: boolean
  onBook: (pkg: PricingPackage) => void
}

// Category-specific colors for titles and loading spinners
const CATEGORY_COLORS = {
  PLAYGROUND: {
    title: 'text-pink-400',
    titleShadow: '0 0 20px rgba(236, 72, 153, 0.5)',
    spinnerBorder: 'border-pink-400',
  },
  SENSORY_ROOM: {
    title: 'text-purple-400',
    titleShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
    spinnerBorder: 'border-purple-400',
  },
  CAFE: {
    title: 'text-cyan-400',
    titleShadow: '0 0 20px rgba(34, 211, 238, 0.5)',
    spinnerBorder: 'border-cyan-400',
  },
  PARTY: {
    title: 'text-yellow-400',
    titleShadow: '0 0 20px rgba(250, 204, 21, 0.5)',
    spinnerBorder: 'border-yellow-400',
  },
}

export const PricingCategory = memo(function PricingCategory({
  title,
  packages,
  category,
  isLoading,
  onBook,
}: PricingCategoryProps) {
  const colors = CATEGORY_COLORS[category]

  return (
    <motion.div
      className="mb-10"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      {/* Category Title */}
      <motion.h3
        className={`${colors.title} font-['Great_Vibes'] text-4xl mb-6 text-center`}
        style={{ textShadow: colors.titleShadow }}
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.6 }}
      >
        {title}
      </motion.h3>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading State - Skeleton Cards
          <>
            {[...Array(3)].map((_, index) => (
              <PricingCardSkeleton key={index} index={index} />
            ))}
          </>
        ) : packages.length > 0 ? (
          // Pricing Cards
          packages.map((pkg, index) => (
            <PricingCard
              key={pkg.id || index}
              package={pkg}
              category={category}
              index={index}
              onBook={onBook}
            />
          ))
        ) : (
          // Empty State
          <div className="col-span-3 text-center py-12">
            <p className="text-white/60">Trenutno nema dostupnih paketa</p>
          </div>
        )}
      </div>
    </motion.div>
  )
})

PricingCategory.displayName = 'PricingCategory'

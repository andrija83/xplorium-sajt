/**
 * PricingCard Component
 *
 * Reusable pricing card component that displays package information
 * with category-specific theming and animations.
 *
 * Replaces 1,800+ lines of duplicated code across 4 pricing sections.
 */

'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'

export type PricingCategory = 'PLAYGROUND' | 'SENSORY_ROOM' | 'CAFE' | 'PARTY'

export interface PricingPackage {
  id: string
  name: string
  price: string | null  // Nullable during migration to priceAmount/priceCurrency
  priceAmount?: number | null
  priceCurrency?: string | null
  features: string[]
  popular?: boolean
  category: PricingCategory
}

interface PricingCardProps {
  package: PricingPackage
  category: PricingCategory
  index: number
  onBook: (pkg: PricingPackage) => void
}

// Category-specific color themes
const CATEGORY_THEMES = {
  PLAYGROUND: {
    primary: 'pink-400',
    gradient: 'from-pink-400/10 to-pink-600/5',
    border: 'border-pink-400/20',
    borderActive: 'border-pink-400/60',
    textShadow: '0 0 10px rgba(236, 72, 153, 0.5)',
    titleShadow: '0 0 20px rgba(236, 72, 153, 0.5)',
    boxShadow: '0 0 30px rgba(236, 72, 153, 0.3)',
    badgeGradient: 'from-pink-500 to-pink-600',
    badgeShadow: '0 0 10px rgba(236, 72, 153, 0.8)',
    badgeBoxShadow: '0 0 20px rgba(236, 72, 153, 0.5)',
    buttonBg: 'bg-pink-400/20',
    buttonBorder: 'border-pink-400/50',
    buttonText: 'text-pink-400',
    buttonHoverBg: 'hover:bg-pink-400/30',
    buttonShadow: '0 0 15px rgba(236, 72, 153, 0.2)',
    buttonHoverShadow: '0 0 25px rgba(236, 72, 153, 0.4)',
    spinnerBorder: 'border-pink-400',
    borderColor: 'rgba(236, 72, 153, 0.8)',
  },
  SENSORY_ROOM: {
    primary: 'purple-400',
    gradient: 'from-purple-400/10 to-purple-600/5',
    border: 'border-purple-400/20',
    borderActive: 'border-purple-400/60',
    textShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
    titleShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
    boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)',
    badgeGradient: 'from-purple-500 to-purple-600',
    badgeShadow: '0 0 10px rgba(168, 85, 247, 0.8)',
    badgeBoxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
    buttonBg: 'bg-purple-400/20',
    buttonBorder: 'border-purple-400/50',
    buttonText: 'text-purple-400',
    buttonHoverBg: 'hover:bg-purple-400/30',
    buttonShadow: '0 0 15px rgba(168, 85, 247, 0.2)',
    buttonHoverShadow: '0 0 25px rgba(168, 85, 247, 0.4)',
    spinnerBorder: 'border-purple-400',
    borderColor: 'rgba(168, 85, 247, 0.8)',
  },
  CAFE: {
    primary: 'cyan-400',
    gradient: 'from-cyan-400/10 to-cyan-600/5',
    border: 'border-cyan-400/20',
    borderActive: 'border-cyan-400/60',
    textShadow: '0 0 10px rgba(34, 211, 238, 0.5)',
    titleShadow: '0 0 20px rgba(34, 211, 238, 0.5)',
    boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)',
    badgeGradient: 'from-cyan-500 to-cyan-600',
    badgeShadow: '0 0 10px rgba(34, 211, 238, 0.8)',
    badgeBoxShadow: '0 0 20px rgba(34, 211, 238, 0.5)',
    buttonBg: 'bg-cyan-400/20',
    buttonBorder: 'border-cyan-400/50',
    buttonText: 'text-cyan-400',
    buttonHoverBg: 'hover:bg-cyan-400/30',
    buttonShadow: '0 0 15px rgba(34, 211, 238, 0.2)',
    buttonHoverShadow: '0 0 25px rgba(34, 211, 238, 0.4)',
    spinnerBorder: 'border-cyan-400',
    borderColor: 'rgba(34, 211, 238, 0.8)',
  },
  PARTY: {
    primary: 'yellow-400',
    gradient: 'from-yellow-400/10 to-yellow-600/5',
    border: 'border-yellow-400/20',
    borderActive: 'border-yellow-400/60',
    textShadow: '0 0 10px rgba(250, 204, 21, 0.5)',
    titleShadow: '0 0 20px rgba(250, 204, 21, 0.5)',
    boxShadow: '0 0 30px rgba(250, 204, 21, 0.3)',
    badgeGradient: 'from-yellow-500 to-yellow-600',
    badgeShadow: '0 0 10px rgba(250, 204, 21, 0.8)',
    badgeBoxShadow: '0 0 20px rgba(250, 204, 21, 0.5)',
    buttonBg: 'bg-yellow-400/20',
    buttonBorder: 'border-yellow-400/50',
    buttonText: 'text-yellow-400',
    buttonHoverBg: 'hover:bg-yellow-400/30',
    buttonShadow: '0 0 15px rgba(250, 204, 21, 0.2)',
    buttonHoverShadow: '0 0 25px rgba(250, 204, 21, 0.4)',
    spinnerBorder: 'border-yellow-400',
    borderColor: 'rgba(250, 204, 21, 0.8)',
  },
}

export const PricingCard = memo(({ package: pkg, category, index, onBook }: PricingCardProps) => {
  const theme = CATEGORY_THEMES[category]

  return (
    <motion.div
      className={`relative bg-gradient-to-br ${pkg.popular ? theme.gradient : 'from-white/5 to-white/0'} border-2 ${pkg.popular ? theme.borderActive : theme.border} rounded-xl p-6 backdrop-blur-sm`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        borderColor: theme.borderColor,
        scale: pkg.popular ? 1.05 : 1.03,
        y: -10,
      }}
      style={{
        ...(pkg.popular ? { boxShadow: theme.boxShadow } : {}),
        willChange: 'transform, opacity'
      }}
    >
      {/* Popular Badge */}
      {pkg.popular && (
        <div
          className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r ${theme.badgeGradient} text-white text-xs px-4 py-1.5 rounded-full font-medium`}
          style={{ textShadow: theme.badgeShadow, boxShadow: theme.badgeBoxShadow }}
        >
          ⭐ Najpopularnije
        </div>
      )}

      {/* Package Name */}
      <h4 className="text-white font-['Great_Vibes'] text-3xl mb-3">
        {pkg.name}
      </h4>

      {/* Price */}
      <p
        className={`text-${theme.primary} text-3xl font-bold mb-6`}
        style={{ textShadow: theme.textShadow }}
      >
        {pkg.price || (pkg.priceAmount ? `${pkg.priceAmount} ${pkg.priceCurrency || 'RSD'}` : 'Contact us')}
      </p>

      {/* Features List */}
      <ul className="space-y-3 mb-6">
        {pkg.features.map((feature: string, i: number) => (
          <li
            key={i}
            className="text-white/80 text-sm flex items-start"
          >
            <span className={`text-${theme.primary} mr-2 text-lg`}>✓</span>
            {feature}
          </li>
        ))}
      </ul>

      {/* Book Button */}
      <motion.button
        onClick={() => onBook(pkg)}
        aria-label={`Book ${pkg.name} package`}
        className={`w-full py-3 ${theme.buttonBg} border-2 ${theme.buttonBorder} rounded-lg ${theme.buttonText} text-sm font-medium ${theme.buttonHoverBg} transition-all`}
        style={{ boxShadow: theme.buttonShadow }}
        whileHover={{ scale: 1.05, boxShadow: theme.buttonHoverShadow }}
        whileTap={{ scale: 0.95 }}
      >
        {category === 'PARTY' ? 'Rezerviši Rođendan' : 'Rezerviši Sada'}
      </motion.button>
    </motion.div>
  )
})

PricingCard.displayName = 'PricingCard'

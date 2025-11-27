'use client'

import { memo } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { SectionSkeleton } from '@/components/loading/SectionSkeleton'
import { useNavigationStore } from '@/stores/navigationStore'

// Dynamic imports for feature sections
const CafeSection = dynamic(() => import("@/features/cafe/CafeSection").then(m => ({ default: m.CafeSection })), {
  loading: () => <SectionSkeleton />,
  ssr: false
})
const SensorySection = dynamic(() => import("@/features/sensory/SensorySection").then(m => ({ default: m.SensorySection })), {
  loading: () => <SectionSkeleton />,
  ssr: false
})
const IgraonicaSection = dynamic(() => import("@/features/igraonica/IgraonicaSection").then(m => ({ default: m.IgraonicaSection })), {
  loading: () => <SectionSkeleton />,
  ssr: false
})
const ProfileSection = dynamic(() => import("@/components/profile/ProfileSection").then(m => ({ default: m.ProfileSection })), {
  loading: () => <SectionSkeleton />,
  ssr: false
})

/**
 * SectionManager Component
 *
 * Manages routing and rendering of feature sections:
 * - Cafe Section (with glass frame submenu)
 * - Sensory Section (with planet orb navigation)
 * - Igraonica Section (playground)
 * - Profile Section
 *
 * Now uses Zustand store for navigation - NO MORE PROP DRILLING! 🎉
 *
 * Uses AnimatePresence-compatible transitions
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const SectionManager = memo(function SectionManager() {
  // Get navigation state directly from Zustand store - no props needed!
  const activeView = useNavigationStore(state => state.activeView)

  // Igraonica needs full viewport width, others need container constraints
  const isFullWidth = activeView === "igraonica"

  return (
    <motion.div
      key={activeView}
      className={`w-full ${isFullWidth ? '' : 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      role="region"
      aria-label={`${activeView === 'discover' ? 'Sensory' : activeView === 'igraonica' ? 'Igraonica' : activeView === 'cafe' ? 'Cafe' : activeView} section`}
    >
      {/* All sections now get their state directly from Zustand - no props! */}
      {activeView === "cafe" && <CafeSection />}

      {activeView === "discover" && <SensorySection />}

      {activeView === "igraonica" && <IgraonicaSection />}

      {activeView === "profile" && <ProfileSection />}
    </motion.div>
  )
})

SectionManager.displayName = 'SectionManager'

'use client'

import { memo } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { SectionSkeleton } from '@/components/loading/SectionSkeleton'

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

interface SectionManagerProps {
  activeView: string
  sensorySubView: string | null
  cafeSubView: string | null
  setSensorySubView: (view: string | null) => void
  setCafeSubView: (view: string | null) => void
}

/**
 * SectionManager Component
 *
 * Manages routing and rendering of feature sections:
 * - Cafe Section (with glass frame submenu)
 * - Sensory Section (with planet orb navigation)
 * - Igraonica Section (playground)
 * - Profile Section
 *
 * Uses AnimatePresence-compatible transitions
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const SectionManager = memo(function SectionManager({
  activeView,
  sensorySubView,
  cafeSubView,
  setSensorySubView,
  setCafeSubView,
}: SectionManagerProps) {
  return (
    <motion.div
      key={activeView}
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      role="region"
      aria-label={`${activeView === 'discover' ? 'Sensory' : activeView === 'igraonica' ? 'Igraonica' : activeView === 'cafe' ? 'Cafe' : activeView} section`}
    >
      {activeView === "cafe" && (
        <CafeSection
          cafeSubView={cafeSubView}
          setCafeSubView={setCafeSubView}
        />
      )}

      {activeView === "discover" && (
        <SensorySection
          sensorySubView={sensorySubView}
          setSensorySubView={setSensorySubView}
        />
      )}

      {activeView === "igraonica" && <IgraonicaSection />}

      {activeView === "profile" && <ProfileSection />}
    </motion.div>
  )
})

SectionManager.displayName = 'SectionManager'

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

/**
 * Root Template for Page Transitions
 *
 * This template wraps all pages and handles smooth transitions
 * when navigating between routes. It re-renders on every route change,
 * unlike layout.tsx which persists across navigations.
 *
 * Animation: Fade + Scale
 * Duration: 0.5s
 * Easing: easeInOut
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{
          duration: 0.5,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

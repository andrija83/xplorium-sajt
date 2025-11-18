"use client"

import type React from "react"
import { memo, useMemo } from "react"
import { motion } from "framer-motion"
import { LogIn, UserPlus } from "lucide-react"
import { ANIMATION_EASING } from "@/constants/animations"

/**
 * AuthButtons Component
 *
 * Displays Sign In and Sign Up buttons in the top-right corner
 * with Xplorium's signature neon glow effects and animations.
 *
 * Features:
 * - Neon cyan glow effect matching site theme
 * - Smooth hover animations with scale and glow increase
 * - Glass morphism backdrop effect
 * - Responsive sizing for mobile/desktop
 * - Icon + text layout
 *
 * Optimized with React.memo and memoized color constants
 */

interface AuthButtonsProps {
  /** Optional className for custom positioning */
  className?: string
  /** Callback when Sign In is clicked */
  onSignIn?: () => void
  /** Callback when Sign Up is clicked */
  onSignUp?: () => void
}

export const AuthButtons = memo(function AuthButtons({
  className = "",
  onSignIn,
  onSignUp
}: AuthButtonsProps) {

  // Memoized neon color constants
  const colors = useMemo(() => ({
    neonCyan: "#22d3ee",
    neonCyanGlow: "0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee",
    neonCyanGlowHover: "0 0 15px #22d3ee, 0 0 30px #22d3ee, 0 0 45px #22d3ee, 0 0 60px #06b6d4"
  }), [])

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      {/* Sign In Button */}
      <motion.button
        onClick={onSignIn}
        className="group relative flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5
                   rounded-lg backdrop-blur-sm bg-black/20 border border-cyan-400/30
                   overflow-hidden transition-colors duration-300"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          ease: ANIMATION_EASING.SMOOTH
        }}
        whileHover={{
          scale: 1.05,
          borderColor: "rgba(34, 211, 238, 0.6)"
        }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Gradient overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />

        {/* Icon */}
        <LogIn
          className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 relative z-10
                     transition-all duration-300 group-hover:text-cyan-300"
          style={{
            filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))"
          }}
        />

        {/* Text */}
        <span
          className="text-sm sm:text-base font-medium text-cyan-400 relative z-10
                     transition-all duration-300 group-hover:text-cyan-300"
          style={{
            textShadow: colors.neonCyanGlow
          }}
        >
          Sign In
        </span>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
                     transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: colors.neonCyanGlowHover,
            border: `1px solid ${colors.neonCyan}`
          }}
        />
      </motion.button>

      {/* Sign Up Button - Rainbow border */}
      <motion.button
        onClick={onSignUp}
        className="group relative flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5
                   rounded-lg backdrop-blur-sm bg-black/40 overflow-hidden transition-all duration-300"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.4,
          ease: ANIMATION_EASING.SMOOTH
        }}
        whileHover={{
          scale: 1.05
        }}
        whileTap={{ scale: 0.95 }}
        style={{
          boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)"
        }}
      >
        {/* Animated rainbow border */}
        <motion.div
          className="absolute inset-0 rounded-lg p-[2px]"
          style={{
            background: "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)",
            backgroundSize: "200% 100%"
          }}
          animate={{
            backgroundPosition: ["0% 0%", "200% 0%"]
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear"
          }}
        >
          <div className="absolute inset-[2px] rounded-lg bg-black/40 backdrop-blur-sm" />
        </motion.div>

        {/* Animated background shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ["-200%", "200%"]
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear"
          }}
        />

        {/* Icon */}
        <UserPlus
          className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10
                     transition-all duration-300 group-hover:text-white"
          style={{
            filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))"
          }}
        />

        {/* Text */}
        <span
          className="text-sm sm:text-base font-semibold text-white relative z-10
                     transition-all duration-300"
          style={{
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)"
          }}
        >
          Sign Up
        </span>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
                     transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: "0 0 20px rgba(255, 255, 255, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2)",
          }}
        />
      </motion.button>
    </div>
  )
})

AuthButtons.displayName = 'AuthButtons'

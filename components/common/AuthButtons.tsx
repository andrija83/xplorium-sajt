"use client"

import type React from "react"
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
 */

interface AuthButtonsProps {
  /** Optional className for custom positioning */
  className?: string
  /** Callback when Sign In is clicked */
  onSignIn?: () => void
  /** Callback when Sign Up is clicked */
  onSignUp?: () => void
}

export function AuthButtons({
  className = "",
  onSignIn,
  onSignUp
}: AuthButtonsProps) {

  // Neon cyan color matching Cafe section
  const neonCyan = "#22d3ee"
  const neonCyanGlow = "0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee"
  const neonCyanGlowHover = "0 0 15px #22d3ee, 0 0 30px #22d3ee, 0 0 45px #22d3ee, 0 0 60px #06b6d4"

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
            textShadow: neonCyanGlow
          }}
        >
          Sign In
        </span>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
                     transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: neonCyanGlowHover,
            border: `1px solid ${neonCyan}`
          }}
        />
      </motion.button>

      {/* Sign Up Button - More prominent */}
      <motion.button
        onClick={onSignUp}
        className="group relative flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5
                   rounded-lg backdrop-blur-sm bg-gradient-to-r from-cyan-500/20 to-cyan-600/20
                   border-2 border-cyan-400/50 overflow-hidden transition-all duration-300
                   hover:from-cyan-500/30 hover:to-cyan-600/30"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.4,
          ease: ANIMATION_EASING.SMOOTH
        }}
        whileHover={{
          scale: 1.05,
          borderColor: "rgba(34, 211, 238, 0.8)"
        }}
        whileTap={{ scale: 0.95 }}
        style={{
          boxShadow: neonCyanGlow
        }}
      >
        {/* Animated background shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
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
          className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 relative z-10
                     transition-all duration-300 group-hover:text-white"
          style={{
            filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.8))"
          }}
        />

        {/* Text */}
        <span
          className="text-sm sm:text-base font-semibold text-cyan-300 relative z-10
                     transition-all duration-300 group-hover:text-white"
          style={{
            textShadow: neonCyanGlow
          }}
        >
          Sign Up
        </span>

        {/* Stronger hover glow */}
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
                     transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `${neonCyanGlowHover}, inset 0 0 20px rgba(34, 211, 238, 0.3)`,
          }}
        />
      </motion.button>
    </div>
  )
}

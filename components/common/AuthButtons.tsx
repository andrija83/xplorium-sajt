"use client"

import type React from "react"
import { memo, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LogIn, UserPlus, User, LogOut, Settings, Shield } from "lucide-react"
import { ANIMATION_EASING } from "@/constants/animations"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

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
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)

  // Memoized neon color constants
  const colors = useMemo(() => ({
    neonCyan: "#22d3ee",
    neonCyanGlow: "0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee",
    neonCyanGlowHover: "0 0 15px #22d3ee, 0 0 30px #22d3ee, 0 0 45px #22d3ee, 0 0 60px #06b6d4"
  }), [])

  const handleSignOut = async () => {
    setShowDropdown(false)
    await signOut({ redirect: false })
    // Replace current history entry to prevent back button access
    router.replace('/')
    router.refresh()
  }

  const handleAdminDashboard = () => {
    setShowDropdown(false)
    router.push('/admin')
  }

  // Show loading state
  if (status === "loading") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-20 h-10 bg-cyan-400/10 rounded-lg animate-pulse" />
      </div>
    )
  }

  // Show user menu if authenticated
  if (session?.user) {
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'

    return (
      <div className={`relative ${className}`}>
        <motion.button
          onClick={() => setShowDropdown(!showDropdown)}
          className="group relative flex items-center gap-3 px-4 py-2 sm:px-5 sm:py-2.5
                     rounded-lg backdrop-blur-sm bg-black/20 border border-cyan-400/30
                     overflow-hidden transition-colors duration-300"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.6,
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
          <User
            className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 relative z-10
                       transition-all duration-300 group-hover:text-cyan-300"
            style={{
              filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))"
            }}
          />

          {/* User name */}
          <span
            className="text-sm sm:text-base font-medium text-cyan-400 relative z-10
                       transition-all duration-300 group-hover:text-cyan-300 max-w-[150px] truncate"
            style={{
              textShadow: colors.neonCyanGlow
            }}
          >
            {session.user.name || session.user.email}
          </span>

          {isAdmin && (
            <Shield className="w-4 h-4 text-purple-400 relative z-10" />
          )}

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

        {/* Dropdown menu */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-56 rounded-lg backdrop-blur-sm
                         bg-black/90 border border-cyan-400/30 overflow-hidden z-50"
              style={{
                boxShadow: colors.neonCyanGlow
              }}
            >
              {/* User info */}
              <div className="px-4 py-3 border-b border-cyan-400/20">
                <p className="text-sm text-cyan-100/80 truncate">
                  {session.user.email}
                </p>
                <p className="text-xs text-cyan-400/60 mt-1">
                  {session.user.role}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-2">
                {isAdmin && (
                  <button
                    onClick={handleAdminDashboard}
                    className="w-full px-4 py-2 flex items-center gap-3 text-cyan-300
                               hover:bg-cyan-400/10 transition-colors text-left"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Admin Dashboard</span>
                  </button>
                )}

                {!isAdmin && (
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      router.push('/profile')
                    }}
                    className="w-full px-4 py-2 flex items-center gap-3 text-cyan-300
                               hover:bg-cyan-400/10 transition-colors text-left"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">My Profile</span>
                  </button>
                )}

                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 flex items-center gap-3 text-red-400
                             hover:bg-red-400/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click outside to close */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    )
  }

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

"use client"

import { memo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, User, LogOut, Shield, Home } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

/**
 * AdminHeader Component
 *
 * Top header bar for the admin dashboard
 * Features:
 * - Page title display
 * - User profile dropdown
 * - Mobile menu toggle
 * - Sign out functionality
 * - Link back to main site
 */

interface AdminHeaderProps {
  /** Current page title */
  title?: string
  /** Mobile menu toggle callback */
  onMobileMenuToggle?: () => void
}

export const AdminHeader = memo(function AdminHeader({
  title = "Dashboard",
  onMobileMenuToggle
}: AdminHeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    setShowUserMenu(false)
    await signOut({ redirect: false })
    router.push('/')
  }

  const neonCyanGlow = "0 0 10px #22d3ee, 0 0 20px #22d3ee"

  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6
                 bg-black/40 backdrop-blur-xl border-b border-cyan-400/20"
      style={{
        boxShadow: "0 4px 24px rgba(34, 211, 238, 0.1)"
      }}
    >
      {/* Left: Mobile menu + Title */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-cyan-400/60 hover:text-cyan-400
                     hover:bg-cyan-400/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Page title */}
        <h2
          className="text-lg sm:text-xl font-semibold text-cyan-400"
          style={{
            textShadow: neonCyanGlow
          }}
        >
          {title}
        </h2>
      </div>

      {/* Right: User menu */}
      <div className="flex items-center gap-3">
        {/* Back to site link */}
        <Link
          href="/"
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg
                     text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-400/10
                     transition-colors text-sm"
        >
          <Home className="w-4 h-4" />
          <span>Back to Site</span>
        </Link>

        {/* User menu dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg
                       bg-black/20 border border-cyan-400/30
                       hover:bg-cyan-400/10 hover:border-cyan-400/50
                       transition-all duration-300"
          >
            {/* User icon */}
            <div
              className="p-1.5 rounded-full bg-cyan-400/20 border border-cyan-400/50"
              style={{
                boxShadow: "0 0 10px rgba(34, 211, 238, 0.4)"
              }}
            >
              <User className="w-4 h-4 text-cyan-400" />
            </div>

            {/* User name (hidden on mobile) */}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-cyan-300">
                {session?.user?.name || session?.user?.email}
              </p>
              <p className="text-xs text-cyan-400/60 flex items-center gap-1">
                {session?.user?.role === 'SUPER_ADMIN' && (
                  <Shield className="w-3 h-3" />
                )}
                {session?.user?.role}
              </p>
            </div>
          </button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {showUserMenu && (
              <>
                {/* Backdrop for mobile */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Menu */}
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-lg
                             bg-black/95 backdrop-blur-xl border border-cyan-400/30
                             overflow-hidden z-50"
                  style={{
                    boxShadow: "0 8px 32px rgba(34, 211, 238, 0.2)"
                  }}
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-cyan-400/20">
                    <p className="text-sm font-medium text-cyan-300 truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-cyan-100/60 truncate mt-1">
                      {session?.user?.email}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {session?.user?.role === 'SUPER_ADMIN' && (
                        <Shield className="w-3 h-3 text-purple-400" />
                      )}
                      <p className="text-xs font-medium text-cyan-400/80">
                        {session?.user?.role}
                      </p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    {/* Back to site (mobile) */}
                    <Link
                      href="/"
                      onClick={() => setShowUserMenu(false)}
                      className="sm:hidden flex items-center gap-3 px-4 py-2
                                 text-cyan-300 hover:bg-cyan-400/10 transition-colors"
                    >
                      <Home className="w-4 h-4" />
                      <span className="text-sm">Back to Site</span>
                    </Link>

                    {/* Sign out */}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2
                                 text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
})

AdminHeader.displayName = 'AdminHeader'

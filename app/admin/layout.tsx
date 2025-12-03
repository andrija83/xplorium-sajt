"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { getBookings } from "@/app/actions/bookings"
import { useActivityTracker } from "@/hooks/useActivityTracker"
import { logger } from "@/lib/logger"

/**
 * Admin Layout Component
 *
 * Main layout wrapper for all admin pages
 * Features:
 * - Sidebar navigation with pending bookings count
 * - Header with user menu
 * - Responsive mobile menu
 * - Automatic pending count updates
 * - Activity tracking for session refresh
 */

// Map routes to page titles
const getPageTitle = (pathname: string): string => {
  if (pathname === '/admin') return 'Dashboard'
  if (pathname.startsWith('/admin/bookings')) return 'Bookings'
  if (pathname.startsWith('/admin/events')) return 'Events'
  if (pathname.startsWith('/admin/users')) return 'Users'
  if (pathname.startsWith('/admin/campaigns')) return 'Campaigns'
  if (pathname.startsWith('/admin/content')) return 'Content'
  if (pathname.startsWith('/admin/export-import')) return 'Export / Import'
  if (pathname.startsWith('/admin/audit')) return 'Audit Logs'
  return 'Admin'
}

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Track admin activity to prevent session timeout
  useActivityTracker()

  // Get page title based on current route
  const pageTitle = getPageTitle(pathname || '')

  // Protect admin routes - redirect if not authorized
  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/')
      return
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      router.push('/')
      return
    }
  }, [session, status, router])

  // Fetch pending bookings count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const result = await getBookings({ status: 'PENDING' })
        if (result.success && result.bookings) {
          setPendingCount(result.bookings.length)
        }
      } catch (error) {
        logger.error('Failed to fetch pending bookings count', error instanceof Error ? error : new Error(String(error)))
      }
    }

    fetchPendingCount()

    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <AdminSidebar
        pendingCount={pendingCount}
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AdminHeader
          title={pageTitle}
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

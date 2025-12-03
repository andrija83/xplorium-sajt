"use client"

import { memo, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Shield,
  Menu,
  X,
  ChevronLeft,
  BookOpen,
  DollarSign,
  Wrench,
  Package,
  FileDown,
  UserCircle,
  Mail,
  Settings,
  Bell,
  BarChart3,
  Clock,
  ChevronDown,
  ChevronRight,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * AdminSidebar Component
 *
 * Navigation sidebar for the admin dashboard
 * Features:
 * - Grouped navigation with collapsible sections
 * - Active link highlighting with neon cyan glow
 * - Pending bookings badge
 * - Collapsible sidebar on desktop
 * - Mobile-responsive with slide-out menu
 * - Glass morphism design matching Xplorium theme
 * - Persistent group expanded state (localStorage)
 */

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

interface NavGroup {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
}

interface AdminSidebarProps {
  /** Number of pending bookings for badge */
  pendingCount?: number
  /** Mobile menu open state */
  isMobileOpen?: boolean
  /** Mobile menu toggle callback */
  onMobileToggle?: () => void
}

export const AdminSidebar = memo(function AdminSidebar({
  pendingCount = 0,
  isMobileOpen = false,
  onMobileToggle
}: AdminSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Initialize expanded groups from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('admin-nav-expanded')
    if (stored) {
      try {
        setExpandedGroups(new Set(JSON.parse(stored)))
      } catch (e) {
        // Ignore parse errors
      }
    } else {
      // Default: expand all groups
      setExpandedGroups(new Set(['bookings', 'customers', 'finance', 'insights', 'operations', 'system']))
    }
  }, [])

  // Save expanded groups to localStorage
  useEffect(() => {
    if (expandedGroups.size > 0) {
      localStorage.setItem('admin-nav-expanded', JSON.stringify(Array.from(expandedGroups)))
    }
  }, [expandedGroups])

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  // Top-level navigation items (always visible)
  const topLevelItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard
    },
    {
      label: "Notifications",
      href: "/admin/notifications",
      icon: Bell
    }
  ]

  // Grouped navigation items
  const navGroups: NavGroup[] = [
    {
      id: "bookings",
      label: "Bookings & Events",
      icon: Calendar,
      items: [
        {
          label: "Bookings",
          href: "/admin/bookings",
          icon: Calendar,
          badge: pendingCount
        },
        {
          label: "Scheduling",
          href: "/admin/scheduling",
          icon: Clock
        },
        {
          label: "Events",
          href: "/admin/events",
          icon: BookOpen
        }
      ]
    },
    {
      id: "customers",
      label: "Customers & Marketing",
      icon: UserCircle,
      items: [
        {
          label: "Customers",
          href: "/admin/customers",
          icon: UserCircle
        },
        {
          label: "Customer Insights",
          href: "/admin/customers/insights",
          icon: TrendingUp
        },
        {
          label: "Campaigns",
          href: "/admin/campaigns",
          icon: Mail
        },
        {
          label: "Users",
          href: "/admin/users",
          icon: Users
        }
      ]
    },
    {
      id: "finance",
      label: "Finance & Analytics",
      icon: DollarSign,
      items: [
        {
          label: "Revenue",
          href: "/admin/revenue",
          icon: DollarSign
        },
        {
          label: "Analytics",
          href: "/admin/analytics",
          icon: BarChart3
        },
        {
          label: "Pricing",
          href: "/admin/pricing",
          icon: DollarSign
        },
        {
          label: "Reports",
          href: "/admin/reports",
          icon: FileDown
        }
      ]
    },
    {
      id: "operations",
      label: "Operations",
      icon: Wrench,
      items: [
        {
          label: "Maintenance",
          href: "/admin/maintenance",
          icon: Wrench
        },
        {
          label: "Inventory",
          href: "/admin/inventory",
          icon: Package
        },
        {
          label: "Content",
          href: "/admin/content",
          icon: FileText
        }
      ]
    },
    {
      id: "system",
      label: "Settings & Security",
      icon: Settings,
      items: [
        {
          label: "Settings",
          href: "/admin/settings",
          icon: Settings
        },
        {
          label: "Audit Logs",
          href: "/admin/audit",
          icon: Shield
        }
      ]
    }
  ]

  // Check if link is active
  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname?.startsWith(href)
  }

  // Check if any item in group is active
  const isGroupActive = (group: NavGroup) => {
    return group.items.some(item => isActive(item.href))
  }

  // Close mobile menu on navigation
  useEffect(() => {
    if (isMobileOpen && onMobileToggle) {
      onMobileToggle()
    }
  }, [pathname])

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-cyan-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-cyan-400"
                style={{
                  textShadow: "0 0 20px rgba(34, 211, 238, 0.6)"
                }}
              >
                Xplorium
              </motion.h1>
            )}
          </div>

          {/* Desktop collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg
                       text-cyan-400/60 hover:text-cyan-400 hover:bg-cyan-400/10
                       transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn(
                "w-5 h-5 transition-transform duration-300",
                isCollapsed && "rotate-180"
              )}
            />
          </button>

          {/* Mobile close button */}
          <button
            onClick={onMobileToggle}
            className="lg:hidden text-cyan-400/60 hover:text-cyan-400 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!isCollapsed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-cyan-100/50 mt-2"
          >
            Admin Panel
          </motion.p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Top-level items */}
        {topLevelItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-3 rounded-lg",
                "transition-all duration-300",
                "hover:bg-cyan-400/10",
                active && "bg-cyan-400/20",
                isCollapsed && "justify-center px-2"
              )}
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-lg border-2 border-cyan-400/50"
                  style={{
                    boxShadow: "0 0 20px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.1)"
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}

              {/* Icon */}
              <Icon
                className={cn(
                  "w-5 h-5 relative z-10 transition-colors",
                  active ? "text-cyan-400" : "text-cyan-100/60 group-hover:text-cyan-300"
                )}
                {...(active && {
                  style: { filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))" }
                })}
              />

              {/* Label */}
              {!isCollapsed && (
                <span
                  className={cn(
                    "relative z-10 font-medium transition-colors",
                    active ? "text-cyan-400" : "text-cyan-100/70 group-hover:text-cyan-300"
                  )}
                  style={
                    active
                      ? { textShadow: "0 0 10px rgba(34, 211, 238, 0.6)" }
                      : undefined
                  }
                >
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}

        {/* Divider */}
        {!isCollapsed && (
          <div className="my-2 border-t border-cyan-400/10" />
        )}

        {/* Grouped items */}
        {navGroups.map((group) => {
          const GroupIcon = group.icon
          const isExpanded = expandedGroups.has(group.id)
          const groupActive = isGroupActive(group)

          return (
            <div key={group.id} className="space-y-1">
              {/* Group header */}
              <button
                onClick={() => !isCollapsed && toggleGroup(group.id)}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 rounded-lg w-full",
                  "transition-all duration-300",
                  "hover:bg-cyan-400/10",
                  groupActive && "bg-cyan-400/10",
                  isCollapsed && "justify-center px-2"
                )}
              >
                {/* Icon */}
                <GroupIcon
                  className={cn(
                    "w-5 h-5 relative z-10 transition-colors",
                    groupActive ? "text-cyan-400" : "text-cyan-100/60 group-hover:text-cyan-300"
                  )}
                  {...(groupActive && {
                    style: { filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))" }
                  })}
                />

                {/* Label */}
                {!isCollapsed && (
                  <>
                    <span
                      className={cn(
                        "relative z-10 font-medium transition-colors flex-1 text-left",
                        groupActive ? "text-cyan-400" : "text-cyan-100/70 group-hover:text-cyan-300"
                      )}
                      style={
                        groupActive
                          ? { textShadow: "0 0 10px rgba(34, 211, 238, 0.6)" }
                          : undefined
                      }
                    >
                      {group.label}
                    </span>

                    {/* Expand/collapse icon */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                      className="relative z-10"
                    >
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-colors",
                          groupActive ? "text-cyan-400" : "text-cyan-100/40"
                        )}
                      />
                    </motion.div>
                  </>
                )}
              </button>

              {/* Group items */}
              {!isCollapsed && (
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 space-y-1 py-1">
                        {group.items.map((item) => {
                          const Icon = item.icon
                          const active = isActive(item.href)

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "group relative flex items-center gap-3 px-4 py-2 rounded-lg",
                                "transition-all duration-300",
                                "hover:bg-cyan-400/10",
                                active && "bg-cyan-400/20"
                              )}
                            >
                              {/* Active indicator */}
                              {active && (
                                <motion.div
                                  layoutId="activeTab"
                                  className="absolute inset-0 rounded-lg border-2 border-cyan-400/50"
                                  style={{
                                    boxShadow: "0 0 20px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.1)"
                                  }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30
                                  }}
                                />
                              )}

                              {/* Icon */}
                              <Icon
                                className={cn(
                                  "w-4 h-4 relative z-10 transition-colors",
                                  active ? "text-cyan-400" : "text-cyan-100/50 group-hover:text-cyan-300"
                                )}
                                {...(active && {
                                  style: { filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))" }
                                })}
                              />

                              {/* Label */}
                              <span
                                className={cn(
                                  "relative z-10 text-sm font-medium transition-colors",
                                  active ? "text-cyan-400" : "text-cyan-100/60 group-hover:text-cyan-300"
                                )}
                                style={
                                  active
                                    ? { textShadow: "0 0 10px rgba(34, 211, 238, 0.6)" }
                                    : undefined
                                }
                              >
                                {item.label}
                              </span>

                              {/* Badge */}
                              {item.badge !== undefined && item.badge > 0 && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="relative z-10 ml-auto px-2 py-0.5 rounded-full text-xs font-bold
                                           bg-red-500/20 text-red-400 border border-red-400/50"
                                  style={{
                                    boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)"
                                  }}
                                >
                                  {item.badge}
                                </motion.span>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-cyan-400/20">
          <p className="text-xs text-cyan-100/40 text-center">
            Xplorium Admin v1.0
          </p>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0",
          "bg-black/40 backdrop-blur-xl border-r border-cyan-400/20",
          "transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
        style={{
          boxShadow: "4px 0 24px rgba(34, 211, 238, 0.1)"
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={onMobileToggle}
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50
                         bg-black/95 backdrop-blur-xl border-r border-cyan-400/20"
              style={{
                boxShadow: "4px 0 24px rgba(34, 211, 238, 0.2)"
              }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
})

AdminSidebar.displayName = 'AdminSidebar'

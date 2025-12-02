"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, Users, FileText, Clock } from "lucide-react"
import { StatsCard } from "@/components/admin/StatsCard"
import { RecentActivity } from "@/components/admin/RecentActivity"
import { QuickActionsWidget } from "@/components/admin/QuickActionsWidget"
import { RevenueStatsCard } from "@/components/admin/RevenueStatsCard"
import { getDashboardStats, getRecentActivity } from "@/app/actions/dashboard"
import { approveBooking, rejectBooking } from "@/app/actions/bookings"
import { ChartSkeleton } from "@/components/loading/ChartSkeleton"
import { logger } from "@/lib/logger"
import { useToast } from "@/hooks/use-toast"

// Dynamic imports for heavy chart libraries (code-splitting)
const BookingsLineChart = dynamic(
  () => import("@/components/admin/charts/BookingsLineChart").then(m => ({ default: m.BookingsLineChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

const BookingsPieChart = dynamic(
  () => import("@/components/admin/charts/BookingsPieChart").then(m => ({ default: m.BookingsPieChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

const BookingsStatusChart = dynamic(
  () => import("@/components/admin/charts/BookingsStatusChart").then(m => ({ default: m.BookingsStatusChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

const PeakTimesChart = dynamic(
  () => import("@/components/admin/charts/PeakTimesChart").then(m => ({ default: m.PeakTimesChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

const PeakDaysChart = dynamic(
  () => import("@/components/admin/charts/PeakDaysChart").then(m => ({ default: m.PeakDaysChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

const BookingsHeatmap = dynamic(
  () => import("@/components/admin/charts/BookingsHeatmap").then(m => ({ default: m.BookingsHeatmap })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

/**
 * Admin Dashboard Page
 *
 * Main dashboard with statistics, charts, and recent activity
 * Features:
 * - Real-time statistics cards
 * - Bookings over time chart (Line chart)
 * - Bookings by type chart (Pie chart)
 * - Recent activity feed
 */

interface DashboardStats {
  totalBookings: number
  totalUsers: number
  upcomingEvents: number
  pendingBookings: number
  approvedBookings: number
  rejectedBookings: number
  todayBookings: number
  weekBookings: number
  monthBookings: number
  bookingsTrend: number
  monthTrend: number
  // Revenue stats
  todayRevenue: number
  yesterdayRevenue: number
  weekRevenue: number
  monthRevenue: number
  todayRevenueTrend: number
  weekRevenueTrend: number
  monthRevenueTrend: number
}

interface PendingBooking {
  id: string
  title: string
  date: Date | string
  time: string
  type: string
  user: {
    name: string | null
    email: string
  }
}

interface DashboardData {
  stats: DashboardStats
  recentBookings: any[]
  recentEvents: any[]
  pendingBookingsData: PendingBooking[]
  bookingsByType: Array<{ type: string; count: number }>
  bookingsByStatus: Array<{ status: string; count: number }>
  bookingsOverTime: Array<{ date: any; count: number }>
  peakDays: Array<{ day: string; count: number }>
  peakTimes: Array<{ time: string; count: number }>
  heatmapData: Array<{ day: string; hour: number; count: number }>
}

const COLORS = {
  CAFE: '#22d3ee', // Cyan
  SENSORY_ROOM: '#a855f7', // Purple
  PLAYGROUND: '#ec4899', // Pink
  PARTY: '#fb923c', // Orange
  EVENT: '#facc15', // Yellow
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch stats and activity in parallel
        const [statsResult, activityResult] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(10)
        ])

        if (statsResult.success) {
          setDashboardData(statsResult as DashboardData)
        }

        if (activityResult.success && activityResult.activity) {
          setActivities(activityResult.activity)
        }
      } catch (error) {
        logger.error('Failed to fetch dashboard data', error instanceof Error ? error : new Error(String(error)))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)

    return () => clearInterval(interval)
  }, [])

  // Quick action handlers
  const handleQuickApprove = async (id: string) => {
    try {
      const result = await approveBooking(id, '')

      if (result.success) {
        toast({
          title: "Booking Approved",
          description: "The booking has been approved successfully.",
          variant: "default",
        })

        // Refresh dashboard data
        const statsResult = await getDashboardStats()
        if (statsResult.success) {
          setDashboardData(statsResult as DashboardData)
        }
      } else {
        throw new Error(result.error || 'Failed to approve booking')
      }
    } catch (error) {
      logger.error('Failed to approve booking', error instanceof Error ? error : new Error(String(error)))
      toast({
        title: "Error",
        description: "Failed to approve booking. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleQuickReject = async (id: string) => {
    try {
      const result = await rejectBooking(id, 'Quick rejected from dashboard')

      if (result.success) {
        toast({
          title: "Booking Rejected",
          description: "The booking has been rejected.",
          variant: "default",
        })

        // Refresh dashboard data
        const statsResult = await getDashboardStats()
        if (statsResult.success) {
          setDashboardData(statsResult as DashboardData)
        }
      } else {
        throw new Error(result.error || 'Failed to reject booking')
      }
    } catch (error) {
      logger.error('Failed to reject booking', error instanceof Error ? error : new Error(String(error)))
      toast({
        title: "Error",
        description: "Failed to reject booking. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  const { stats } = dashboardData

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1
          className="text-3xl font-bold text-cyan-400 mb-2"
          style={{
            textShadow: "0 0 30px rgba(34, 211, 238, 0.6)"
          }}
        >
          Welcome to Admin Dashboard
        </h1>
        <p className="text-cyan-100/60">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Quick Overview - Revenue & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueStatsCard
          todayRevenue={stats.todayRevenue}
          yesterdayRevenue={stats.yesterdayRevenue}
          weekRevenue={stats.weekRevenue}
          monthRevenue={stats.monthRevenue}
          todayTrend={stats.todayRevenueTrend}
          weekTrend={stats.weekRevenueTrend}
          monthTrend={stats.monthRevenueTrend}
          currency="RSD"
        />

        <QuickActionsWidget
          pendingBookings={dashboardData.pendingBookingsData || []}
          onApprove={handleQuickApprove}
          onReject={handleQuickReject}
          isLoading={false}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Link href="/admin/bookings" className="block">
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Calendar}
            trend={stats.bookingsTrend}
            trendLabel="vs last week"
            iconColor="text-cyan-400"
            iconBgColor="bg-cyan-400/20"
            className="cursor-pointer hover:bg-black/30 transition-colors"
          />
        </Link>
        <Link href="/admin/bookings?status=PENDING" className="block">
          <StatsCard
            title="Pending Bookings"
            value={stats.pendingBookings}
            icon={Clock}
            iconColor="text-yellow-400"
            iconBgColor="bg-yellow-400/20"
            className="cursor-pointer hover:bg-black/30 transition-colors"
          />
        </Link>
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          iconColor="text-purple-400"
          iconBgColor="bg-purple-400/20"
        />
        <StatsCard
          title="Total Events"
          value={stats.upcomingEvents}
          icon={FileText}
          iconColor="text-pink-400"
          iconBgColor="bg-pink-400/20"
        />
      </div>

      {/* Additional Stats - This Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="This Month"
          value={stats.monthBookings}
          icon={Calendar}
          trend={stats.monthTrend}
          trendLabel="vs last month"
          iconColor="text-emerald-400"
          iconBgColor="bg-emerald-400/20"
        />
        <StatsCard
          title="This Week"
          value={stats.weekBookings}
          icon={Calendar}
          iconColor="text-blue-400"
          iconBgColor="bg-blue-400/20"
        />
        <Link href="/admin/bookings?status=APPROVED" className="block">
          <StatsCard
            title="Approved"
            value={stats.approvedBookings}
            icon={Calendar}
            iconColor="text-green-400"
            iconBgColor="bg-green-400/20"
            className="cursor-pointer hover:bg-black/30 transition-colors"
          />
        </Link>
        <Link href="/admin/bookings?status=REJECTED" className="block">
          <StatsCard
            title="Rejected"
            value={stats.rejectedBookings}
            icon={Calendar}
            iconColor="text-red-400"
            iconBgColor="bg-red-400/20"
            className="cursor-pointer hover:bg-black/30 transition-colors"
          />
        </Link>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings over time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
          style={{
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
          }}
        >
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">
            Bookings Over Time (Last 30 Days)
          </h3>
          <BookingsLineChart data={dashboardData.bookingsOverTime || []} />
        </motion.div>

        {/* Bookings by type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
          style={{
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
          }}
        >
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">
            Bookings by Type
          </h3>
          <BookingsPieChart
            data={dashboardData.bookingsByType || []}
            colors={COLORS}
          />
        </motion.div>
      </div>

      {/* Analytics section - Status & Peak Times */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-purple-400/20"
          style={{
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
          }}
        >
          <h3 className="text-lg font-semibold text-purple-300 mb-4">
            Booking Status Breakdown
          </h3>
          <BookingsStatusChart data={dashboardData.bookingsByStatus || []} />
        </motion.div>

        {/* Peak Booking Times */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-pink-400/20"
          style={{
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
          }}
        >
          <h3 className="text-lg font-semibold text-pink-300 mb-4">
            Peak Booking Times
          </h3>
          <PeakTimesChart data={dashboardData.peakTimes || []} />
        </motion.div>

        {/* Peak Booking Days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-yellow-400/20"
          style={{
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
          }}
        >
          <h3 className="text-lg font-semibold text-yellow-300 mb-4">
            Peak Booking Days
          </h3>
          <PeakDaysChart data={dashboardData.peakDays || []} />
        </motion.div>
      </div>

      {/* Bookings Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-emerald-400/20"
        style={{
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
        }}
      >
        <h3 className="text-lg font-semibold text-emerald-300 mb-4">
          Booking Density Heatmap
        </h3>
        <p className="text-sm text-emerald-100/60 mb-6">
          Visualize booking patterns by day of week and time of day (This Month)
        </p>
        <BookingsHeatmap data={dashboardData.heatmapData || []} />
      </motion.div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
        style={{
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
        }}
      >
        <h3 className="text-lg font-semibold text-cyan-300 mb-6">
          Recent Activity
        </h3>
        <RecentActivity activities={activities} limit={8} />
      </motion.div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, Users, FileText, Clock } from "lucide-react"
import { StatsCard } from "@/components/admin/StatsCard"
import { RecentActivity } from "@/components/admin/RecentActivity"
import { getDashboardStats, getRecentActivity } from "@/app/actions/dashboard"
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
  todayBookings: number
  weekBookings: number
  monthBookings: number
  bookingsTrend: number
}

interface DashboardData {
  stats: DashboardStats
  recentBookings: any[]
  recentEvents: any[]
  bookingsByType: Array<{ type: string; count: number }>
  bookingsOverTime: Array<{ date: any; count: number }>
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
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)

    return () => clearInterval(interval)
  }, [])

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
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.bookingsOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
              <XAxis
                dataKey="date"
                stroke="rgba(34, 211, 238, 0.6)"
                tick={{ fill: 'rgba(34, 211, 238, 0.6)', fontSize: 12 }}
              />
              <YAxis
                stroke="rgba(34, 211, 238, 0.6)"
                tick={{ fill: 'rgba(34, 211, 238, 0.6)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  borderRadius: '8px',
                  color: '#22d3ee'
                }}
              />
              <Legend
                wrapperStyle={{ color: 'rgba(34, 211, 238, 0.8)' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={{ fill: '#22d3ee', r: 4 }}
                activeDot={{ r: 6, fill: '#22d3ee' }}
                name="Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
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
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.bookingsByType || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {(dashboardData.bookingsByType || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.type as keyof typeof COLORS] || '#22d3ee'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  borderRadius: '8px',
                  color: '#22d3ee'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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

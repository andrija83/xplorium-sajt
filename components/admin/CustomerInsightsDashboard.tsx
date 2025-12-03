'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserCheck,
  UserX,
  Award,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatsCard } from './StatsCard'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/**
 * Customer Insights Dashboard Component
 *
 * Comprehensive customer analytics dashboard featuring:
 * - Customer Lifetime Value (CLV)
 * - Repeat customer rate
 * - Customer segmentation (VIP, Regular, First-time)
 * - Churn analysis
 * - Top customers by revenue and bookings
 * - Birthday reminders for marketing
 * - Monthly trends
 */

interface CustomerInsights {
  // Overview metrics
  totalCustomers: number
  activeCustomers: number
  repeatCustomers: number
  repeatCustomerRate: number
  churnRate: number
  churnedCustomers: number

  // Financial metrics
  averageCustomerLifetimeValue: number
  averageBookingValue: number
  totalRevenue: number

  // Segmentation
  segmentation: {
    vip: number
    regular: number
    firstTime: number
  }

  // Top customers
  topCustomersByRevenue: Array<{
    email: string
    revenue: number
    bookings: number
  }>
  topCustomersByBookings: Array<{
    email: string
    bookings: number
    revenue: number
  }>

  // Birthday reminders
  upcomingBirthdays: Array<{
    id: string
    name: string | null
    email: string
    birthday: Date | null
    totalBookings: number
    loyaltyTier: string
  }>

  // Trends
  monthlyTrends: Array<{
    month: string
    revenue: number
    customers: number
    bookings: number
  }>
}

interface CustomerInsightsDashboardProps {
  insights: CustomerInsights
}

const COLORS = {
  vip: '#a855f7', // Purple
  regular: '#22d3ee', // Cyan
  firstTime: '#ec4899', // Pink
  cyan: '#22d3ee',
  purple: '#a855f7',
  emerald: '#34d399',
  amber: '#fbbf24',
}

export const CustomerInsightsDashboard = memo(function CustomerInsightsDashboard({
  insights,
}: CustomerInsightsDashboardProps) {
  // Prepare segmentation data for pie chart
  const segmentationData = useMemo(
    () => [
      { name: 'VIP (5+ bookings)', value: insights.segmentation.vip, color: COLORS.vip },
      {
        name: 'Regular (2-4 bookings)',
        value: insights.segmentation.regular,
        color: COLORS.regular,
      },
      {
        name: 'First-time (1 booking)',
        value: insights.segmentation.firstTime,
        color: COLORS.firstTime,
      },
    ],
    [insights.segmentation]
  )

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-US')} RSD`
  }

  // Format email for display (truncate if too long)
  const formatEmail = (email: string) => {
    return email.length > 25 ? `${email.substring(0, 22)}...` : email
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-cyan-400 mb-2"
          style={{
            textShadow: '0 0 30px rgba(34, 211, 238, 0.6)',
          }}
        >
          Customer Insights
        </h2>
        <p className="text-cyan-100/60">
          Comprehensive analytics and segmentation of your customer base
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Customers"
          value={insights.totalCustomers}
          icon={Users}
          iconColor="text-cyan-400"
          iconBgColor="bg-cyan-400/20"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-emerald-400/20 hover:border-emerald-400/40 transition-all"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100/60 mb-1">Active Customers</p>
              <p className="text-3xl font-bold text-emerald-300">{insights.activeCustomers}</p>
              <p className="text-xs text-emerald-100/50 mt-1">Last 90 days</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-400/20">
              <UserCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </motion.div>

        <StatsCard
          title="Repeat Customers"
          value={insights.repeatCustomers}
          trend={insights.repeatCustomerRate}
          trendLabel={`${insights.repeatCustomerRate}% repeat rate`}
          icon={Award}
          iconColor="text-purple-400"
          iconBgColor="bg-purple-400/20"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-amber-400/20 hover:border-amber-400/40 transition-all"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-100/60 mb-1">Churn Rate</p>
              <p className="text-3xl font-bold text-amber-300">{insights.churnRate}%</p>
              <p className="text-xs text-amber-100/50 mt-1">{insights.churnedCustomers} churned</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-400/20">
              <UserX className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-emerald-400/20"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-emerald-300">
              Avg. Customer Lifetime Value
            </h3>
            <DollarSign className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400">
            {formatCurrency(insights.averageCustomerLifetimeValue)}
          </p>
          <p className="text-sm text-emerald-100/50 mt-2">
            Total revenue per customer
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cyan-300">Avg. Booking Value</h3>
            <BarChart3 className="w-8 h-8 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-cyan-400">
            {formatCurrency(insights.averageBookingValue)}
          </p>
          <p className="text-sm text-cyan-100/50 mt-2">
            Revenue per booking
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-purple-400/20"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-300">Total Revenue</h3>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-400">
            {formatCurrency(insights.totalRevenue)}
          </p>
          <p className="text-sm text-purple-100/50 mt-2">
            All-time from customers
          </p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segmentation Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-purple-400/20"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
        >
          <h3 className="text-lg font-semibold text-purple-300 mb-4">
            Customer Segmentation
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={segmentationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {segmentationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {insights.segmentation.vip}
              </div>
              <div className="text-purple-100/50">VIP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {insights.segmentation.regular}
              </div>
              <div className="text-cyan-100/50">Regular</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">
                {insights.segmentation.firstTime}
              </div>
              <div className="text-pink-100/50">First-time</div>
            </div>
          </div>
        </motion.div>

        {/* Monthly Trends Line Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
        >
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">
            Monthly Customer Trends (Last 12 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={insights.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
              <XAxis
                dataKey="month"
                stroke="#22d3ee"
                tick={{ fill: 'rgba(34, 211, 238, 0.6)' }}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#22d3ee"
                tick={{ fill: 'rgba(34, 211, 238, 0.6)' }}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="customers"
                stroke={COLORS.cyan}
                strokeWidth={2}
                name="Unique Customers"
                dot={{ fill: COLORS.cyan, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke={COLORS.purple}
                strokeWidth={2}
                name="Total Bookings"
                dot={{ fill: COLORS.purple, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Customers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers by Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-emerald-400/20"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
        >
          <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Top 10 Customers by Revenue
          </h3>
          <div className="space-y-2">
            {insights.topCustomersByRevenue.map((customer, index) => (
              <motion.div
                key={customer.email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-emerald-400/5 border border-emerald-400/10 hover:bg-emerald-400/10 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-emerald-400 font-bold text-sm w-6">
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-emerald-100 truncate" title={customer.email}>
                      {formatEmail(customer.email)}
                    </p>
                    <p className="text-xs text-emerald-100/50">
                      {customer.bookings} bookings
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-emerald-400 whitespace-nowrap ml-2">
                  {formatCurrency(customer.revenue)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Customers by Booking Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
        >
          <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top 10 Customers by Bookings
          </h3>
          <div className="space-y-2">
            {insights.topCustomersByBookings.map((customer, index) => (
              <motion.div
                key={customer.email}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/10 hover:bg-cyan-400/10 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-cyan-400 font-bold text-sm w-6">
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-cyan-100 truncate" title={customer.email}>
                      {formatEmail(customer.email)}
                    </p>
                    <p className="text-xs text-cyan-100/50">
                      {formatCurrency(customer.revenue)} revenue
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-cyan-400 whitespace-nowrap ml-2">
                  {customer.bookings} bookings
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Birthday Reminders */}
      {insights.upcomingBirthdays.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-pink-400/20"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
        >
          <h3 className="text-lg font-semibold text-pink-300 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Birthdays (Next 30 Days) - Marketing Opportunity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.upcomingBirthdays.map((customer, index) => {
              const bday = customer.birthday ? new Date(customer.birthday) : null
              const daysUntil = bday
                ? Math.ceil(
                    (new Date(
                      new Date().getFullYear(),
                      bday.getMonth(),
                      bday.getDate()
                    ).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0

              return (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'p-4 rounded-lg border',
                    'bg-pink-400/5 border-pink-400/20 hover:bg-pink-400/10',
                    'transition-colors'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-pink-100">
                        {customer.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-pink-100/50 truncate">
                        {formatEmail(customer.email)}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-pink-400/20 text-pink-300">
                      {daysUntil}d
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-pink-100/60">
                    <span>{customer.loyaltyTier}</span>
                    <span>{customer.totalBookings} bookings</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
          <p className="text-sm text-pink-100/50 mt-4">
            💡 Tip: Send personalized birthday offers to increase engagement and loyalty!
          </p>
        </motion.div>
      )}
    </div>
  )
})

CustomerInsightsDashboard.displayName = 'CustomerInsightsDashboard'

'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Users } from 'lucide-react'
import { StatsCard } from '@/components/admin/StatsCard'
import { ChartSkeleton } from '@/components/loading/ChartSkeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getRevenueStats,
  getRevenueByType,
  getRevenueOverTime,
  getPaymentStats,
  getTopCustomers,
  exportRevenueData,
  type RevenueStats,
  type RevenueByType,
  type RevenueOverTime,
  type PaymentStats
} from '@/app/actions/revenue'
import { subMonths, subDays, format } from 'date-fns'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

// Dynamic imports for charts
const RevenueLineChart = dynamic(
  () => import('@/components/admin/charts/RevenueLineChart').then(m => ({ default: m.RevenueLineChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
)

const RevenueByTypeChart = dynamic(
  () => import('@/components/admin/charts/RevenueByTypeChart').then(m => ({ default: m.RevenueByTypeChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
)

const PaymentStatusChart = dynamic(
  () => import('@/components/admin/charts/PaymentStatusChart').then(m => ({ default: m.PaymentStatusChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
)

/**
 * Revenue & Financial Dashboard
 *
 * Comprehensive financial analytics and reporting
 * - Revenue statistics and trends
 * - Revenue by booking type
 * - Payment status tracking
 * - Top customers
 * - Export capabilities
 */

interface DashboardData {
  stats: RevenueStats | null
  revenueByType: RevenueByType[]
  revenueOverTime: RevenueOverTime[]
  paymentStats: PaymentStats | null
  topCustomers: any[]
}

type DateRange = '7days' | '30days' | '3months' | '6months' | '1year'

export default function RevenuePage() {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    revenueByType: [],
    revenueOverTime: [],
    paymentStats: null,
    topCustomers: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>('30days')
  const [isExporting, setIsExporting] = useState(false)

  // Get date range based on selection
  const getDateRange = (range: DateRange): { start: Date; end: Date } => {
    const end = new Date()
    let start: Date

    switch (range) {
      case '7days':
        start = subDays(end, 7)
        break
      case '30days':
        start = subDays(end, 30)
        break
      case '3months':
        start = subMonths(end, 3)
        break
      case '6months':
        start = subMonths(end, 6)
        break
      case '1year':
        start = subMonths(end, 12)
        break
      default:
        start = subDays(end, 30)
    }

    return { start, end }
  }

  // Fetch all revenue data
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const { start, end } = getDateRange(dateRange)

      const [statsRes, byTypeRes, overTimeRes, paymentRes, customersRes] = await Promise.all([
        getRevenueStats(start, end),
        getRevenueByType(start, end),
        getRevenueOverTime(start, end, dateRange === '7days' ? 'day' : dateRange === '1year' ? 'month' : 'day'),
        getPaymentStats(start, end),
        getTopCustomers(10, start, end)
      ])

      setData({
        stats: statsRes.success ? statsRes.stats || null : null,
        revenueByType: byTypeRes.success ? byTypeRes.revenueByType || [] : [],
        revenueOverTime: overTimeRes.success ? overTimeRes.revenueOverTime || [] : [],
        paymentStats: paymentRes.success ? paymentRes.stats || null : null,
        topCustomers: customersRes.success ? customersRes.customers || [] : []
      })
    } catch (error) {
      logger.error('Failed to fetch revenue data', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to load revenue data')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle export
  const handleExport = async () => {
    try {
      setIsExporting(true)
      const { start, end } = getDateRange(dateRange)

      const result = await exportRevenueData(start, end)

      if (result.success && result.csv && result.filename) {
        // Create download link
        const blob = new Blob([result.csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename
        a.click()
        window.URL.revokeObjectURL(url)

        toast.success('Revenue data exported successfully')
      } else {
        toast.error(result.error || 'Failed to export data')
      }
    } catch (error) {
      logger.error('Failed to export revenue data', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange])

  if (isLoading) {
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

  const { stats, revenueByType, revenueOverTime, paymentStats, topCustomers } = data
  const currency = stats?.currency || 'RSD'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">
            Revenue & Financial Dashboard
          </h1>
          <p className="text-sm text-cyan-100/60 mt-1">
            Track your revenue, payments, and financial performance
          </p>
        </div>

        <div className="flex gap-3">
          {/* Date Range Selector */}
          <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
            <SelectTrigger className="w-40 bg-black/40 border-cyan-400/30 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outline"
            className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Revenue"
          value={`${(stats?.totalRevenue || 0).toLocaleString()} ${currency}`}
          icon={DollarSign}
          trend={stats?.monthGrowth}
          trendLabel="vs last month"
          iconColor="text-green-400"
          iconBgColor="bg-green-400/20"
        />
        <StatsCard
          title="Paid Revenue"
          value={`${(stats?.paidRevenue || 0).toLocaleString()} ${currency}`}
          icon={DollarSign}
          iconColor="text-emerald-400"
          iconBgColor="bg-emerald-400/20"
        />
        <StatsCard
          title="Pending Revenue"
          value={`${(stats?.pendingRevenue || 0).toLocaleString()} ${currency}`}
          icon={DollarSign}
          iconColor="text-yellow-400"
          iconBgColor="bg-yellow-400/20"
        />
        <StatsCard
          title="Avg Booking Value"
          value={`${(stats?.averageBookingValue || 0).toLocaleString()} ${currency}`}
          icon={TrendingUp}
          iconColor="text-cyan-400"
          iconBgColor="bg-cyan-400/20"
        />
      </div>

      {/* Stats Cards - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={Calendar}
          iconColor="text-purple-400"
          iconBgColor="bg-purple-400/20"
        />
        <StatsCard
          title="Paid Bookings"
          value={stats?.paidBookings || 0}
          icon={Calendar}
          iconColor="text-green-400"
          iconBgColor="bg-green-400/20"
        />
        <StatsCard
          title="Pending Payments"
          value={stats?.pendingBookings || 0}
          icon={Calendar}
          iconColor="text-orange-400"
          iconBgColor="bg-orange-400/20"
        />
        <StatsCard
          title="This Month"
          value={`${(stats?.thisMonth || 0).toLocaleString()} ${currency}`}
          icon={stats && stats.monthGrowth >= 0 ? TrendingUp : TrendingDown}
          iconColor={stats && stats.monthGrowth >= 0 ? "text-green-400" : "text-red-400"}
          iconBgColor={stats && stats.monthGrowth >= 0 ? "bg-green-400/20" : "bg-red-400/20"}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
        >
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">
            Revenue Over Time
          </h3>
          <RevenueLineChart data={revenueOverTime} currency={currency} />
        </motion.div>

        {/* Revenue by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
        >
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">
            Revenue by Booking Type
          </h3>
          <RevenueByTypeChart data={revenueByType} currency={currency} />
        </motion.div>
      </div>

      {/* Payment Status & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-purple-400/20"
        >
          <h3 className="text-lg font-semibold text-purple-300 mb-4">
            Payment Status
          </h3>
          {paymentStats && <PaymentStatusChart data={paymentStats} currency={currency} />}
        </motion.div>

        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-pink-400/20"
        >
          <h3 className="text-lg font-semibold text-pink-300 mb-4">
            Top Customers by Revenue
          </h3>
          <div className="space-y-3">
            {topCustomers.length > 0 ? (
              topCustomers.map((customer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-pink-400/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-400/20 flex items-center justify-center text-pink-400 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-cyan-300">
                        {customer.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-cyan-100/50">
                        {customer.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-400">
                      {customer.revenue.toLocaleString()} {currency}
                    </div>
                    <div className="text-xs text-cyan-100/50">
                      {customer.bookings} bookings
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-cyan-100/50 py-8">
                No customer data available
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

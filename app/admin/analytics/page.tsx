'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertTriangle, Package, XCircle, Clock, Calendar as CalendarIcon } from 'lucide-react'
import { StatsCard } from '@/components/admin/StatsCard'
import {
  getPopularServices,
  getCancellationMetrics,
  getTimeToApprovalMetrics,
  type PopularService,
  type CancellationMetrics,
  type TimeToApprovalMetrics
} from '@/app/actions/revenue'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { subMonths } from 'date-fns'

// Regular imports (page is already lazy-loaded via Next.js route-based code splitting)
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

/**
 * Advanced Analytics Dashboard
 *
 * Features:
 * - Most popular services/packages
 * - Cancellation rate tracking
 * - Service performance metrics
 * - Trend analysis
 */

const COLORS = {
  BIRTHDAY: '#ec4899', // Pink
  PLAYROOM: '#22d3ee', // Cyan
  EVENT: '#a855f7',    // Purple
  cancelled: '#ef4444', // Red
  total: '#22d3ee'     // Cyan
}

export default function AnalyticsPage() {
  const [popularServices, setPopularServices] = useState<PopularService[]>([])
  const [cancellationMetrics, setCancellationMetrics] = useState<CancellationMetrics | null>(null)
  const [approvalMetrics, setApprovalMetrics] = useState<TimeToApprovalMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    try {
      setIsLoading(true)

      const [servicesRes, cancellationRes, approvalRes] = await Promise.all([
        getPopularServices(subMonths(new Date(), 3), new Date()),
        getCancellationMetrics(subMonths(new Date(), 6), new Date()),
        getTimeToApprovalMetrics(subMonths(new Date(), 3), new Date())
      ])

      if (servicesRes.success && servicesRes.services) {
        setPopularServices(servicesRes.services)
      } else {
        toast.error('Failed to load popular services')
      }

      if (cancellationRes.success && cancellationRes.metrics) {
        setCancellationMetrics(cancellationRes.metrics)
      } else {
        toast.error('Failed to load cancellation metrics')
      }

      if (approvalRes.success && approvalRes.metrics) {
        setApprovalMetrics(approvalRes.metrics)
      } else {
        toast.error('Failed to load approval metrics')
      }
    } catch (error) {
      logger.error('Failed to fetch analytics data', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  // Format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cyan-400"
          style={{
            textShadow: '0 0 30px rgba(34, 211, 238, 0.6)',
          }}
        >
          Advanced Analytics
        </h1>
        <p className="text-sm text-cyan-100/60 mt-1">
          Deep insights into service performance, trends, and customer behavior
        </p>
      </div>

      {/* Time-to-Approval Metrics */}
      {approvalMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Avg Approval Time"
            value={`${approvalMetrics.averageHours.toFixed(1)}h`}
            icon={Clock}
            iconColor="text-cyan-400"
            iconBgColor="bg-cyan-400/20"
          />
          <StatsCard
            title="Within 24 Hours"
            value={approvalMetrics.within24Hours}
            trend={(approvalMetrics.within24Hours / approvalMetrics.totalMeasured) * 100}
            trendLabel={`${((approvalMetrics.within24Hours / approvalMetrics.totalMeasured) * 100).toFixed(0)}% of total`}
            icon={TrendingUp}
            iconColor="text-green-400"
            iconBgColor="bg-green-400/20"
          />
          <StatsCard
            title="Fastest Approval"
            value={`${approvalMetrics.fastest.toFixed(1)}h`}
            icon={TrendingUp}
            iconColor="text-emerald-400"
            iconBgColor="bg-emerald-400/20"
          />
          <StatsCard
            title="Slowest Approval"
            value={`${approvalMetrics.slowest.toFixed(1)}h`}
            icon={Clock}
            iconColor="text-orange-400"
            iconBgColor="bg-orange-400/20"
          />
        </div>
      )}

      {/* Cancellation Metrics Overview */}
      {cancellationMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Cancellation Rate"
            value={`${cancellationMetrics.cancellationRate.toFixed(1)}%`}
            icon={cancellationMetrics.cancellationRate > 15 ? AlertTriangle : XCircle}
            iconColor={cancellationMetrics.cancellationRate > 15 ? 'text-red-400' : 'text-orange-400'}
            iconBgColor={cancellationMetrics.cancellationRate > 15 ? 'bg-red-400/20' : 'bg-orange-400/20'}
          />
          <StatsCard
            title="Total Cancelled"
            value={cancellationMetrics.totalCancelled}
            icon={XCircle}
            iconColor="text-red-400"
            iconBgColor="bg-red-400/20"
          />
          <StatsCard
            title="Lost Revenue"
            value={`${cancellationMetrics.cancelledRevenue.toLocaleString()} RSD`}
            icon={TrendingDown}
            iconColor="text-orange-400"
            iconBgColor="bg-orange-400/20"
          />
        </div>
      )}

      {/* Charts Row 1: Popular Services & Cancellation Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Popular Services */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
        >
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">
            Most Popular Services (Last 3 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularServices}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
              <XAxis
                dataKey="type"
                stroke="#22d3ee"
                tick={{ fill: 'rgba(34, 211, 238, 0.6)', fontSize: 11 }}
              />
              <YAxis
                stroke="#22d3ee"
                tick={{ fill: 'rgba(34, 211, 238, 0.6)', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="bookings" fill="#22d3ee" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>

          {/* Service Details */}
          <div className="mt-4 space-y-2">
            {popularServices.map((service, index) => (
              <div
                key={service.type}
                className="flex items-center justify-between p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cyan-100">{service.type}</p>
                    <p className="text-xs text-cyan-100/50">
                      {service.percentage.toFixed(1)}% of total bookings
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-cyan-400">{service.bookings} bookings</p>
                  <p className="text-xs text-cyan-100/50">
                    {service.revenue.toLocaleString()} RSD
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cancellation Trend */}
        {cancellationMetrics && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-orange-400/20"
            style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
          >
            <h3 className="text-lg font-semibold text-orange-300 mb-4">
              Cancellation Trend (Last 6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cancellationMetrics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(249, 115, 22, 0.1)" />
                <XAxis
                  dataKey="month"
                  stroke="#fb923c"
                  tick={{ fill: 'rgba(249, 115, 22, 0.6)', fontSize: 11 }}
                  tickFormatter={formatMonth}
                />
                <YAxis
                  stroke="#fb923c"
                  tick={{ fill: 'rgba(249, 115, 22, 0.6)', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    borderRadius: '8px'
                  }}
                  labelFormatter={formatMonth}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Cancellation Rate (%)"
                  dot={{ fill: '#ef4444', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Cancelled by Type */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-orange-300 mb-2">Cancelled by Type</h4>
              <div className="space-y-2">
                {cancellationMetrics.cancelledByType.map(item => (
                  <div
                    key={item.type}
                    className="flex items-center justify-between p-2 rounded bg-orange-400/5 border border-orange-400/10"
                  >
                    <span className="text-sm text-orange-100">{item.type}</span>
                    <span className="text-sm font-semibold text-orange-400">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Service Performance Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-purple-400/20"
        style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
      >
        <h3 className="text-lg font-semibold text-purple-300 mb-4">
          Service Performance Comparison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {popularServices.map(service => {
            const serviceColor = COLORS[service.type as keyof typeof COLORS] || '#22d3ee'
            return (
              <div
                key={service.type}
                className="p-4 rounded-lg border"
                style={{
                  borderColor: `${serviceColor}33`,
                  backgroundColor: `${serviceColor}0D`
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold" style={{ color: serviceColor }}>
                    {service.type}
                  </h4>
                  <Package className="w-5 h-5" style={{ color: serviceColor }} />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-cyan-100/60">Bookings:</span>
                    <span className="font-semibold text-cyan-100">{service.bookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-100/60">Revenue:</span>
                    <span className="font-semibold text-cyan-100">
                      {service.revenue.toLocaleString()} RSD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-100/60">Avg Value:</span>
                    <span className="font-semibold text-cyan-100">
                      {service.averageValue.toLocaleString()} RSD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-100/60">Market Share:</span>
                    <span className="font-semibold" style={{ color: serviceColor }}>
                      {service.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Time-to-Approval by Type */}
      {approvalMetrics && approvalMetrics.byType.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
        >
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">
            Approval Time by Booking Type
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {approvalMetrics.byType.map(item => (
              <div
                key={item.type}
                className="p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/10"
              >
                <div className="text-sm text-cyan-100/60 mb-1">{item.type}</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {item.averageHours.toFixed(1)}h
                </div>
                <div className="text-xs text-cyan-100/50 mt-1">Average approval time</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded bg-cyan-400/5 border border-cyan-400/10">
            <div className="text-sm text-cyan-100/80">
              <strong>Median:</strong> {approvalMetrics.medianHours.toFixed(1)}h
              {' | '}
              <strong>Within 48h:</strong> {approvalMetrics.within48Hours}/{approvalMetrics.totalMeasured}
              ({((approvalMetrics.within48Hours / approvalMetrics.totalMeasured) * 100).toFixed(0)}%)
            </div>
          </div>
        </motion.div>
      )}

      {/* Insights & Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-green-400/20"
        style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
      >
        <h3 className="text-lg font-semibold text-green-300 mb-4">
          💡 Insights & Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top Service Insight */}
          {popularServices.length > 0 && (
            <div className="p-4 rounded-lg bg-green-400/5 border border-green-400/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-300 mb-1">Top Performer</h4>
                  <p className="text-sm text-green-100/80">
                    <span className="font-semibold">{popularServices[0].type}</span> is your most popular service
                    with {popularServices[0].bookings} bookings ({popularServices[0].percentage.toFixed(1)}% of total).
                    Consider promoting similar offerings!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Insight */}
          {cancellationMetrics && (
            <div className={`p-4 rounded-lg border ${
              cancellationMetrics.cancellationRate > 15
                ? 'bg-red-400/5 border-red-400/20'
                : 'bg-yellow-400/5 border-yellow-400/20'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                  cancellationMetrics.cancellationRate > 15 ? 'text-red-400' : 'text-yellow-400'
                }`} />
                <div>
                  <h4 className={`font-semibold mb-1 ${
                    cancellationMetrics.cancellationRate > 15 ? 'text-red-300' : 'text-yellow-300'
                  }`}>
                    {cancellationMetrics.cancellationRate > 15 ? 'High Cancellation Alert' : 'Cancellation Monitor'}
                  </h4>
                  <p className={`text-sm ${
                    cancellationMetrics.cancellationRate > 15 ? 'text-red-100/80' : 'text-yellow-100/80'
                  }`}>
                    Your cancellation rate is {cancellationMetrics.cancellationRate.toFixed(1)}%.
                    {cancellationMetrics.cancellationRate > 15
                      ? ' Consider reviewing booking policies or implementing reminders.'
                      : ' This is within normal range. Keep monitoring trends.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Approval Time Insight */}
          {approvalMetrics && (
            <div className={`p-4 rounded-lg border ${
              approvalMetrics.averageHours <= 24
                ? 'bg-green-400/5 border-green-400/20'
                : 'bg-yellow-400/5 border-yellow-400/20'
            }`}>
              <div className="flex items-start gap-3">
                <Clock className={`w-5 h-5 mt-0.5 ${
                  approvalMetrics.averageHours <= 24 ? 'text-green-400' : 'text-yellow-400'
                }`} />
                <div>
                  <h4 className={`font-semibold mb-1 ${
                    approvalMetrics.averageHours <= 24 ? 'text-green-300' : 'text-yellow-300'
                  }`}>
                    {approvalMetrics.averageHours <= 24 ? 'Fast Response Time' : 'Approval Time Monitor'}
                  </h4>
                  <p className={`text-sm ${
                    approvalMetrics.averageHours <= 24 ? 'text-green-100/80' : 'text-yellow-100/80'
                  }`}>
                    Your average approval time is {approvalMetrics.averageHours.toFixed(1)} hours.
                    {approvalMetrics.averageHours <= 24
                      ? ' Great job! Fast approvals improve customer satisfaction.'
                      : ' Consider streamlining your approval process for better customer experience.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

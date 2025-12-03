'use client'

import { memo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

/**
 * Revenue Forecast Chart Component
 *
 * Displays historical revenue data with forecasted values for the next 3 months
 * Uses linear regression for prediction and shows confidence level
 */

interface ForecastDataPoint {
  month: string
  revenue?: number
  forecast?: number
  isForecast?: boolean
}

interface RevenueForecastChartProps {
  historicalData: Array<{ month: string; revenue: number }>
  forecast: Array<{ month: string; forecastedRevenue: number; confidence: 'high' | 'medium' | 'low' }>
  currency: string
  rSquared?: number
}

const ConfidenceIndicator = ({ confidence }: { confidence: 'high' | 'medium' | 'low' }) => {
  const config = {
    high: {
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      label: 'High Confidence'
    },
    medium: {
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20',
      label: 'Medium Confidence'
    },
    low: {
      icon: AlertTriangle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/20',
      label: 'Low Confidence'
    }
  }

  const { icon: Icon, color, bgColor, label } = config[confidence]

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${bgColor}`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-sm font-medium ${color}`}>{label}</span>
    </div>
  )
}

export const RevenueForecastChart = memo(function RevenueForecastChart({
  historicalData,
  forecast,
  currency,
  rSquared
}: RevenueForecastChartProps) {
  // Combine historical and forecast data
  const chartData: ForecastDataPoint[] = [
    ...historicalData.map(d => ({
      month: d.month,
      revenue: d.revenue,
      isForecast: false
    })),
    ...forecast.map(f => ({
      month: f.month,
      forecast: f.forecastedRevenue,
      isForecast: true
    }))
  ]

  // Format month for display (e.g., "2024-01" -> "Jan '24")
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(date)
  }

  const confidence = forecast[0]?.confidence || 'medium'

  return (
    <div className="space-y-4">
      {/* Confidence Indicator */}
      <div className="flex items-center justify-between">
        <ConfidenceIndicator confidence={confidence} />
        {rSquared !== undefined && (
          <div className="text-sm text-cyan-100/60">
            R² = {rSquared.toFixed(3)} (model fit)
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
          <XAxis
            dataKey="month"
            stroke="#22d3ee"
            tick={{ fill: 'rgba(34, 211, 238, 0.6)', fontSize: 11 }}
            tickFormatter={formatMonth}
          />
          <YAxis
            stroke="#22d3ee"
            tick={{ fill: 'rgba(34, 211, 238, 0.6)', fontSize: 11 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(34, 211, 238, 0.3)',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`${value.toLocaleString()} ${currency}`, '']}
            labelFormatter={formatMonth}
          />
          <Legend />

          {/* Historical Data Line */}
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#22d3ee"
            strokeWidth={2}
            name="Actual Revenue"
            dot={{ fill: '#22d3ee', r: 4 }}
            connectNulls={false}
          />

          {/* Forecast Line */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#a855f7"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Forecasted Revenue"
            dot={{ fill: '#a855f7', r: 4 }}
            connectNulls={false}
          />

          {/* Reference line to separate historical from forecast */}
          <ReferenceLine
            x={historicalData[historicalData.length - 1]?.month}
            stroke="rgba(168, 85, 247, 0.5)"
            strokeDasharray="3 3"
            label={{
              value: 'Forecast',
              position: 'top',
              fill: '#a855f7',
              fontSize: 12
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Forecast Summary */}
      <div className="grid grid-cols-3 gap-3">
        {forecast.map((f, index) => (
          <div
            key={f.month}
            className="p-3 rounded-lg bg-purple-400/5 border border-purple-400/20"
          >
            <div className="text-xs text-purple-100/50 mb-1">
              {formatMonth(f.month)}
            </div>
            <div className="text-lg font-bold text-purple-400">
              {f.forecastedRevenue.toLocaleString()} {currency}
            </div>
          </div>
        ))}
      </div>

      {/* Info Note */}
      <p className="text-xs text-cyan-100/50">
        💡 Forecast based on linear regression analysis of last 12 months. Confidence level indicates model reliability.
      </p>
    </div>
  )
})

RevenueForecastChart.displayName = 'RevenueForecastChart'

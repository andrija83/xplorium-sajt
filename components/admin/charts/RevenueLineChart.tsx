'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface RevenueLineChartProps {
  data: Array<{
    date: string
    revenue: number
    bookings: number
  }>
  currency?: string
}

export const RevenueLineChart = ({ data, currency = 'RSD' }: RevenueLineChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-cyan-100/50">
        No revenue data available
      </div>
    )
  }

  // Format data for chart
  const chartData = data.map(item => ({
    ...item,
    name: item.date
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#22d3ee20" />
        <XAxis
          dataKey="name"
          stroke="#22d3ee"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#22d3ee"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid #22d3ee',
            borderRadius: '8px',
            color: '#fff'
          }}
          formatter={(value: number, name: string) => {
            if (name === 'revenue') {
              return [`${value.toLocaleString()} ${currency}`, 'Revenue']
            }
            return [value, 'Bookings']
          }}
        />
        <Legend
          wrapperStyle={{ color: '#22d3ee' }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#22d3ee"
          strokeWidth={3}
          dot={{ fill: '#22d3ee', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="bookings"
          stroke="#a855f7"
          strokeWidth={2}
          dot={{ fill: '#a855f7', r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

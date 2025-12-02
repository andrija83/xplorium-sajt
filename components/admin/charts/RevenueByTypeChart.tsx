'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface RevenueByTypeChartProps {
  data: Array<{
    type: string
    revenue: number
    bookings: number
    averageValue: number
  }>
  currency?: string
}

const TYPE_COLORS: Record<string, string> = {
  CAFE: '#22d3ee',
  SENSORY_ROOM: '#a855f7',
  PLAYGROUND: '#ec4899',
  PARTY: '#f97316',
  EVENT: '#10b981'
}

const TYPE_LABELS: Record<string, string> = {
  CAFE: 'Café',
  SENSORY_ROOM: 'Sensory Room',
  PLAYGROUND: 'Playground',
  PARTY: 'Party',
  EVENT: 'Event'
}

export const RevenueByTypeChart = ({ data, currency = 'RSD' }: RevenueByTypeChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-cyan-100/50">
        No revenue data by type available
      </div>
    )
  }

  // Format data for chart
  const chartData = data.map(item => ({
    ...item,
    name: TYPE_LABELS[item.type] || item.type
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
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
            if (name === 'bookings') {
              return [value, 'Bookings']
            }
            if (name === 'averageValue') {
              return [`${value.toLocaleString()} ${currency}`, 'Avg Value']
            }
            return [value, name]
          }}
        />
        <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={TYPE_COLORS[data[index].type] || '#22d3ee'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

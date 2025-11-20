'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface BookingsPieChartProps {
  data: Array<{ type: string; count: number }>
  colors: Record<string, string>
}

/**
 * BookingsPieChart Component
 *
 * Displays bookings by type using Recharts PieChart
 * Separated for code-splitting via dynamic import
 */
export function BookingsPieChart({ data, colors }: BookingsPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="count"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[entry.type] || '#22d3ee'} />
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
  )
}

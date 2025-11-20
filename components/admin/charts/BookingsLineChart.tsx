'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface BookingsLineChartProps {
  data: Array<{ date: string; count: number }>
}

/**
 * BookingsLineChart Component
 *
 * Displays bookings over time using Recharts LineChart
 * Separated for code-splitting via dynamic import
 */
export function BookingsLineChart({ data }: BookingsLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
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
  )
}

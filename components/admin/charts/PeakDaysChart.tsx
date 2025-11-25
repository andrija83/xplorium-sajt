'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface PeakDaysChartProps {
  data: Array<{ day: string; count: number }>
}

const DAY_COLORS: Record<string, string> = {
  Monday: '#22d3ee',
  Tuesday: '#a855f7',
  Wednesday: '#ec4899',
  Thursday: '#fb923c',
  Friday: '#facc15',
  Saturday: '#10b981',
  Sunday: '#06b6d4',
}

export function PeakDaysChart({ data }: PeakDaysChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis
          dataKey="day"
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            borderRadius: '8px',
            color: '#fff',
          }}
          labelStyle={{ color: '#22d3ee' }}
        />
        <Legend wrapperStyle={{ color: '#fff' }} />
        <Bar
          dataKey="count"
          fill="#a855f7"
          name="Bookings"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

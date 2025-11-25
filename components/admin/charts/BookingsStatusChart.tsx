'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface BookingsStatusChartProps {
  data: Array<{ status: string; count: number }>
}

const STATUS_COLORS = {
  PENDING: '#facc15', // Yellow
  APPROVED: '#22d3ee', // Cyan
  REJECTED: '#ec4899', // Pink
}

const STATUS_LABELS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

export function BookingsStatusChart({ data }: BookingsStatusChartProps) {
  const chartData = data.map((item) => ({
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
    value: item.count,
    status: item.status,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <Legend
          wrapperStyle={{
            color: '#fff',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

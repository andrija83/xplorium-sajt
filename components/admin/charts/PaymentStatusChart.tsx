'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface PaymentStatusChartProps {
  data: {
    totalPaid: number
    totalPending: number
    fullPayments: number
    partialPayments: number
    unpaidBookings: number
  }
  currency?: string
}

const COLORS = {
  paid: '#10b981',
  pending: '#f59e0b',
  unpaid: '#ef4444'
}

export const PaymentStatusChart = ({ data, currency = 'RSD' }: PaymentStatusChartProps) => {
  const chartData = [
    { name: 'Paid', value: data.totalPaid, color: COLORS.paid },
    { name: 'Pending', value: data.totalPending, color: COLORS.pending }
  ]

  const paymentTypesData = [
    { name: 'Full Payments', value: data.fullPayments, color: '#10b981' },
    { name: 'Partial Payments', value: data.partialPayments, color: '#f59e0b' },
    { name: 'Unpaid', value: data.unpaidBookings, color: '#ef4444' }
  ]

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Revenue Status */}
      <div>
        <h4 className="text-sm font-medium text-cyan-300 mb-4 text-center">Revenue Status</h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value.toLocaleString()} ${currency}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid #22d3ee',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number) => `${value.toLocaleString()} ${currency}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Payment Types */}
      <div>
        <h4 className="text-sm font-medium text-cyan-300 mb-4 text-center">Payment Types</h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={paymentTypesData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {paymentTypesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid #22d3ee',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

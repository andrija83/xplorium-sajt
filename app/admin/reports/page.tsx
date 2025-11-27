'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Users, Calendar, DollarSign, Package } from 'lucide-react'
import { ExportButton } from '@/components/admin/ExportButton'
import {
  exportBookings,
  exportCustomers,
  exportEventAttendance,
  exportMonthlyRevenue,
  exportUsers,
  exportPricingPackages,
} from '@/app/actions/exports'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

/**
 * Reports & Exports Page
 *
 * Central location for exporting all types of data from the system
 * - Bookings
 * - Customers
 * - Users
 * - Events
 * - Monthly Revenue
 * - Pricing Packages
 */

export default function ReportsPage() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [revenueYear, setRevenueYear] = useState(String(currentYear))
  const [revenueMonth, setRevenueMonth] = useState(String(currentMonth))

  // Define report type to include optional customControls
  type Report = {
    name: string
    description: string
    action: () => Promise<any>  // Export functions return success/data objects
    filename: string
    customControls?: React.ReactNode
  }

  const reportCategories: Array<{
    title: string
    icon: any
    iconColor: string
    iconBg: string
    borderColor: string
    reports: Report[]
  }> = [
    {
      title: 'Bookings & Reservations',
      icon: Calendar,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-400/20',
      borderColor: 'border-cyan-400/20',
      reports: [
        {
          name: 'All Bookings',
          description: 'Export complete booking history with customer details',
          action: () => exportBookings(),
          filename: 'all-bookings',
        },
        {
          name: 'Pending Bookings',
          description: 'Export only bookings awaiting approval',
          action: () => exportBookings({ status: 'PENDING' }),
          filename: 'pending-bookings',
        },
        {
          name: 'Approved Bookings',
          description: 'Export confirmed bookings',
          action: () => exportBookings({ status: 'APPROVED' }),
          filename: 'approved-bookings',
        },
      ],
    },
    {
      title: 'Customers & Users',
      icon: Users,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-400/20',
      borderColor: 'border-purple-400/20',
      reports: [
        {
          name: 'Customer Database',
          description: 'Export unique customers with booking history and contact info',
          action: exportCustomers,
          filename: 'customers',
        },
        {
          name: 'All Users',
          description: 'Export registered user accounts with roles and status',
          action: exportUsers,
          filename: 'users',
        },
      ],
    },
    {
      title: 'Events & Attendance',
      icon: FileText,
      iconColor: 'text-pink-400',
      iconBg: 'bg-pink-400/20',
      borderColor: 'border-pink-400/20',
      reports: [
        {
          name: 'Event Attendance',
          description: 'Export all events with dates and attendance data',
          action: exportEventAttendance,
          filename: 'event-attendance',
        },
      ],
    },
    {
      title: 'Financial Reports',
      icon: DollarSign,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-400/20',
      borderColor: 'border-emerald-400/20',
      reports: [
        {
          name: 'Monthly Revenue',
          description: 'Export monthly booking statistics and revenue breakdown',
          action: () => exportMonthlyRevenue(Number(revenueYear), Number(revenueMonth)),
          filename: `revenue-${revenueYear}-${revenueMonth}`,
          customControls: (
            <div className="flex gap-2 mt-2">
              <div className="flex-1">
                <Label className="text-xs text-cyan-100/60">Year</Label>
                <Select value={revenueYear} onValueChange={setRevenueYear}>
                  <SelectTrigger className="h-8 bg-black/40 border-cyan-400/30 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-xs text-cyan-100/60">Month</Label>
                <Select value={revenueMonth} onValueChange={setRevenueMonth}>
                  <SelectTrigger className="h-8 bg-black/40 border-cyan-400/30 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={String(month)}>
                        {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      title: 'Pricing & Packages',
      icon: Package,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-400/20',
      borderColor: 'border-yellow-400/20',
      reports: [
        {
          name: 'Pricing Packages',
          description: 'Export all pricing packages with categories and prices',
          action: exportPricingPackages,
          filename: 'pricing-packages',
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cyan-400">Reports & Exports</h1>
        <p className="text-sm text-cyan-100/60 mt-1">
          Export data to CSV files for accounting, analysis, and record-keeping
        </p>
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-blue-500/10 backdrop-blur-sm border border-blue-400/30"
      >
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-300">About CSV Exports</h3>
            <p className="text-xs text-blue-100/60 mt-1">
              All exports are generated in CSV format, compatible with Excel, Google Sheets, and accounting software.
              Files include UTF-8 encoding for proper character display.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Report Categories */}
      <div className="space-y-6">
        {reportCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            <Card className={`p-6 bg-black/20 backdrop-blur-sm border ${category.borderColor}`}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${category.iconBg}`}>
                  <category.icon className={`w-5 h-5 ${category.iconColor}`} />
                </div>
                <h2 className={`text-lg font-semibold ${category.iconColor}`}>{category.title}</h2>
              </div>

              {/* Reports List */}
              <div className="space-y-3">
                {category.reports.map((report, reportIndex) => (
                  <div
                    key={reportIndex}
                    className="flex items-start justify-between p-4 rounded-lg bg-black/20 border border-white/5
                               hover:border-white/10 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white">{report.name}</h3>
                      <p className="text-xs text-cyan-100/50 mt-1">{report.description}</p>
                      {report.customControls && <div className="mt-3">{report.customControls}</div>}
                    </div>
                    <div className="ml-4">
                      <ExportButton
                        onExport={report.action}
                        filename={report.filename}
                        label="Export"
                        variant="outline"
                        size="sm"
                        className={`border-${category.iconColor.replace('text-', '')}/30 ${category.iconColor} hover:bg-${category.iconColor.replace('text-', '')}/10`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-xl bg-black/10 backdrop-blur-sm border border-cyan-400/10"
      >
        <p className="text-xs text-cyan-100/40 text-center">
          💡 Tip: Apply filters on individual pages (Bookings, Users, etc.) before exporting for customized reports
        </p>
      </motion.div>
    </div>
  )
}

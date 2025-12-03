'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react'
import { CustomerInsightsDashboard } from '@/components/admin/CustomerInsightsDashboard'
import { getCustomerInsights } from '@/app/actions/customers'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

/**
 * Customer Insights Page
 *
 * Comprehensive customer analytics dashboard showing:
 * - Customer Lifetime Value (CLV)
 * - Repeat customer rate
 * - Customer segmentation
 * - Churn analysis
 * - Top customers
 * - Monthly trends
 */

export default function CustomerInsightsPage() {
  const [insights, setInsights] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchInsights = async () => {
    try {
      setIsLoading(true)
      const result = await getCustomerInsights()

      if (result.success && result.insights) {
        setInsights(result.insights)
      } else {
        toast.error('Failed to load customer insights')
        logger.error('Failed to fetch customer insights', new Error(result.error || 'Unknown error'))
      }
    } catch (error) {
      logger.error('Error fetching customer insights', error instanceof Error ? error : new Error(String(error)))
      toast.error('An error occurred while loading insights')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchInsights()
    toast.success('Customer insights refreshed')
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-cyan-100/60">Loading customer insights...</p>
        </motion.div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-cyan-100/60 mb-4">Failed to load insights</p>
          <Button onClick={() => fetchInsights()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers">
            <Button
              variant="outline"
              size="sm"
              className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Insights Dashboard */}
      <CustomerInsightsDashboard insights={insights} />
    </div>
  )
}

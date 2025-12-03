'use client'

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Clock, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { BUFFER_TIME_MINUTES } from '@/lib/scheduling'

/**
 * Buffer Time Warning Component
 *
 * Displays conflict warnings and suggested alternative times for bookings
 * Helps users understand the 45-minute buffer time requirement
 */

interface BufferTimeWarningProps {
  conflictType?: 'overlap' | 'buffer_violation' | 'double_booking'
  message?: string
  suggestedTimes?: Date[]
  onSelectTime?: (time: Date) => void
  bufferTimeMinutes?: number // Optional: if provided, shows actual buffer time instead of constant
  className?: string
}

export const BufferTimeWarning = memo(function BufferTimeWarning({
  conflictType,
  message,
  suggestedTimes = [],
  onSelectTime,
  bufferTimeMinutes,
  className
}: BufferTimeWarningProps) {
  // Use provided buffer time or fall back to constant
  const displayBufferTime = bufferTimeMinutes ?? BUFFER_TIME_MINUTES
  if (!conflictType || !message) {
    return null
  }

  const getSeverityConfig = () => {
    switch (conflictType) {
      case 'double_booking':
        return {
          color: 'red',
          bgColor: 'bg-red-400/10',
          borderColor: 'border-red-400/30',
          textColor: 'text-red-300',
          iconColor: 'text-red-400'
        }
      case 'buffer_violation':
        return {
          color: 'orange',
          bgColor: 'bg-orange-400/10',
          borderColor: 'border-orange-400/30',
          textColor: 'text-orange-300',
          iconColor: 'text-orange-400'
        }
      default:
        return {
          color: 'yellow',
          bgColor: 'bg-yellow-400/10',
          borderColor: 'border-yellow-400/30',
          textColor: 'text-yellow-300',
          iconColor: 'text-yellow-400'
        }
    }
  }

  const config = getSeverityConfig()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'p-4 rounded-lg border',
          config.bgColor,
          config.borderColor,
          className
        )}
      >
        {/* Conflict Message */}
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
          <div className="flex-1">
            <h4 className={cn('font-semibold mb-1', config.textColor)}>
              {conflictType === 'double_booking' && 'Time Slot Unavailable'}
              {conflictType === 'buffer_violation' && 'Buffer Time Required'}
              {conflictType === 'overlap' && 'Scheduling Conflict'}
            </h4>
            <p className="text-sm text-cyan-100/80">{message}</p>
          </div>
        </div>

        {/* Buffer Time Info */}
        {conflictType === 'buffer_violation' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-cyan-400/5 border border-cyan-400/20 mb-3">
            <Clock className="w-4 h-4 text-cyan-400" />
            <p className="text-xs text-cyan-100/70">
              We require <strong className="text-cyan-300">{displayBufferTime} minutes</strong> between bookings for cleanup and preparation
            </p>
          </div>
        )}

        {/* Suggested Times */}
        {suggestedTimes.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-cyan-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Suggested Alternative Times:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {suggestedTimes.map((time, index) => (
                <motion.button
                  key={index}
                  type="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onSelectTime?.(time)}
                  className={cn(
                    'p-3 rounded-lg border transition-all',
                    'bg-cyan-400/5 border-cyan-400/20',
                    'hover:bg-cyan-400/10 hover:border-cyan-400/40',
                    'focus:outline-none focus:ring-2 focus:ring-cyan-400/50'
                  )}
                >
                  <div className="text-sm font-semibold text-cyan-300">
                    {format(time, 'h:mm a')}
                  </div>
                  <div className="text-xs text-cyan-100/50 mt-1">
                    {format(time, 'MMM d, yyyy')}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* No Suggestions Available */}
        {suggestedTimes.length === 0 && (
          <div className="mt-3 p-3 rounded bg-cyan-400/5 border border-cyan-400/10">
            <p className="text-xs text-cyan-100/60">
              No alternative times found nearby. Please try a different date or contact support.
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
})

BufferTimeWarning.displayName = 'BufferTimeWarning'


/**
 * Buffer Time Info Component
 *
 * Educational component to inform users about buffer time requirements
 */
export const BufferTimeInfo = memo(function BufferTimeInfo() {
  return (
    <div className="p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-cyan-400/10">
          <Clock className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-cyan-300 mb-1">
            {BUFFER_TIME_MINUTES}-Minute Buffer Time
          </h4>
          <p className="text-sm text-cyan-100/70">
            To ensure the best experience, we automatically reserve {BUFFER_TIME_MINUTES} minutes
            before and after each booking for cleanup and preparation. This helps us maintain
            quality service for all customers.
          </p>
        </div>
      </div>
    </div>
  )
})

BufferTimeInfo.displayName = 'BufferTimeInfo'

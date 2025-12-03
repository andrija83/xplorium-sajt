'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Calendar, Info, CheckCircle, Edit, Save, X } from 'lucide-react'
import { BUFFER_TIME_MINUTES } from '@/lib/scheduling'
import { BufferTimeInfo } from '@/components/admin/BufferTimeWarning'
import { getBufferTime, updateBufferTime } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { addMinutes, format as formatDate } from 'date-fns'

/**
 * Scheduling Settings Page
 *
 * Displays buffer time configuration and scheduling rules
 */

export default function SchedulingPage() {
  const [bufferTime, setBufferTime] = useState(BUFFER_TIME_MINUTES)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(BUFFER_TIME_MINUTES.toString())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch current buffer time
  useEffect(() => {
    const fetchBufferTime = async () => {
      try {
        const result = await getBufferTime()
        if (result.success) {
          setBufferTime(result.bufferTime)
          setEditValue(result.bufferTime.toString())
        }
      } catch (error) {
        logger.error('Failed to fetch buffer time', error instanceof Error ? error : new Error(String(error)))
      } finally {
        setIsLoading(false)
      }
    }

    fetchBufferTime()
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(bufferTime.toString())
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(bufferTime.toString())
  }

  const handleSave = async () => {
    const minutes = parseInt(editValue, 10)

    if (isNaN(minutes) || minutes < 0 || minutes > 180) {
      toast.error('Buffer time must be between 0 and 180 minutes')
      return
    }

    try {
      setIsSaving(true)
      const result = await updateBufferTime(minutes)

      if (result.success) {
        setBufferTime(minutes)
        setIsEditing(false)
        toast.success(result.message || 'Buffer time updated successfully')
      } else {
        toast.error(result.error || 'Failed to update buffer time')
      }
    } catch (error) {
      logger.error('Failed to update buffer time', error instanceof Error ? error : new Error(String(error)))
      toast.error('An error occurred while updating buffer time')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cyan-400"
          style={{
            textShadow: '0 0 30px rgba(34, 211, 238, 0.6)',
          }}
        >
          Scheduling Settings
        </h1>
        <p className="text-sm text-cyan-100/60 mt-1">
          Configure buffer times and scheduling rules for optimal booking management
        </p>
      </div>

      {/* Buffer Time Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
        style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-cyan-400/20">
            <Clock className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-cyan-300">Buffer Time Configuration</h2>
            <p className="text-sm text-cyan-100/60">
              Automatic time buffer between bookings
            </p>
          </div>
        </div>

        {/* Current Setting */}
        <div className="mb-6 p-6 rounded-lg bg-gradient-to-br from-cyan-400/10 to-purple-400/10 border border-cyan-400/30">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-cyan-100/60 mb-1">Current Buffer Time</p>
              {!isEditing ? (
                <div className="flex items-center gap-4">
                  <p className="text-4xl font-bold text-cyan-400">
                    {isLoading ? '...' : `${bufferTime} minutes`}
                  </p>
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    type="number"
                    min="0"
                    max="180"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-32 text-xl font-bold bg-black/40 border-cyan-400/30 text-cyan-400"
                    disabled={isSaving}
                  />
                  <span className="text-xl text-cyan-300">minutes</span>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      disabled={isSaving}
                      className="bg-green-400/20 text-green-300 border-green-400/30 hover:bg-green-400/30"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      disabled={isSaving}
                      className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {!isEditing && (
              <div className="p-4 rounded-full bg-green-400/20">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            )}
          </div>
          <p className="text-xs text-cyan-100/50 mt-3">
            Valid range: 0-180 minutes (0 hours to 3 hours)
          </p>
        </div>

        {/* Info Panel */}
        <BufferTimeInfo />

        {/* Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/10">
            <h3 className="font-semibold text-cyan-300 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Why Buffer Time?
            </h3>
            <ul className="text-sm text-cyan-100/70 space-y-1">
              <li>• Allows time for cleanup between bookings</li>
              <li>• Prevents overlapping schedules</li>
              <li>• Gives staff time to prepare</li>
              <li>• Ensures quality service for all customers</li>
              <li>• Adjustable from 0 to 180 minutes</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-purple-400/5 border border-purple-400/10">
            <h3 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              How It Works
            </h3>
            <ul className="text-sm text-purple-100/70 space-y-1">
              <li>• Automatically checked on booking creation</li>
              <li>• Prevents bookings within {isLoading ? '...' : bufferTime} min of existing ones</li>
              <li>• Suggests alternative times if conflict detected</li>
              <li>• Applies to all booking types equally</li>
              <li>• Real-time validation with current settings</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Example Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-purple-400/20"
        style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
      >
        <h2 className="text-lg font-semibold text-purple-300 mb-4">
          Example Timeline
        </h2>
        <p className="text-sm text-cyan-100/60 mb-6">
          Visual representation of how buffer time works between bookings
        </p>

        <div className="space-y-4">
          {/* Booking 1 */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-cyan-300">Booking #1</span>
              <span className="text-xs text-cyan-100/50">2:00 PM - 4:00 PM (2 hours)</span>
            </div>
            <div className="h-12 bg-gradient-to-r from-cyan-400/40 to-cyan-400/20 rounded-lg border border-cyan-400/30 flex items-center px-4">
              <span className="text-sm font-semibold text-cyan-100">Active Booking</span>
            </div>
          </div>

          {/* Buffer Time */}
          <div className="relative pl-8">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400/30"></div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-orange-300">Buffer Time</span>
              <span className="text-xs text-orange-100/50">
                4:00 PM - {isLoading ? '...' : formatDate(addMinutes(new Date('2024-01-01 16:00'), bufferTime), 'h:mm a')} ({isLoading ? '...' : bufferTime} min)
              </span>
            </div>
            <div className="h-8 bg-gradient-to-r from-orange-400/20 to-orange-400/10 rounded-lg border border-orange-400/20 border-dashed flex items-center px-4">
              <span className="text-xs text-orange-100/70">Cleanup & Preparation</span>
            </div>
          </div>

          {/* Next Available */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-green-300">Next Available</span>
              <span className="text-xs text-green-100/50">
                {isLoading ? '...' : formatDate(addMinutes(new Date('2024-01-01 16:00'), bufferTime), 'h:mm a')} onwards
              </span>
            </div>
            <div className="h-12 bg-gradient-to-r from-green-400/40 to-green-400/20 rounded-lg border border-green-400/30 flex items-center px-4">
              <span className="text-sm font-semibold text-green-100">Booking #2 can start here</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-green-400/5 border border-green-400/20">
          <p className="text-sm text-green-100/80">
            <strong className="text-green-300">✓ Allowed:</strong> Booking #2 starts at {isLoading ? '...' : formatDate(addMinutes(new Date('2024-01-01 16:00'), bufferTime), 'h:mm a')} or later
            <br />
            <strong className="text-red-300">✗ Not Allowed:</strong> Booking #2 starts between 4:00 PM - {isLoading ? '...' : formatDate(addMinutes(new Date('2024-01-01 16:00'), bufferTime - 1), 'h:mm a')}
          </p>
        </div>
      </motion.div>

      {/* Additional Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
        style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
      >
        <h2 className="text-lg font-semibold text-cyan-300 mb-4">
          Smart Scheduling Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/10">
            <div className="w-10 h-10 rounded-lg bg-cyan-400/20 flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-cyan-300 mb-1">Conflict Detection</h3>
            <p className="text-sm text-cyan-100/60">
              Automatically checks for overlaps and buffer violations before confirming bookings
            </p>
          </div>

          <div className="p-4 rounded-lg bg-purple-400/5 border border-purple-400/10">
            <div className="w-10 h-10 rounded-lg bg-purple-400/20 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-purple-300 mb-1">Alternative Suggestions</h3>
            <p className="text-sm text-purple-100/60">
              Provides up to 3 alternative time slots when conflicts are detected
            </p>
          </div>

          <div className="p-4 rounded-lg bg-pink-400/5 border border-pink-400/10">
            <div className="w-10 h-10 rounded-lg bg-pink-400/20 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-pink-400" />
            </div>
            <h3 className="font-semibold text-pink-300 mb-1">Real-time Validation</h3>
            <p className="text-sm text-pink-100/60">
              Validates bookings in real-time during creation and updates
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

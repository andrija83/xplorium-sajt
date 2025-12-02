'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Loader2, RefreshCw } from 'lucide-react'
import { SettingsEditor } from '@/components/admin/SettingsEditor'
import { getAllSettings, updateSettings, initializeDefaultSettings, type Setting } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

/**
 * Admin Settings Page
 *
 * Centralized settings management for the entire site
 * - General site information
 * - Contact details
 * - Business hours
 * - Social media links
 * - Email notification preferences
 * - Feature toggles
 */

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(false)

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const result = await getAllSettings()

      if (result.success && result.settings) {
        setSettings(result.settings)

        // If no settings exist, offer to initialize defaults
        if (result.settings.length === 0) {
          toast.info('No settings found. Initialize default settings to get started.', {
            duration: 5000
          })
        }
      } else {
        toast.error('Failed to load settings')
      }
    } catch (error) {
      logger.error('Failed to fetch settings', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize default settings
  const handleInitialize = async () => {
    try {
      setIsInitializing(true)
      const result = await initializeDefaultSettings()

      if (result.success) {
        toast.success(`Initialized ${result.count} default settings`)
        fetchSettings()
      } else {
        toast.error(result.error || 'Failed to initialize settings')
      }
    } catch (error) {
      logger.error('Failed to initialize settings', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to initialize settings')
    } finally {
      setIsInitializing(false)
    }
  }

  // Handle save
  const handleSave = async (settingsToUpdate: Array<{ key: string; value: any; category: string }>) => {
    const result = await updateSettings(settingsToUpdate)

    if (result.success) {
      // Refresh settings
      fetchSettings()
    } else {
      throw new Error(result.error || 'Failed to save settings')
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  // Show initialization screen if no settings
  if (settings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center p-8 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
        >
          <Settings className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyan-400 mb-2">
            No Settings Found
          </h2>
          <p className="text-cyan-100/60 mb-6">
            Initialize default settings to configure your site's information, contact details, business hours, and more.
          </p>
          <Button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            {isInitializing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Initialize Default Settings
              </>
            )}
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsEditor settings={settings} onSave={handleSave} />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, RotateCcw, Building, Mail, Clock, Share2, Bell, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import type { Setting } from '@/app/actions/settings'
import { cn } from '@/lib/utils'

interface SettingsEditorProps {
  settings: Setting[]
  onSave: (settings: Array<{ key: string; value: any; category: string }>) => Promise<void>
}

interface SettingsState {
  [key: string]: any
}

/**
 * SettingsEditor Component
 *
 * Comprehensive settings editor with organized tabs
 * Categories: General, Contact, Hours, Social, Notifications, Features
 */
export const SettingsEditor = ({ settings, onSave }: SettingsEditorProps) => {
  // Initialize state from settings
  const initialState: SettingsState = {}
  settings.forEach(setting => {
    initialState[setting.key] = setting.value
  })

  const [formData, setFormData] = useState<SettingsState>(initialState)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Update a specific setting
  const updateSetting = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
    setHasChanges(true)
  }

  // Reset to original values
  const handleReset = () => {
    setFormData(initialState)
    setHasChanges(false)
    toast.info('Changes reset')
  }

  // Save all changes
  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Convert to array format for server action
      const settingsToUpdate = Object.entries(formData).map(([key, value]) => {
        const originalSetting = settings.find(s => s.key === key)
        const category = originalSetting?.category || getCategoryFromKey(key)
        return { key, value, category }
      })

      await onSave(settingsToUpdate)
      setHasChanges(false)
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Get category from key
  const getCategoryFromKey = (key: string): string => {
    const prefix = key.split('.')[0]
    const categoryMap: Record<string, string> = {
      'site': 'general',
      'contact': 'contact',
      'hours': 'hours',
      'social': 'social',
      'email': 'notifications',
      'features': 'features'
    }
    return categoryMap[prefix] || 'general'
  }

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayLabels: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }

  return (
    <div className="space-y-6">
      {/* Header with Save/Reset */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">Site Settings</h2>
          <p className="text-sm text-cyan-100/60 mt-1">
            Configure your venue's information and preferences
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={!hasChanges || isSaving}
            className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Unsaved changes indicator */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm"
        >
          You have unsaved changes. Click "Save Changes" to apply them.
        </motion.div>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-6 w-full bg-black/20 border border-cyan-400/20">
          <TabsTrigger value="general" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Building className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Mail className="w-4 h-4 mr-2" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="hours" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" />
            Hours
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Share2 className="w-4 h-4 mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="features" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Zap className="w-4 h-4 mr-2" />
            Features
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 space-y-4"
          >
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">General Information</h3>

            <div>
              <Label htmlFor="site-name" className="text-cyan-300">Site Name</Label>
              <Input
                id="site-name"
                value={formData['site.name']?.text || ''}
                onChange={(e) => updateSetting('site.name', { text: e.target.value })}
                className="mt-2 bg-black/40 border-cyan-400/30 text-white"
              />
            </div>

            <div>
              <Label htmlFor="site-tagline" className="text-cyan-300">Tagline</Label>
              <Input
                id="site-tagline"
                value={formData['site.tagline']?.text || ''}
                onChange={(e) => updateSetting('site.tagline', { text: e.target.value })}
                className="mt-2 bg-black/40 border-cyan-400/30 text-white"
              />
            </div>

            <div>
              <Label htmlFor="site-description" className="text-cyan-300">Description</Label>
              <Textarea
                id="site-description"
                value={formData['site.description']?.text || ''}
                onChange={(e) => updateSetting('site.description', { text: e.target.value })}
                rows={3}
                className="mt-2 bg-black/40 border-cyan-400/30 text-white"
              />
            </div>

            <div>
              <Label htmlFor="site-logo" className="text-cyan-300">Logo URL</Label>
              <Input
                id="site-logo"
                value={formData['site.logo']?.url || ''}
                onChange={(e) => updateSetting('site.logo', { url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="mt-2 bg-black/40 border-cyan-400/30 text-white"
              />
            </div>
          </motion.div>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contact" className="space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 space-y-4"
          >
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Contact Information</h3>

            <div>
              <Label htmlFor="contact-email" className="text-cyan-300">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={formData['contact.email']?.text || ''}
                onChange={(e) => updateSetting('contact.email', { text: e.target.value })}
                className="mt-2 bg-black/40 border-cyan-400/30 text-white"
              />
            </div>

            <div>
              <Label htmlFor="contact-phone" className="text-cyan-300">Phone</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={formData['contact.phone']?.text || ''}
                onChange={(e) => updateSetting('contact.phone', { text: e.target.value })}
                className="mt-2 bg-black/40 border-cyan-400/30 text-white"
              />
            </div>

            <div>
              <Label htmlFor="contact-address" className="text-cyan-300">Address</Label>
              <Textarea
                id="contact-address"
                value={formData['contact.address']?.text || ''}
                onChange={(e) => updateSetting('contact.address', { text: e.target.value })}
                rows={2}
                className="mt-2 bg-black/40 border-cyan-400/30 text-white"
              />
            </div>

            <div>
              <Label htmlFor="contact-maps" className="text-cyan-300">Google Maps URL</Label>
              <Input
                id="contact-maps"
                value={formData['contact.googleMapsUrl']?.text || ''}
                onChange={(e) => updateSetting('contact.googleMapsUrl', { text: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="mt-2 bg-black/40 border-cyan-400/30 text-white"
              />
            </div>
          </motion.div>
        </TabsContent>

        {/* Business Hours */}
        <TabsContent value="hours" className="space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 space-y-4"
          >
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Business Hours</h3>

            {dayNames.map(day => {
              const key = `hours.${day}`
              const hours = formData[key] || { open: '09:00', close: '21:00', closed: false }

              return (
                <div key={day} className="grid grid-cols-12 gap-4 items-center">
                  <Label className="col-span-2 text-cyan-300">{dayLabels[day]}</Label>

                  <div className="col-span-3">
                    <Input
                      type="time"
                      value={hours.open || ''}
                      onChange={(e) => updateSetting(key, { ...hours, open: e.target.value })}
                      disabled={hours.closed}
                      className="bg-black/40 border-cyan-400/30 text-white disabled:opacity-50"
                    />
                  </div>

                  <span className="col-span-1 text-center text-cyan-100/50">to</span>

                  <div className="col-span-3">
                    <Input
                      type="time"
                      value={hours.close || ''}
                      onChange={(e) => updateSetting(key, { ...hours, close: e.target.value })}
                      disabled={hours.closed}
                      className="bg-black/40 border-cyan-400/30 text-white disabled:opacity-50"
                    />
                  </div>

                  <div className="col-span-3 flex items-center gap-2">
                    <Switch
                      checked={!hours.closed}
                      onCheckedChange={(checked) => updateSetting(key, { ...hours, closed: !checked })}
                    />
                    <span className="text-sm text-cyan-100/70">
                      {hours.closed ? 'Closed' : 'Open'}
                    </span>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social" className="space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 space-y-4"
          >
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Social Media Links</h3>

            <div>
              <Label htmlFor="social-facebook" className="text-cyan-300">Facebook URL</Label>
              <Input
                id="social-facebook"
                value={formData['social.facebook']?.url || ''}
                onChange={(e) => updateSetting('social.facebook', { url: e.target.value })}
                placeholder="https://facebook.com/yourpage"
                className="mt-2 bg-black/40 border-cyan-400/30 text-white"
              />
            </div>

            <div>
              <Label htmlFor="social-instagram" className="text-cyan-300">Instagram URL</Label>
              <Input
                id="social-instagram"
                value={formData['social.instagram']?.url || ''}
                onChange={(e) => updateSetting('social.instagram', { url: e.target.value })}
                placeholder="https://instagram.com/yourpage"
                className="mt-2 bg-black/40 border-cyan-400/30 text-white"
              />
            </div>

            <div>
              <Label htmlFor="social-twitter" className="text-cyan-300">Twitter URL</Label>
              <Input
                id="social-twitter"
                value={formData['social.twitter']?.url || ''}
                onChange={(e) => updateSetting('social.twitter', { url: e.target.value })}
                placeholder="https://twitter.com/yourpage"
                className="mt-2 bg-black/40 border-cyan-400/30 text-white"
              />
            </div>

            <div>
              <Label htmlFor="social-youtube" className="text-cyan-300">YouTube URL</Label>
              <Input
                id="social-youtube"
                value={formData['social.youtube']?.url || ''}
                onChange={(e) => updateSetting('social.youtube', { url: e.target.value })}
                placeholder="https://youtube.com/yourchannel"
                className="mt-2 bg-black/40 border-cyan-400/30 text-white"
              />
            </div>
          </motion.div>
        </TabsContent>

        {/* Email Notifications */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 space-y-4"
          >
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Email Notifications</h3>

            {[
              { key: 'email.bookingConfirmation', label: 'Send Booking Confirmation Emails' },
              { key: 'email.bookingApproved', label: 'Send Booking Approved Emails' },
              { key: 'email.bookingRejected', label: 'Send Booking Rejected Emails' },
              { key: 'email.lowInventory', label: 'Send Low Inventory Alerts' }
            ].map(({ key, label }) => {
              const setting = formData[key] || { enabled: true }

              return (
                <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-cyan-400/10">
                  <Label className="text-cyan-300">{label}</Label>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={(checked) => updateSetting(key, { ...setting, enabled: checked })}
                  />
                </div>
              )
            })}

            <div className="p-4 rounded-lg bg-black/20 border border-cyan-400/10">
              <Label htmlFor="inventory-threshold" className="text-cyan-300">Low Inventory Threshold</Label>
              <Input
                id="inventory-threshold"
                type="number"
                value={formData['email.lowInventory']?.threshold || 10}
                onChange={(e) => updateSetting('email.lowInventory', {
                  ...formData['email.lowInventory'],
                  threshold: parseInt(e.target.value) || 10
                })}
                min="1"
                className="mt-2 bg-black/40 border-cyan-400/30 text-white w-32"
              />
              <p className="text-xs text-cyan-100/50 mt-2">
                Alert when inventory falls below this number
              </p>
            </div>
          </motion.div>
        </TabsContent>

        {/* Feature Toggles */}
        <TabsContent value="features" className="space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 space-y-4"
          >
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Feature Toggles</h3>

            {[
              { key: 'features.onlineBooking', label: 'Enable Online Booking', description: 'Allow customers to book online through the website' },
              { key: 'features.loyaltyProgram', label: 'Enable Loyalty Program', description: 'Track customer points and rewards' },
              { key: 'features.payments', label: 'Enable Online Payments', description: 'Accept payments through the website (requires payment gateway setup)' }
            ].map(({ key, label, description }) => {
              const setting = formData[key] || { enabled: false }

              return (
                <div key={key} className="flex items-start justify-between p-4 rounded-lg bg-black/20 border border-cyan-400/10">
                  <div className="flex-1">
                    <Label className="text-cyan-300">{label}</Label>
                    <p className="text-xs text-cyan-100/50 mt-1">{description}</p>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={(checked) => updateSetting(key, { enabled: checked })}
                    className="ml-4"
                  />
                </div>
              )
            })}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

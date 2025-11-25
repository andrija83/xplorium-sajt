"use client"

import { useState } from "react"
import { Mail, MessageSquare, Phone } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateMarketingPreferences } from "@/app/actions/loyalty"

interface MarketingPreferencesCardProps {
  userId: string
  marketingOptIn: boolean
  smsOptIn: boolean
  preferredContactMethod: string
}

export function MarketingPreferencesCard({
  userId,
  marketingOptIn,
  smsOptIn,
  preferredContactMethod,
}: MarketingPreferencesCardProps) {
  const [emailOptIn, setEmailOptIn] = useState(marketingOptIn)
  const [smsOptInState, setSmsOptInState] = useState(smsOptIn)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleEmail = async (checked: boolean) => {
    setIsLoading(true)
    setEmailOptIn(checked)

    try {
      const result = await updateMarketingPreferences(userId, checked, undefined)

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error || "Failed to update preferences")
        setEmailOptIn(!checked) // Revert on error
      }
    } catch (error) {
      toast.error("An error occurred")
      setEmailOptIn(!checked) // Revert on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleSMS = async (checked: boolean) => {
    setIsLoading(true)
    setSmsOptInState(checked)

    try {
      const result = await updateMarketingPreferences(userId, undefined, checked)

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error || "Failed to update preferences")
        setSmsOptInState(!checked) // Revert on error
      }
    } catch (error) {
      toast.error("An error occurred")
      setSmsOptInState(!checked) // Revert on error
    } finally {
      setIsLoading(false)
    }
  }

  const contactMethodIcons = {
    EMAIL: <Mail className="w-4 h-4" />,
    PHONE: <Phone className="w-4 h-4" />,
    SMS: <MessageSquare className="w-4 h-4" />,
    ANY: <Mail className="w-4 h-4" />,
  }

  return (
    <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 p-6">
      <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5" />
        Marketing Preferences
      </h3>

      <div className="space-y-6">
        {/* Email Marketing */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="email-opt-in" className="text-sm font-medium text-cyan-100 cursor-pointer">
              Email Marketing
            </Label>
            <p className="text-xs text-cyan-100/50 mt-1">
              Allow sending promotional emails
            </p>
          </div>
          <Switch
            id="email-opt-in"
            checked={emailOptIn}
            onCheckedChange={handleToggleEmail}
            disabled={isLoading}
          />
        </div>

        {/* SMS Marketing */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="sms-opt-in" className="text-sm font-medium text-cyan-100 cursor-pointer">
              SMS Marketing
            </Label>
            <p className="text-xs text-cyan-100/50 mt-1">
              Allow sending promotional SMS
            </p>
          </div>
          <Switch
            id="sms-opt-in"
            checked={smsOptInState}
            onCheckedChange={handleToggleSMS}
            disabled={isLoading}
          />
        </div>

        {/* Preferred Contact Method */}
        <div className="pt-4 border-t border-cyan-400/10">
          <div className="text-sm font-medium text-cyan-100 mb-2">
            Preferred Contact Method
          </div>
          <div className="flex items-center gap-2 text-sm text-cyan-100/70">
            {contactMethodIcons[preferredContactMethod as keyof typeof contactMethodIcons]}
            {preferredContactMethod}
          </div>
        </div>

        {/* Marketing Status Summary */}
        <div className="pt-4 border-t border-cyan-400/10">
          <div className="text-xs font-medium text-cyan-100/60 mb-2">MARKETING STATUS</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-cyan-100/50">Email Marketing</span>
              <span className={emailOptIn ? "text-green-400" : "text-red-400"}>
                {emailOptIn ? "✓ Opted In" : "✗ Opted Out"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-cyan-100/50">SMS Marketing</span>
              <span className={smsOptInState ? "text-green-400" : "text-red-400"}>
                {smsOptInState ? "✓ Opted In" : "✗ Opted Out"}
              </span>
            </div>
          </div>
        </div>

        {/* GDPR Compliance Note */}
        <div className="text-xs text-cyan-100/40 italic pt-4 border-t border-cyan-400/10">
          Note: Customer can update these preferences from their account settings.
          Always respect opt-out preferences when sending marketing communications.
        </div>
      </div>
    </div>
  )
}

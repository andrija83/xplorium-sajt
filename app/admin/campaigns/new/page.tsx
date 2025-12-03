'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { createCampaign, getCampaignRecipients, type CreateCampaignInput } from '@/app/actions/campaigns'
import { ArrowLeft, Users, Mail, MessageSquare, Send } from 'lucide-react'
import type { CampaignType, LoyaltyTier } from '@prisma/client'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

const LOYALTY_TIERS: LoyaltyTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'VIP']

export default function NewCampaignPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recipientCount, setRecipientCount] = useState(0)
  const [isCalculatingRecipients, setIsCalculatingRecipients] = useState(false)

  // Form state
  const [formData, setFormData] = useState<CreateCampaignInput>({
    name: '',
    description: '',
    type: 'EMAIL',
    subject: '',
    content: '',
    targetAudience: {
      loyaltyTiers: [],
      marketingOptIn: true,
      tags: [],
      minTotalSpent: undefined,
      maxTotalSpent: undefined,
      minBookings: undefined,
      maxBookings: undefined
    }
  })

  // Handle form field changes
  const handleChange = (field: keyof CreateCampaignInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle target audience changes
  const handleAudienceChange = (field: keyof CreateCampaignInput['targetAudience'], value: any) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        [field]: value
      }
    }))
  }

  // Handle loyalty tier selection
  const handleTierToggle = (tier: LoyaltyTier) => {
    const currentTiers = formData.targetAudience.loyaltyTiers || []
    const updatedTiers = currentTiers.includes(tier)
      ? currentTiers.filter(t => t !== tier)
      : [...currentTiers, tier]
    handleAudienceChange('loyaltyTiers', updatedTiers)
  }

  // Calculate recipient count when audience filters change
  useEffect(() => {
    const calculateRecipients = async () => {
      setIsCalculatingRecipients(true)
      try {
        // Create a temporary campaign to calculate recipients
        const tempCampaign = await createCampaign({
          ...formData,
          name: '__temp_calc__',
          content: 'temp'
        })

        if (tempCampaign.success && tempCampaign.campaign) {
          setRecipientCount(tempCampaign.campaign.totalRecipients)
          // Delete the temp campaign
          await fetch(`/api/campaigns/${tempCampaign.campaign.id}`, { method: 'DELETE' })
        }
      } catch (error) {
        // Silent fail for recipient calculation
      } finally {
        setIsCalculatingRecipients(false)
      }
    }

    // Debounce the calculation
    const timer = setTimeout(() => {
      if (formData.targetAudience) {
        calculateRecipients()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.targetAudience])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a campaign name')
      return
    }

    if (!formData.content.trim()) {
      toast.error('Please enter campaign content')
      return
    }

    if ((formData.type === 'EMAIL' || formData.type === 'BOTH') && !formData.subject?.trim()) {
      toast.error('Email campaigns require a subject')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createCampaign(formData)

      if (result.success) {
        toast.success('Campaign created successfully')
        router.push('/admin/campaigns')
      } else {
        toast.error(result.error || 'Failed to create campaign')
      }
    } catch (error) {
      logger.error('Failed to create campaign', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to create campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Campaign</h1>
          <p className="text-muted-foreground">
            Set up a new email or SMS marketing campaign
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Form - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Campaign name and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Summer Promotion 2025"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this campaign"
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Campaign Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange('type', value as CampaignType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Only
                      </div>
                    </SelectItem>
                    <SelectItem value="SMS">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        SMS Only
                      </div>
                    </SelectItem>
                    <SelectItem value="BOTH">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Email + SMS
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Message Content</CardTitle>
              <CardDescription>What you want to send to your audience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(formData.type === 'EMAIL' || formData.type === 'BOTH') && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Exclusive Summer Deals Inside!"
                    value={formData.subject || ''}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="content">
                  {formData.type === 'EMAIL' ? 'Email Content' : formData.type === 'SMS' ? 'SMS Message' : 'Message Content'} *
                </Label>
                <Textarea
                  id="content"
                  placeholder={
                    formData.type === 'SMS'
                      ? 'Keep it short and sweet for SMS (max 160 characters recommended)'
                      : 'Write your message here. You can use HTML for email campaigns.'
                  }
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  rows={10}
                  required
                />
                {formData.type === 'SMS' && (
                  <p className="text-xs text-muted-foreground">
                    Character count: {formData.content.length} {formData.content.length > 160 && '(⚠️ May be split into multiple messages)'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Target Audience - Right Column (1/3) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
              <CardDescription>Who should receive this campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recipient Count */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Recipients</span>
                </div>
                <div className="text-2xl font-bold">
                  {isCalculatingRecipients ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    recipientCount.toLocaleString()
                  )}
                </div>
              </div>

              {/* Loyalty Tiers */}
              <div className="space-y-2">
                <Label>Loyalty Tiers</Label>
                <div className="space-y-2">
                  {LOYALTY_TIERS.map(tier => (
                    <div key={tier} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tier-${tier}`}
                        checked={formData.targetAudience.loyaltyTiers?.includes(tier) || false}
                        onCheckedChange={() => handleTierToggle(tier)}
                      />
                      <Label htmlFor={`tier-${tier}`} className="cursor-pointer">
                        <Badge variant="outline">{tier}</Badge>
                      </Label>
                    </div>
                  ))}
                  {formData.targetAudience.loyaltyTiers?.length === 0 && (
                    <p className="text-xs text-muted-foreground">All tiers (no filter)</p>
                  )}
                </div>
              </div>

              {/* Marketing Opt-In */}
              <div className="space-y-2">
                <Label htmlFor="marketing-opt-in">Marketing Preference</Label>
                <Select
                  value={
                    formData.targetAudience.marketingOptIn === undefined
                      ? 'all'
                      : formData.targetAudience.marketingOptIn
                      ? 'opted-in'
                      : 'opted-out'
                  }
                  onValueChange={(value) =>
                    handleAudienceChange(
                      'marketingOptIn',
                      value === 'all' ? undefined : value === 'opted-in'
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="opted-in">Opted In Only</SelectItem>
                    <SelectItem value="opted-out">Opted Out Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Spending Range */}
              <div className="space-y-2">
                <Label>Total Spent Range (RSD)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={formData.targetAudience.minTotalSpent || ''}
                    onChange={(e) =>
                      handleAudienceChange('minTotalSpent', e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={formData.targetAudience.maxTotalSpent || ''}
                    onChange={(e) =>
                      handleAudienceChange('maxTotalSpent', e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
              </div>

              {/* Booking Count Range */}
              <div className="space-y-2">
                <Label>Total Bookings Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={formData.targetAudience.minBookings || ''}
                    onChange={(e) =>
                      handleAudienceChange('minBookings', e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={formData.targetAudience.maxBookings || ''}
                    onChange={(e) =>
                      handleAudienceChange('maxBookings', e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Button type="submit" className="w-full" disabled={isSubmitting || isCalculatingRecipients}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Create Campaign
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}

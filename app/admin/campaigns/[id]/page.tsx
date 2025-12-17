'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import {
  getCampaign,
  getCampaignRecipients,
  updateCampaign,
  deleteCampaign,
  scheduleCampaign,
  cancelCampaign
} from '@/app/actions/campaigns'
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  MailCheck,
  Users,
  Calendar,
  Send,
  Ban,
  Edit,
  Trash2,
  TrendingUp,
  MousePointerClick,
  UserX
} from 'lucide-react'
import { format } from 'date-fns'
import type { Campaign, CampaignType, CampaignStatus } from '@prisma/client'
import { NeonLoader } from '@/components/common'

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [recipients, setRecipients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false)

  // Fetch campaign details
  const fetchCampaign = async () => {
    try {
      setIsLoading(true)
      const result = await getCampaign(campaignId)

      if (result.success && result.campaign) {
        setCampaign(result.campaign as Campaign)
      } else {
        toast.error(result.error || 'Campaign not found')
        router.push('/admin/campaigns')
      }
    } catch (error) {
      logger.error('Failed to fetch campaign', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to load campaign')
      router.push('/admin/campaigns')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch recipients
  const fetchRecipients = async () => {
    try {
      setIsLoadingRecipients(true)
      const result = await getCampaignRecipients(campaignId)

      if (result.success && result.recipients) {
        setRecipients(result.recipients)
      } else {
        toast.error(result.error || 'Failed to load recipients')
      }
    } catch (error) {
      logger.error('Failed to fetch recipients', error instanceof Error ? error : new Error(String(error)))
    } finally {
      setIsLoadingRecipients(false)
    }
  }

  useEffect(() => {
    fetchCampaign()
  }, [campaignId])

  // Handle campaign deletion
  const handleDelete = async () => {
    if (!campaign) return
    if (!confirm(`Are you sure you want to delete the campaign "${campaign.name}"?`)) {
      return
    }

    try {
      const result = await deleteCampaign(campaign.id)
      if (result.success) {
        toast.success('Campaign deleted successfully')
        router.push('/admin/campaigns')
      } else {
        toast.error(result.error || 'Failed to delete campaign')
      }
    } catch (error) {
      logger.error('Failed to delete campaign', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to delete campaign')
    }
  }

  // Handle campaign cancellation
  const handleCancel = async () => {
    if (!campaign) return
    if (!confirm(`Are you sure you want to cancel the campaign "${campaign.name}"?`)) {
      return
    }

    try {
      const result = await cancelCampaign(campaign.id)
      if (result.success) {
        toast.success('Campaign cancelled successfully')
        fetchCampaign()
      } else {
        toast.error(result.error || 'Failed to cancel campaign')
      }
    } catch (error) {
      logger.error('Failed to cancel campaign', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to cancel campaign')
    }
  }

  // Get status badge
  const getStatusBadge = (status: CampaignStatus) => {
    const badges: Record<CampaignStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      DRAFT: { variant: 'secondary', label: 'Draft' },
      SCHEDULED: { variant: 'default', label: 'Scheduled' },
      SENDING: { variant: 'outline', label: 'Sending' },
      SENT: { variant: 'outline', label: 'Sent' },
      CANCELLED: { variant: 'destructive', label: 'Cancelled' }
    }
    const badge = badges[status]
    return <Badge variant={badge.variant}>{badge.label}</Badge>
  }

  // Get type icon
  const getTypeIcon = (type: CampaignType) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="w-5 h-5" />
      case 'SMS':
        return <MessageSquare className="w-5 h-5" />
      case 'BOTH':
        return <MailCheck className="w-5 h-5" />
    }
  }

  if (isLoading || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <NeonLoader size="md" color="cyan" text="Loading campaign..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              {getStatusBadge(campaign.status)}
            </div>
            {campaign.description && (
              <p className="text-muted-foreground mt-1">{campaign.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {campaign.status === 'DRAFT' && (
            <>
              <Button variant="outline" onClick={() => router.push(`/admin/campaigns/${campaign.id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </>
          )}
          {campaign.status === 'SCHEDULED' && (
            <Button variant="destructive" onClick={handleCancel}>
              <Ban className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          {(campaign.status === 'DRAFT' || campaign.status === 'CANCELLED') && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(campaign.type)}
                    <span className="font-medium">{campaign.type}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(campaign.status)}</div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="mt-1">{format(new Date(campaign.createdAt), 'MMM d, yyyy')}</p>
                </div>

                {campaign.scheduledDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Scheduled Date</p>
                    <p className="mt-1">{format(new Date(campaign.scheduledDate), 'MMM d, yyyy HH:mm')}</p>
                  </div>
                )}

                {campaign.sentDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sent Date</p>
                    <p className="mt-1">{format(new Date(campaign.sentDate), 'MMM d, yyyy HH:mm')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Message Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.subject && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Subject</p>
                  <p className="font-medium">{campaign.subject}</p>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Content</p>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">{campaign.content}</pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance (for sent campaigns) */}
          {campaign.status === 'SENT' && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>How your campaign performed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Send className="w-4 h-4" />
                      <span className="text-sm">Sent</span>
                    </div>
                    <p className="text-2xl font-bold">{campaign.sentCount.toLocaleString()}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Opened</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {campaign.sentCount > 0
                        ? ((campaign.openedCount / campaign.sentCount) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.openedCount.toLocaleString()} total
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MousePointerClick className="w-4 h-4" />
                      <span className="text-sm">Clicked</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {campaign.sentCount > 0
                        ? ((campaign.clickedCount / campaign.sentCount) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.clickedCount.toLocaleString()} total
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UserX className="w-4 h-4" />
                      <span className="text-sm">Unsubscribed</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {campaign.sentCount > 0
                        ? ((campaign.unsubscribeCount / campaign.sentCount) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.unsubscribeCount.toLocaleString()} total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Target Audience */}
          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Users className="w-5 h-5" />
                  <span className="text-2xl font-bold text-foreground">
                    {campaign.totalRecipients.toLocaleString()}
                  </span>
                  <span>recipients</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const audience = campaign.targetAudience as any
                return (
                  <>
                    {audience.loyaltyTiers && audience.loyaltyTiers.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Loyalty Tiers</p>
                        <div className="flex flex-wrap gap-2">
                          {audience.loyaltyTiers.map((tier: string) => (
                            <Badge key={tier} variant="outline">{tier}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {audience.marketingOptIn !== undefined && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Marketing Preference</p>
                        <Badge>{audience.marketingOptIn ? 'Opted In' : 'Opted Out'}</Badge>
                      </div>
                    )}

                    {(audience.minTotalSpent !== undefined || audience.maxTotalSpent !== undefined) && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Total Spent Range</p>
                        <p>
                          {audience.minTotalSpent !== undefined ? `${audience.minTotalSpent.toLocaleString()} RSD` : 'Any'} -{' '}
                          {audience.maxTotalSpent !== undefined ? `${audience.maxTotalSpent.toLocaleString()} RSD` : 'Any'}
                        </p>
                      </div>
                    )}

                    {(audience.minBookings !== undefined || audience.maxBookings !== undefined) && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Total Bookings Range</p>
                        <p>
                          {audience.minBookings !== undefined ? audience.minBookings : 'Any'} -{' '}
                          {audience.maxBookings !== undefined ? audience.maxBookings : 'Any'}
                        </p>
                      </div>
                    )}
                  </>
                )
              })()}

              <Separator />

              <Button
                variant="outline"
                className="w-full"
                onClick={fetchRecipients}
                disabled={isLoadingRecipients}
              >
                {isLoadingRecipients ? (
                  <NeonLoader size="sm" color="cyan" />
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    View Recipients
                  </>
                )}
              </Button>

              {recipients.length > 0 && (
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {recipients.map((recipient) => (
                    <div key={recipient.id} className="text-sm p-2 bg-muted rounded">
                      <p className="font-medium">{recipient.name || 'No name'}</p>
                      <p className="text-xs text-muted-foreground">{recipient.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

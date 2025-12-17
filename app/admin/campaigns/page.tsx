'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import {
  getCampaigns,
  getCampaignAnalytics,
  deleteCampaign,
  scheduleCampaign,
  cancelCampaign,
  type CampaignFilters
} from '@/app/actions/campaigns'
import {
  Plus,
  Search,
  Mail,
  MessageSquare,
  MailCheck,
  Calendar,
  Send,
  Ban,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  MousePointerClick,
  UserX
} from 'lucide-react'
import { format } from 'date-fns'
import type { Campaign, CampaignType, CampaignStatus } from '@prisma/client'
import { NeonLoader } from '@/components/common'

type CampaignListItem = Pick<Campaign, 'id' | 'name' | 'description' | 'type' | 'status' | 'subject' | 'scheduledDate' | 'sentDate' | 'totalRecipients' | 'sentCount' | 'openedCount' | 'clickedCount' | 'unsubscribeCount' | 'createdAt' | 'updatedAt'>

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<CampaignType | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'ALL'>('ALL')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0
  })

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      setIsLoading(true)
      const filters: CampaignFilters = {
        search: searchQuery || undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit
      }

      const result = await getCampaigns(filters)

      if (result.success && result.campaigns) {
        setCampaigns(result.campaigns as CampaignListItem[])
        setPagination(prev => ({
          ...prev,
          total: result.total || 0,
          totalPages: Math.ceil((result.total || 0) / prev.limit)
        }))
      } else {
        logger.error('Failed to fetch campaigns', new Error(result.error))
        toast.error(result.error || 'Failed to load campaigns')
      }
    } catch (error) {
      logger.error('Failed to fetch campaigns', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to load campaigns')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const result = await getCampaignAnalytics()
      if (result.success && result.analytics) {
        setAnalytics(result.analytics)
      }
    } catch (error) {
      logger.error('Failed to fetch analytics', error instanceof Error ? error : new Error(String(error)))
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [searchQuery, typeFilter, statusFilter, pagination.page])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  // Handle campaign deletion
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the campaign "${name}"?`)) {
      return
    }

    try {
      const result = await deleteCampaign(id)
      if (result.success) {
        toast.success('Campaign deleted successfully')
        fetchCampaigns()
        fetchAnalytics()
      } else {
        toast.error(result.error || 'Failed to delete campaign')
      }
    } catch (error) {
      logger.error('Failed to delete campaign', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to delete campaign')
    }
  }

  // Handle campaign cancellation
  const handleCancel = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to cancel the campaign "${name}"?`)) {
      return
    }

    try {
      const result = await cancelCampaign(id)
      if (result.success) {
        toast.success('Campaign cancelled successfully')
        fetchCampaigns()
        fetchAnalytics()
      } else {
        toast.error(result.error || 'Failed to cancel campaign')
      }
    } catch (error) {
      logger.error('Failed to cancel campaign', error instanceof Error ? error : new Error(String(error)))
      toast.error('Failed to cancel campaign')
    }
  }

  // Get status badge variant
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
        return <Mail className="w-4 h-4" />
      case 'SMS':
        return <MessageSquare className="w-4 h-4" />
      case 'BOTH':
        return <MailCheck className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage email and SMS marketing campaigns
          </p>
        </div>
        <Button onClick={() => router.push('/admin/campaigns/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.sentCampaigns} sent, {analytics.scheduledCampaigns} scheduled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Messages sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.openRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalOpened.toLocaleString()} opened
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.clickRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalClicked.toLocaleString()} clicked
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>Manage and track your marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as CampaignType | 'ALL')}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="BOTH">Both</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CampaignStatus | 'ALL')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="SENDING">Sending</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <NeonLoader size="md" color="cyan" text="Loading campaigns..." />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No campaigns found</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/campaigns/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first campaign
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Scheduled/Sent</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            {campaign.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {campaign.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(campaign.type)}
                            <span className="text-sm">{campaign.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {campaign.totalRecipients.toLocaleString()}
                            {campaign.status === 'SENT' && campaign.sentCount > 0 && (
                              <span className="text-muted-foreground">
                                {' '}({campaign.sentCount.toLocaleString()} sent)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {campaign.sentDate
                              ? format(new Date(campaign.sentDate), 'MMM d, yyyy')
                              : campaign.scheduledDate
                              ? format(new Date(campaign.scheduledDate), 'MMM d, yyyy')
                              : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {campaign.status === 'SENT' && campaign.sentCount > 0 ? (
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                                <span>
                                  {((campaign.openedCount / campaign.sentCount) * 100).toFixed(1)}% opened
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MousePointerClick className="w-3 h-3 text-muted-foreground" />
                                <span>
                                  {((campaign.clickedCount / campaign.sentCount) * 100).toFixed(1)}% clicked
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}>
                                <Edit className="w-4 h-4 mr-2" />
                                View/Edit
                              </DropdownMenuItem>
                              {campaign.status === 'DRAFT' && (
                                <DropdownMenuItem onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}>
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Schedule
                                </DropdownMenuItem>
                              )}
                              {campaign.status === 'SCHEDULED' && (
                                <DropdownMenuItem onClick={() => handleCancel(campaign.id, campaign.name)}>
                                  <Ban className="w-4 h-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(campaign.id, campaign.name)}
                                className="text-destructive"
                                disabled={campaign.status === 'SENT' || campaign.status === 'SENDING'}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} campaigns
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

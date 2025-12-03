'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/audit'
import { logger } from '@/lib/logger'
import type { CampaignType, CampaignStatus } from '@prisma/client'

/**
 * Campaign Management Server Actions
 *
 * Provides CRUD operations for marketing campaigns with:
 * - Email/SMS campaign management
 * - Target audience filtering
 * - Campaign scheduling
 * - Analytics tracking
 */

// ============================================================================
// Types
// ============================================================================

export interface CampaignFilters {
  search?: string
  type?: CampaignType | 'ALL'
  status?: CampaignStatus | 'ALL'
  limit?: number
  offset?: number
}

export interface CreateCampaignInput {
  name: string
  description?: string
  type: CampaignType
  subject?: string
  content: string
  targetAudience: {
    loyaltyTiers?: string[]
    marketingOptIn?: boolean
    tags?: string[]
    minTotalSpent?: number
    maxTotalSpent?: number
    minBookings?: number
    maxBookings?: number
  }
  scheduledDate?: Date
}

export interface UpdateCampaignInput extends Partial<CreateCampaignInput> {
  id: string
  status?: CampaignStatus
}

// ============================================================================
// Campaign CRUD Operations
// ============================================================================

/**
 * Get all campaigns with optional filtering
 */
export async function getCampaigns(filters: CampaignFilters = {}) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'USER') {
      return { success: false, error: 'Unauthorized' }
    }

    const {
      search,
      type,
      status,
      limit = 20,
      offset = 0
    } = filters

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (type && type !== 'ALL') {
      where.type = type
    }

    if (status && status !== 'ALL') {
      where.status = status
    }

    // Get campaigns with pagination
    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: [
          { status: 'asc' }, // DRAFT, SCHEDULED, SENDING, SENT, CANCELLED
          { scheduledDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          status: true,
          subject: true,
          targetAudience: true,
          scheduledDate: true,
          sentDate: true,
          totalRecipients: true,
          sentCount: true,
          openedCount: true,
          clickedCount: true,
          unsubscribeCount: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.campaign.count({ where })
    ])

    logger.db('Fetched campaigns', { count: campaigns.length, total, filters })
    return { success: true, campaigns, total }
  } catch (error) {
    logger.serverActionError('getCampaigns', error)
    return { success: false, error: 'Failed to fetch campaigns' }
  }
}

/**
 * Get a single campaign by ID
 */
export async function getCampaign(id: string) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'USER') {
      return { success: false, error: 'Unauthorized' }
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        status: true,
        subject: true,
        content: true,
        targetAudience: true,
        scheduledDate: true,
        sentDate: true,
        totalRecipients: true,
        sentCount: true,
        openedCount: true,
        clickedCount: true,
        unsubscribeCount: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!campaign) {
      return { success: false, error: 'Campaign not found' }
    }

    logger.db('Fetched campaign', { campaignId: id })
    return { success: true, campaign }
  } catch (error) {
    logger.serverActionError('getCampaign', error)
    return { success: false, error: 'Failed to fetch campaign' }
  }
}

/**
 * Create a new campaign
 */
export async function createCampaign(input: CreateCampaignInput) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'USER') {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate input
    if (!input.name || !input.type || !input.content) {
      return { success: false, error: 'Missing required fields' }
    }

    // Email campaigns require subject
    if (input.type !== 'SMS' && !input.subject) {
      return { success: false, error: 'Email campaigns require a subject' }
    }

    // Calculate recipient count based on target audience
    const recipientCount = await calculateRecipientCount(input.targetAudience)

    const campaign = await prisma.campaign.create({
      data: {
        name: input.name,
        description: input.description,
        type: input.type,
        subject: input.subject,
        content: input.content,
        targetAudience: input.targetAudience,
        scheduledDate: input.scheduledDate,
        totalRecipients: recipientCount,
        createdBy: session.user.id
      }
    })

    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'Campaign',
      entityId: campaign.id,
      changes: { name: input.name, type: input.type, status: 'DRAFT' }
    })

    logger.info('Campaign created', { campaignId: campaign.id, name: input.name })
    revalidatePath('/admin/campaigns')

    return { success: true, campaign }
  } catch (error) {
    logger.serverActionError('createCampaign', error)
    return { success: false, error: 'Failed to create campaign' }
  }
}

/**
 * Update an existing campaign
 */
export async function updateCampaign(input: UpdateCampaignInput) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'USER') {
      return { success: false, error: 'Unauthorized' }
    }

    const { id, ...updateData } = input

    // Fetch existing campaign
    const existing = await prisma.campaign.findUnique({
      where: { id },
      select: { status: true }
    })

    if (!existing) {
      return { success: false, error: 'Campaign not found' }
    }

    // Prevent editing campaigns that are already sent
    if (existing.status === 'SENT' || existing.status === 'SENDING') {
      return { success: false, error: 'Cannot edit campaigns that are sent or sending' }
    }

    // Recalculate recipient count if target audience changed
    let totalRecipients: number | undefined
    if (updateData.targetAudience) {
      totalRecipients = await calculateRecipientCount(updateData.targetAudience)
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...updateData,
        ...(totalRecipients !== undefined && { totalRecipients })
      }
    })

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Campaign',
      entityId: id,
      changes: updateData
    })

    logger.info('Campaign updated', { campaignId: id })
    revalidatePath('/admin/campaigns')
    revalidatePath(`/admin/campaigns/${id}`)

    return { success: true, campaign }
  } catch (error) {
    logger.serverActionError('updateCampaign', error)
    return { success: false, error: 'Failed to update campaign' }
  }
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(id: string) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Only super admins can delete campaigns' }
    }

    // Fetch campaign to check status
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { status: true, name: true }
    })

    if (!campaign) {
      return { success: false, error: 'Campaign not found' }
    }

    // Prevent deleting sent campaigns
    if (campaign.status === 'SENT' || campaign.status === 'SENDING') {
      return { success: false, error: 'Cannot delete campaigns that are sent or sending' }
    }

    await prisma.campaign.delete({ where: { id } })

    await logAudit({
      userId: session.user.id,
      action: 'DELETE',
      entity: 'Campaign',
      entityId: id,
      changes: { name: campaign.name }
    })

    logger.info('Campaign deleted', { campaignId: id })
    revalidatePath('/admin/campaigns')

    return { success: true }
  } catch (error) {
    logger.serverActionError('deleteCampaign', error)
    return { success: false, error: 'Failed to delete campaign' }
  }
}

/**
 * Schedule a campaign for sending
 */
export async function scheduleCampaign(id: string, scheduledDate: Date) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'USER') {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate scheduled date is in the future
    if (scheduledDate <= new Date()) {
      return { success: false, error: 'Scheduled date must be in the future' }
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        status: 'SCHEDULED',
        scheduledDate
      }
    })

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Campaign',
      entityId: id,
      changes: { status: 'SCHEDULED', scheduledDate }
    })

    logger.info('Campaign scheduled', { campaignId: id, scheduledDate })
    revalidatePath('/admin/campaigns')
    revalidatePath(`/admin/campaigns/${id}`)

    return { success: true, campaign }
  } catch (error) {
    logger.serverActionError('scheduleCampaign', error)
    return { success: false, error: 'Failed to schedule campaign' }
  }
}

/**
 * Cancel a scheduled campaign
 */
export async function cancelCampaign(id: string) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'USER') {
      return { success: false, error: 'Unauthorized' }
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: { status: 'CANCELLED' }
    })

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Campaign',
      entityId: id,
      changes: { status: 'CANCELLED' }
    })

    logger.info('Campaign cancelled', { campaignId: id })
    revalidatePath('/admin/campaigns')
    revalidatePath(`/admin/campaigns/${id}`)

    return { success: true, campaign }
  } catch (error) {
    logger.serverActionError('cancelCampaign', error)
    return { success: false, error: 'Failed to cancel campaign' }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate the number of recipients based on target audience filters
 */
async function calculateRecipientCount(targetAudience: CreateCampaignInput['targetAudience']): Promise<number> {
  try {
    const where: any = {}

    // Filter by loyalty tiers
    if (targetAudience.loyaltyTiers && targetAudience.loyaltyTiers.length > 0) {
      where.loyaltyTier = { in: targetAudience.loyaltyTiers }
    }

    // Filter by marketing opt-in status
    if (targetAudience.marketingOptIn !== undefined) {
      where.marketingOptIn = targetAudience.marketingOptIn
    }

    // Filter by tags
    if (targetAudience.tags && targetAudience.tags.length > 0) {
      where.tags = { hasSome: targetAudience.tags }
    }

    // Filter by total spent
    if (targetAudience.minTotalSpent !== undefined || targetAudience.maxTotalSpent !== undefined) {
      where.totalSpent = {}
      if (targetAudience.minTotalSpent !== undefined) {
        where.totalSpent.gte = targetAudience.minTotalSpent
      }
      if (targetAudience.maxTotalSpent !== undefined) {
        where.totalSpent.lte = targetAudience.maxTotalSpent
      }
    }

    // Filter by total bookings
    if (targetAudience.minBookings !== undefined || targetAudience.maxBookings !== undefined) {
      where.totalBookings = {}
      if (targetAudience.minBookings !== undefined) {
        where.totalBookings.gte = targetAudience.minBookings
      }
      if (targetAudience.maxBookings !== undefined) {
        where.totalBookings.lte = targetAudience.maxBookings
      }
    }

    const count = await prisma.user.count({ where })
    return count
  } catch (error) {
    logger.error('Failed to calculate recipient count', error instanceof Error ? error : new Error(String(error)))
    return 0
  }
}

/**
 * Get recipients for a campaign based on target audience
 */
export async function getCampaignRecipients(id: string) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'USER') {
      return { success: false, error: 'Unauthorized' }
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { targetAudience: true }
    })

    if (!campaign) {
      return { success: false, error: 'Campaign not found' }
    }

    const targetAudience = campaign.targetAudience as CreateCampaignInput['targetAudience']
    const where: any = {}

    // Build same filters as calculateRecipientCount
    if (targetAudience.loyaltyTiers && targetAudience.loyaltyTiers.length > 0) {
      where.loyaltyTier = { in: targetAudience.loyaltyTiers }
    }

    if (targetAudience.marketingOptIn !== undefined) {
      where.marketingOptIn = targetAudience.marketingOptIn
    }

    if (targetAudience.tags && targetAudience.tags.length > 0) {
      where.tags = { hasSome: targetAudience.tags }
    }

    if (targetAudience.minTotalSpent !== undefined || targetAudience.maxTotalSpent !== undefined) {
      where.totalSpent = {}
      if (targetAudience.minTotalSpent !== undefined) {
        where.totalSpent.gte = targetAudience.minTotalSpent
      }
      if (targetAudience.maxTotalSpent !== undefined) {
        where.totalSpent.lte = targetAudience.maxTotalSpent
      }
    }

    if (targetAudience.minBookings !== undefined || targetAudience.maxBookings !== undefined) {
      where.totalBookings = {}
      if (targetAudience.minBookings !== undefined) {
        where.totalBookings.gte = targetAudience.minBookings
      }
      if (targetAudience.maxBookings !== undefined) {
        where.totalBookings.lte = targetAudience.maxBookings
      }
    }

    const recipients = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        loyaltyTier: true,
        totalSpent: true,
        totalBookings: true,
        marketingOptIn: true,
        smsOptIn: true
      }
    })

    logger.db('Fetched campaign recipients', { campaignId: id, count: recipients.length })
    return { success: true, recipients }
  } catch (error) {
    logger.serverActionError('getCampaignRecipients', error)
    return { success: false, error: 'Failed to fetch recipients' }
  }
}

/**
 * Get campaign analytics summary
 */
export async function getCampaignAnalytics() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'USER') {
      return { success: false, error: 'Unauthorized' }
    }

    const [totalCampaigns, sentCampaigns, scheduledCampaigns, draftCampaigns] = await Promise.all([
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'SENT' } }),
      prisma.campaign.count({ where: { status: 'SCHEDULED' } }),
      prisma.campaign.count({ where: { status: 'DRAFT' } })
    ])

    // Get aggregate stats for sent campaigns
    const sentStats = await prisma.campaign.aggregate({
      where: { status: 'SENT' },
      _sum: {
        totalRecipients: true,
        sentCount: true,
        openedCount: true,
        clickedCount: true,
        unsubscribeCount: true
      }
    })

    const analytics = {
      totalCampaigns,
      sentCampaigns,
      scheduledCampaigns,
      draftCampaigns,
      totalRecipients: sentStats._sum.totalRecipients || 0,
      totalSent: sentStats._sum.sentCount || 0,
      totalOpened: sentStats._sum.openedCount || 0,
      totalClicked: sentStats._sum.clickedCount || 0,
      totalUnsubscribed: sentStats._sum.unsubscribeCount || 0,
      openRate: sentStats._sum.sentCount
        ? ((sentStats._sum.openedCount || 0) / sentStats._sum.sentCount) * 100
        : 0,
      clickRate: sentStats._sum.sentCount
        ? ((sentStats._sum.clickedCount || 0) / sentStats._sum.sentCount) * 100
        : 0,
      unsubscribeRate: sentStats._sum.sentCount
        ? ((sentStats._sum.unsubscribeCount || 0) / sentStats._sum.sentCount) * 100
        : 0
    }

    logger.db('Fetched campaign analytics', analytics)
    return { success: true, analytics }
  } catch (error) {
    logger.serverActionError('getCampaignAnalytics', error)
    return { success: false, error: 'Failed to fetch analytics' }
  }
}

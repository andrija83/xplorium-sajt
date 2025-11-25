'use server'

import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { logger } from '@/lib/logger'
import { requireAdmin } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { updateContentSchema, type UpdateContentInput } from '@/lib/validations'
import { type ContentStatus } from '@/types'
import type { Prisma } from '@prisma/client'

/**
 * Get content by section
 * @param section - Section name ('cafe', 'sensory', 'igraonica')
 * @returns Content data
 */
export async function getContentBySection(section: 'cafe' | 'sensory' | 'igraonica') {
  try {
    // Require admin role for content management
    await requireAdmin()

    const content = await prisma.siteContent.findUnique({
      where: { section },
    })

    if (!content) {
      return { error: 'Content not found' }
    }

    return { success: true, content }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Unauthorized' }
  }
}

/**
 * Update content for a section
 * @param data - Section name and content data
 * @returns Updated content
 */
export async function updateContent(data: UpdateContentInput) {
  try {
    // Require admin role for content updates
    const session = await requireAdmin()

    // Validate input
    const validatedData = updateContentSchema.parse(data)

    const existing = await prisma.siteContent.findUnique({
      where: { section: validatedData.section },
    })

    const nextStatus: ContentStatus = (validatedData.status as ContentStatus) || existing?.status || 'DRAFT'
    const nextVersion = existing ? (existing.version || 1) + 1 : 1

    // Update or create content
    const content = await prisma.siteContent.upsert({
      where: { section: validatedData.section },
      update: {
        content: validatedData.content as Prisma.InputJsonValue,
        updatedBy: session.user.id,
        status: nextStatus,
        version: nextVersion,
      },
      create: {
        section: validatedData.section,
        content: validatedData.content as Prisma.InputJsonValue,
        updatedBy: session.user.id,
        status: nextStatus,
        version: nextVersion,
      },
    })

    // Create immutable version snapshot
    await prisma.siteContentVersion.create({
      data: {
        section: validatedData.section,
        version: nextVersion,
        status: nextStatus,
        content: validatedData.content as Prisma.InputJsonValue,
        createdBy: session.user.id,
        siteContentId: content.id,
      },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Content',
      entityId: validatedData.section,
      changes: {
        content: validatedData.content,
        status: nextStatus,
        version: nextVersion,
      },
    })

    // Revalidate the public page for this section
    revalidatePath('/')
    revalidatePath('/admin/content')
    revalidatePath(`/admin/content/${validatedData.section}`)

    return {
      success: true,
      content,
      message: 'Content updated successfully',
    }
  } catch (error) {
    logger.serverActionError('updateContent', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to update content',
    }
  }
}

/**
 * Get content version history for a section
 */
export async function getContentHistory(section: 'cafe' | 'sensory' | 'igraonica') {
  try {
    await requireAdmin()

    const versions = await prisma.siteContentVersion.findMany({
      where: { section },
      orderBy: { version: 'desc' },
      take: 10,
      select: {
        id: true,
        version: true,
        status: true,
        createdAt: true,
        createdBy: true,
      },
    })

    return { success: true, versions }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Unauthorized' }
  }
}

/**
 * Publish current content - promote to PUBLISHED with a new version snapshot
 */
export async function publishContent(section: 'cafe' | 'sensory' | 'igraonica') {
  try {
    const session = await requireAdmin()

    const current = await prisma.siteContent.findUnique({ where: { section } })
    if (!current) {
      return { success: false, error: 'Content not found' }
    }

    const nextVersion = (current.version || 1) + 1

    const updated = await prisma.siteContent.update({
      where: { section },
      data: {
        status: 'PUBLISHED',
        version: nextVersion,
        updatedBy: session.user.id,
      },
    })

    await prisma.siteContentVersion.create({
      data: {
        section,
        version: nextVersion,
        status: 'PUBLISHED',
        content: current.content as Prisma.InputJsonValue,
        createdBy: session.user.id,
        siteContentId: current.id,
      },
    })

    await logAudit({
      userId: session.user.id,
      action: 'PUBLISH',
      entity: 'Content',
      entityId: section,
      changes: {
        status: 'PUBLISHED',
        version: nextVersion,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin/content')
    revalidatePath(`/admin/content/${section}`)

    return { success: true, content: updated }
  } catch (error) {
    logger.serverActionError('publishContent', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to publish content',
    }
  }
}

/**
 * Roll back content to a previous version (creates a new draft version)
 */
export async function revertContentVersion(section: 'cafe' | 'sensory' | 'igraonica', targetVersion: number) {
  try {
    const session = await requireAdmin()

    const snapshot = await prisma.siteContentVersion.findUnique({
      where: { section_version: { section, version: targetVersion } },
    })

    if (!snapshot) {
      return { success: false, error: 'Version not found' }
    }

    const current = await prisma.siteContent.findUnique({ where: { section } })
    const nextVersion = current ? (current.version || 1) + 1 : targetVersion + 1

    const content = await prisma.siteContent.upsert({
      where: { section },
      update: {
        content: snapshot.content as Prisma.InputJsonValue,
        status: 'DRAFT',
        version: nextVersion,
        updatedBy: session.user.id,
      },
      create: {
        section,
        content: snapshot.content as Prisma.InputJsonValue,
        status: 'DRAFT',
        version: nextVersion,
        updatedBy: session.user.id,
      },
    })

    await prisma.siteContentVersion.create({
      data: {
        section,
        version: nextVersion,
        status: 'DRAFT',
        content: snapshot.content as Prisma.InputJsonValue,
        createdBy: session.user.id,
        siteContentId: content.id,
      },
    })

    await logAudit({
      userId: session.user.id,
      action: 'ROLLBACK',
      entity: 'Content',
      entityId: section,
      changes: {
        revertedTo: targetVersion,
        newVersion: nextVersion,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin/content')
    revalidatePath(`/admin/content/${section}`)

    return { success: true, content }
  } catch (error) {
    logger.serverActionError('rollbackContent', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to rollback content',
    }
  }
}

/**
 * Get all site content
 * @returns All content sections
 */
export async function getAllContent() {
  try {
    // Require admin role for content management
    await requireAdmin()

    const content = await prisma.siteContent.findMany({
      orderBy: {
        section: 'asc',
      },
      select: {
        id: true,
        section: true,
        updatedAt: true,
        updatedBy: true,
        status: true,
        version: true,
      },
    })

    return { success: true, content }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Unauthorized' }
  }
}

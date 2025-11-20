'use server'

import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { requireAdmin } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { updateContentSchema, type UpdateContentInput } from '@/lib/validations'
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

    // Update or create content
    const content = await prisma.siteContent.upsert({
      where: { section: validatedData.section },
      update: {
        content: validatedData.content as Prisma.InputJsonValue,
        updatedBy: session.user.id,
      },
      create: {
        section: validatedData.section,
        content: validatedData.content as Prisma.InputJsonValue,
        updatedBy: session.user.id,
      },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Content',
      entityId: validatedData.section,
      changes: validatedData.content,
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
    console.error('Update content error:', error)

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
    })

    return { success: true, content }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Unauthorized' }
  }
}

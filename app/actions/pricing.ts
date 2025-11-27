'use server'

import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { logger } from '@/lib/logger'
import { requireAdmin } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { sanitizeErrorForClient } from '@/lib/sanitize'
import {
  createPricingSchema,
  updatePricingSchema,
  type CreatePricingInput,
  type UpdatePricingInput,
} from '@/lib/validations/pricing'

// ============================================
// QUERIES
// ============================================

/**
 * Get all pricing packages with optional filtering (Admin only)
 */
export async function getPricingPackages({
  status,
  category,
  limit = 50,
  offset = 0,
}: {
  status?: string
  category?: string
  limit?: number
  offset?: number
} = {}) {
  try {
    await requireAdmin()

    const packages = await prisma.pricingPackage.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(category && { category: category as any }),
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      skip: offset,
    })

    return { success: true, packages }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Unauthorized' }
  }
}

/**
 * Get a single pricing package by ID (Admin only)
 */
export async function getPricingPackageById(id: string) {
  try {
    await requireAdmin()

    const package_ = await prisma.pricingPackage.findUnique({
      where: { id },
    })

    if (!package_) {
      return { success: false, error: 'Pricing package not found' }
    }

    return { success: true, package: package_ }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Unauthorized' }
  }
}

/**
 * Get published pricing packages for public display
 */
export async function getPublishedPricingPackages(category?: string) {
  const packages = await prisma.pricingPackage.findMany({
    where: {
      status: 'PUBLISHED',
      ...(category && { category: category as any }),
    },
    orderBy: [{ order: 'asc' }, { popular: 'desc' }],
  })

  return { success: true, packages }
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new pricing package
 */
export async function createPricingPackage(data: CreatePricingInput) {
  logger.debug('createPricingPackage called', { data })

  try {
    logger.debug('Checking authorization...')
    const session = await requireAdmin()
    logger.debug('User authorized', { email: session.user.email })

    // Validate input
    logger.debug('Validating data with schema')
    const validatedData = createPricingSchema.parse(data)
    logger.debug('Validation passed', { validatedData })

    // Get max order for new package
    logger.db('Getting max order for category', { category: validatedData.category })
    const maxOrder = await prisma.pricingPackage.findFirst({
      where: { category: validatedData.category },
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    logger.db('Max order found', { order: maxOrder?.order || 0 })

    // Create package
    logger.db('Creating package in database')
    const package_ = await prisma.pricingPackage.create({
      data: {
        ...validatedData,
        order: (maxOrder?.order || 0) + 1,
      },
    })
    logger.info('Package created successfully', { id: package_.id, name: package_.name })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'PricingPackage',
      entityId: package_.id,
      changes: validatedData,
    })

    revalidatePath('/admin/pricing')
    revalidatePath('/', 'page')

    return {
      success: true,
      package: package_,
      message: 'Pricing package created successfully',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Pricing package validation failed', { errors: error.errors })
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    logger.serverActionError('createPricingPackage', error)
    return {
      success: false,
      error: sanitizeErrorForClient(error),
    }
  }
}

/**
 * Update a pricing package
 */
export async function updatePricingPackage(id: string, data: UpdatePricingInput) {
  try {
    const session = await requireAdmin()

    // Validate input
    const validatedData = updatePricingSchema.parse(data)

    // Update package
    const package_ = await prisma.pricingPackage.update({
      where: { id },
      data: validatedData,
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'PricingPackage',
      entityId: id,
      changes: validatedData,
    })

    revalidatePath('/admin/pricing')
    revalidatePath(`/admin/pricing/${id}`)
    revalidatePath('/', 'page')

    return {
      success: true,
      package: package_,
      message: 'Pricing package updated successfully',
    }
  } catch (error) {
    logger.serverActionError('updatePricingPackage', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: 'Failed to update pricing package',
    }
  }
}

/**
 * Delete a pricing package
 */
export async function deletePricingPackage(id: string) {
  try {
    const session = await requireAdmin()

    await prisma.pricingPackage.delete({
      where: { id },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'DELETE',
      entity: 'PricingPackage',
      entityId: id,
    })

    revalidatePath('/admin/pricing')
    revalidatePath('/', 'page')

    return {
      success: true,
      message: 'Pricing package deleted successfully',
    }
  } catch (error) {
    logger.serverActionError('deletePricingPackage', error)
    return {
      success: false,
      error: 'Failed to delete pricing package',
    }
  }
}

/**
 * Reorder pricing packages (drag and drop)
 */
export async function reorderPricingPackages(packageIds: string[]) {
  try {
    const session = await requireAdmin()

    // Update each package's order
    await Promise.all(
      packageIds.map((id, index) =>
        prisma.pricingPackage.update({
          where: { id },
          data: { order: index },
        })
      )
    )

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'PricingPackage',
      entityId: 'multiple',
      changes: { newOrder: packageIds },
    })

    revalidatePath('/admin/pricing')
    revalidatePath('/', 'page')

    return {
      success: true,
      message: 'Pricing packages reordered successfully',
    }
  } catch (error) {
    logger.serverActionError('reorderPricingPackages', error)
    return {
      success: false,
      error: 'Failed to reorder pricing packages',
    }
  }
}

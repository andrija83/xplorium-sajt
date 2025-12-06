'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { logAudit } from '@/lib/audit'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import {
  createUserSchema,
  updateUserRoleSchema,
  toggleUserBlockSchema,
  type CreateUserInput,
  type UpdateUserRoleInput,
  type ToggleUserBlockInput,
} from '@/lib/validations'

/**
 * Get all users with optional filtering
 * @param filters - Filter options
 * @returns Array of users
 */
export async function getUsers({
  role,
  blocked,
  search,
  includeDeleted = false,
  limit = 50,
  offset = 0,
}: {
  role?: string
  blocked?: boolean
  search?: string
  includeDeleted?: boolean
  limit?: number
  offset?: number
} = {}) {
  const session = await auth()

  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: 'Unauthorized' }
  }

  const where = {
    // Filter out deleted users by default unless explicitly requested
    deleted: includeDeleted ? undefined : false,
    ...(role && { role: role as any }),
    ...(blocked !== undefined && { blocked }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        blocked: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        // CRM & Loyalty fields
        loyaltyPoints: true,
        loyaltyTier: true,
        totalSpent: true,
        phone: true,
        preferredContactMethod: true,
        marketingOptIn: true,
        smsOptIn: true,
        totalBookings: true,
        lastBookingDate: true,
        firstBookingDate: true,
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    }),
    prisma.user.count({ where }),
  ])

  return { success: true, users, total }
}

/**
 * Get a single user by ID
 * @param id - User ID
 * @returns User data
 */
export async function getUserById(id: string) {
  const session = await auth()

  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: 'Unauthorized' }
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      blocked: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      // Customer/CRM fields
      phone: true,
      loyaltyPoints: true,
      loyaltyTier: true,
      totalSpent: true,
      totalBookings: true,
      firstBookingDate: true,
      lastBookingDate: true,
      customerNotes: true,
      tags: true,
      preferredContactMethod: true,
      preferredTypes: true,
      marketingOptIn: true,
      smsOptIn: true,
      bookings: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      auditLogs: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  })

  if (!user) {
    return { error: 'User not found' }
  }

  return { success: true, user }
}

/**
 * Create a new user (admin or regular user)
 * @param data - User data
 * @returns Created user
 */
export async function createUser(data: CreateUserInput) {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    // Only SUPER_ADMIN can create other SUPER_ADMIN users
    if (data.role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { error: 'Only super admins can create other super admin accounts' }
    }

    // Validate input
    const validatedData = createUserSchema.parse(data)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return { error: 'User with this email already exists' }
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      changes: { email: user.email, name: user.name, role: user.role },
    })

    revalidatePath('/admin/users')

    return {
      success: true,
      user,
      message: 'User created successfully',
    }
  } catch (error) {
    logger.serverActionError('createUser', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to create user',
    }
  }
}

/**
 * Update a user's role
 * @param data - User ID and new role
 * @returns Updated user
 */
export async function updateUserRole(data: UpdateUserRoleInput) {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validatedData = updateUserRoleSchema.parse(data)

    // Prevent changing own role
    if (validatedData.userId === session.user.id) {
      return { error: 'You cannot change your own role' }
    }

    // Only SUPER_ADMIN can create/modify SUPER_ADMIN users
    if (
      validatedData.role === 'SUPER_ADMIN' &&
      session.user.role !== 'SUPER_ADMIN'
    ) {
      return { error: 'Only super admins can assign the super admin role' }
    }

    // Get original user for audit log
    const originalUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { role: true },
    })

    if (!originalUser) {
      return { error: 'User not found' }
    }

    // Prevent modifying SUPER_ADMIN users unless you're also SUPER_ADMIN
    if (
      originalUser.role === 'SUPER_ADMIN' &&
      session.user.role !== 'SUPER_ADMIN'
    ) {
      return { error: 'Only super admins can modify super admin accounts' }
    }

    // Update user role
    const user = await prisma.user.update({
      where: { id: validatedData.userId },
      data: { role: validatedData.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: validatedData.userId,
      changes: { role: { from: originalUser.role, to: validatedData.role } },
    })

    revalidatePath('/admin/users')
    revalidatePath(`/admin/users/${validatedData.userId}`)

    return {
      success: true,
      user,
      message: 'User role updated successfully',
    }
  } catch (error) {
    logger.serverActionError('updateUserRole', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to update user role',
    }
  }
}

/**
 * Toggle a user's blocked status
 * @param data - User ID
 * @returns Updated user
 */
export async function toggleUserBlock(data: ToggleUserBlockInput) {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validatedData = toggleUserBlockSchema.parse(data)

    // Prevent blocking yourself
    if (validatedData.userId === session.user.id) {
      return { error: 'You cannot block your own account' }
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { blocked: true, role: true },
    })

    if (!currentUser) {
      return { error: 'User not found' }
    }

    // Prevent blocking SUPER_ADMIN users unless you're also SUPER_ADMIN
    if (currentUser.role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { error: 'Only super admins can block super admin accounts' }
    }

    // Toggle blocked status
    const user = await prisma.user.update({
      where: { id: validatedData.userId },
      data: { blocked: !currentUser.blocked },
      select: {
        id: true,
        email: true,
        name: true,
        blocked: true,
      },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: validatedData.userId,
      changes: { blocked: user.blocked },
    })

    revalidatePath('/admin/users')
    revalidatePath(`/admin/users/${validatedData.userId}`)

    return {
      success: true,
      user,
      message: user.blocked ? 'User blocked successfully' : 'User unblocked successfully',
    }
  } catch (error) {
    logger.serverActionError('toggleUserBlock', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to toggle user block status',
    }
  }
}

/**
 * Soft delete a user account
 * Marks user as deleted and anonymizes email to prevent conflicts
 * Preserves all related records for data integrity
 * @param id - User ID
 * @returns Success status
 */
export async function deleteUser(id: string) {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    // Prevent deleting yourself
    if (id === session.user.id) {
      return { error: 'You cannot delete your own account' }
    }

    // Get user with related records count
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: {
        role: true,
        email: true,
        name: true,
        deleted: true,
        _count: {
          select: {
            bookings: true,
            notifications: true,
            auditLogs: true,
          }
        }
      },
    })

    if (!userToDelete) {
      return { error: 'User not found' }
    }

    if (userToDelete.deleted) {
      return { error: 'User is already deleted' }
    }

    // Prevent deleting SUPER_ADMIN users unless you're also SUPER_ADMIN
    if (userToDelete.role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { error: 'Only super admins can delete super admin accounts' }
    }

    // Log related records for transparency
    logger.info('Deleting user with related records', {
      userId: id,
      email: userToDelete.email,
      bookingsCount: userToDelete._count.bookings,
      notificationsCount: userToDelete._count.notifications,
      auditLogsCount: userToDelete._count.auditLogs,
      performedBy: session.user.id,
    })

    // Soft delete: Mark as deleted and anonymize email
    await prisma.user.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
        originalEmail: userToDelete.email, // Store original email for audit
        // Anonymize email to prevent conflicts with new signups
        email: `deleted_${id}@deleted.local`,
        // Clear password hash for security
        password: '',
        // Keep name and other data for audit trail
      },
    })

    // Create detailed audit log
    await logAudit({
      userId: session.user.id,
      action: 'DELETE',
      entity: 'User',
      entityId: id,
      changes: {
        email: userToDelete.email,
        name: userToDelete.name,
        relatedRecords: {
          bookings: userToDelete._count.bookings,
          notifications: userToDelete._count.notifications,
          auditLogs: userToDelete._count.auditLogs,
        },
        deletedAt: new Date(),
      },
    })

    revalidatePath('/admin/users')

    const totalRelatedRecords = userToDelete._count.bookings + userToDelete._count.notifications + userToDelete._count.auditLogs

    return {
      success: true,
      message: `User deleted successfully. ${totalRelatedRecords} related record(s) preserved for data integrity.`,
    }
  } catch (error) {
    logger.serverActionError('deleteUser', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to delete user',
    }
  }
}

/**
 * Restore a soft-deleted user account
 * Only SUPER_ADMIN can restore users
 * @param id - User ID
 * @returns Success status
 */
export async function restoreUser(id: string) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return { error: 'Unauthorized - Super Admin access required' }
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        deleted: true,
        originalEmail: true,
        email: true,
        name: true,
      }
    })

    if (!user) {
      return { error: 'User not found' }
    }

    if (!user.deleted) {
      return { error: 'User is not deleted' }
    }

    // Check if original email is now taken by another active user
    if (user.originalEmail) {
      const emailConflict = await prisma.user.findFirst({
        where: {
          email: user.originalEmail,
          deleted: false,
          id: { not: id } // Exclude the user being restored
        }
      })

      if (emailConflict) {
        return {
          error: 'Cannot restore: Email address is now in use by another account',
        }
      }
    }

    // Restore user
    await prisma.user.update({
      where: { id },
      data: {
        deleted: false,
        deletedAt: null,
        deletedBy: null,
        // Restore original email if available
        email: user.originalEmail || user.email,
        originalEmail: null,
        // Note: Password remains cleared - user must reset password
      },
    })

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      changes: {
        restored: true,
        restoredBy: session.user.id,
        email: user.originalEmail,
      },
    })

    logger.info('User account restored', {
      userId: id,
      email: user.originalEmail,
      restoredBy: session.user.id,
    })

    revalidatePath('/admin/users')

    return {
      success: true,
      message: 'User restored successfully. They will need to reset their password.',
    }
  } catch (error) {
    logger.serverActionError('restoreUser', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to restore user',
    }
  }
}

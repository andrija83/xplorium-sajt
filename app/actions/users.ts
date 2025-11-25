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
  limit = 50,
  offset = 0,
}: {
  role?: string
  blocked?: boolean
  search?: string
  limit?: number
  offset?: number
} = {}) {
  const session = await auth()

  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: 'Unauthorized' }
  }

  const where = {
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
 * Delete a user
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

    // Get user to check role
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    })

    if (!userToDelete) {
      return { error: 'User not found' }
    }

    // Prevent deleting SUPER_ADMIN users unless you're also SUPER_ADMIN
    if (userToDelete.role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { error: 'Only super admins can delete super admin accounts' }
    }

    await prisma.user.delete({
      where: { id },
    })

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: 'DELETE',
      entity: 'User',
      entityId: id,
    })

    revalidatePath('/admin/users')

    return {
      success: true,
      message: 'User deleted successfully',
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

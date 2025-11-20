import { auth } from '@/lib/auth'
import type { Role } from '@prisma/client'

/**
 * Auth Utility Functions
 *
 * Centralized role-based authorization checks for server actions
 * Ensures consistent security implementation across the application
 */

/**
 * Require specific roles for an action
 * Throws error if user is not authenticated or doesn't have required role
 *
 * @param roles - Array of roles that are allowed
 * @returns Session object if authorized
 * @throws Error if unauthorized
 *
 * @example
 * const session = await requireRole(['ADMIN', 'SUPER_ADMIN'])
 */
export async function requireRole(roles: Role[]) {
  const session = await auth()

  if (!session) {
    throw new Error('Unauthorized: Not authenticated')
  }

  if (!roles.includes(session.user.role as Role)) {
    throw new Error(`Unauthorized: Requires one of roles: ${roles.join(', ')}`)
  }

  return session
}

/**
 * Require admin role (ADMIN or SUPER_ADMIN)
 * Convenience function for the most common authorization check
 *
 * @returns Session object if authorized
 * @throws Error if unauthorized
 *
 * @example
 * const session = await requireAdmin()
 */
export async function requireAdmin() {
  return requireRole(['ADMIN', 'SUPER_ADMIN'])
}

/**
 * Require super admin role
 * For critical operations that only super admins should perform
 *
 * @returns Session object if authorized
 * @throws Error if unauthorized
 *
 * @example
 * const session = await requireSuperAdmin()
 */
export async function requireSuperAdmin() {
  return requireRole(['SUPER_ADMIN'])
}

/**
 * Check if user has specific role
 * Returns boolean instead of throwing error
 *
 * @param roles - Array of roles to check
 * @returns True if user has one of the roles
 *
 * @example
 * const isAdmin = await hasRole(['ADMIN', 'SUPER_ADMIN'])
 */
export async function hasRole(roles: Role[]): Promise<boolean> {
  try {
    await requireRole(roles)
    return true
  } catch {
    return false
  }
}

/**
 * Check if user is admin
 * Convenience function that returns boolean
 *
 * @returns True if user is ADMIN or SUPER_ADMIN
 *
 * @example
 * const isAdmin = await isAdmin()
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(['ADMIN', 'SUPER_ADMIN'])
}

/**
 * Get current session or return null
 * Use when you need to check authentication without throwing error
 *
 * @returns Session object or null
 *
 * @example
 * const session = await getCurrentSession()
 * if (!session) return { error: 'Please sign in' }
 */
export async function getCurrentSession() {
  return await auth()
}

/**
 * Require authenticated user (any role)
 * For actions that require login but don't need specific role
 *
 * @returns Session object if authenticated
 * @throws Error if not authenticated
 *
 * @example
 * const session = await requireAuth()
 */
export async function requireAuth() {
  const session = await auth()

  if (!session) {
    throw new Error('Unauthorized: Authentication required')
  }

  return session
}

/**
 * Check if user is resource owner
 * Verifies if the authenticated user is the owner of a resource
 *
 * @param userId - ID of the resource owner
 * @returns True if current user is the owner
 *
 * @example
 * const session = await requireAuth()
 * if (!isResourceOwner(booking.userId)) {
 *   return { error: 'You can only modify your own bookings' }
 * }
 */
export async function isResourceOwner(userId: string): Promise<boolean> {
  const session = await getCurrentSession()
  return session?.user.id === userId
}

/**
 * Require resource ownership or admin role
 * User can access if they own the resource OR are an admin
 *
 * @param userId - ID of the resource owner
 * @returns Session object if authorized
 * @throws Error if unauthorized
 *
 * @example
 * const session = await requireOwnerOrAdmin(booking.userId)
 */
export async function requireOwnerOrAdmin(userId: string) {
  const session = await requireAuth()

  const isOwner = session.user.id === userId
  const isAdminRole = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)

  if (!isOwner && !isAdminRole) {
    throw new Error('Unauthorized: Must be resource owner or admin')
  }

  return session
}

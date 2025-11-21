import { prisma } from './db'
import { headers } from 'next/headers'
import { Prisma } from '@prisma/client'

/**
 * Log an admin action to the audit log
 * @param params - Audit log parameters
 */
export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  changes,
}: {
  userId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'PUBLISH' | 'ROLLBACK'
  entity: 'Event' | 'Booking' | 'User' | 'Content' | 'InventoryItem' | 'MaintenanceLog' | 'PricingPackage'
  entityId: string
  changes?: Record<string, any>
}) {
  try {
    // Get IP address and user agent from headers
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null
    const userAgent = headersList.get('user-agent') || null

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        changes: changes ? (changes as Prisma.InputJsonValue) : Prisma.DbNull,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main flow
    console.error('Failed to create audit log:', error)
  }
}

/**
 * Get audit logs with optional filtering
 * @param filters - Filter options
 * @returns Array of audit logs with total count
 */
export async function getAuditLogs({
  userId,
  entity,
  action,
  limit = 50,
  offset = 0,
}: {
  userId?: string
  entity?: string
  action?: string
  limit?: number
  offset?: number
} = {}) {
  const where = {
    ...(userId && { userId }),
    ...(entity && { entity }),
    ...(action && { action }),
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ])

  return { logs, total }
}

/**
 * Get audit logs for a specific entity
 * @param entity - Entity type
 * @param entityId - Entity ID
 * @returns Array of audit logs
 */
export async function getEntityAuditLogs(entity: string, entityId: string) {
  const logs = await prisma.auditLog.findMany({
    where: {
      entity,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return logs
}

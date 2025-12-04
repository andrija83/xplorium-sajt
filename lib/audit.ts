import { prisma } from './db'
import { headers } from 'next/headers'
import { Prisma } from '@prisma/client'

/**
 * List of sensitive field names that should be removed from audit logs
 * These fields commonly contain passwords, tokens, and other sensitive data
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'hashedPassword',
  'newPassword',
  'oldPassword',
  'currentPassword',
  'confirmPassword',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'secretKey',
  'apiSecret',
  'privateKey',
  'ssn',
  'socialSecurity',
  'creditCard',
  'cardNumber',
  'cvv',
  'pin',
  'bankAccount',
  'routingNumber',
]

/**
 * Recursively sanitizes an object by removing sensitive fields
 * @param obj - Object to sanitize
 * @returns Sanitized object with sensitive fields redacted
 */
function sanitizeAuditData(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeAuditData(item))
  }

  // Handle objects
  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase()

      // Check if the key matches any sensitive field pattern
      const isSensitive = SENSITIVE_FIELDS.some(
        sensitiveField => lowerKey.includes(sensitiveField.toLowerCase())
      )

      if (isSensitive) {
        // Redact sensitive fields
        sanitized[key] = '[REDACTED]'
      } else {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizeAuditData(value)
      }
    }

    return sanitized
  }

  // Return primitive values as-is
  return obj
}

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
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'PUBLISH' | 'ARCHIVE' | 'ROLLBACK' | 'EXPORT' | 'IMPORT' | 'RESTORE'
  entity: 'Event' | 'Booking' | 'User' | 'Content' | 'InventoryItem' | 'MaintenanceLog' | 'PricingPackage' | 'Campaign' | 'Settings' | 'System'
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
        changes: changes ? (sanitizeAuditData(changes) as Prisma.InputJsonValue) : Prisma.DbNull,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main flow
    const { logger } = await import('./logger')
    logger.error('Failed to create audit log', error instanceof Error ? error : new Error(String(error)))
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

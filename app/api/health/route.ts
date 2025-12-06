import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: {
      status: 'up' | 'down'
      latency?: number
      error?: string
    }
  }
}

/**
 * Health Check Endpoint
 *
 * GET /api/health
 *
 * Returns the health status of the application including:
 * - Overall status (healthy, degraded, unhealthy)
 * - Database connectivity and latency
 * - Application version and uptime
 *
 * Use cases:
 * - Load balancer health checks
 * - Kubernetes liveness/readiness probes
 * - Monitoring dashboards
 * - Uptime monitoring services
 */
export async function GET(): Promise<NextResponse<HealthStatus>> {
  const startTime = Date.now()

  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks: {
      database: {
        status: 'down',
      },
    },
  }

  // Check database connectivity
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - dbStart

    health.checks.database = {
      status: 'up',
      latency: dbLatency,
    }

    // Warn if database is slow (> 500ms)
    if (dbLatency > 500) {
      logger.warn('Database health check slow', { latency: dbLatency })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error'
    logger.error('Database health check failed', error instanceof Error ? error : new Error(errorMessage))

    health.checks.database = {
      status: 'down',
      error: process.env.NODE_ENV === 'development' ? errorMessage : 'Database connection failed',
    }
    health.status = 'unhealthy'
  }

  // Determine overall status
  const allChecksUp = Object.values(health.checks).every(check => check.status === 'up')
  if (!allChecksUp) {
    health.status = 'unhealthy'
  }

  // Return appropriate HTTP status code
  const httpStatus = health.status === 'healthy' ? 200 : 503

  // Log health check (debug level to avoid noise)
  logger.debug('Health check completed', {
    status: health.status,
    latency: Date.now() - startTime,
  })

  return NextResponse.json(health, { status: httpStatus })
}

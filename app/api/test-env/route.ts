import { NextResponse } from 'next/server'

/**
 * Test environment variables endpoint
 * GET /api/test-env
 *
 * Shows which environment variables are available (without showing values)
 */
export async function GET() {
  const envVars = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: !!process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
  }

  console.log('[TEST-ENV] Environment variables:', envVars)

  return NextResponse.json({
    message: 'Environment variables check',
    env: envVars,
    note: 'Boolean values indicate if the variable exists (not the actual value for security)',
  })
}

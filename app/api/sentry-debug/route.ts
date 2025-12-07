/**
 * Sentry Debug API Route
 *
 * Visit /api/sentry-debug to check Sentry configuration
 * This endpoint shows if Sentry is properly configured without actually sending errors
 */

import { NextResponse } from 'next/server'

export async function GET() {
  const debug = {
    nodeEnv: process.env.NODE_ENV,
    hasSentryDsn: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    sentryDsnPrefix: process.env.NEXT_PUBLIC_SENTRY_DSN?.substring(0, 20) + '...',
    hasSentryOrg: !!process.env.SENTRY_ORG,
    hasSentryProject: !!process.env.SENTRY_PROJECT,
    hasSentryAuthToken: !!process.env.SENTRY_AUTH_TOKEN,
    sentryOrg: process.env.SENTRY_ORG,
    sentryProject: process.env.SENTRY_PROJECT,
    // Check if Sentry SDK is loaded
    sentryLoaded: typeof global !== 'undefined' && 'Sentry' in (global as any),
  }

  return NextResponse.json({
    message: 'Sentry Configuration Debug',
    debug,
    instructions: {
      step1: 'Verify all flags are true',
      step2: 'If hasSentryDsn is false, NEXT_PUBLIC_SENTRY_DSN is missing from Vercel env vars',
      step3: 'If nodeEnv is not "production", Sentry is disabled by default',
      step4: 'SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN are for build-time source map upload',
    }
  })
}

/**
 * Force Sentry Test - Sends error directly without NextResponse wrapper
 */

import { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET(request: NextRequest) {
  console.log('=== SENTRY FORCE TEST ===')
  console.log('Sentry DSN:', process.env.NEXT_PUBLIC_SENTRY_DSN?.substring(0, 30) + '...')
  console.log('Node ENV:', process.env.NODE_ENV)

  // Force capture a message
  const messageId = Sentry.captureMessage('FORCE TEST: Sentry is alive!', 'error')
  console.log('Sentry Message ID:', messageId)

  // Force capture an exception
  const error = new Error('FORCE TEST: This is a forced server error')
  const exceptionId = Sentry.captureException(error)
  console.log('Sentry Exception ID:', exceptionId)

  // Flush to ensure it's sent immediately
  await Sentry.flush(2000)
  console.log('Sentry flushed')

  // Now throw to also test automatic capture
  throw new Error('FORCE TEST: Automatic capture test')
}

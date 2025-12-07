/**
 * Sentry Test API Route
 *
 * Visit /api/sentry-test to trigger a test error that will be sent to Sentry
 * This helps verify that Sentry is properly configured in production
 */

import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  try {
    // Capture a test message
    Sentry.captureMessage('Sentry Test: API route message', 'info')

    // Capture a test exception
    const testError = new Error('Sentry Test: This is a test error from the API route')
    Sentry.captureException(testError)

    // Also throw an error to test automatic error capture
    throw new Error('Sentry Test: Automatic error capture test')
  } catch (error) {
    // Sentry will automatically capture this
    return NextResponse.json({
      success: true,
      message: 'Test errors sent to Sentry! Check your Sentry dashboard.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

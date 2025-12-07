/**
 * Sentry Test Utility
 *
 * Use these functions to test Sentry integration
 * DO NOT use in production code
 */

import * as Sentry from "@sentry/nextjs";

export function testSentryError() {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Sentry test - throwing error');
    throw new Error('Sentry Test Error: This is a test error to verify Sentry integration');
  }
}

export function testSentryMessage() {
  Sentry.captureMessage('Sentry Test Message: Integration working!', 'info');
  console.log('Sentry test message sent');
}

export function testSentryException() {
  try {
    throw new Error('Sentry Test Exception: This is a caught exception');
  } catch (error) {
    Sentry.captureException(error);
    console.log('Sentry test exception captured');
  }
}

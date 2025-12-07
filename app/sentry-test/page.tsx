'use client'

/**
 * Sentry Test Page
 *
 * This page provides buttons to test different types of Sentry error capture:
 * - Client-side errors
 * - API route errors
 * - Manual error capture
 *
 * Visit /sentry-test to test Sentry integration
 * DELETE THIS PAGE after confirming Sentry works
 */

import { useState } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function SentryTestPage() {
  const [result, setResult] = useState<string>('')

  // Test 1: Throw a client-side error
  const testClientError = () => {
    console.log('=== CLIENT ERROR TEST ===')
    console.log('Sentry DSN configured:', !!process.env.NEXT_PUBLIC_SENTRY_DSN)
    console.log('Sentry object:', typeof Sentry)

    try {
      throw new Error('Sentry Test: Client-side error thrown')
    } catch (error) {
      const eventId = Sentry.captureException(error)
      console.log('Sentry Event ID:', eventId)
      Sentry.flush(2000).then(() => {
        console.log('Sentry flushed successfully')
        setResult(`✅ Client error sent to Sentry! Event ID: ${eventId}`)
      })
    }
  }

  // Test 2: Test API route error
  const testApiError = async () => {
    try {
      const response = await fetch('/api/sentry-test')
      const data = await response.json()
      setResult('✅ API error sent to Sentry! ' + data.message)
    } catch (error) {
      setResult('❌ Failed to call API: ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  // Test 3: Send a manual message
  const testMessage = () => {
    Sentry.captureMessage('Sentry Test: Manual test message from client', 'info')
    setResult('✅ Test message sent to Sentry!')
  }

  // Test 4: Trigger an unhandled error (will crash the component)
  const testUnhandledError = () => {
    // This will be caught by ErrorBoundary
    throw new Error('Sentry Test: Unhandled error for ErrorBoundary')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">⚠️ Sentry Test Page</h1>
          <p className="text-yellow-200">
            This page is for testing only. Delete it after confirming Sentry works.
          </p>
          <p className="text-yellow-200 text-sm mt-2">
            File: <code>app/sentry-test/page.tsx</code> and <code>app/api/sentry-test/route.ts</code>
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Test Sentry Error Tracking</h2>
            <p className="text-gray-400 mb-6">
              Click the buttons below to send test errors to Sentry. Then check your Sentry dashboard at:{' '}
              <a
                href="https://mycompany-qzw.sentry.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                mycompany-qzw.sentry.io
              </a>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Test 1 */}
            <button
              onClick={testClientError}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              1. Test Client Error
              <span className="block text-sm text-blue-200 mt-1">
                Captured client-side exception
              </span>
            </button>

            {/* Test 2 */}
            <button
              onClick={testApiError}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              2. Test API Error
              <span className="block text-sm text-purple-200 mt-1">
                Server-side API route error
              </span>
            </button>

            {/* Test 3 */}
            <button
              onClick={testMessage}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              3. Test Message
              <span className="block text-sm text-green-200 mt-1">
                Manual info message
              </span>
            </button>

            {/* Test 4 */}
            <button
              onClick={testUnhandledError}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              4. Test Unhandled Error
              <span className="block text-sm text-red-200 mt-1">
                Crashes component (ErrorBoundary)
              </span>
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="mt-6 p-4 bg-gray-700 rounded-lg border-l-4 border-cyan-400">
              <p className="text-white font-mono">{result}</p>
              <p className="text-gray-400 text-sm mt-2">
                Check your Sentry dashboard to see the captured error
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold mb-3 text-cyan-400">What to check in Sentry:</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">1.</span>
                <span>Go to Issues → you should see the test errors appear within ~30 seconds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">2.</span>
                <span>Click on an error to see the full stack trace with source maps</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">3.</span>
                <span>Check that the error includes environment info (production/preview)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">4.</span>
                <span>Verify session replay is captured (if error triggers during user interaction)</span>
              </li>
            </ul>
          </div>

          {/* Cleanup Instructions */}
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <h3 className="text-red-400 font-bold mb-2">🗑️ After Testing:</h3>
            <p className="text-red-200 text-sm">
              Delete these files to clean up:
            </p>
            <ul className="text-red-200 text-sm mt-2 font-mono">
              <li>• app/sentry-test/page.tsx</li>
              <li>• app/api/sentry-test/route.ts</li>
              <li>• lib/sentry-test.ts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

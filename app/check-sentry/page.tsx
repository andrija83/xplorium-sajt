'use client'

/**
 * Check Sentry Configuration Page
 * Displays the actual Sentry configuration in the browser
 */

import { useEffect, useState } from 'react'

export default function CheckSentryPage() {
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    // Check if Sentry is available
    const sentryHub = (window as any).__SENTRY__

    setConfig({
      sentryAvailable: !!sentryHub,
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      hub: sentryHub ? 'Initialized' : 'Not found',
      clients: sentryHub?.getStackTop?.()?.client ? 'Client exists' : 'No client'
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sentry Configuration Check</h1>

        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-cyan-400">Environment Variables</h2>
            <div className="font-mono text-sm space-y-2">
              <div>
                <span className="text-gray-400">NEXT_PUBLIC_SENTRY_DSN:</span>
                <br />
                <span className="text-white break-all">
                  {process.env.NEXT_PUBLIC_SENTRY_DSN || '❌ Not set'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h2 className="text-xl font-semibold mb-2 text-cyan-400">Runtime Configuration</h2>
            <pre className="bg-gray-900 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h2 className="text-xl font-semibold mb-2 text-cyan-400">What This Means</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className={config?.sentryAvailable ? 'text-green-400' : 'text-red-400'}>
                  {config?.sentryAvailable ? '✅' : '❌'}
                </span>
                <span>Sentry SDK loaded in browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={config?.dsn ? 'text-green-400' : 'text-red-400'}>
                  {config?.dsn ? '✅' : '❌'}
                </span>
                <span>DSN configured</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={config?.clients === 'Client exists' ? 'text-green-400' : 'text-red-400'}>
                  {config?.clients === 'Client exists' ? '✅' : '❌'}
                </span>
                <span>Sentry client initialized</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <a
            href="/simple-error"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Go to Simple Error Test →
          </a>
        </div>
      </div>
    </div>
  )
}

'use client'

/**
 * Super Simple Error Page - Just throws an error
 * This is the simplest possible test for Sentry
 */

import { useEffect } from 'react'

export default function SimpleErrorPage() {
  useEffect(() => {
    // Throw an error immediately when page loads
    throw new Error('Simple Test Error - If you see this in Sentry, it works!')
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Simple Error Test</h1>
        <p className="text-gray-400">This page throws an error on load.</p>
        <p className="text-gray-400">Check Sentry dashboard for the error.</p>
      </div>
    </div>
  )
}

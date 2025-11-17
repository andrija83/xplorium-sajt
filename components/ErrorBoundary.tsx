'use client'

import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree and displays
 * a fallback UI instead of crashing the entire application.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details to console (in production, send to error tracking service)
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    // Reset error state and attempt to recover
    this.setState({ hasError: false, error: null })

    // Reload the page to fully reset the app state
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black">
          <div className="text-center px-4 max-w-md">
            {/* Error Icon */}
            <div className="mb-6 inline-block">
              <svg
                className="w-20 h-20 text-pink-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-white text-2xl sm:text-3xl font-bold mb-4">
              Oops! Something went wrong
            </h1>

            <p className="text-white/70 text-sm sm:text-base mb-8">
              {process.env.NODE_ENV === 'development' && this.state.error
                ? `Error: ${this.state.error.message}`
                : "We're sorry for the inconvenience. Please try refreshing the page."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-pink-400/20 border-2 border-pink-400/50 rounded-lg text-pink-400 font-medium hover:bg-pink-400/30 transition-all"
                style={{ boxShadow: '0 0 15px rgba(236, 72, 153, 0.2)' }}
              >
                Return to Home
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-medium hover:bg-white/20 transition-all"
              >
                Reload Page
              </button>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-white/50 text-sm cursor-pointer hover:text-white/70 transition-colors">
                  Technical Details (Development Only)
                </summary>
                <pre className="mt-4 p-4 bg-white/5 rounded-lg text-xs text-white/70 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

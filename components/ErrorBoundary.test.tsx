import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error')
}

// Component that works fine
const NoError = () => <div>No error here</div>

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error
  beforeAll(() => {
    console.error = vi.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NoError />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error here')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
    expect(screen.getByText(/Return to Home/i)).toBeInTheDocument()
  })

  it('renders error message in development mode', () => {
    // Mock development environment
    vi.stubEnv('NODE_ENV', 'development')

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Test error')).toBeInTheDocument()

    // Restore environment
    vi.unstubAllEnvs()
  })
})

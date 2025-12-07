import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingSpinner />)
    // Check that the spinner exists (it's a div with rounded-full class)
    const spinner = container.querySelector('.rounded-full')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with text when provided', () => {
    render(<LoadingSpinner text="Loading..." />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('does not render text when not provided', () => {
    render(<LoadingSpinner />)
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    let spinner = document.querySelector('.w-6')
    expect(spinner).toBeInTheDocument()

    rerender(<LoadingSpinner size="md" />)
    spinner = document.querySelector('.w-12')
    expect(spinner).toBeInTheDocument()

    rerender(<LoadingSpinner size="lg" />)
    spinner = document.querySelector('.w-16')
    expect(spinner).toBeInTheDocument()
  })
})

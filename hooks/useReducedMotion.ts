import { useEffect, useState } from 'react'

/**
 * useReducedMotion Hook
 *
 * Detects if the user prefers reduced motion based on system settings
 * Uses window.matchMedia to check prefers-reduced-motion media query
 *
 * @returns {boolean} True if user prefers reduced motion, false otherwise
 *
 * @example
 * const prefersReducedMotion = useReducedMotion()
 * const animationDuration = prefersReducedMotion ? 0 : 0.5
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') return

    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Add event listener
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

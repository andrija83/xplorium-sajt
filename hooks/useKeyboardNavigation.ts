import { useEffect } from 'react'

/**
 * useKeyboardNavigation Hook
 *
 * Handles keyboard navigation events (Escape key to go back)
 * Sets up event listeners with proper cleanup
 *
 * @param {() => void} onEscape - Callback function when Escape key is pressed
 * @param {boolean} enabled - Whether keyboard navigation is enabled
 *
 * @example
 * useKeyboardNavigation(() => {
 *   console.log('Escape pressed!')
 *   goBack()
 * }, true)
 */
export const useKeyboardNavigation = (onEscape: () => void, enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onEscape()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onEscape, enabled])
}

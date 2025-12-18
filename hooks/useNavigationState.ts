import { useEffect } from 'react'
import { useNavigationStore } from '@/stores/navigationStore'

/**
 * useNavigationState Hook
 *
 * Wrapper hook that uses Zustand store for navigation state management with URL sync.
 * Provides the same API as before, but now uses global state + URL query params.
 *
 * Features:
 * - Syncs state with URL on mount (enables deep linking)
 * - Updates URL when navigation changes
 * - Supports browser back/forward buttons
 * - No prop drilling needed!
 *
 * @returns Object containing navigation state and handlers
 */
export function useNavigationState() {
  // Get all navigation state and actions from Zustand store
  const {
    activeView,
    sensorySubView,
    cafeSubView,
    setSensorySubView,
    setCafeSubView,
    navigateToSection,
    goBackToMenu,
    handleProfileClick,
    syncFromURL,
  } = useNavigationStore()

  // Sync from URL on mount (for deep linking)
  useEffect(() => {
    syncFromURL()
  }, [syncFromURL])

  return {
    // State
    activeView,
    sensorySubView,
    cafeSubView,

    // Setters (for subsection navigation within feature components)
    setSensorySubView,
    setCafeSubView,

    // Handlers
    navigateToSection,
    goBackToMenu,
    handleProfileClick,
  }
}

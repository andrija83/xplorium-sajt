import { useState, useCallback } from 'react'

/**
 * Navigation State Interface
 */
interface NavigationState {
  activeView: string | null
  cafeSubView: string | null
  sensorySubView: string | null
}

/**
 * Navigation Actions Interface
 */
interface NavigationActions {
  setActiveView: (view: string | null) => void
  setCafeSubView: (view: string | null) => void
  setSensorySubView: (view: string | null) => void
  goBack: () => void
  reset: () => void
}

/**
 * useNavigation Hook
 *
 * Manages navigation state across the application
 * Provides actions for navigating between sections and subsections
 *
 * @returns {NavigationState & NavigationActions} Navigation state and actions
 *
 * @example
 * const { activeView, setActiveView, goBack, reset } = useNavigation()
 *
 * // Navigate to a section
 * setActiveView('cafe')
 *
 * // Go back
 * goBack()
 *
 * // Reset all navigation
 * reset()
 */
export const useNavigation = (): NavigationState & NavigationActions => {
  const [activeView, setActiveView] = useState<string | null>(null)
  const [cafeSubView, setCafeSubView] = useState<string | null>(null)
  const [sensorySubView, setSensorySubView] = useState<string | null>(null)

  /**
   * Go back in navigation hierarchy
   * - If in subsection → go back to section
   * - If in section → go back to main menu
   */
  const goBack = useCallback(() => {
    // If in cafe subsection, go back to cafe main
    if (cafeSubView) {
      setCafeSubView(null)
      return
    }

    // If in sensory subsection, go back to sensory main
    if (sensorySubView) {
      setSensorySubView(null)
      return
    }

    // If in any main section, go back to menu
    if (activeView) {
      setActiveView(null)
      return
    }
  }, [activeView, cafeSubView, sensorySubView])

  /**
   * Reset all navigation to initial state
   */
  const reset = useCallback(() => {
    setActiveView(null)
    setCafeSubView(null)
    setSensorySubView(null)
  }, [])

  return {
    // State
    activeView,
    cafeSubView,
    sensorySubView,

    // Actions
    setActiveView,
    setCafeSubView,
    setSensorySubView,
    goBack,
    reset,
  }
}

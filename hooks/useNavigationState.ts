import { useState, useCallback } from 'react'

/**
 * useNavigationState Hook
 *
 * Manages navigation state for the Xplorium landing page
 * Handles main sections (cafe/discover/igraonica/profile) and their subsections
 *
 * @returns Object containing navigation state and handlers
 */
export function useNavigationState() {
  const [activeView, setActiveView] = useState<string | null>(null)
  const [sensorySubView, setSensorySubView] = useState<string | null>(null)
  const [cafeSubView, setCafeSubView] = useState<string | null>(null)

  /**
   * Navigate to a main section
   * Resets all subviews when navigating to a new section
   */
  const navigateToSection = useCallback((section: string) => {
    setActiveView(section)
    setSensorySubView(null)
    setCafeSubView(null)
  }, [])

  /**
   * Go back to previous view
   * - If in subview, goes back to section menu
   * - If in section, goes back to main menu
   */
  const goBackToMenu = useCallback(() => {
    if (sensorySubView) {
      setSensorySubView(null)
    } else if (cafeSubView) {
      setCafeSubView(null)
    } else {
      setActiveView(null)
    }
  }, [sensorySubView, cafeSubView])

  /**
   * Navigate to profile section
   */
  const handleProfileClick = useCallback(() => {
    setActiveView("profile")
    setSensorySubView(null)
    setCafeSubView(null)
  }, [])

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

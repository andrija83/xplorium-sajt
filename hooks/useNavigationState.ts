import { useNavigationStore } from '@/stores/navigationStore'

/**
 * useNavigationState Hook
 *
 * Wrapper hook that uses Zustand store for navigation state management.
 * Provides the same API as before, but now uses global state instead of local useState.
 *
 * This allows any component to access navigation without prop drilling!
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
  } = useNavigationStore()

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

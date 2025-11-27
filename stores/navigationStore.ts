/**
 * Navigation Store (Zustand)
 *
 * Global state management for landing page navigation.
 * Eliminates prop drilling by providing centralized navigation state.
 *
 * Usage:
 * ```tsx
 * import { useNavigationStore } from '@/stores/navigationStore'
 *
 * const { activeView, setCafeSubView } = useNavigationStore()
 * ```
 */

import { create } from 'zustand'

interface NavigationState {
  // Active main section
  activeView: string | null

  // Subsection states
  cafeSubView: string | null
  sensorySubView: string | null

  // Actions
  setActiveView: (view: string | null) => void
  setCafeSubView: (view: string | null) => void
  setSensorySubView: (view: string | null) => void

  // Navigation helpers (matching existing hook API)
  navigateToSection: (section: string) => void
  goBackToMenu: () => void
  handleProfileClick: () => void
  reset: () => void
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  // Initial state
  activeView: null,
  cafeSubView: null,
  sensorySubView: null,

  // Setters
  setActiveView: (view) => set({ activeView: view }),
  setCafeSubView: (view) => set({ cafeSubView: view }),
  setSensorySubView: (view) => set({ sensorySubView: view }),

  // Navigate to a main section (resets subsections)
  navigateToSection: (section) => set({
    activeView: section,
    cafeSubView: null,
    sensorySubView: null,
  }),

  // Go back one level in navigation hierarchy (matching existing hook behavior)
  goBackToMenu: () => {
    const { cafeSubView, sensorySubView } = get()

    // If in a subsection, go back to main section
    if (sensorySubView) {
      set({ sensorySubView: null })
    } else if (cafeSubView) {
      set({ cafeSubView: null })
    } else {
      // Go back to home (close section)
      set({ activeView: null })
    }
  },

  // Navigate to profile section (matching existing hook behavior)
  handleProfileClick: () => set({
    activeView: 'profile',
    cafeSubView: null,
    sensorySubView: null,
  }),

  // Reset all navigation state
  reset: () => set({
    activeView: null,
    cafeSubView: null,
    sensorySubView: null,
  }),
}))

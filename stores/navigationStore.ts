/**
 * Navigation Store (Zustand)
 *
 * Global state management for landing page navigation with URL sync.
 * Eliminates prop drilling by providing centralized navigation state.
 * Syncs navigation state with URL query params for deep linking and SEO.
 *
 * URL Structure:
 * - Home: `/`
 * - Section: `/?section=cafe`
 * - Subsection: `/?section=cafe&view=meni`
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

  // Internal flag to prevent URL update loops
  _isHydrating: boolean

  // Actions
  setActiveView: (view: string | null) => void
  setCafeSubView: (view: string | null) => void
  setSensorySubView: (view: string | null) => void

  // Navigation helpers (matching existing hook API)
  navigateToSection: (section: string) => void
  goBackToMenu: () => void
  handleProfileClick: () => void
  reset: () => void

  // URL sync
  syncFromURL: () => void
  _updateURL: (state: { activeView: string | null; cafeSubView: string | null; sensorySubView: string | null }) => void
}

/**
 * Sync state to URL query params
 */
function updateURL(activeView: string | null, cafeSubView: string | null, sensorySubView: string | null) {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams()

  if (activeView) {
    params.set('section', activeView)

    // Add subsection view if present
    if (cafeSubView) {
      params.set('view', cafeSubView)
    } else if (sensorySubView) {
      params.set('view', sensorySubView)
    }
  }

  // Build new URL
  const queryString = params.toString()
  const newURL = queryString ? `/?${queryString}` : '/'

  // Only update if URL actually changed
  if (window.location.pathname + window.location.search !== newURL) {
    window.history.pushState(null, '', newURL)
  }
}

/**
 * Parse URL query params into navigation state
 */
function parseURLParams(): { activeView: string | null; subView: string | null } {
  if (typeof window === 'undefined') {
    return { activeView: null, subView: null }
  }

  const params = new URLSearchParams(window.location.search)
  const section = params.get('section')
  const view = params.get('view')

  return {
    activeView: section,
    subView: view,
  }
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  // Initial state
  activeView: null,
  cafeSubView: null,
  sensorySubView: null,
  _isHydrating: false,

  // Sync state from URL (call on mount)
  syncFromURL: () => {
    const { activeView, subView } = parseURLParams()

    set({
      _isHydrating: true,
      activeView,
      cafeSubView: activeView === 'cafe' ? subView : null,
      sensorySubView: activeView === 'sensory' ? subView : null,
    })

    // Reset hydrating flag after a tick
    setTimeout(() => set({ _isHydrating: false }), 0)
  },

  // Internal URL updater
  _updateURL: (state) => {
    const { _isHydrating } = get()
    if (!_isHydrating) {
      updateURL(state.activeView, state.cafeSubView, state.sensorySubView)
    }
  },

  // Setters with URL sync
  setActiveView: (view) => {
    const newState = { activeView: view, cafeSubView: null, sensorySubView: null }
    set(newState)
    get()._updateURL(newState)
  },

  setCafeSubView: (view) => {
    const { activeView } = get()
    const newState = { activeView, cafeSubView: view, sensorySubView: null }
    set({ cafeSubView: view })
    get()._updateURL(newState)
  },

  setSensorySubView: (view) => {
    const { activeView } = get()
    const newState = { activeView, cafeSubView: null, sensorySubView: view }
    set({ sensorySubView: view })
    get()._updateURL(newState)
  },

  // Navigate to a main section (resets subsections)
  navigateToSection: (section) => {
    const newState = {
      activeView: section,
      cafeSubView: null,
      sensorySubView: null,
    }
    set(newState)
    get()._updateURL(newState)
  },

  // Go back one level in navigation hierarchy
  goBackToMenu: () => {
    const { cafeSubView, sensorySubView, activeView } = get()

    let newState: { activeView: string | null; cafeSubView: string | null; sensorySubView: string | null }

    // If in a subsection, go back to main section
    if (sensorySubView) {
      newState = { activeView, cafeSubView: null, sensorySubView: null }
      set({ sensorySubView: null })
    } else if (cafeSubView) {
      newState = { activeView, cafeSubView: null, sensorySubView: null }
      set({ cafeSubView: null })
    } else {
      // Go back to home (close section)
      newState = { activeView: null, cafeSubView: null, sensorySubView: null }
      set({ activeView: null })
    }

    get()._updateURL(newState)
  },

  // Navigate to profile section
  handleProfileClick: () => {
    const newState = {
      activeView: 'profile',
      cafeSubView: null,
      sensorySubView: null,
    }
    set(newState)
    get()._updateURL(newState)
  },

  // Reset all navigation state
  reset: () => {
    const newState = {
      activeView: null,
      cafeSubView: null,
      sensorySubView: null,
    }
    set(newState)
    get()._updateURL(newState)
  },
}))

// Listen for browser back/forward buttons
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    useNavigationStore.getState().syncFromURL()
  })
}

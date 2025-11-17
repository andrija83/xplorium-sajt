/**
 * Navigation Types for Xplorium
 *
 * Defines enums and interfaces for navigation state management,
 * replacing magic strings with type-safe enums.
 */

/**
 * Main sections of the application
 */
export enum Section {
  Cafe = 'cafe',
  Discover = 'discover',
  Igraonica = 'igraonica'
}

/**
 * Cafe subsections
 */
export enum CafeSubSection {
  Meni = 'meni',
  Zakup = 'zakup',
  Radno = 'radno',
  Kontakt = 'kontakt'
}

/**
 * Sensory room subsections
 */
export enum SensorySubSection {
  Floor = 'floor',
  Wall = 'wall',
  Ceiling = 'ceiling'
}

/**
 * Complete navigation state
 */
export interface NavigationState {
  /** Currently active main section, null if on brand screen */
  section: Section | null
  /** Active cafe subsection, null if not in cafe or on cafe menu */
  cafeSubSection: CafeSubSection | null
  /** Active sensory subsection, null if not in sensory or on planet selection */
  sensorySubSection: SensorySubSection | null
}

/**
 * Navigation tab configuration
 */
export interface NavigationTab {
  /** Display label for the tab */
  label: string
  /** Section identifier */
  section: Section
  /** CSS positioning for the tab */
  position: React.CSSProperties
}

/**
 * Planet orb configuration for Sensory section
 */
export interface PlanetConfig {
  /** Display label */
  label: string
  /** Target subsection */
  section: SensorySubSection
  /** Color scheme identifier */
  color: 'yellow' | 'orange' | 'green' | 'blue' | 'purple' | 'pink'
  /** Size variant */
  size: 'sm' | 'md' | 'lg'
  /** CSS positioning */
  position: React.CSSProperties
  /** Optional image path (overrides neon effect) */
  image?: string
}

/**
 * Cafe menu item configuration
 */
export interface CafeMenuItem {
  /** Display label */
  label: string
  /** Target subsection */
  section: CafeSubSection
  /** Color for text/glow */
  color: string
  /** CSS text-shadow value for neon glow */
  shadow: string
}

/**
 * Navigation action types for useReducer pattern
 */
export enum NavigationActionType {
  NAVIGATE_TO_SECTION = 'NAVIGATE_TO_SECTION',
  NAVIGATE_TO_CAFE_SUBSECTION = 'NAVIGATE_TO_CAFE_SUBSECTION',
  NAVIGATE_TO_SENSORY_SUBSECTION = 'NAVIGATE_TO_SENSORY_SUBSECTION',
  GO_BACK = 'GO_BACK',
  RESET = 'RESET'
}

/**
 * Navigation actions for useReducer
 */
export type NavigationAction =
  | { type: NavigationActionType.NAVIGATE_TO_SECTION; payload: Section }
  | { type: NavigationActionType.NAVIGATE_TO_CAFE_SUBSECTION; payload: CafeSubSection }
  | { type: NavigationActionType.NAVIGATE_TO_SENSORY_SUBSECTION; payload: SensorySubSection }
  | { type: NavigationActionType.GO_BACK }
  | { type: NavigationActionType.RESET }

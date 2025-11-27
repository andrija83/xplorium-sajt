/**
 * Type Definitions Index
 *
 * Central export point for all TypeScript type definitions.
 * Import types like: import { Section, NavigationState } from '@/types'
 */

// Navigation types
export {
  Section,
  CafeSubSection,
  SensorySubSection,
  NavigationActionType,
  type NavigationState,
  type NavigationTab,
  type PlanetConfig,
  type CafeMenuItem,
  type NavigationAction,
} from './navigation'

// Common types
export {
  LoadingState,
  type BaseComponentProps,
  type AnimationComponentProps,
  type TextAnimationProps,
  type GalleryImage,
  type StarParticle,
  type StarburstParticle,
  type LiquidDripConfig,
  type LetterDripConfig,
  type EventPackage,
  type MenuPackage,
  type ColorScheme,
  type NeonColorScheme,
  type SizeVariant,
  type ColorVariant,
  type EasingType,
  type AnimationDirection,
  type AsyncState,
} from './common'

// Database types (safe for client components)
export {
  Role,
  BookingStatus,
  BookingType,
  EventStatus,
  PricingCategory,
  PricingStatus,
  ContentStatus,
  MaintenanceArea,
  MaintenanceType,
  MaintenanceStatus,
  Priority,
  InventoryCategory,
  type User,
  type Booking,
  type Event,
  type PricingPackage,
  type SiteContent,
  type MaintenanceLog,
  type InventoryItem,
  type PublicUser,
  type BookingInput,
  type EventInput,
  type PricingPackageInput,
  isBookingType,
  isBookingStatus,
  isPricingCategory,
} from './database'

// API Response types
export {
  type ApiResponse,
  type ApiSuccessResponse,
  type ApiErrorResponse,
  type PaginationMeta,
  type PaginatedResponse,
  isSuccessResponse,
  isErrorResponse,
} from './api'

/**
 * Database Type Definitions
 *
 * These types mirror the Prisma schema enums and models but are safe
 * to import in client components without exposing the database schema.
 *
 * IMPORTANT: These are decoupled from @prisma/client to prevent
 * database schema exposure in client-side code.
 */

// ============================================
// ENUMS
// ============================================

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum BookingType {
  CAFE = 'CAFE',
  SENSORY_ROOM = 'SENSORY_ROOM',
  PLAYGROUND = 'PLAYGROUND',
  PARTY = 'PARTY',
  EVENT = 'EVENT',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum PricingCategory {
  PLAYGROUND = 'PLAYGROUND',
  SENSORY_ROOM = 'SENSORY_ROOM',
  CAFE = 'CAFE',
  PARTY = 'PARTY',
}

export enum PricingStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum MaintenanceArea {
  CAFE = 'CAFE',
  PLAYGROUND = 'PLAYGROUND',
  SENSORY_ROOM = 'SENSORY_ROOM',
  GENERAL = 'GENERAL',
  EXTERIOR = 'EXTERIOR',
}

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
  CLEANING = 'CLEANING',
  UPGRADE = 'UPGRADE',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum InventoryCategory {
  CAFE = 'CAFE',
  PLAYGROUND = 'PLAYGROUND',
  SENSORY_ROOM = 'SENSORY_ROOM',
  PARTY_SUPPLIES = 'PARTY_SUPPLIES',
  CLEANING = 'CLEANING',
  GENERAL = 'GENERAL',
}

// ============================================
// MODEL TYPES (Client-Safe)
// ============================================

/**
 * User type for client-side use
 * Excludes sensitive fields like password
 */
export interface User {
  id: string
  email: string
  emailVerified: Date | null
  name: string | null
  role: Role
  image: string | null
  blocked: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Booking type for client-side use
 */
export interface Booking {
  id: string
  userId: string | null
  title: string
  date: Date
  time: string
  type: BookingType
  guestCount: number
  phone: string
  email: string
  specialRequests: string | null
  status: BookingStatus
  adminNotes: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Event type for client-side use
 */
export interface Event {
  id: string
  slug: string
  title: string
  description: string
  date: Date
  time: string
  image: string | null
  category: string
  status: EventStatus
  order: number
  createdAt: Date
  updatedAt: Date
}

/**
 * PricingPackage type for client-side use
 */
export interface PricingPackage {
  id: string
  name: string
  price: string | null  // Nullable during migration to priceAmount/priceCurrency
  priceAmount?: number | null  // New structured price field
  priceCurrency?: string | null  // Currency code (ISO 4217)
  category: PricingCategory
  popular: boolean
  features: string[] // Typed as string array instead of Json
  description: string | null
  status: PricingStatus
  order: number
  createdAt: Date
  updatedAt: Date
}

/**
 * SiteContent type for client-side use
 */
export interface SiteContent {
  id: string
  section: string
  content: Record<string, any> // Flexible JSON structure
  status: ContentStatus
  version: number
  updatedAt: Date
  updatedBy: string | null
}

/**
 * MaintenanceLog type for client-side use (admin only)
 */
export interface MaintenanceLog {
  id: string
  equipment: string
  area: MaintenanceArea
  description: string
  type: MaintenanceType
  status: MaintenanceStatus
  priority: Priority
  scheduledDate: Date
  completedDate: Date | null
  cost: number | null
  performedBy: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * InventoryItem type for client-side use (admin only)
 */
export interface InventoryItem {
  id: string
  name: string
  category: InventoryCategory
  quantity: number
  unit: string
  reorderPoint: number
  supplierName: string | null
  supplierContact: string | null
  lastRestocked: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Omit sensitive fields for public API responses
 */
export type PublicUser = Omit<User, 'emailVerified' | 'blocked'>

/**
 * Booking creation input (client-side form data)
 */
export type BookingInput = Omit<
  Booking,
  'id' | 'userId' | 'status' | 'adminNotes' | 'createdAt' | 'updatedAt'
> & {
  date: string // Accept ISO string from forms
}

/**
 * Event creation input (admin-side form data)
 */
export type EventInput = Omit<
  Event,
  'id' | 'slug' | 'status' | 'order' | 'createdAt' | 'updatedAt'
> & {
  date: string // Accept ISO string from forms
}

/**
 * Pricing package creation input (admin-side form data)
 */
export type PricingPackageInput = Omit<
  PricingPackage,
  'id' | 'status' | 'order' | 'createdAt' | 'updatedAt'
>

/**
 * Type guard to check if a value is a valid BookingType
 */
export function isBookingType(value: string): value is BookingType {
  return Object.values(BookingType).includes(value as BookingType)
}

/**
 * Type guard to check if a value is a valid BookingStatus
 */
export function isBookingStatus(value: string): value is BookingStatus {
  return Object.values(BookingStatus).includes(value as BookingStatus)
}

/**
 * Type guard to check if a value is a valid PricingCategory
 */
export function isPricingCategory(value: string): value is PricingCategory {
  return Object.values(PricingCategory).includes(value as PricingCategory)
}

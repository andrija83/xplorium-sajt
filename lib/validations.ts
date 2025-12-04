import { z } from 'zod'

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
})

// ============================================
// BOOKING SCHEMAS
// ============================================

export const createBookingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  date: z.coerce.date(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  type: z.enum(['CAFE', 'SENSORY_ROOM', 'PLAYGROUND', 'PARTY', 'EVENT']),
  guestCount: z.number().min(1, 'At least 1 guest required').max(100, 'Maximum 100 guests'),
  phone: z.string().min(10, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
  specialRequests: z.string().optional(),
  // Price tracking fields for loyalty points calculation
  totalAmount: z.number().positive().optional(),
  currency: z.string().length(3).optional(), // ISO 4217 currency code (RSD, EUR, USD, etc.)
  paidAmount: z.number().positive().optional(),
  isPaid: z.boolean().optional(),
  paymentDate: z.coerce.date().optional(),
})

export const updateBookingSchema = createBookingSchema.partial().extend({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']).optional(),
  adminNotes: z.string().optional(),
  specialRequests: z.string().optional(),
})

export const approveBookingSchema = z.object({
  bookingId: z.string().cuid(),
  adminNotes: z.string().optional(),
})

export const rejectBookingSchema = z.object({
  bookingId: z.string().cuid(),
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
})

// ============================================
// EVENT SCHEMAS
// ============================================

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.coerce.date(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  category: z.string().min(2, 'Category is required'),
  image: z.string().url('Invalid image URL').or(z.literal('')).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
})

export const updateEventSchema = createEventSchema.partial().extend({
  order: z.number().int().min(0).optional(),
})

export const reorderEventsSchema = z.object({
  eventIds: z.array(z.string().cuid()),
})

// ============================================
// USER SCHEMAS
// ============================================

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).default('USER'),
})

export const updateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
})

export const toggleUserBlockSchema = z.object({
  userId: z.string().cuid(),
})

// ============================================
// CONTENT SCHEMAS
// ============================================

export const updateContentSchema = z.object({
  section: z.enum(['cafe', 'sensory', 'igraonica']),
  content: z.record(z.unknown()), // Flexible JSON content
  status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
})

// ============================================
// CUSTOMER SCHEMAS
// ============================================

export const upsertCustomerSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number must not exceed 20 digits').optional(),
  marketingOptIn: z.boolean().optional(),
  smsOptIn: z.boolean().optional(),
  notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
  tags: z.array(z.string().min(1).max(50)).max(20, 'Maximum 20 tags allowed').optional(),
})

export const addCustomerTagSchema = z.object({
  id: z.string().cuid('Invalid customer ID'),
  tag: z.string()
    .min(1, 'Tag cannot be empty')
    .max(50, 'Tag must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Tag can only contain letters, numbers, spaces, hyphens, and underscores')
    .transform(val => val.trim()),
})

export const updateLoyaltyPointsSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  points: z.number()
    .int('Points must be a whole number')
    .min(-10000, 'Cannot subtract more than 10,000 points at once')
    .max(10000, 'Cannot add more than 10,000 points at once')
    .refine(val => Number.isFinite(val), 'Points must be a finite number')
    .refine(val => !Number.isNaN(val), 'Points cannot be NaN'),
  reason: z.string().min(3, 'Reason must be at least 3 characters').max(200, 'Reason must not exceed 200 characters').optional(),
})

// ============================================
// IMPORT SCHEMAS
// ============================================

export const importBookingSchema = z.object({
  Title: z.string().min(1, 'Title is required').max(100, 'Title must not exceed 100 characters'),
  Date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  Time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  Type: z.enum(['CAFE', 'SENSORY_ROOM', 'PLAYGROUND', 'PARTY', 'EVENT'], {
    errorMap: () => ({ message: 'Type must be one of: CAFE, SENSORY_ROOM, PLAYGROUND, PARTY, EVENT' })
  }),
  'Guest Count': z.number().int().min(1, 'Guest count must be at least 1').max(100, 'Guest count must not exceed 100'),
  'Total Amount': z.number().positive('Total amount must be positive').optional(),
  Currency: z.string().length(3, 'Currency must be a 3-letter code (e.g., RSD, EUR, USD)').optional(),
  Phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number must not exceed 20 digits'),
  'User Email': z.string().email('Invalid email address'),
  'Special Requests': z.string().max(500, 'Special requests must not exceed 500 characters').optional(),
})

export const importEventSchema = z.object({
  Slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must not exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  Title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must not exceed 200 characters'),
  Description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must not exceed 2000 characters'),
  Date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  Time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  'End Time': z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  Category: z.enum(['WORKSHOP', 'PARTY', 'SPECIAL_EVENT', 'HOLIDAY', 'SEASONAL', 'CLASS', 'TOURNAMENT', 'OTHER'], {
    errorMap: () => ({ message: 'Category must be one of: WORKSHOP, PARTY, SPECIAL_EVENT, HOLIDAY, SEASONAL, CLASS, TOURNAMENT, OTHER' })
  }),
  Capacity: z.number().int().min(1, 'Capacity must be at least 1').max(500, 'Capacity must not exceed 500').optional(),
  Price: z.number().min(0, 'Price cannot be negative').optional(),
  Currency: z.string().length(3, 'Currency must be a 3-letter code (e.g., RSD, EUR, USD)').optional(),
  Location: z.string().max(200, 'Location must not exceed 200 characters').optional(),
  Image: z.string().url('Invalid image URL').or(z.literal('')).optional(),
  Tags: z.string().max(200, 'Tags must not exceed 200 characters').optional(),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>
export type ApproveBookingInput = z.infer<typeof approveBookingSchema>
export type RejectBookingInput = z.infer<typeof rejectBookingSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type ReorderEventsInput = z.infer<typeof reorderEventsSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
export type ToggleUserBlockInput = z.infer<typeof toggleUserBlockSchema>
export type UpdateContentInput = z.infer<typeof updateContentSchema>
export type UpsertCustomerInput = z.infer<typeof upsertCustomerSchema>
export type AddCustomerTagInput = z.infer<typeof addCustomerTagSchema>
export type UpdateLoyaltyPointsInput = z.infer<typeof updateLoyaltyPointsSchema>
export type ImportBookingInput = z.infer<typeof importBookingSchema>
export type ImportEventInput = z.infer<typeof importEventSchema>

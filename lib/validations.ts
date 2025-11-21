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

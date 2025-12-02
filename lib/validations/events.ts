import { z } from 'zod'

/**
 * Event Validation Schemas
 */

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(100),
  description: z.string().min(1, 'Description is required'),
  date: z.coerce.date(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional().nullable(),
  category: z.enum(['WORKSHOP', 'PARTY', 'SPECIAL_EVENT', 'HOLIDAY', 'SEASONAL', 'CLASS', 'TOURNAMENT', 'OTHER']),
  capacity: z.number().int().positive().optional().nullable(),
  price: z.number().nonnegative().optional().nullable(),
  currency: z.string().length(3).optional(),
  location: z.string().max(200).optional().nullable(),
  image: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'ARCHIVED']).optional()
})

export const updateEventSchema = createEventSchema.partial()

export const reorderEventsSchema = z.object({
  eventIds: z.array(z.string())
})

export const rsvpSchema = z.object({
  eventId: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional().nullable(),
  guestCount: z.number().int().positive().default(1),
  notes: z.string().optional().nullable()
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type ReorderEventsInput = z.infer<typeof reorderEventsSchema>
export type RSVPInput = z.infer<typeof rsvpSchema>

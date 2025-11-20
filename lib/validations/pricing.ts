import { z } from 'zod'

// ============================================
// PRICING VALIDATION SCHEMAS
// ============================================

export const createPricingSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  price: z.string().min(1, 'Price is required'),
  category: z.enum(['PLAYGROUND', 'SENSORY_ROOM', 'CAFE', 'PARTY']),
  popular: z.boolean().default(false),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
})

export const updatePricingSchema = createPricingSchema.partial().extend({
  order: z.number().int().min(0).optional(),
})

export type CreatePricingInput = z.infer<typeof createPricingSchema>
export type UpdatePricingInput = z.infer<typeof updatePricingSchema>

import { z } from "zod"

export const createInventorySchema = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.enum(["CAFE", "PLAYGROUND", "SENSORY_ROOM", "PARTY_SUPPLIES", "CLEANING", "GENERAL"]),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  unit: z.string().min(1, "Unit is required (e.g., pieces, kg, liters)"),
  reorderPoint: z.number().int().min(0, "Reorder point cannot be negative").default(10),
  supplierName: z.string().optional().nullable(),
  supplierContact: z.string().optional().nullable(),
  lastRestocked: z.date().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type CreateInventoryInput = z.infer<typeof createInventorySchema>

export const updateInventorySchema = createInventorySchema.partial()
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>

export const adjustStockSchema = z.object({
  quantity: z.number().int(),
  reason: z.string().optional(),
})

export type AdjustStockInput = z.infer<typeof adjustStockSchema>

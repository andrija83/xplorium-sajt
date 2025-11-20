import { z } from "zod"

export const createMaintenanceSchema = z.object({
  equipment: z.string().min(1, "Equipment/area name is required"),
  area: z.enum(["CAFE", "PLAYGROUND", "SENSORY_ROOM", "GENERAL", "EXTERIOR"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["PREVENTIVE", "REPAIR", "INSPECTION", "CLEANING", "UPGRADE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("SCHEDULED"),
  scheduledDate: z.date({
    required_error: "Scheduled date is required",
  }),
  completedDate: z.date().optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  performedBy: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>

export const updateMaintenanceSchema = createMaintenanceSchema.partial()
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>

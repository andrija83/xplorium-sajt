"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"
import { createMaintenanceSchema, updateMaintenanceSchema } from "@/lib/validations/maintenance"
import type { CreateMaintenanceInput, UpdateMaintenanceInput } from "@/lib/validations/maintenance"

/**
 * Get maintenance logs with optional filtering
 */
export async function getMaintenanceLogs(filters?: {
  status?: string
  area?: string
  type?: string
  priority?: string
  search?: string
  limit?: number
  offset?: number
}) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized" }
    }

    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.area) {
      where.area = filters.area
    }

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.priority) {
      where.priority = filters.priority
    }

    if (filters?.search) {
      where.OR = [
        { equipment: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { performedBy: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    const logs = await prisma.maintenanceLog.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { scheduledDate: "desc" },
      ],
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    })

    return { success: true, logs }
  } catch (error) {
    console.error("Error fetching maintenance logs:", error)
    return { success: false, error: "Failed to fetch maintenance logs" }
  }
}

/**
 * Get single maintenance log by ID
 */
export async function getMaintenanceLogById(id: string) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized" }
    }

    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
    })

    if (!log) {
      return { success: false, error: "Maintenance log not found" }
    }

    return { success: true, log }
  } catch (error) {
    console.error("Error fetching maintenance log:", error)
    return { success: false, error: "Failed to fetch maintenance log" }
  }
}

/**
 * Create new maintenance log
 */
export async function createMaintenanceLog(data: CreateMaintenanceInput) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized" }
    }

    const validated = createMaintenanceSchema.parse(data)

    const log = await prisma.maintenanceLog.create({
      data: validated,
    })

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entity: "MaintenanceLog",
      entityId: log.id,
      changes: { created: log }
    })

    revalidatePath("/admin/maintenance")
    return { success: true, log }
  } catch (error: any) {
    console.error("Error creating maintenance log:", error)
    return {
      success: false,
      error: error.message || "Failed to create maintenance log"
    }
  }
}

/**
 * Update maintenance log
 */
export async function updateMaintenanceLog(id: string, data: UpdateMaintenanceInput) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized" }
    }

    const validated = updateMaintenanceSchema.parse(data)

    const oldLog = await prisma.maintenanceLog.findUnique({
      where: { id },
    })

    const log = await prisma.maintenanceLog.update({
      where: { id },
      data: validated,
    })

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entity: "MaintenanceLog",
      entityId: log.id,
      changes: { before: oldLog, after: log }
    })

    revalidatePath("/admin/maintenance")
    revalidatePath(`/admin/maintenance/${id}`)
    return { success: true, log }
  } catch (error: any) {
    console.error("Error updating maintenance log:", error)
    return {
      success: false,
      error: error.message || "Failed to update maintenance log"
    }
  }
}

/**
 * Delete maintenance log
 */
export async function deleteMaintenanceLog(id: string) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized" }
    }

    const log = await prisma.maintenanceLog.delete({
      where: { id },
    })

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entity: "MaintenanceLog",
      entityId: id,
      changes: { deleted: log }
    })

    revalidatePath("/admin/maintenance")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting maintenance log:", error)
    return {
      success: false,
      error: error.message || "Failed to delete maintenance log"
    }
  }
}

/**
 * Mark maintenance as completed
 */
export async function completeMaintenanceLog(id: string, completedData?: {
  performedBy?: string
  cost?: number
  notes?: string
}) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized" }
    }

    const log = await prisma.maintenanceLog.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedDate: new Date(),
        ...completedData,
      },
    })

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entity: "MaintenanceLog",
      entityId: log.id,
      changes: { action: "completed", data: log }
    })

    revalidatePath("/admin/maintenance")
    revalidatePath(`/admin/maintenance/${id}`)
    return { success: true, log }
  } catch (error: any) {
    console.error("Error completing maintenance log:", error)
    return {
      success: false,
      error: error.message || "Failed to complete maintenance log"
    }
  }
}

/**
 * Get upcoming maintenance (scheduled within next 30 days)
 */
export async function getUpcomingMaintenance() {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized" }
    }

    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    const logs = await prisma.maintenanceLog.findMany({
      where: {
        status: {
          in: ["SCHEDULED", "IN_PROGRESS"]
        },
        scheduledDate: {
          gte: today,
          lte: thirtyDaysFromNow,
        },
      },
      orderBy: [
        { priority: "desc" },
        { scheduledDate: "asc" },
      ],
    })

    return { success: true, logs }
  } catch (error) {
    console.error("Error fetching upcoming maintenance:", error)
    return { success: false, error: "Failed to fetch upcoming maintenance" }
  }
}

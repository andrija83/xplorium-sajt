"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"
import { createInventorySchema, updateInventorySchema, adjustStockSchema } from "@/lib/validations/inventory"
import type { CreateInventoryInput, UpdateInventoryInput, AdjustStockInput } from "@/lib/validations/inventory"

/**
 * Get inventory items with optional filtering
 */
export async function getInventoryItems(filters?: {
  category?: string
  lowStock?: boolean
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

    if (filters?.category) {
      where.category = filters.category
    }

    if (filters?.lowStock) {
      where.quantity = {
        lte: prisma.inventoryItem.fields.reorderPoint
      }
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" as const } },
        { supplierName: { contains: filters.search, mode: "insensitive" as const } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        orderBy: [
          { category: "asc" },
          { name: "asc" },
        ],
        take: filters?.limit || 100,
        skip: filters?.offset || 0,
      }),
      prisma.inventoryItem.count({ where }),
    ])

    return { success: true, items, total }
  } catch (error) {
    console.error("Error fetching inventory items:", error)
    return { success: false, error: "Failed to fetch inventory items" }
  }
}

/**
 * Get single inventory item by ID
 */
export async function getInventoryItemById(id: string) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized" }
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id },
    })

    if (!item) {
      return { success: false, error: "Item not found" }
    }

    return { success: true, item }
  } catch (error) {
    console.error("Error fetching inventory item:", error)
    return { success: false, error: "Failed to fetch inventory item" }
  }
}

/**
 * Create new inventory item
 */
export async function createInventoryItem(data: CreateInventoryInput) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized" }
    }

    const validated = createInventorySchema.parse(data)

    const item = await prisma.inventoryItem.create({
      data: validated,
    })

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entity: "InventoryItem",
      entityId: item.id,
      changes: { created: item }
    })

    revalidatePath("/admin/inventory")
    return { success: true, item }
  } catch (error: any) {
    console.error("Error creating inventory item:", error)
    return {
      success: false,
      error: error.message || "Failed to create inventory item"
    }
  }
}

/**
 * Update inventory item
 */
export async function updateInventoryItem(id: string, data: UpdateInventoryInput) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized" }
    }

    const validated = updateInventorySchema.parse(data)

    const oldItem = await prisma.inventoryItem.findUnique({
      where: { id },
    })

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: validated,
    })

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entity: "InventoryItem",
      entityId: item.id,
      changes: { before: oldItem, after: item }
    })

    revalidatePath("/admin/inventory")
    revalidatePath(`/admin/inventory/${id}`)
    return { success: true, item }
  } catch (error: any) {
    console.error("Error updating inventory item:", error)
    return {
      success: false,
      error: error.message || "Failed to update inventory item"
    }
  }
}

/**
 * Delete inventory item
 */
export async function deleteInventoryItem(id: string) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized" }
    }

    const item = await prisma.inventoryItem.delete({
      where: { id },
    })

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entity: "InventoryItem",
      entityId: id,
      changes: { deleted: item }
    })

    revalidatePath("/admin/inventory")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting inventory item:", error)
    return {
      success: false,
      error: error.message || "Failed to delete inventory item"
    }
  }
}

/**
 * Adjust stock quantity (add or remove)
 */
export async function adjustStock(id: string, adjustment: AdjustStockInput) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized" }
    }

    const validated = adjustStockSchema.parse(adjustment)

    const currentItem = await prisma.inventoryItem.findUnique({
      where: { id },
    })

    if (!currentItem) {
      return { success: false, error: "Item not found" }
    }

    const newQuantity = currentItem.quantity + validated.quantity

    if (newQuantity < 0) {
      return { success: false, error: "Cannot adjust stock below zero" }
    }

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        quantity: newQuantity,
        lastRestocked: validated.quantity > 0 ? new Date() : currentItem.lastRestocked,
      },
    })

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entity: "InventoryItem",
      entityId: item.id,
      changes: {
        action: "stock_adjustment",
        adjustment: validated.quantity,
        oldQuantity: currentItem.quantity,
        newQuantity: item.quantity,
        reason: validated.reason
      }
    })

    revalidatePath("/admin/inventory")
    revalidatePath(`/admin/inventory/${id}`)
    return { success: true, item }
  } catch (error: any) {
    console.error("Error adjusting stock:", error)
    return {
      success: false,
      error: error.message || "Failed to adjust stock"
    }
  }
}

/**
 * Get low stock items (quantity <= reorderPoint)
 */
export async function getLowStockItems() {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized" }
    }

    const items = await prisma.inventoryItem.findMany({
      where: {
        quantity: {
          lte: prisma.inventoryItem.fields.reorderPoint
        }
      },
      orderBy: [
        { quantity: "asc" },
        { name: "asc" },
      ],
    })

    return { success: true, items, count: items.length }
  } catch (error) {
    console.error("Error fetching low stock items:", error)
    return { success: false, error: "Failed to fetch low stock items" }
  }
}

/**
 * Get inventory stats
 */
export async function getInventoryStats() {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized" }
    }

    const [totalItems, lowStockCount, byCategory] = await Promise.all([
      prisma.inventoryItem.count(),
      prisma.inventoryItem.count({
        where: {
          quantity: {
            lte: prisma.inventoryItem.fields.reorderPoint
          }
        }
      }),
      prisma.inventoryItem.groupBy({
        by: ['category'],
        _count: true,
      }),
    ])

    return {
      success: true,
      stats: {
        totalItems,
        lowStockCount,
        byCategory,
      }
    }
  } catch (error) {
    console.error("Error fetching inventory stats:", error)
    return { success: false, error: "Failed to fetch inventory stats" }
  }
}

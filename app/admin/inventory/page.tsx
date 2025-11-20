"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Plus, Package, Edit, Trash2, AlertTriangle, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { getInventoryItems, deleteInventoryItem } from "@/app/actions/inventory"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"

/**
 * Inventory Management Page
 *
 * Features:
 * - List all inventory items
 * - Low stock alerts (visual indicators)
 * - Filter by category
 * - Search by name/supplier
 * - Track quantities and reorder points
 */

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  reorderPoint: number
  supplierName: string | null
  supplierContact: string | null
  lastRestocked: Date | null
  createdAt: Date
}

const CATEGORY_LABELS: Record<string, string> = {
  CAFE: "Cafe",
  PLAYGROUND: "Playground",
  SENSORY_ROOM: "Sensory Room",
  PARTY_SUPPLIES: "Party Supplies",
  CLEANING: "Cleaning",
  GENERAL: "General",
}

function InventoryContent() {
  const router = useRouter()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
  const [showLowStock, setShowLowStock] = useState(false)

  // Fetch inventory items
  const fetchItems = async (page = 1) => {
    try {
      setIsLoading(true)

      const result = await getInventoryItems({
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
        lowStock: showLowStock,
        search: searchQuery || undefined,
        limit: pagination.limit,
        offset: (page - 1) * pagination.limit,
      })

      if (result.success && result.items) {
        setItems(result.items as InventoryItem[])
        setPagination(prev => ({
          ...prev,
          page,
          total: result.items?.length || 0,
          totalPages: 1,
        }))
      }
    } catch (error) {
      console.error("Failed to fetch inventory items:", error)
      toast.error("Failed to load inventory items")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchItems(1)
  }, [categoryFilter, showLowStock])

  // Handle search
  const handleSearch = () => {
    fetchItems(1)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchItems(page)
  }

  // Handle delete
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      const result = await deleteInventoryItem(id)
      if (result.success) {
        toast.success("Item deleted successfully")
        fetchItems(pagination.page)
      } else {
        toast.error(result.error || "Failed to delete item")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  // Handle row click
  const handleRowClick = (item: InventoryItem) => {
    router.push(`/admin/inventory/${item.id}/edit`)
  }

  // Check if item is low stock
  const isLowStock = (item: InventoryItem) => item.quantity <= item.reorderPoint

  // Get low stock count
  const lowStockCount = items.filter(isLowStock).length

  // Table columns
  const columns: Column<InventoryItem>[] = [
    {
      header: "Item",
      accessor: (item) => (
        <div className="flex items-center gap-3">
          {isLowStock(item) ? (
            <div className="w-10 h-10 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400">
              <Package className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="font-medium text-cyan-300">{item.name}</div>
            <div className="text-xs text-cyan-100/50">{CATEGORY_LABELS[item.category]}</div>
          </div>
        </div>
      ),
      width: "w-64",
    },
    {
      header: "Stock Level",
      accessor: (item) => {
        const low = isLowStock(item)
        return (
          <div className="flex items-center gap-2">
            <div className={cn(
              "text-lg font-bold",
              low ? "text-red-400" : "text-green-400"
            )}>
              {item.quantity}
            </div>
            <span className="text-sm text-cyan-100/50">{item.unit}</span>
            {low && (
              <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-red-400/20 text-red-400 border border-red-400/50">
                LOW
              </span>
            )}
          </div>
        )
      },
      width: "w-40",
    },
    {
      header: "Reorder Point",
      accessor: (item) => (
        <div className="text-sm text-cyan-100/70">
          {item.reorderPoint} {item.unit}
        </div>
      ),
      width: "w-32",
      center: true,
    },
    {
      header: "Supplier",
      accessor: (item) => (
        <div className="text-sm">
          {item.supplierName ? (
            <>
              <div className="text-cyan-300">{item.supplierName}</div>
              {item.supplierContact && (
                <div className="text-xs text-cyan-100/50">{item.supplierContact}</div>
              )}
            </>
          ) : (
            <span className="text-cyan-100/40">-</span>
          )}
        </div>
      ),
      width: "w-48",
    },
    {
      header: "Last Restocked",
      accessor: (item) => (
        <div className="text-sm text-cyan-100/70">
          {item.lastRestocked ? format(new Date(item.lastRestocked), "MMM dd, yyyy") : "-"}
        </div>
      ),
      width: "w-32",
    },
    {
      header: "Actions",
      accessor: (item) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/admin/inventory/${item.id}/edit`)
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
            onClick={(e) => handleDelete(e, item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      width: "w-24",
      center: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">
            Inventory Management
          </h1>
          <p className="text-sm text-cyan-100/60 mt-1">
            Track supplies and stock levels
            {lowStockCount > 0 && (
              <span className="ml-2 text-red-400 font-medium">
                • {lowStockCount} low stock {lowStockCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </p>
        </div>
        <Link href="/admin/inventory/new">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
              <Input
                placeholder="Search items or suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-black/40 border-cyan-400/30 text-white
                           placeholder:text-cyan-100/30 focus:border-cyan-400"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Search
            </Button>
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-black/40 border-cyan-400/30 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="CAFE">Cafe</SelectItem>
              <SelectItem value="PLAYGROUND">Playground</SelectItem>
              <SelectItem value="SENSORY_ROOM">Sensory Room</SelectItem>
              <SelectItem value="PARTY_SUPPLIES">Party Supplies</SelectItem>
              <SelectItem value="CLEANING">Cleaning</SelectItem>
              <SelectItem value="GENERAL">General</SelectItem>
            </SelectContent>
          </Select>

          {/* Low Stock Filter */}
          <Button
            variant={showLowStock ? "default" : "outline"}
            onClick={() => setShowLowStock(!showLowStock)}
            className={cn(
              showLowStock
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-black/40 border-cyan-400/30 text-white hover:bg-black/60"
            )}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {showLowStock ? "Showing Low Stock" : "Show Low Stock"}
          </Button>
        </div>
      </motion.div>

      {/* Table */}
      <DataTable
        data={items}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage="No inventory items found"
        onRowClick={handleRowClick}
      />
    </div>
  )
}

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    }>
      <InventoryContent />
    </Suspense>
  )
}

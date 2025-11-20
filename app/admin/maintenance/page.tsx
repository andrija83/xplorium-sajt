"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Plus, Wrench, Edit, Trash2, CheckCircle, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { getMaintenanceLogs, deleteMaintenanceLog } from "@/app/actions/maintenance"
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
 * Maintenance Log Management Page
 *
 * Features:
 * - List all maintenance logs
 * - Filter by status, area, type, priority
 * - Search by equipment/description
 * - Create new maintenance log
 * - Edit/Delete actions
 */

interface MaintenanceLog {
  id: string
  equipment: string
  area: string
  description: string
  type: string
  status: string
  priority: string
  scheduledDate: Date
  completedDate: Date | null
  cost: number | null
  performedBy: string | null
  createdAt: Date
}

const STATUS_COLORS = {
  SCHEDULED: "bg-blue-400/20 text-blue-400 border-blue-400/50",
  IN_PROGRESS: "bg-yellow-400/20 text-yellow-400 border-yellow-400/50",
  COMPLETED: "bg-green-400/20 text-green-400 border-green-400/50",
  CANCELLED: "bg-gray-400/20 text-gray-400 border-gray-400/50",
}

const PRIORITY_COLORS = {
  LOW: "bg-gray-400/20 text-gray-400 border-gray-400/50",
  MEDIUM: "bg-blue-400/20 text-blue-400 border-blue-400/50",
  HIGH: "bg-orange-400/20 text-orange-400 border-orange-400/50",
  URGENT: "bg-red-400/20 text-red-400 border-red-400/50",
}

const AREA_LABELS: Record<string, string> = {
  CAFE: "Cafe",
  PLAYGROUND: "Playground",
  SENSORY_ROOM: "Sensory Room",
  GENERAL: "General",
  EXTERIOR: "Exterior",
}

function MaintenanceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [logs, setLogs] = useState<MaintenanceLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [areaFilter, setAreaFilter] = useState<string>("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")

  // Fetch maintenance logs
  const fetchLogs = async (page = 1) => {
    try {
      setIsLoading(true)

      const result = await getMaintenanceLogs({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        area: areaFilter !== "ALL" ? areaFilter : undefined,
        type: typeFilter !== "ALL" ? typeFilter : undefined,
        priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
        search: searchQuery || undefined,
        limit: pagination.limit,
        offset: (page - 1) * pagination.limit,
      })

      if (result.success && result.logs) {
        setLogs(result.logs as MaintenanceLog[])
        const total = result.total || 0
        setPagination(prev => ({
          ...prev,
          page,
          total,
          totalPages: Math.ceil(total / prev.limit),
        }))
      }
    } catch (error) {
      console.error("Failed to fetch maintenance logs:", error)
      toast.error("Failed to load maintenance logs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs(1)
  }, [statusFilter, areaFilter, typeFilter, priorityFilter])

  // Handle search
  const handleSearch = () => {
    fetchLogs(1)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchLogs(page)
  }

  // Handle delete
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this maintenance log?")) return

    try {
      const result = await deleteMaintenanceLog(id)
      if (result.success) {
        toast.success("Maintenance log deleted successfully")
        fetchLogs(pagination.page)
      } else {
        toast.error(result.error || "Failed to delete maintenance log")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  // Handle row click
  const handleRowClick = (log: MaintenanceLog) => {
    router.push(`/admin/maintenance/${log.id}/edit`)
  }

  // Table columns
  const columns: Column<MaintenanceLog>[] = [
    {
      header: "Equipment / Area",
      accessor: (log) => (
        <div>
          <div className="font-medium text-cyan-300">{log.equipment}</div>
          <div className="text-xs text-cyan-100/50">{AREA_LABELS[log.area]}</div>
        </div>
      ),
      width: "w-48",
    },
    {
      header: "Type",
      accessor: (log) => (
        <span className="text-cyan-100/70 capitalize text-sm">
          {log.type.replace("_", " ").toLowerCase()}
        </span>
      ),
      width: "w-32",
    },
    {
      header: "Scheduled",
      accessor: (log) => (
        <div className="text-sm">
          <div className="text-cyan-300">
            {format(new Date(log.scheduledDate), "MMM dd, yyyy")}
          </div>
          {log.completedDate && (
            <div className="text-xs text-green-400">
              Completed {format(new Date(log.completedDate), "MMM dd")}
            </div>
          )}
        </div>
      ),
      width: "w-32",
    },
    {
      header: "Priority",
      accessor: (log) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border",
            PRIORITY_COLORS[log.priority as keyof typeof PRIORITY_COLORS]
          )}
        >
          {log.priority === "URGENT" && <AlertTriangle className="w-3 h-3" />}
          {log.priority}
        </span>
      ),
      width: "w-28",
      center: true,
    },
    {
      header: "Status",
      accessor: (log) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border",
            STATUS_COLORS[log.status as keyof typeof STATUS_COLORS]
          )}
        >
          {log.status === "COMPLETED" && <CheckCircle className="w-3 h-3" />}
          {log.status === "IN_PROGRESS" && <Clock className="w-3 h-3" />}
          {log.status.replace("_", " ")}
        </span>
      ),
      width: "w-32",
      center: true,
    },
    {
      header: "Cost",
      accessor: (log) => (
        <div className="text-sm text-cyan-100/70">
          {log.cost ? `${log.cost.toFixed(2)} RSD` : "-"}
        </div>
      ),
      width: "w-28",
      center: true,
    },
    {
      header: "Actions",
      accessor: (log) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/admin/maintenance/${log.id}/edit`)
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
            onClick={(e) => handleDelete(e, log.id)}
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
            Maintenance Log
          </h1>
          <p className="text-sm text-cyan-100/60 mt-1">
            Track equipment maintenance and repairs
          </p>
        </div>
        <Link href="/admin/maintenance/new">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
            <Plus className="w-4 h-4" />
            Schedule Maintenance
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
              <Input
                placeholder="Search equipment..."
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

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-black/40 border-cyan-400/30 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Area Filter */}
          <Select value={areaFilter} onValueChange={setAreaFilter}>
            <SelectTrigger className="bg-black/40 border-cyan-400/30 text-white">
              <SelectValue placeholder="Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Areas</SelectItem>
              <SelectItem value="CAFE">Cafe</SelectItem>
              <SelectItem value="PLAYGROUND">Playground</SelectItem>
              <SelectItem value="SENSORY_ROOM">Sensory Room</SelectItem>
              <SelectItem value="GENERAL">General</SelectItem>
              <SelectItem value="EXTERIOR">Exterior</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="bg-black/40 border-cyan-400/30 text-white">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Table */}
      <DataTable
        data={logs}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage="No maintenance logs found"
        onRowClick={handleRowClick}
      />
    </div>
  )
}

export default function MaintenancePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    }>
      <MaintenanceContent />
    </Suspense>
  )
}

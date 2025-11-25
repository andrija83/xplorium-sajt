"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, History, User, FileText, Calendar, Activity, Download } from "lucide-react"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { getAuditLogs } from "@/app/actions/audit"
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
import { logger } from "@/lib/logger"

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  userId: string
  user: {
    name: string | null
    email: string
    role: string
  }
  changes: any
  createdAt: Date
}

const ACTION_COLORS = {
  CREATE: "text-green-400",
  UPDATE: "text-blue-400",
  DELETE: "text-red-400",
  APPROVE: "text-cyan-400",
  REJECT: "text-orange-400",
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  })

  // Filters
  const [actionFilter, setActionFilter] = useState<string>("ALL")
  const [entityFilter, setEntityFilter] = useState<string>("ALL")

  const fetchLogs = async (page = 1) => {
    try {
      setIsLoading(true)
      const result = await getAuditLogs({
        action: actionFilter !== "ALL" ? actionFilter : undefined,
        entity: entityFilter !== "ALL" ? entityFilter : undefined,
        limit: pagination.limit,
        offset: (page - 1) * pagination.limit,
      })

      if (result.success && result.logs) {
        setLogs(result.logs as AuditLog[])
        const total = result.total || 0
        setPagination(prev => ({
          ...prev,
          page,
          total,
          totalPages: Math.ceil(total / prev.limit),
        }))
      } else {
        toast.error(result.error || "Failed to load logs")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs(1)
  }, [actionFilter, entityFilter])

  const handlePageChange = (page: number) => {
    fetchLogs(page)
  }

  const handleExportCSV = async () => {
    try {
      toast.info("Preparing export...")

      // Fetch all logs for export (without pagination)
      const result = await getAuditLogs({
        action: actionFilter !== "ALL" ? actionFilter : undefined,
        entity: entityFilter !== "ALL" ? entityFilter : undefined,
        limit: 10000, // Large limit to get all records
        offset: 0,
      })

      if (!result.success || !result.logs) {
        toast.error("Failed to export logs")
        return
      }

      // Convert logs to CSV
      const headers = ["Date", "Action", "Entity", "Entity ID", "User Name", "User Email", "User Role", "Changes"]
      const csvRows = [headers.join(",")]

      result.logs.forEach((log: AuditLog) => {
        const row = [
          format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss"),
          log.action,
          log.entity,
          log.entityId,
          `"${(log.user.name || "Unknown").replace(/"/g, '""')}"`, // Escape quotes
          `"${log.user.email.replace(/"/g, '""')}"`,
          log.user.role,
          `"${JSON.stringify(log.changes || {}).replace(/"/g, '""')}"`, // Escape quotes in JSON
        ]
        csvRows.push(row.join(","))
      })

      // Create blob and download
      const csvContent = csvRows.join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `audit-logs-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Exported ${result.logs.length} logs to CSV`)
    } catch (error) {
      logger.error("Failed to export audit logs", error instanceof Error ? error : new Error(String(error)))
      toast.error("Failed to export logs")
    }
  }

  const columns: Column<AuditLog>[] = [
    {
      header: "Action",
      accessor: (log) => (
        <div className="flex items-center gap-2">
          <Activity className={cn("w-4 h-4", ACTION_COLORS[log.action as keyof typeof ACTION_COLORS] || "text-gray-400")} />
          <span className={cn("font-medium", ACTION_COLORS[log.action as keyof typeof ACTION_COLORS] || "text-gray-400")}>
            {log.action}
          </span>
        </div>
      ),
      width: "w-32",
    },
    {
      header: "Entity",
      accessor: (log) => (
        <span className="text-cyan-100 font-mono text-xs px-2 py-1 rounded bg-cyan-400/10 border border-cyan-400/20">
          {log.entity}
        </span>
      ),
      width: "w-24",
    },
    {
      header: "User",
      accessor: (log) => (
        <div className="flex flex-col">
          <span className="text-cyan-300 text-sm">{log.user.name || "Unknown"}</span>
          <span className="text-cyan-100/50 text-xs">{log.user.email}</span>
        </div>
      ),
      width: "w-48",
    },
    {
      header: "Details",
      accessor: (log) => (
        <div className="text-xs text-cyan-100/60 truncate max-w-xs">
          ID: {log.entityId}
          {log.changes && (
            <span className="ml-2 opacity-50">
              (Changes: {Object.keys(log.changes).join(", ")})
            </span>
          )}
        </div>
      ),
      width: "w-64",
    },
    {
      header: "Date",
      accessor: (log) => (
        <span className="text-xs text-cyan-100/50">
          {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
        </span>
      ),
      width: "w-40",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">Audit Logs</h1>
          <p className="text-sm text-cyan-100/60 mt-1">
            Track system activities and changes
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          disabled={logs.length === 0 || isLoading}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40 bg-black/40 border-cyan-400/30 text-white">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="APPROVE">Approve</SelectItem>
              <SelectItem value="REJECT">Reject</SelectItem>
            </SelectContent>
          </Select>

          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-40 bg-black/40 border-cyan-400/30 text-white">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Entities</SelectItem>
              <SelectItem value="Booking">Booking</SelectItem>
              <SelectItem value="Event">Event</SelectItem>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Content">Content</SelectItem>
              <SelectItem value="InventoryItem">Inventory Item</SelectItem>
              <SelectItem value="MaintenanceLog">Maintenance Log</SelectItem>
              <SelectItem value="PricingPackage">Pricing Package</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <DataTable
        data={logs}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage="No audit logs found"
      />
    </div>
  )
}

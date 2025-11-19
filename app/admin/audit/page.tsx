"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, History, User, FileText, Calendar, Activity } from "lucide-react"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { getAuditLogs } from "@/app/actions/audit"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

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
    limit: 20,
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
        // Mock pagination
        setPagination(prev => ({
          ...prev,
          page,
          total: result.logs?.length || 0, // Should be real total
          totalPages: 1,
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

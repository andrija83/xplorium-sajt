"use client"

import React, { memo } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * DataTable Component
 *
 * Reusable table component for displaying data with pagination
 * Features:
 * - Custom column definitions
 * - Sortable columns
 * - Pagination controls
 * - Empty state
 * - Loading state
 * - Responsive design
 * - Xplorium cyan theme
 */

export interface Column<T> {
  /** Column header label */
  header: string
  /** Accessor function to get cell value */
  accessor: (row: T) => React.ReactNode
  /** Column key for sorting */
  key?: string
  /** Column width class */
  width?: string
  /** Center align column */
  center?: boolean
}

export interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface DataTableProps<T> {
  /** Array of data rows */
  data: T[]
  /** Column definitions */
  columns: Column<T>[]
  /** Pagination data */
  pagination?: PaginationData
  /** Page change handler */
  onPageChange?: (page: number) => void
  /** Loading state */
  isLoading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Row click handler */
  onRowClick?: (row: T) => void
  /** Custom row className */
  rowClassName?: string
}

export const DataTable = memo(function DataTable<T extends { id: string }>({
  data,
  columns,
  pagination,
  onPageChange,
  isLoading = false,
  emptyMessage = "No data found",
  onRowClick,
  rowClassName
}: DataTableProps<T>) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-xl border border-cyan-400/20 bg-black/20 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-400/10 border-b border-cyan-400/20">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={cn("px-4 py-3 text-left text-sm font-semibold text-cyan-300", col.width)}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, idx) => (
                <tr key={idx} className="border-b border-cyan-400/10">
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className="px-4 py-3">
                      <div className="h-4 bg-cyan-400/10 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-cyan-400/20 bg-black/20 backdrop-blur-sm p-12 text-center">
        <p className="text-cyan-100/50 text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div
        className="rounded-xl border border-cyan-400/20 bg-black/20 backdrop-blur-sm overflow-hidden"
        style={{
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-cyan-400/10 border-b border-cyan-400/20">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-semibold text-cyan-300",
                      col.width,
                      col.center && "text-center"
                    )}
                    style={{
                      textShadow: "0 0 10px rgba(34, 211, 238, 0.4)"
                    }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {data.map((row, rowIdx) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIdx * 0.02 }}
                  className={cn(
                    "border-b border-cyan-400/10 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-cyan-400/5",
                    rowClassName
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn(
                        "px-4 py-3 text-sm text-cyan-100/80",
                        col.center && "text-center"
                      )}
                    >
                      {col.accessor(row)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          {/* Info */}
          <div className="text-sm text-cyan-100/60">
            Showing{" "}
            <span className="font-medium text-cyan-300">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-cyan-300">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-cyan-300">{pagination.total}</span>{" "}
            results
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 rounded-lg border border-cyan-400/30 text-cyan-300
                         hover:bg-cyan-400/10 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, idx) => {
                const page = idx + 1
                // Show first, last, current, and adjacent pages
                if (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= pagination.page - 1 && page <= pagination.page + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange?.(page)}
                      className={cn(
                        "px-3 py-2 rounded-lg border transition-all duration-300",
                        page === pagination.page
                          ? "bg-cyan-400/20 border-cyan-400 text-cyan-300 font-semibold"
                          : "border-cyan-400/30 text-cyan-100/70 hover:bg-cyan-400/10"
                      )}
                    >
                      {page}
                    </button>
                  )
                } else if (
                  page === pagination.page - 2 ||
                  page === pagination.page + 2
                ) {
                  return (
                    <span key={page} className="px-2 text-cyan-100/40">
                      ...
                    </span>
                  )
                }
                return null
              })}
            </div>

            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 rounded-lg border border-cyan-400/30 text-cyan-300
                         hover:bg-cyan-400/10 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}) as React.FC<any>

DataTable.displayName = 'DataTable'

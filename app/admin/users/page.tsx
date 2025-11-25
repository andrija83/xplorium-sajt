"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Shield, User as UserIcon, Lock, Unlock, Trash2, MoreHorizontal, Mail } from "lucide-react"
import type { Column } from "@/components/admin/DataTable"
import { getUsers, deleteUser, toggleUserBlock } from "@/app/actions/users"
import { DataTableSkeleton } from "@/components/loading/DataTableSkeleton"
import { logger } from "@/lib/logger"

// Dynamic import for DataTable (code-splitting)
const DataTable = dynamic(
  () => import("@/components/admin/DataTable").then(m => ({ default: m.DataTable })),
  {
    loading: () => <DataTableSkeleton />,
    ssr: false
  }
)
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Image from "next/image"

/**
 * Users Management Page
 *
 * Features:
 * - List all users
 * - Filter by role and status
 * - Search by name/email
 * - Block/Unblock users
 * - Delete users
 */

interface User {
  id: string
  name: string | null
  email: string
  role: string
  image: string | null
  blocked: boolean
  createdAt: Date
}

const ROLE_COLORS = {
  USER: "bg-blue-400/20 text-blue-400 border-blue-400/50",
  ADMIN: "bg-cyan-400/20 text-cyan-400 border-cyan-400/50",
  SUPER_ADMIN: "bg-purple-400/20 text-purple-400 border-purple-400/50",
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // Fetch users
  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true)

      const result = await getUsers({
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        blocked: statusFilter === "BLOCKED" ? true : statusFilter === "ACTIVE" ? false : undefined,
        search: searchQuery || undefined,
        limit: pagination.limit,
        offset: (page - 1) * pagination.limit,
      })

      if (result.success && result.users) {
        setUsers(result.users as User[])
        const total = result.total || 0
        setPagination(prev => ({
          ...prev,
          page,
          total,
          totalPages: Math.ceil(total / prev.limit),
        }))
      }
    } catch (error) {
      logger.error("Failed to fetch users", error instanceof Error ? error : new Error(String(error)))
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
  }, [roleFilter, statusFilter])

  // Handle search
  const handleSearch = () => {
    fetchUsers(1)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchUsers(page)
  }

  // Handle block/unblock
  const handleToggleBlock = async (userId: string) => {
    try {
      const result = await toggleUserBlock({ userId })
      if (result.success) {
        toast.success(result.message)
        fetchUsers(pagination.page)
      } else {
        toast.error(result.error || "Failed to update user")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  // Handle delete
  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

    try {
      const result = await deleteUser(userId)
      if (result.success) {
        toast.success("User deleted successfully")
        fetchUsers(pagination.page)
      } else {
        toast.error(result.error || "Failed to delete user")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  // Handle row click
  const handleRowClick = (user: User) => {
    router.push(`/admin/users/${user.id}`)
  }

  // Table columns
  const columns: Column<User>[] = [
    {
      header: "User",
      accessor: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-400/10 overflow-hidden relative">
            {user.image ? (
              <Image src={user.image} alt={user.name || "User"} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cyan-400">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-cyan-300">{user.name || "Unnamed User"}</div>
            <div className="text-xs text-cyan-100/50">{user.email}</div>
          </div>
        </div>
      ),
      width: "w-64",
    },
    {
      header: "Role",
      accessor: (user) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border",
            ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]
          )}
        >
          {user.role === "SUPER_ADMIN" && <Shield className="w-3 h-3" />}
          {user.role === "ADMIN" && <Shield className="w-3 h-3" />}
          {user.role === "USER" && <UserIcon className="w-3 h-3" />}
          {user.role.replace("_", " ")}
        </span>
      ),
      width: "w-32",
    },
    {
      header: "Status",
      accessor: (user) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border",
            user.blocked
              ? "bg-red-400/20 text-red-400 border-red-400/50"
              : "bg-green-400/20 text-green-400 border-green-400/50"
          )}
        >
          {user.blocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          {user.blocked ? "Blocked" : "Active"}
        </span>
      ),
      width: "w-32",
      center: true,
    },
    {
      header: "Joined",
      accessor: (user) => (
        <span className="text-xs text-cyan-100/50">
          {format(new Date(user.createdAt), "MMM dd, yyyy")}
        </span>
      ),
      width: "w-32",
    },
    {
      header: "Actions",
      accessor: (user) => (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-400 hover:bg-cyan-400/10">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/90 border-cyan-400/20 text-cyan-100">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                <UserIcon className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = `mailto:${user.email}`}>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-cyan-400/20" />
              <DropdownMenuItem onClick={() => handleToggleBlock(user.id)}>
                {user.blocked ? (
                  <>
                    <Unlock className="w-4 h-4 mr-2" /> Unblock User
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" /> Block User
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(user.id)}
                className="text-red-400 focus:text-red-400 focus:bg-red-400/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: "w-16",
      center: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">
            User Management
          </h1>
          <p className="text-sm text-cyan-100/60 mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/users/new")}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          Create User
        </Button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
              <Input
                placeholder="Search by name or email..."
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

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40 bg-black/40 border-cyan-400/30 text-white">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-black/40 border-cyan-400/30 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Table */}
      <DataTable
        data={users}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage="No users found"
        onRowClick={handleRowClick}
      />
    </div>
  )
}

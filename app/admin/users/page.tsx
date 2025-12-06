"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Shield, User as UserIcon, Lock, Unlock, Trash2, MoreHorizontal, Mail, UserCheck, UserX, RotateCcw } from "lucide-react"
import type { Column } from "@/components/admin/DataTable"
import { getUsers, deleteUser, toggleUserBlock, restoreUser } from "@/app/actions/users"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  deleted?: boolean
  deletedAt?: Date | null
  deletedBy?: string | null
  originalEmail?: string | null
  _count?: {
    bookings: number
    notifications: number
    auditLogs: number
  }
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

  // Tab state
  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active")

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
        includeDeleted: activeTab === "deleted",
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
  }, [roleFilter, statusFilter, activeTab])

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
  const handleDelete = async (userId: string, user: User) => {
    const recordCount = (user._count?.bookings || 0) + (user._count?.notifications || 0) + (user._count?.auditLogs || 0)

    const message = recordCount > 0
      ? `This user has ${recordCount} related records (bookings, notifications, audit logs). These records will be preserved and this user can be restored by a Super Admin. Continue?`
      : "Are you sure you want to delete this user? This user can be restored later by a Super Admin."

    if (!confirm(message)) return

    try {
      const result = await deleteUser(userId)
      if (result.success) {
        toast.success("User deleted successfully. Records preserved.")
        fetchUsers(pagination.page)
      } else {
        toast.error(result.error || "Failed to delete user")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  // Handle restore
  const handleRestore = async (userId: string) => {
    if (!confirm("Restore this user? They will regain access to their account.")) return

    try {
      const result = await restoreUser(userId)
      if (result.success) {
        toast.success("User restored successfully")
        fetchUsers(pagination.page)
      } else {
        toast.error(result.error || "Failed to restore user")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  // Handle row click
  const handleRowClick = (user: User) => {
    router.push(`/admin/users/${user.id}`)
  }

  // Table columns - dynamic based on tab
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
            <div className="text-xs text-cyan-100/50">
              {activeTab === "deleted" && user.originalEmail ? user.originalEmail : user.email}
            </div>
            {activeTab === "deleted" && user._count && (
              <div className="text-xs text-yellow-400/70 mt-1">
                {user._count.bookings} bookings • {user._count.notifications} notifications • {user._count.auditLogs} logs
              </div>
            )}
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
      header: activeTab === "deleted" ? "Deleted" : "Joined",
      accessor: (user) => (
        <span className="text-xs text-cyan-100/50">
          {activeTab === "deleted" && user.deletedAt
            ? format(new Date(user.deletedAt), "MMM dd, yyyy")
            : format(new Date(user.createdAt), "MMM dd, yyyy")}
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

              {activeTab === "deleted" ? (
                // Deleted users - show restore option
                <>
                  <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                    <UserIcon className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-cyan-400/20" />
                  <DropdownMenuItem
                    onClick={() => handleRestore(user.id)}
                    className="text-green-400 focus:text-green-400 focus:bg-green-400/10"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore User
                  </DropdownMenuItem>
                </>
              ) : (
                // Active users - show normal actions
                <>
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
                    onClick={() => handleDelete(user.id, user)}
                    className="text-red-400 focus:text-red-400 focus:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User
                  </DropdownMenuItem>
                </>
              )}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "active" | "deleted")}>
        <TabsList className="bg-black/40 border border-cyan-400/20">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Active Users
          </TabsTrigger>
          <TabsTrigger
            value="deleted"
            className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
          >
            <UserX className="w-4 h-4 mr-2" />
            Deleted Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-6">
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

              {/* Status Filter - only show for active users */}
              {activeTab === "active" && (
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
              )}
            </div>
          </motion.div>

          {/* Table */}
          <DataTable
            data={users}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            emptyMessage={activeTab === "deleted" ? "No deleted users found" : "No users found"}
            onRowClick={handleRowClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

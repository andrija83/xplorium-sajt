"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Star, User as UserIcon, Mail, Phone, Tag, MoreHorizontal, TrendingUp } from "lucide-react"
import type { Column } from "@/components/admin/DataTable"
import { getUsers } from "@/app/actions/users"
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
 * Customer Management Page
 *
 * Features:
 * - List all customers (users with bookings)
 * - Filter by loyalty tier and marketing opt-in
 * - Search by name/email/phone
 * - View customer details and booking history
 * - Track loyalty points and tiers
 */

interface Customer {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string
  image: string | null
  loyaltyPoints: number
  loyaltyTier: string
  totalSpent: number
  totalBookings: number
  lastBookingDate: Date | null
  firstBookingDate: Date | null
  marketingOptIn: boolean
  tags: string[]
  createdAt: Date
}

// Loyalty tier colors and icons
const TIER_CONFIG = {
  BRONZE: {
    icon: "🥉",
    color: "bg-orange-400/20 text-orange-400 border-orange-400/50",
    label: "Bronze"
  },
  SILVER: {
    icon: "🥈",
    color: "bg-gray-300/20 text-gray-300 border-gray-300/50",
    label: "Silver"
  },
  GOLD: {
    icon: "🥇",
    color: "bg-yellow-400/20 text-yellow-400 border-yellow-400/50",
    label: "Gold"
  },
  PLATINUM: {
    icon: "💎",
    color: "bg-cyan-400/20 text-cyan-400 border-cyan-400/50",
    label: "Platinum"
  },
  VIP: {
    icon: "⭐",
    color: "bg-purple-400/20 text-purple-400 border-purple-400/50",
    label: "VIP"
  }
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [tierFilter, setTierFilter] = useState<string>("ALL")
  const [marketingFilter, setMarketingFilter] = useState<string>("ALL")

  // Store all users for client-side filtering and pagination
  const [allUsers, setAllUsers] = useState<Customer[]>([])

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setIsLoading(true)

      // Fetch ALL users (no limit)
      const result = await getUsers({
        search: searchQuery || undefined,
        limit: 1000, // High limit to get all users
        offset: 0,
      })

      if (result.success && result.users) {
        setAllUsers(result.users as Customer[])
      }
    } catch (error) {
      logger.error("Failed to fetch customers", error instanceof Error ? error : new Error(String(error)))
      toast.error("Failed to load customers")
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters and pagination client-side
  useEffect(() => {
    let filteredUsers = [...allUsers]

    // Apply tier filter
    if (tierFilter !== "ALL") {
      filteredUsers = filteredUsers.filter(u => u.loyaltyTier === tierFilter)
    }

    // Apply marketing filter
    if (marketingFilter === "OPTED_IN") {
      filteredUsers = filteredUsers.filter(u => u.marketingOptIn === true)
    } else if (marketingFilter === "OPTED_OUT") {
      filteredUsers = filteredUsers.filter(u => u.marketingOptIn === false)
    }

    // Calculate pagination
    const total = filteredUsers.length
    const totalPages = Math.ceil(total / pagination.limit)
    const start = (pagination.page - 1) * pagination.limit
    const end = start + pagination.limit
    const paginatedUsers = filteredUsers.slice(start, end)

    setCustomers(paginatedUsers)
    setPagination(prev => ({
      ...prev,
      total,
      totalPages,
    }))
  }, [allUsers, tierFilter, marketingFilter, pagination.page, pagination.limit])

  useEffect(() => {
    fetchCustomers()
  }, [])

  // Handle search
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchCustomers()
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [tierFilter, marketingFilter])

  // Handle row click
  const handleRowClick = (customer: Customer) => {
    router.push(`/admin/customers/${customer.id}`)
  }

  // Calculate statistics
  const stats = {
    totalCustomers: customers.length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    totalBookings: customers.reduce((sum, c) => sum + c.totalBookings, 0),
    marketingOptIn: customers.filter(c => c.marketingOptIn).length,
  }

  // Table columns
  const columns: Column<Customer>[] = [
    {
      header: "Customer",
      accessor: (customer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-400/10 overflow-hidden relative">
            {customer.image ? (
              <Image src={customer.image} alt={customer.name || "Customer"} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cyan-400">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-cyan-300">{customer.name || "Unnamed Customer"}</div>
            <div className="text-xs text-cyan-100/50">{customer.email}</div>
            {customer.phone && (
              <div className="text-xs text-cyan-100/40 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" />
                {customer.phone}
              </div>
            )}
          </div>
        </div>
      ),
      width: "w-64",
    },
    {
      header: "Loyalty Tier",
      accessor: (customer) => {
        const tier = TIER_CONFIG[customer.loyaltyTier as keyof typeof TIER_CONFIG] || TIER_CONFIG.BRONZE
        return (
          <div className="flex flex-col gap-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border w-fit",
                tier.color
              )}
            >
              <span>{tier.icon}</span>
              {tier.label}
            </span>
            <span className="text-xs text-cyan-100/50">
              {customer.loyaltyPoints.toLocaleString()} pts
            </span>
          </div>
        )
      },
      width: "w-32",
    },
    {
      header: "Bookings",
      accessor: (customer) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-cyan-300">
            {customer.totalBookings}
          </span>
          {customer.lastBookingDate && (
            <span className="text-xs text-cyan-100/50">
              Last: {format(new Date(customer.lastBookingDate), "MMM dd")}
            </span>
          )}
        </div>
      ),
      width: "w-24",
      center: true,
    },
    {
      header: "Total Spent",
      accessor: (customer) => (
        <span className="text-sm font-medium text-cyan-300">
          ${customer.totalSpent.toFixed(2)}
        </span>
      ),
      width: "w-28",
      center: true,
    },
    {
      header: "Marketing",
      accessor: (customer) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border",
            customer.marketingOptIn
              ? "bg-green-400/20 text-green-400 border-green-400/50"
              : "bg-red-400/20 text-red-400 border-red-400/50"
          )}
        >
          <Mail className="w-3 h-3" />
          {customer.marketingOptIn ? "Opted In" : "Opted Out"}
        </span>
      ),
      width: "w-32",
      center: true,
    },
    {
      header: "Tags",
      accessor: (customer) => (
        <div className="flex flex-wrap gap-1">
          {customer.tags && customer.tags.length > 0 ? (
            customer.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-purple-400/20 text-purple-400 border border-purple-400/30"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-cyan-100/30">No tags</span>
          )}
          {customer.tags && customer.tags.length > 2 && (
            <span className="text-xs text-cyan-100/50">+{customer.tags.length - 2}</span>
          )}
        </div>
      ),
      width: "w-40",
    },
    {
      header: "Actions",
      accessor: (customer) => (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-400 hover:bg-cyan-400/10">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/90 border-cyan-400/20 text-cyan-100">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/admin/customers/${customer.id}`)}>
                <UserIcon className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = `mailto:${customer.email}`}>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              {customer.phone && (
                <DropdownMenuItem onClick={() => window.location.href = `tel:${customer.phone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Customer
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-cyan-400/20" />
              <DropdownMenuItem onClick={() => router.push(`/admin/customers/${customer.id}`)}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Manage Loyalty Points
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
            Customer Management
          </h1>
          <p className="text-sm text-cyan-100/60 mt-1">
            Manage customer relationships, loyalty program, and marketing lists
          </p>
        </div>

        <Button
          onClick={() => router.push('/admin/customers/insights')}
          className="bg-purple-500/20 border border-purple-400/50 text-purple-300 hover:bg-purple-500/30"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          View Customer Insights
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30"
        >
          <div className="text-sm text-cyan-100/60">Total Customers</div>
          <div className="text-2xl font-bold text-cyan-300 mt-1">{stats.totalCustomers}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30"
        >
          <div className="text-sm text-cyan-100/60">Total Revenue</div>
          <div className="text-2xl font-bold text-purple-300 mt-1">${stats.totalRevenue.toFixed(2)}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30"
        >
          <div className="text-sm text-cyan-100/60">Total Bookings</div>
          <div className="text-2xl font-bold text-yellow-300 mt-1">{stats.totalBookings}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30"
        >
          <div className="text-sm text-cyan-100/60">Marketing Opt-In</div>
          <div className="text-2xl font-bold text-green-300 mt-1">
            {stats.marketingOptIn}
            <span className="text-sm text-cyan-100/50 ml-2">
              ({stats.totalCustomers > 0 ? Math.round((stats.marketingOptIn / stats.totalCustomers) * 100) : 0}%)
            </span>
          </div>
        </motion.div>
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
                placeholder="Search by name, email, or phone..."
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

          {/* Loyalty Tier Filter */}
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-40 bg-black/40 border-cyan-400/30 text-white">
              <SelectValue placeholder="Loyalty Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Tiers</SelectItem>
              <SelectItem value="BRONZE">🥉 Bronze</SelectItem>
              <SelectItem value="SILVER">🥈 Silver</SelectItem>
              <SelectItem value="GOLD">🥇 Gold</SelectItem>
              <SelectItem value="PLATINUM">💎 Platinum</SelectItem>
              <SelectItem value="VIP">⭐ VIP</SelectItem>
            </SelectContent>
          </Select>

          {/* Marketing Filter */}
          <Select value={marketingFilter} onValueChange={setMarketingFilter}>
            <SelectTrigger className="w-40 bg-black/40 border-cyan-400/30 text-white">
              <SelectValue placeholder="Marketing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Customers</SelectItem>
              <SelectItem value="OPTED_IN">Opted In</SelectItem>
              <SelectItem value="OPTED_OUT">Opted Out</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Table */}
      <DataTable
        data={customers}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage="No customers found"
        onRowClick={handleRowClick}
      />
    </div>
  )
}

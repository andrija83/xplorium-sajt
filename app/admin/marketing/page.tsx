"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Mail,
  Users,
  Filter,
  Download,
  Send,
  TrendingUp,
  Star,
  Tag as TagIcon,
  MessageSquare,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { getMarketingList, getCustomerTags, exportMarketingList, getMarketingStats } from "@/app/actions/marketing"
import { convertToCSV, downloadCSV, generateFilename } from "@/lib/csv-export"

/**
 * Marketing Campaign Builder Page
 *
 * Features:
 * - Segment builder with multiple filters
 * - Preview recipient list
 * - Export to CSV
 * - Marketing statistics dashboard
 */

interface Customer {
  id: string
  email: string
  name: string | null
  phone: string | null
  loyaltyTier: string
  loyaltyPoints: number
  totalBookings: number
  totalSpent: number
  tags: string[]
  marketingOptIn: boolean
  smsOptIn: boolean
  preferredContactMethod: string
}

interface MarketingStats {
  totalCustomers: number
  emailOptIn: number
  smsOptIn: number
  emailOptInRate: number
  smsOptInRate: number
  tierDistribution: Record<string, number>
  avgBookings: number
  avgSpent: number
}

const TIER_CONFIG = {
  BRONZE: { icon: "🥉", label: "Bronze", color: "bg-orange-400/20 text-orange-400" },
  SILVER: { icon: "🥈", label: "Silver", color: "bg-gray-300/20 text-gray-300" },
  GOLD: { icon: "🥇", label: "Gold", color: "bg-yellow-400/20 text-yellow-400" },
  PLATINUM: { icon: "💎", label: "Platinum", color: "bg-cyan-400/20 text-cyan-400" },
  VIP: { icon: "⭐", label: "VIP", color: "bg-purple-400/20 text-purple-400" },
}

export default function MarketingPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [stats, setStats] = useState<MarketingStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filters
  const [loyaltyTier, setLoyaltyTier] = useState<string>("ALL")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [minBookings, setMinBookings] = useState("")
  const [minSpent, setMinSpent] = useState("")
  const [channelFilter, setChannelFilter] = useState<string>("EMAIL")

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [tagsResult, statsResult] = await Promise.all([
        getCustomerTags(),
        getMarketingStats(),
      ])

      if (tagsResult.success && tagsResult.tags) {
        setAvailableTags(tagsResult.tags)
      }

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats)
      }
    } catch (error) {
      toast.error("Failed to load data")
    }
  }

  const handleGenerateList = async () => {
    setIsLoading(true)

    try {
      const filters: any = {}

      if (loyaltyTier !== "ALL") {
        filters.loyaltyTier = loyaltyTier
      }

      if (selectedTags.length > 0) {
        filters.tags = selectedTags
      }

      if (minBookings) {
        filters.minBookings = parseInt(minBookings)
      }

      if (minSpent) {
        filters.minSpent = parseFloat(minSpent)
      }

      if (channelFilter === "SMS") {
        filters.smsOptIn = true
      } else {
        filters.marketingOptIn = true
      }

      const result = await getMarketingList(filters)

      if (result.success && result.customers) {
        setCustomers(result.customers as Customer[])
        toast.success(`Generated list of ${result.count} customers`)
      } else {
        toast.error(result.error || "Failed to generate list")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    setIsLoading(true)

    try {
      const filters: any = {}

      if (loyaltyTier !== "ALL") filters.loyaltyTier = loyaltyTier
      if (selectedTags.length > 0) filters.tags = selectedTags
      if (minBookings) filters.minBookings = parseInt(minBookings)
      if (minSpent) filters.minSpent = parseFloat(minSpent)

      const result = await exportMarketingList(filters)

      if (result.success && result.data) {
        const csvContent = convertToCSV(result.data)
        downloadCSV(csvContent, generateFilename('marketing-list'))
        toast.success(`Exported ${result.count} customers`)
      } else {
        toast.error(result.error || "Failed to export")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <Mail className="w-7 h-7" />
          Email Marketing Campaigns
        </h1>
        <p className="text-sm text-cyan-100/60 mt-1">
          Build targeted campaigns and manage your marketing lists
        </p>
      </div>

      {/* Marketing Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30"
          >
            <div className="flex items-center gap-2 text-sm text-cyan-100/60">
              <Users className="w-4 h-4" />
              Total Customers
            </div>
            <div className="text-2xl font-bold text-cyan-300 mt-1">
              {stats.totalCustomers}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30"
          >
            <div className="flex items-center gap-2 text-sm text-cyan-100/60">
              <Mail className="w-4 h-4" />
              Email Opt-In
            </div>
            <div className="text-2xl font-bold text-green-300 mt-1">
              {stats.emailOptIn}
              <span className="text-sm text-cyan-100/50 ml-2">
                ({Math.round(stats.emailOptInRate)}%)
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30"
          >
            <div className="flex items-center gap-2 text-sm text-cyan-100/60">
              <MessageSquare className="w-4 h-4" />
              SMS Opt-In
            </div>
            <div className="text-2xl font-bold text-purple-300 mt-1">
              {stats.smsOptIn}
              <span className="text-sm text-cyan-100/50 ml-2">
                ({Math.round(stats.smsOptInRate)}%)
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30"
          >
            <div className="flex items-center gap-2 text-sm text-cyan-100/60">
              <TrendingUp className="w-4 h-4" />
              Avg. Spent
            </div>
            <div className="text-2xl font-bold text-yellow-300 mt-1">
              ${stats.avgSpent.toFixed(2)}
            </div>
          </motion.div>
        </div>
      )}

      {/* Segment Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Filters */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-black/20 backdrop-blur-sm border-cyan-400/20">
            <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5" />
              Segment Builder
            </h3>

            <div className="space-y-4">
              {/* Channel Filter */}
              <div>
                <Label className="text-sm font-medium text-cyan-100 mb-2 block">
                  Channel
                </Label>
                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger className="bg-black/40 border-cyan-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">📧 Email</SelectItem>
                    <SelectItem value="SMS">📱 SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Loyalty Tier Filter */}
              <div>
                <Label className="text-sm font-medium text-cyan-100 mb-2 block">
                  Loyalty Tier
                </Label>
                <Select value={loyaltyTier} onValueChange={setLoyaltyTier}>
                  <SelectTrigger className="bg-black/40 border-cyan-400/30 text-white">
                    <SelectValue />
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
              </div>

              {/* Min Bookings */}
              <div>
                <Label className="text-sm font-medium text-cyan-100 mb-2 block">
                  Minimum Bookings
                </Label>
                <Input
                  type="number"
                  placeholder="e.g., 3"
                  value={minBookings}
                  onChange={(e) => setMinBookings(e.target.value)}
                  className="bg-black/40 border-cyan-400/30 text-white"
                />
              </div>

              {/* Min Spent */}
              <div>
                <Label className="text-sm font-medium text-cyan-100 mb-2 block">
                  Minimum Spent ($)
                </Label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={minSpent}
                  onChange={(e) => setMinSpent(e.target.value)}
                  className="bg-black/40 border-cyan-400/30 text-white"
                />
              </div>

              {/* Tags Filter */}
              <div>
                <Label className="text-sm font-medium text-cyan-100 mb-2 block flex items-center gap-2">
                  <TagIcon className="w-4 h-4" />
                  Customer Tags
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.length > 0 ? (
                    availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={`cursor-pointer transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-purple-500 text-white border-purple-400"
                            : "bg-purple-400/10 text-purple-400 border-purple-400/30 hover:bg-purple-400/20"
                        }`}
                      >
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-cyan-100/40">No tags available</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                <Button
                  onClick={handleGenerateList}
                  disabled={isLoading}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  <Target className="w-4 h-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate List"}
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isLoading || customers.length === 0}
                  variant="outline"
                  className="w-full border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export to CSV
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Recipient List Preview */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-black/20 backdrop-blur-sm border-cyan-400/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recipient List
                {customers.length > 0 && (
                  <Badge className="bg-cyan-400/20 text-cyan-400">
                    {customers.length} recipients
                  </Badge>
                )}
              </h3>
            </div>

            {customers.length > 0 ? (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {customers.map((customer) => {
                  const tier = TIER_CONFIG[customer.loyaltyTier as keyof typeof TIER_CONFIG]
                  return (
                    <div
                      key={customer.id}
                      className="p-4 rounded-lg bg-black/20 border border-cyan-400/10 hover:bg-cyan-400/5 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-cyan-100">
                            {customer.name || "Unnamed Customer"}
                          </div>
                          <div className="text-sm text-cyan-100/60 flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </span>
                            {customer.phone && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {customer.phone}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {tier && (
                              <Badge className={tier.color}>
                                {tier.icon} {tier.label}
                              </Badge>
                            )}
                            <span className="text-xs text-cyan-100/50">
                              {customer.totalBookings} bookings
                            </span>
                            <span className="text-xs text-cyan-100/50">
                              ${customer.totalSpent.toFixed(2)} spent
                            </span>
                          </div>
                          {customer.tags && customer.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {customer.tags.map((tag, idx) => (
                                <Badge
                                  key={idx}
                                  className="bg-purple-400/10 text-purple-400 text-xs border-purple-400/20"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-cyan-100/40">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No recipients yet</p>
                <p className="text-sm mt-2">
                  Use the segment builder to generate a targeted customer list
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Info Box */}
      <Card className="p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-400/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-cyan-400/20">
            <Mail className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-cyan-100 mb-1">
              Email Marketing Best Practices
            </h4>
            <ul className="text-sm text-cyan-100/60 space-y-1">
              <li>• Always respect customer opt-out preferences</li>
              <li>• Segment your audience for better engagement</li>
              <li>• Test your emails before sending to the full list</li>
              <li>• Include an unsubscribe link in all marketing emails</li>
              <li>• Track campaign performance and optimize accordingly</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

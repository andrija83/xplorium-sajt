"use client"

import { useState } from "react"
import { Star, Plus, Minus, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { updateLoyaltyPoints } from "@/app/actions/loyalty"
import { cn } from "@/lib/utils"

interface LoyaltyPointsCardProps {
  userId: string
  currentPoints: number
  currentTier: string
}

// Loyalty tier configuration
const TIER_CONFIG = {
  BRONZE: {
    icon: "🥉",
    color: "bg-orange-400/20 text-orange-400 border-orange-400/50",
    label: "Bronze",
    minPoints: 0
  },
  SILVER: {
    icon: "🥈",
    color: "bg-gray-300/20 text-gray-300 border-gray-300/50",
    label: "Silver",
    minPoints: 1000
  },
  GOLD: {
    icon: "🥇",
    color: "bg-yellow-400/20 text-yellow-400 border-yellow-400/50",
    label: "Gold",
    minPoints: 3000
  },
  PLATINUM: {
    icon: "💎",
    color: "bg-cyan-400/20 text-cyan-400 border-cyan-400/50",
    label: "Platinum",
    minPoints: 6000
  },
  VIP: {
    icon: "⭐",
    color: "bg-purple-400/20 text-purple-400 border-purple-400/50",
    label: "VIP",
    minPoints: 10000
  }
}

export function LoyaltyPointsCard({ userId, currentPoints, currentTier }: LoyaltyPointsCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isSubtracting, setIsSubtracting] = useState(false)
  const [points, setPoints] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const tier = TIER_CONFIG[currentTier as keyof typeof TIER_CONFIG] || TIER_CONFIG.BRONZE

  const handleUpdatePoints = async (add: boolean) => {
    if (!points || parseInt(points) <= 0) {
      toast.error("Please enter a valid number of points")
      return
    }

    setIsLoading(true)

    try {
      const pointsValue = parseInt(points)
      const result = await updateLoyaltyPoints(
        userId,
        add ? pointsValue : -pointsValue,
        reason || undefined
      )

      if (result.success) {
        toast.success(result.message)
        setPoints("")
        setReason("")
        setIsAdding(false)
        setIsSubtracting(false)
      } else {
        toast.error(result.error || "Failed to update points")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate progress to next tier
  const nextTierKey = Object.keys(TIER_CONFIG).find(
    (key) => TIER_CONFIG[key as keyof typeof TIER_CONFIG].minPoints > currentPoints
  )
  const nextTier = nextTierKey ? TIER_CONFIG[nextTierKey as keyof typeof TIER_CONFIG] : null
  const progress = nextTier
    ? ((currentPoints - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100
    : 100

  return (
    <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 p-6">
      <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2 mb-4">
        <Star className="w-5 h-5" />
        Loyalty Program
      </h3>

      {/* Current Tier */}
      <div className="mb-6">
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-medium border",
          tier.color
        )}>
          <span className="text-2xl">{tier.icon}</span>
          {tier.label} Tier
        </div>
        <div className="text-3xl font-bold text-white mt-3">
          {currentPoints.toLocaleString()} <span className="text-lg text-cyan-100/50">points</span>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {nextTier && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-cyan-100/60 mb-2">
            <span>Progress to {nextTier.label}</span>
            <span>{Math.min(Math.round(progress), 100)}%</span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-cyan-100/40 mt-1">
            {nextTier.minPoints - currentPoints} points until {nextTier.label}
          </div>
        </div>
      )}

      {/* Tier Milestones */}
      <div className="space-y-2 mb-6 pb-6 border-b border-cyan-400/10">
        <div className="text-xs font-medium text-cyan-100/60 mb-2">TIER LEVELS</div>
        {Object.entries(TIER_CONFIG).map(([key, config]) => (
          <div
            key={key}
            className={cn(
              "flex items-center justify-between text-sm py-1 px-2 rounded",
              currentTier === key ? "bg-cyan-400/10" : ""
            )}
          >
            <span className="flex items-center gap-2">
              <span>{config.icon}</span>
              <span className={currentTier === key ? "text-cyan-300 font-medium" : "text-cyan-100/50"}>
                {config.label}
              </span>
            </span>
            <span className={currentTier === key ? "text-cyan-300 font-medium" : "text-cyan-100/40"}>
              {config.minPoints.toLocaleString()}+ pts
            </span>
          </div>
        ))}
      </div>

      {/* Manage Points */}
      <div className="space-y-3">
        {!isAdding && !isSubtracting ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Points
            </Button>
            <Button
              onClick={() => setIsSubtracting(true)}
              variant="outline"
              className="border-red-400/30 text-red-400 hover:bg-red-400/10"
            >
              <Minus className="w-4 h-4 mr-2" />
              Subtract
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="Number of points"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="bg-black/40 border-cyan-400/30 text-white"
            />
            <Textarea
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-black/40 border-cyan-400/30 text-white min-h-[60px]"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleUpdatePoints(isAdding)}
                disabled={isLoading}
                className={isAdding
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
                }
              >
                {isLoading ? "Updating..." : isAdding ? "Add Points" : "Subtract Points"}
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false)
                  setIsSubtracting(false)
                  setPoints("")
                  setReason("")
                }}
                variant="outline"
                className="border-cyan-400/30 text-cyan-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

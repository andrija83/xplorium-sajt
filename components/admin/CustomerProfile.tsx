"use client"

import { User as UserIcon, Mail, Phone, Calendar, Clock } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"

interface CustomerProfileProps {
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
    image: string | null
    role: string
    blocked: boolean
    emailVerified: Date | null
    createdAt: Date
    updatedAt: Date
  }
}

// Loyalty tier configuration
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

export function CustomerProfile({ user }: CustomerProfileProps) {
  return (
    <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 p-6">
      <h3 className="text-lg font-semibold text-cyan-300 mb-4">
        Profile Information
      </h3>

      {/* Avatar */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-cyan-400/10 overflow-hidden relative flex-shrink-0 border-2 border-cyan-400/30">
          {user.image ? (
            <Image src={user.image} alt={user.name || "Customer"} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-cyan-400">
              <UserIcon className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-semibold text-white mb-1">
            {user.name || "Unnamed Customer"}
          </h4>
          <div className="flex items-center text-sm text-cyan-100/60 gap-2">
            <Mail className="w-4 h-4" />
            {user.email}
          </div>
          {user.emailVerified && (
            <div className="text-xs text-green-400 mt-1">
              ✓ Email verified
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3 mb-6 pb-6 border-b border-cyan-400/10">
        {user.phone ? (
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-cyan-100/40">Phone</p>
              <p className="text-cyan-100">{user.phone}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-cyan-400/40" />
            <div>
              <p className="text-cyan-100/40">Phone</p>
              <p className="text-cyan-100/30 italic">Not provided</p>
            </div>
          </div>
        )}
      </div>

      {/* Account Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <div>
            <p className="text-cyan-100/40">Account Created</p>
            <p className="text-cyan-100">{format(new Date(user.createdAt), "PPP")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-cyan-400" />
          <div>
            <p className="text-cyan-100/40">Last Updated</p>
            <p className="text-cyan-100">{format(new Date(user.updatedAt), "PPP")}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

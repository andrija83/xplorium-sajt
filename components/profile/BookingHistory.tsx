"use client"

import { Calendar, Clock, Users, MapPin } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Booking {
    id: string
    title: string
    date: Date
    time: string
    type: string
    guestCount: number
    status: string
    specialRequests?: string | null
}

interface BookingHistoryProps {
    bookings: Booking[]
}

const STATUS_COLORS = {
    PENDING: "bg-yellow-400/20 text-yellow-400 border-yellow-400/50",
    APPROVED: "bg-green-400/20 text-green-400 border-green-400/50",
    REJECTED: "bg-red-400/20 text-red-400 border-red-400/50",
    CANCELLED: "bg-gray-400/20 text-gray-400 border-gray-400/50",
    COMPLETED: "bg-blue-400/20 text-blue-400 border-blue-400/50",
}

const TYPE_LABELS = {
    CAFE: "Cafe",
    SENSORY_ROOM: "Sensory Room",
    PLAYGROUND: "Playground",
    PARTY: "Party",
    EVENT: "Event",
}

export default function BookingHistory({ bookings }: BookingHistoryProps) {
    if (bookings.length === 0) {
        return (
            <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">Booking History</h2>
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
                    <p className="text-cyan-100/60">No bookings yet</p>
                    <p className="text-cyan-100/40 text-sm mt-2">
                        Your booking history will appear here
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20">
            <h2 className="text-xl font-bold text-cyan-400 mb-6">
                Booking History ({bookings.length})
            </h2>

            <div className="space-y-4">
                {bookings.map((booking, index) => (
                    <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg bg-black/30 border border-cyan-400/10 hover:border-cyan-400/30 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-semibold text-cyan-300">{booking.title}</h3>
                                <p className="text-xs text-cyan-100/50 mt-1">
                                    {TYPE_LABELS[booking.type as keyof typeof TYPE_LABELS] || booking.type}
                                </p>
                            </div>
                            <span
                                className={cn(
                                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
                                    STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS]
                                )}
                            >
                                {booking.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-cyan-100/70">
                                <Calendar className="w-4 h-4 text-cyan-400" />
                                <span>{format(new Date(booking.date), "MMM dd, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-cyan-100/70">
                                <Clock className="w-4 h-4 text-cyan-400" />
                                <span>{booking.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-cyan-100/70">
                                <Users className="w-4 h-4 text-cyan-400" />
                                <span>{booking.guestCount} {booking.guestCount === 1 ? "guest" : "guests"}</span>
                            </div>
                        </div>

                        {booking.specialRequests && (
                            <div className="mt-3 pt-3 border-t border-cyan-400/10">
                                <p className="text-xs text-cyan-100/50">Special Requests:</p>
                                <p className="text-sm text-cyan-100/70 mt-1">
                                    {booking.specialRequests}
                                </p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

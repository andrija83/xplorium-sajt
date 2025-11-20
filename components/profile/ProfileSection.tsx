"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import ProfileHeader from "@/components/profile/ProfileHeader"
import LoyaltyCard from "@/components/profile/LoyaltyCard"
import BookingHistory from "@/components/profile/BookingHistory"
import { getUserBookings } from "@/app/actions/bookings"

export function ProfileSection() {
    const { data: session, status } = useSession()
    const [bookings, setBookings] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchBookings = async () => {
            if (session?.user) {
                const result = await getUserBookings()
                if (result.success) {
                    setBookings(result.bookings)
                }
                setIsLoading(false)
            }
        }

        if (status === "authenticated") {
            fetchBookings()
        }
    }, [session, status])

    if (status === "loading" || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
            </div>
        )
    }

    if (!session?.user) {
        return null
    }

    const approvedBookings = bookings.filter(
        (b) => b.status === "APPROVED" || b.status === "COMPLETED"
    ).length

    return (
        <div className="w-full py-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center sm:text-left"
            >
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    My Profile
                </h1>
                <p className="text-cyan-100/60 mt-2">
                    Manage your account and view your booking history
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile & Loyalty */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <ProfileHeader
                            user={{
                                name: session.user.name || null,
                                email: session.user.email || "",
                                image: session.user.image,
                                createdAt: new Date(), // Ideally fetch this from DB or session if available
                            }}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <LoyaltyCard
                            totalBookings={bookings.length}
                            approvedBookings={approvedBookings}
                        />
                    </motion.div>
                </div>

                {/* Right Column - Booking History */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2"
                >
                    <BookingHistory bookings={bookings} />
                </motion.div>
            </div>
        </div>
    )
}

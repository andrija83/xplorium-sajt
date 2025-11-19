import { Gift, Star, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

interface LoyaltyCardProps {
    totalBookings: number
    approvedBookings: number
}

export default function LoyaltyCard({
    totalBookings,
    approvedBookings,
}: LoyaltyCardProps) {
    // Calculate visit tier
    const getVisitTier = (count: number) => {
        if (count >= 10) return { name: "Frequent Visitor", color: "from-yellow-400 to-orange-500" }
        if (count >= 5) return { name: "Regular", color: "from-cyan-400 to-blue-500" }
        return { name: "New Member", color: "from-gray-400 to-gray-500" }
    }

    const tier = getVisitTier(approvedBookings)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border border-cyan-400/20 relative overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl" />

            <div className="relative">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                            <Gift className="w-5 h-5" />
                            Loyalty Program
                        </h2>
                        <p className="text-cyan-100/60 text-sm mt-1">
                            Track your visits and unlock rewards
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${tier.color} text-white font-semibold text-sm`}>
                        {tier.name}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-black/30 border border-cyan-400/10">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs text-cyan-100/60">Total Bookings</span>
                        </div>
                        <p className="text-2xl font-bold text-cyan-300">{totalBookings}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-black/30 border border-cyan-400/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs text-cyan-100/60">Completed Visits</span>
                        </div>
                        <p className="text-2xl font-bold text-cyan-300">{approvedBookings}</p>
                    </div>
                </div>

                {/* Coming Soon */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-400/10 to-blue-500/10 border border-cyan-400/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center">
                            <Gift className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-cyan-300">
                                Exclusive Rewards Coming Soon!
                            </p>
                            <p className="text-xs text-cyan-100/60 mt-1">
                                Earn discounts and free programs based on your visit frequency
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

import { getUserById } from "@/app/actions/users"
import { notFound } from "next/navigation"
import { CustomerProfile } from "@/components/admin/CustomerProfile"
import { LoyaltyPointsCard } from "@/components/admin/LoyaltyPointsCard"
import { CustomerTagsCard } from "@/components/admin/CustomerTagsCard"
import { CustomerNotesCard } from "@/components/admin/CustomerNotesCard"
import { MarketingPreferencesCard } from "@/components/admin/MarketingPreferencesCard"
import { format } from "date-fns"
import { Calendar, TrendingUp, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function CustomerDetailsPage({ params }: PageProps) {
    const { id } = await params
    const result = await getUserById(id)

    if (!result.success || !result.user) {
        notFound()
    }

    const { user } = result

    // Calculate customer value metrics
    const lifetimeValue = user.totalSpent || 0
    const averageBookingValue = user.totalBookings > 0
        ? lifetimeValue / user.totalBookings
        : 0

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-cyan-400">Customer Profile</h1>
                    <p className="text-sm text-cyan-100/60 mt-1">
                        Manage customer information, loyalty points, and preferences
                    </p>
                </div>
                <Link href="/admin/customers">
                    <Button variant="outline" className="border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10">
                        Back to Customers
                    </Button>
                </Link>
            </div>

            {/* Customer Value Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30">
                    <div className="text-sm text-cyan-100/60">Lifetime Value</div>
                    <div className="text-2xl font-bold text-cyan-300 mt-1">
                        ${lifetimeValue.toFixed(2)}
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                    <div className="text-sm text-cyan-100/60">Total Bookings</div>
                    <div className="text-2xl font-bold text-purple-300 mt-1">
                        {user.totalBookings || 0}
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
                    <div className="text-sm text-cyan-100/60">Avg. Booking Value</div>
                    <div className="text-2xl font-bold text-yellow-300 mt-1">
                        ${averageBookingValue.toFixed(2)}
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30">
                    <div className="text-sm text-cyan-100/60">Customer Since</div>
                    <div className="text-lg font-bold text-green-300 mt-1">
                        {user.firstBookingDate
                            ? format(new Date(user.firstBookingDate), "MMM yyyy")
                            : format(new Date(user.createdAt), "MMM yyyy")
                        }
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile & Loyalty */}
                <div className="space-y-6">
                    <CustomerProfile user={user} />
                    <LoyaltyPointsCard
                        userId={user.id}
                        currentPoints={user.loyaltyPoints || 0}
                        currentTier={user.loyaltyTier || 'BRONZE'}
                    />
                </div>

                {/* Middle Column - Tags & Notes */}
                <div className="space-y-6">
                    <CustomerTagsCard
                        userId={user.id}
                        tags={user.tags || []}
                    />
                    <CustomerNotesCard
                        userId={user.id}
                        notes={user.customerNotes || ''}
                    />
                </div>

                {/* Right Column - Marketing & Stats */}
                <div className="space-y-6">
                    <MarketingPreferencesCard
                        userId={user.id}
                        marketingOptIn={user.marketingOptIn || false}
                        smsOptIn={user.smsOptIn || false}
                        preferredContactMethod={user.preferredContactMethod || 'EMAIL'}
                    />

                    {/* Customer Stats */}
                    <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 p-6">
                        <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5" />
                            Customer Statistics
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-cyan-100/60">First Booking</span>
                                <span className="text-sm text-cyan-100">
                                    {user.firstBookingDate
                                        ? format(new Date(user.firstBookingDate), "PPP")
                                        : "No bookings yet"
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-cyan-100/60">Last Booking</span>
                                <span className="text-sm text-cyan-100">
                                    {user.lastBookingDate
                                        ? format(new Date(user.lastBookingDate), "PPP")
                                        : "No bookings yet"
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-cyan-100/60">Total Spent</span>
                                <span className="text-sm font-medium text-cyan-300">
                                    ${(user.totalSpent || 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-cyan-100/60">Account Status</span>
                                <span className={`text-sm font-medium ${user.blocked ? 'text-red-400' : 'text-green-400'}`}>
                                    {user.blocked ? 'Blocked' : 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking History */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Booking History
                    <span className="text-sm font-normal text-cyan-100/60 ml-2">
                        ({user.bookings?.length || 0} total)
                    </span>
                </h3>
                <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 overflow-hidden">
                    {user.bookings && user.bookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-cyan-400/20 bg-cyan-400/5">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                                            Time
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                                            Guests
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-cyan-400/10">
                                    {user.bookings.map((booking: any) => (
                                        <tr key={booking.id} className="hover:bg-cyan-400/5 transition-colors">
                                            <td className="px-4 py-3 text-sm text-cyan-100">
                                                {booking.title}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-cyan-100/70">
                                                {format(new Date(booking.date), "MMM dd, yyyy")}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-cyan-100/70">
                                                {booking.time}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-cyan-100/70">
                                                {booking.type}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-cyan-100/70">
                                                {booking.guestCount}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                                                    booking.status === 'APPROVED'
                                                        ? 'bg-green-400/20 text-green-400 border-green-400/50'
                                                        : booking.status === 'PENDING'
                                                        ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50'
                                                        : booking.status === 'REJECTED'
                                                        ? 'bg-red-400/20 text-red-400 border-red-400/50'
                                                        : 'bg-cyan-400/20 text-cyan-400 border-cyan-400/50'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-cyan-100/40">
                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No bookings found</p>
                            <p className="text-xs mt-1">Customer hasn't made any bookings yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

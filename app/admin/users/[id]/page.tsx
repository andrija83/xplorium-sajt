import { getUserById } from "@/app/actions/users"
import { notFound } from "next/navigation"
import { UserRoleSelector } from "@/components/admin/UserRoleSelector"
import { format } from "date-fns"
import { Shield, User as UserIcon, Calendar, Mail, Clock, History } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function UserDetailsPage({ params }: PageProps) {
    const { id } = await params
    const result = await getUserById(id)

    if (!result.success || !result.user) {
        notFound()
    }

    const { user } = result

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-cyan-400">User Details</h1>
                <Link href="/admin/users">
                    <Button variant="outline" className="border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10">
                        Back to Users
                    </Button>
                </Link>
            </div>

            {/* Profile Card */}
            <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full bg-cyan-400/10 overflow-hidden relative flex-shrink-0 border-2 border-cyan-400/30">
                        {user.image ? (
                            <Image src={user.image} alt={user.name || "User"} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-cyan-400">
                                <UserIcon className="w-12 h-12" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-1">{user.name || "Unnamed User"}</h2>
                                <div className="flex items-center text-cyan-100/60 gap-2">
                                    <Mail className="w-4 h-4" />
                                    {user.email}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-cyan-300">Role</label>
                                <UserRoleSelector userId={user.id} currentRole={user.role} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-cyan-400/10">
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="w-4 h-4 text-cyan-400" />
                                <div>
                                    <p className="text-cyan-100/40">Joined</p>
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
                            <div className="flex items-center gap-3 text-sm">
                                <Shield className="w-4 h-4 text-cyan-400" />
                                <div>
                                    <p className="text-cyan-100/40">Status</p>
                                    <p className={user.blocked ? "text-red-400" : "text-green-400"}>
                                        {user.blocked ? "Blocked" : "Active"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Bookings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Recent Bookings
                    </h3>
                    <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 overflow-hidden">
                        {user.bookings && user.bookings.length > 0 ? (
                            <div className="divide-y divide-cyan-400/10">
                                {user.bookings.map((booking: any) => (
                                    <div key={booking.id} className="p-4 hover:bg-cyan-400/5 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-cyan-100">{booking.title}</p>
                                                <p className="text-xs text-cyan-100/50">{format(new Date(booking.date), "PPP")}</p>
                                            </div>
                                            <span className="text-xs px-2 py-1 rounded border border-cyan-400/20 text-cyan-400">
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-cyan-100/40">
                                No bookings found
                            </div>
                        )}
                    </div>
                </div>

                {/* Audit Logs */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Recent Activity
                    </h3>
                    <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 overflow-hidden">
                        {user.auditLogs && user.auditLogs.length > 0 ? (
                            <div className="divide-y divide-cyan-400/10">
                                {user.auditLogs.map((log: any) => (
                                    <div key={log.id} className="p-4 hover:bg-cyan-400/5 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-cyan-100">
                                                    {log.action} {log.entity}
                                                </p>
                                                <p className="text-xs text-cyan-100/50">{format(new Date(log.createdAt), "PPP p")}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-cyan-100/40">
                                No activity recorded
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

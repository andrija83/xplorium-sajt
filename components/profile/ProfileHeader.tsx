import { User } from "lucide-react"
import { format } from "date-fns"

interface ProfileHeaderProps {
    user: {
        name: string | null
        email: string
        image?: string | null
        createdAt: Date
    }
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
    const initials = user.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : user.email[0].toUpperCase()

    return (
        <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20">
            <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                    {user.image ? (
                        <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="w-24 h-24 rounded-full border-2 border-cyan-400/50"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border-2 border-cyan-400/50 flex items-center justify-center">
                            <span className="text-3xl font-bold text-cyan-300">
                                {initials}
                            </span>
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center border-2 border-black">
                        <User className="w-4 h-4 text-black" />
                    </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-cyan-400">
                        {user.name || "User"}
                    </h1>
                    <p className="text-cyan-100/70 mt-1">{user.email}</p>
                    <p className="text-cyan-100/50 text-sm mt-2">
                        Member since {format(new Date(user.createdAt), "MMMM yyyy")}
                    </p>
                </div>
            </div>
        </div>
    )
}

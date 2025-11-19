"use client"

import { useState } from "react"
import { updateUserRole } from "@/app/actions/users"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface UserRoleSelectorProps {
    userId: string
    currentRole: string
}

export function UserRoleSelector({ userId, currentRole }: UserRoleSelectorProps) {
    const [role, setRole] = useState(currentRole)
    const [isLoading, setIsLoading] = useState(false)

    const handleRoleChange = async (newRole: string) => {
        try {
            setIsLoading(true)
            const result = await updateUserRole({ userId, role: newRole as any })

            if (result.success) {
                setRole(newRole)
                toast.success("User role updated successfully")
            } else {
                toast.error(result.error || "Failed to update role")
                // Revert
                setRole(role)
            }
        } catch (error) {
            toast.error("An error occurred")
            setRole(role)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Select value={role} onValueChange={handleRoleChange} disabled={isLoading}>
                <SelectTrigger className="w-40 bg-black/40 border-cyan-400/30 text-white">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
            </Select>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
        </div>
    )
}

"use server"

import { getAuditLogs as getLogs } from "@/lib/audit"
import { auth } from "@/lib/auth"

export async function getAuditLogs(params: {
    userId?: string
    entity?: string
    action?: string
    limit?: number
    offset?: number
}) {
    const session = await auth()

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
        return { error: "Unauthorized" }
    }

    try {
        const logs = await getLogs(params)
        return { success: true, logs }
    } catch (error) {
        console.error("Failed to fetch audit logs:", error)
        return { error: "Failed to fetch audit logs" }
    }
}

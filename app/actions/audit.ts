"use server"

import { getAuditLogs as getLogs } from "@/lib/audit"
import { logger } from "@/lib/logger"
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
        const { logs, total } = await getLogs(params)
        return { success: true, logs, total }
    } catch (error) {
        logger.serverActionError("getAuditLogs", error)
        return { error: "Failed to fetch audit logs" }
    }
}

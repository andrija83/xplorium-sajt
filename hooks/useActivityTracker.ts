"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

/**
 * Hook to track user activity and refresh admin sessions
 * Prevents admin timeout while actively using the app
 */
export function useActivityTracker() {
    const { data: session, update } = useSession()

    useEffect(() => {
        // Only track activity for admins
        if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
            return
        }

        let activityTimeout: NodeJS.Timeout

        const resetActivityTimer = () => {
            // Clear existing timeout
            if (activityTimeout) {
                clearTimeout(activityTimeout)
            }

            // Update session to refresh lastActivity timestamp
            // This happens every 5 minutes of activity
            activityTimeout = setTimeout(() => {
                update() // Refresh the session
            }, 5 * 60 * 1000) // 5 minutes
        }

        // Activity events to track
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, resetActivityTimer)
        })

        // Initial timer
        resetActivityTimer()

        // Cleanup
        return () => {
            if (activityTimeout) {
                clearTimeout(activityTimeout)
            }
            events.forEach(event => {
                window.removeEventListener(event, resetActivityTimer)
            })
        }
    }, [session, update])
}

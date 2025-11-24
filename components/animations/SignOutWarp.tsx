"use client"

import { motion } from "framer-motion"
import { Starfield } from "../common/Starfield"

export const SignOutWarp = () => {
    // NOTE: Redirect is now handled by AuthButtons.handleSignOut
    // This component just shows the animation

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
        >
            {/* Standard Starfield Background */}
            <Starfield activeView={null} />

            {/* X Logo appears and slowly fades out while rotating */}
            <motion.div
                initial={{ opacity: 1, rotate: 0 }}
                animate={{
                    opacity: 0,
                    rotate: 180
                }}
                transition={{
                    duration: 2,
                    ease: [0.4, 0, 0.2, 1]
                }}
                className="relative z-10"
            >
                <div className="rounded-3xl overflow-hidden">
                    <img
                        src="/crystal-x-logo.jpg"
                        alt="X Logo"
                        className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48"
                    />
                </div>
            </motion.div>
        </motion.div>
    )
}

"use client"

import { motion } from "framer-motion"
import { Starfield } from "../common/Starfield"

export const SignOutWarp = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
        >
            {/* Standard Starfield Background */}
            <Starfield activeView={null} />

            {/* Central text */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.2, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, times: [0, 0.2, 1] }}
                className="relative z-10 text-center"
            >
                <h2 className="text-4xl md:text-6xl font-bold text-cyan-400 tracking-wider uppercase"
                    style={{ textShadow: "0 0 20px rgba(34, 211, 238, 0.8)" }}>
                    Disconnecting
                </h2>
                <p className="text-cyan-100/70 mt-4 text-lg">See you in the next mission</p>
            </motion.div>
        </motion.div>
    )
}

'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Check } from 'lucide-react'
import { toast } from 'sonner'
import { BirthdayBookingForm } from './BirthdayBookingForm'

interface PlayRoomBookingFormProps {
    onBack: () => void
}

interface BookingItem {
    id: string
    name: string
    price: number
    position: { [key: string]: string | number }
}

const PLAY_ROOM_ITEMS: BookingItem[] = [
    {
        id: 'sensory-room',
        name: 'Sensory Room',
        price: 5000,
        position: { top: '20%', left: '15%' }
    },
    {
        id: 'slide-room',
        name: 'Slide Room',
        price: 6000,
        position: { top: '30%', right: '15%' }
    },
    {
        id: 'minidisco',
        name: 'Minidisco',
        price: 4000,
        position: { bottom: '30%', left: '20%' }
    },
    {
        id: 'cake-room',
        name: 'Cake Room',
        price: 4000,
        position: { bottom: '25%', right: '20%' }
    }
]

const ROTATING_TEXTS = [
    'SELECT YOUR EXPERIENCE',
    'CHOOSE YOUR ADVENTURE',
    'PICK YOUR PLAYGROUND',
    'CREATE YOUR MEMORIES',
    'BUILD YOUR PARTY'
]

export const PlayRoomBookingForm = ({ onBack }: PlayRoomBookingFormProps) => {
    const [step, setStep] = useState<'selection' | 'details'>('selection')
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const [currentTextIndex, setCurrentTextIndex] = useState(0)

    // Pink neon glow for Play Room theme
    const neonPinkGlow = '0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 30px #ec4899'

    // Rotate text every 3 seconds
    useEffect(() => {
        if (step !== 'selection') return

        const interval = setInterval(() => {
            setCurrentTextIndex((prev) => (prev + 1) % ROTATING_TEXTS.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [step])

    const toggleItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        )
    }

    const totalPrice = useMemo(() => {
        return selectedItems.reduce((sum, id) => {
            const item = PLAY_ROOM_ITEMS.find(i => i.id === id)
            return sum + (item?.price || 0)
        }, 0)
    }, [selectedItems])

    const handleContinue = () => {
        setStep('details')
    }

    const handleBack = () => {
        if (step === 'details') {
            setStep('selection')
        } else {
            onBack()
        }
    }

    return (
        <div className={`w-full relative ${step === 'selection' ? 'h-screen overflow-hidden' : 'min-h-screen bg-black'}`}>
            {/* Back button - Absolute top left (Only visible in selection) */}
            {step === 'selection' && (
                <motion.button
                    onClick={handleBack}
                    className="absolute top-8 left-8 flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors z-50"
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ArrowLeft className="w-6 h-6" />
                    <span className="text-lg">Back</span>
                </motion.button>
            )}

            {/* Header - Center Top (Only visible in selection) */}
            <AnimatePresence>
                {step === 'selection' && (
                    <motion.div
                        className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-40"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                    >
                        <h2
                            className="text-4xl md:text-5xl font-bold"
                            style={{
                                color: '#ec4899',
                                textShadow: neonPinkGlow,
                                fontFamily: '"Neon Light", Monoton, sans-serif'
                            }}
                        >
                            PLAY ROOM
                        </h2>

                        {/* Animated rotating booking indicator text */}
                        <div className="mt-4 h-8 md:h-10 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentTextIndex}
                                    className="relative inline-block"
                                    initial={{ opacity: 0, y: 20, rotateX: -90 }}
                                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                    exit={{ opacity: 0, y: -20, rotateX: 90 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: [0.22, 1, 0.36, 1]
                                    }}
                                >
                                    {/* Main text */}
                                    <motion.p
                                        className="text-lg md:text-xl tracking-widest uppercase font-bold relative z-10"
                                        style={{
                                            color: '#ec4899',
                                            textShadow: '0 0 5px #ec4899, 0 0 10px #ec4899'
                                        }}
                                        animate={{
                                            textShadow: [
                                                '0 0 5px #ec4899, 0 0 10px #ec4899',
                                                '0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 30px #ec4899',
                                                '0 0 5px #ec4899, 0 0 10px #ec4899'
                                            ]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut'
                                        }}
                                    >
                                        {ROTATING_TEXTS[currentTextIndex]}
                                    </motion.p>

                                    {/* Glitch layers */}
                                    <motion.p
                                        className="absolute top-0 left-0 text-lg md:text-xl tracking-widest uppercase font-bold pointer-events-none"
                                        style={{
                                            color: '#22d3ee',
                                            mixBlendMode: 'screen',
                                            opacity: 0.7
                                        }}
                                        animate={{
                                            x: [0, -2, 2, 0],
                                            opacity: [0, 0.7, 0, 0.7, 0]
                                        }}
                                        transition={{
                                            duration: 0.3,
                                            repeat: Infinity,
                                            repeatDelay: 3,
                                            ease: 'easeInOut'
                                        }}
                                    >
                                        {ROTATING_TEXTS[currentTextIndex]}
                                    </motion.p>

                                    <motion.p
                                        className="absolute top-0 left-0 text-lg md:text-xl tracking-widest uppercase font-bold pointer-events-none"
                                        style={{
                                            color: '#fbbf24',
                                            mixBlendMode: 'screen',
                                            opacity: 0.7
                                        }}
                                        animate={{
                                            x: [0, 2, -2, 0],
                                            opacity: [0, 0.7, 0, 0.7, 0]
                                        }}
                                        transition={{
                                            duration: 0.3,
                                            repeat: Infinity,
                                            repeatDelay: 3,
                                            delay: 0.15,
                                            ease: 'easeInOut'
                                        }}
                                    >
                                        {ROTATING_TEXTS[currentTextIndex]}
                                    </motion.p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                {step === 'selection' ? (
                    <motion.div
                        key="selection-view"
                        className="absolute inset-0 w-full h-full"
                        exit={{ opacity: 0, transition: { duration: 0.5 } }}
                    >
                        {/* Scattered Items */}
                        {PLAY_ROOM_ITEMS.map((item, index) => {
                            const isSelected = selectedItems.includes(item.id)

                            const exitX = item.position.left ? '-100vw' : '100vw'
                            const exitY = item.position.top ? '-100vh' : '100vh'

                            return (
                                <motion.div
                                    key={item.id}
                                    className="absolute flex items-center gap-4 cursor-pointer group"
                                    style={item.position}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{
                                        x: exitX,
                                        y: exitY,
                                        opacity: 0,
                                        scale: 0.5,
                                        transition: { duration: 0.8, ease: "easeInOut" }
                                    }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    onClick={() => toggleItem(item.id)}
                                >
                                    <div className="flex flex-col items-start">
                                        <h4
                                            className={`text-2xl md:text-4xl font-bold transition-all duration-300 ${isSelected ? 'text-pink-400' : 'text-white/80 group-hover:text-pink-300'
                                                }`}
                                            style={{
                                                textShadow: isSelected ? neonPinkGlow : 'none'
                                            }}
                                        >
                                            {item.name}
                                        </h4>
                                        <span className={`text-sm md:text-base transition-colors ${isSelected ? 'text-pink-300' : 'text-white/50'}`}>
                                            {item.price} RSD
                                        </span>
                                    </div>

                                    <motion.button
                                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all ${isSelected
                                            ? 'bg-pink-500 border-pink-500 text-white'
                                            : 'border-pink-500/50 text-pink-500'
                                            }`}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {isSelected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    </motion.button>
                                </motion.div>
                            )
                        })}

                        {/* Total Price - Bottom Right */}
                        <AnimatePresence>
                            {selectedItems.length > 0 && (
                                <motion.div
                                    className="absolute bottom-8 right-8 z-50 text-right"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 50 }}
                                >
                                    <div className="text-pink-100/70 text-sm uppercase tracking-wider">Total</div>
                                    <div className="text-3xl md:text-5xl font-bold text-pink-400"
                                        style={{ textShadow: neonPinkGlow }}>
                                        {totalPrice} <span className="text-xl md:text-2xl">RSD</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Continue Button */}
                        {selectedItems.length > 0 && (
                            <motion.div
                                className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 100 }}
                            >
                                <motion.button
                                    onClick={handleContinue}
                                    className="px-12 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xl rounded-full transition-all shadow-lg"
                                    style={{ boxShadow: neonPinkGlow }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Continue to Booking ({selectedItems.length})
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="details-view"
                        className="w-full min-h-full"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <BirthdayBookingForm
                            onBack={() => setStep('selection')}
                            initialSelectedRooms={selectedItems}
                            variant="playroom"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { BirthdayBookingForm } from './BirthdayBookingForm'
import { SignInModal } from '@/components/auth/SignInModal'

interface PlayRoomBookingFormProps {
    onBack: () => void
}

interface BookingItem {
    id: string
    name: string
    price: number
    position: { [key: string]: string | number }
    mandatory?: boolean
}

const PLAY_ROOM_ITEMS: BookingItem[] = [
    {
        id: 'sensory-room',
        name: 'Sensory Room',
        price: 5000,
        position: { top: '25%', left: '45%', transform: 'translateX(-50%)' },
        mandatory: true
    },
    {
        id: 'slide-room',
        name: 'Slide Room',
        price: 6000,
        position: { top: '50%', right: '10%', transform: 'translateY(-50%)' }
    },
    {
        id: 'minidisco',
        name: 'Minidisco',
        price: 4000,
        position: { top: '50%', left: '10%', transform: 'translateY(-50%)' }
    },
    {
        id: 'cake-room',
        name: 'Cake Room',
        price: 4000,
        position: { bottom: '20%', left: '45%', transform: 'translateX(-50%)' },
        mandatory: true
    }
]

const ROTATING_TEXTS = [
    'SELECT YOUR EXPERIENCE',
    'CHOOSE YOUR ADVENTURE',
    'PICK YOUR PLAYGROUND',
    'CREATE YOUR MEMORIES',
    'BUILD YOUR PARTY'
]

const KIDS_CAPACITY_OPTIONS = [
    { id: 'up-to-10', label: 'Up to 10 Kids', capacity: 10, price: 1000, icon: '👶' },
    { id: 'up-to-20', label: 'Up to 20 Kids', capacity: 20, price: 2000, icon: '🧒' },
    { id: 'up-to-30', label: 'Up to 30 Kids', capacity: 30, price: 3000, icon: '🎉' }
]

const TIME_DURATION_OPTIONS = [
    { id: '30-min', label: '30 Minutes', duration: 30, price: 1000, icon: '⏱️' },
    { id: '45-min', label: '45 Minutes', duration: 45, price: 1500, icon: '🕒' }
]

export const PlayRoomBookingForm = ({ onBack }: PlayRoomBookingFormProps) => {
    const { data: session, status } = useSession()
    const [step, setStep] = useState<'selection' | 'details'>('selection')
    // Initialize with mandatory items pre-selected
    const mandatoryItems = PLAY_ROOM_ITEMS.filter(item => item.mandatory).map(item => item.id)
    const [selectedItems, setSelectedItems] = useState<string[]>(mandatoryItems)
    const [selectedCapacity, setSelectedCapacity] = useState<string | null>(null)
    const [selectedDuration, setSelectedDuration] = useState<string | null>(null)
    const [currentTextIndex, setCurrentTextIndex] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const [showSignInModal, setShowSignInModal] = useState(false)

    // Pink neon glow for Play Room theme
    const neonPinkGlow = '0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 30px #ec4899'

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Auto-proceed to booking form after successful sign in
    useEffect(() => {
        if (session && showSignInModal && selectedCapacity && selectedDuration) {
            setShowSignInModal(false)
            setStep('details')
            toast.success('Successfully signed in! Continue with your booking.')
        }
    }, [session, showSignInModal, selectedCapacity, selectedDuration])

    // Rotate text every 3 seconds
    useEffect(() => {
        if (step !== 'selection') return

        const interval = setInterval(() => {
            setCurrentTextIndex((prev) => (prev + 1) % ROTATING_TEXTS.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [step])

    const toggleItem = (id: string) => {
        // Check if item is mandatory
        const item = PLAY_ROOM_ITEMS.find(i => i.id === id)
        if (item?.mandatory) {
            // Show toast that this item is required
            toast.error(`${item.name} is required and cannot be deselected`)
            return
        }

        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        )
    }

    const totalPrice = useMemo(() => {
        const base = selectedItems.reduce((sum, id) => {
            const item = PLAY_ROOM_ITEMS.find(i => i.id === id)
            return sum + (item?.price || 0)
        }, 0)

        const capacityPrice = selectedCapacity
            ? (KIDS_CAPACITY_OPTIONS.find(opt => opt.id === selectedCapacity)?.price || 0)
            : 0

        const durationPrice = selectedDuration
            ? (TIME_DURATION_OPTIONS.find(opt => opt.id === selectedDuration)?.price || 0)
            : 0

        return base + capacityPrice + durationPrice
    }, [selectedItems, selectedCapacity, selectedDuration])

    const handleContinue = () => {
        if (!selectedCapacity) {
            toast.error('Please select the number of kids')
            return
        }
        if (!selectedDuration) {
            toast.error('Please select the time duration')
            return
        }

        // Check if user is authenticated
        if (!session) {
            toast.error('Please sign in to continue with your booking')
            setShowSignInModal(true)
            return
        }

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
        <div className={`w-full relative ${step === 'selection' ? 'min-h-[100vh] overflow-hidden' : 'min-h-screen bg-black'}`}>
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
                                    className={`absolute flex items-center gap-4 group ${item.mandatory ? 'cursor-default' : 'cursor-pointer'}`}
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
                                    <div className="flex flex-col items-start relative">
                                        <div className="flex items-center gap-2">
                                            <h4
                                                className={`text-2xl md:text-4xl font-bold transition-all duration-300 ${isSelected ? 'text-pink-400' : 'text-white/80 group-hover:text-pink-300'
                                                    }`}
                                                style={{
                                                    textShadow: isSelected ? neonPinkGlow : 'none'
                                                }}
                                            >
                                                {item.name}
                                            </h4>
                                            {item.mandatory && (
                                                <span className="text-xs md:text-sm px-2 py-1 bg-pink-500/20 border border-pink-500/50 rounded-full text-pink-400 font-bold">
                                                    REQUIRED
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-sm md:text-base transition-colors ${isSelected ? 'text-pink-300' : 'text-white/50'}`}>
                                            {item.price} RSD
                                        </span>
                                    </div>

                                    <motion.button
                                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all ${isSelected
                                            ? 'bg-pink-500 border-pink-500 text-white'
                                            : 'border-pink-500/50 text-pink-500'
                                            } ${item.mandatory ? 'opacity-100' : ''}`}
                                        whileHover={{ scale: item.mandatory ? 1 : 1.1 }}
                                        whileTap={{ scale: item.mandatory ? 1 : 0.9 }}
                                    >
                                        <Check className="w-5 h-5" />
                                    </motion.button>
                                </motion.div>
                            )
                        })}

                        {/* Kids Capacity & Time Duration Selection - Bottom Left */}
                        <AnimatePresence>
                            {selectedItems.length > 0 && (
                                <motion.div
                                    className="absolute bottom-8 left-8 z-50 flex flex-col gap-6"
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                >
                                    {/* Number of Kids */}
                                    <div>
                                        <div className="text-pink-100/70 text-sm uppercase tracking-wider mb-3">Number of Kids</div>
                                        <div className="flex flex-col gap-2">
                                            {KIDS_CAPACITY_OPTIONS.map((option) => {
                                                const isSelected = selectedCapacity === option.id
                                                return (
                                                    <motion.button
                                                        key={option.id}
                                                        onClick={() => setSelectedCapacity(option.id)}
                                                        className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2 transition-all ${isSelected
                                                            ? 'bg-pink-500 border-pink-500 text-white'
                                                            : 'border-pink-500/50 bg-black/30 text-pink-300 hover:border-pink-500/80'
                                                            }`}
                                                        whileHover={{ scale: 1.05, x: 5 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        style={{
                                                            textShadow: isSelected ? '0 0 5px #ec4899' : 'none'
                                                        }}
                                                    >
                                                        <span className="text-xl">{option.icon}</span>
                                                        <span className="font-bold text-sm md:text-base">{option.label}</span>
                                                        <span className="text-xs text-pink-100/80">{option.price} RSD</span>
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="ml-auto"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </motion.div>
                                                        )}
                                                    </motion.button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Time Duration */}
                                    <div>
                                        <div className="text-pink-100/70 text-sm uppercase tracking-wider mb-3">Time Duration</div>
                                        <div className="flex flex-col gap-2">
                                            {TIME_DURATION_OPTIONS.map((option) => {
                                                const isSelected = selectedDuration === option.id
                                                return (
                                                    <motion.button
                                                        key={option.id}
                                                        onClick={() => setSelectedDuration(option.id)}
                                                        className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2 transition-all ${isSelected
                                                            ? 'bg-pink-500 border-pink-500 text-white'
                                                            : 'border-pink-500/50 bg-black/30 text-pink-300 hover:border-pink-500/80'
                                                            }`}
                                                        whileHover={{ scale: 1.05, x: 5 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        style={{
                                                            textShadow: isSelected ? '0 0 5px #ec4899' : 'none'
                                                        }}
                                                    >
                                                        <span className="text-xl">{option.icon}</span>
                                                        <span className="font-bold text-sm md:text-base">{option.label}</span>
                                                        <span className="text-xs text-pink-100/80">{option.price} RSD</span>
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="ml-auto"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </motion.div>
                                                        )}
                                                    </motion.button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

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
                            initialKidsCount={KIDS_CAPACITY_OPTIONS.find(option => option.id === selectedCapacity)?.capacity}
                            initialKidsLabel={KIDS_CAPACITY_OPTIONS.find(option => option.id === selectedCapacity)?.label}
                            initialDurationMinutes={TIME_DURATION_OPTIONS.find(option => option.id === selectedDuration)?.duration}
                            initialDurationLabel={TIME_DURATION_OPTIONS.find(option => option.id === selectedDuration)?.label}
                            initialTotalPrice={totalPrice}
                            variant="playroom"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sign In Modal */}
            <SignInModal
                isOpen={showSignInModal}
                onClose={() => setShowSignInModal(false)}
            />
        </div>
    )
}

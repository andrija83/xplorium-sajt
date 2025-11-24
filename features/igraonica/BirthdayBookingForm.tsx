'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, Clock, Mail, Phone, User, Cake, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { validateEmail } from '@/lib/validation'

/**
 * BirthdayBookingForm Component
 *
 * Birthday party booking form with neon theme (cyan or pink)
 * Features:
 * - Party details (date, time, guests)
 * - Contact information
 * - Special requests
 * - Neon-themed styling matching Igraonica section
 */

interface BirthdayBookingFormProps {
  onBack: () => void
  initialSelectedRooms?: string[]
  variant?: 'birthday' | 'playroom'
}

interface FormData {
  childName: string
  childAge: string
  parentName: string
  email: string
  phone: string
  partyDate: string
  partyTime: string
  numberOfGuests: string
  selectedRooms: string[]
  includeFoodBeverages: boolean
  includeCakeBeverages: boolean
  selectedFood: string[]
  selectedBeverages: string[]
  specialRequests: string
}

const AVAILABLE_ROOMS = [
  { id: 'cake-room', name: 'Cake Room', icon: '🎂' },
  { id: '270-room', name: '270 Room', icon: '🎮' },
  { id: 'slide-room', name: 'Slide Room', icon: '🛝' },
  { id: 'sensory-room', name: 'Sensory Room', icon: '✨' },
  { id: 'mini-disco-room', name: 'Mini Disco Room', icon: '🪩' }
]

const FOOD_OPTIONS = [
  {
    id: 'pizza',
    name: 'Pizza',
    icon: '🍕',
    description: 'Fresh baked pizza',
    hasSubmenu: true,
    submenuOptions: [
      { id: 'pizza-kfc', name: 'KFC', description: 'KFC style pizza' },
      { id: 'pizza-la-strega', name: 'La Strega', description: 'La Strega pizza' }
    ]
  },
  {
    id: 'pasta',
    name: 'Pasta',
    icon: '🍝',
    description: 'Kid-friendly pasta dishes',
    hasSubmenu: true,
    submenuOptions: [
      { id: 'pasta-pastara', name: 'Pastara', description: 'Pastara style pasta' },
      { id: 'pasta-la-strega', name: 'La Strega', description: 'La Strega pasta' }
    ]
  },
  { id: 'sandwiches', name: 'Sandwiches', icon: '🥪', description: 'Assorted sandwiches', hasSubmenu: false },
  {
    id: 'chicken-nuggets',
    name: 'Chicken Nuggets',
    icon: '🍗',
    description: 'Crispy chicken nuggets',
    hasSubmenu: true,
    submenuOptions: [
      { id: 'chicken-nuggets-kfc', name: 'KFC', description: 'KFC chicken nuggets' }
    ]
  },
  { id: 'fries', name: 'French Fries', icon: '🍟', description: 'Golden french fries', hasSubmenu: false },
  { id: 'fruit-platter', name: 'Fruit Platter', icon: '🍇', description: 'Fresh seasonal fruits', hasSubmenu: false },
  { id: 'sweets', name: 'Sweets & Candy', icon: '🍬', description: 'Assorted sweets and candy', hasSubmenu: false },
  { id: 'birthday-cake', name: 'Birthday Cake', icon: '🎂', description: 'Custom birthday cake', hasSubmenu: false }
]

const BEVERAGE_OPTIONS = [
  { id: 'orange-juice', name: 'Orange Juice', icon: '🍊', description: 'Fresh orange juice' },
  { id: 'apple-juice', name: 'Apple Juice', icon: '🍎', description: 'Fresh apple juice' },
  { id: 'lemonade', name: 'Lemonade', icon: '🍋', description: 'Homemade lemonade' },
  { id: 'water', name: 'Water', icon: '💧', description: 'Still & sparkling water' },
  { id: 'soft-drinks', name: 'Soft Drinks', icon: '🥤', description: 'Assorted soft drinks' },
  { id: 'milkshakes', name: 'Milkshakes', icon: '🥛', description: 'Chocolate, vanilla, strawberry' },
  { id: 'hot-chocolate', name: 'Hot Chocolate', icon: '☕', description: 'Warm hot chocolate' }
]

export const BirthdayBookingForm = ({ onBack, initialSelectedRooms = [], variant = 'birthday' }: BirthdayBookingFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    childName: '',
    childAge: '',
    parentName: '',
    email: '',
    phone: '',
    partyDate: '',
    partyTime: '',
    numberOfGuests: '',
    selectedRooms: initialSelectedRooms,
    includeFoodBeverages: false,
    includeCakeBeverages: false,
    selectedFood: [],
    selectedBeverages: [],
    specialRequests: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Theme configuration
  const theme = {
    birthday: {
      primary: 'cyan',
      text: 'text-cyan-400',
      textHover: 'hover:text-cyan-300',
      textDim: 'text-cyan-100/70',
      textDimmer: 'text-cyan-100/50',
      border: 'border-cyan-400/30',
      borderFocus: 'focus:border-cyan-400',
      borderHover: 'hover:border-cyan-400/50',
      bg: 'bg-cyan-400',
      bgHover: 'hover:bg-cyan-500',
      bgDim: 'bg-cyan-400/10',
      bgDimmer: 'bg-cyan-400/5',
      placeholder: 'placeholder-cyan-100/30',
      glow: '0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee',
      hex: '#22d3ee'
    },
    playroom: {
      primary: 'pink',
      text: 'text-pink-400',
      textHover: 'hover:text-pink-300',
      textDim: 'text-pink-100/70',
      textDimmer: 'text-pink-100/50',
      border: 'border-pink-400/30',
      borderFocus: 'focus:border-pink-400',
      borderHover: 'hover:border-pink-400/50',
      bg: 'bg-pink-500',
      bgHover: 'hover:bg-pink-600',
      bgDim: 'bg-pink-500/10',
      bgDimmer: 'bg-pink-500/5',
      placeholder: 'placeholder-pink-100/30',
      glow: '0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 30px #ec4899',
      hex: '#ec4899'
    }
  }[variant]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.childName.trim()) newErrors.childName = "Child's name is required"
    if (!formData.childAge) newErrors.childAge = "Child's age is required"
    if (!formData.parentName.trim()) newErrors.parentName = "Parent's name is required"

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.phone) newErrors.phone = "Phone number is required"
    if (!formData.partyDate) newErrors.partyDate = "Date is required"
    if (!formData.partyTime) newErrors.partyTime = "Time is required"
    if (!formData.numberOfGuests) newErrors.numberOfGuests = "Number of guests is required"
    // selectedRooms validation removed - rooms are pre-selected from previous step

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('Booking submitted:', formData)
      toast.success('Booking request sent! We\'ll contact you soon.')

      // Reset form
      setFormData({
        childName: '',
        childAge: '',
        parentName: '',
        email: '',
        phone: '',
        partyDate: '',
        partyTime: '',
        numberOfGuests: '',
        selectedRooms: [],
        includeFoodBeverages: false,
        includeCakeBeverages: false,
        selectedFood: [],
        selectedBeverages: [],
        specialRequests: ''
      })
      setErrors({})
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to submit booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        {/* Back button */}
        <motion.button
          onClick={onBack}
          className={`flex items-center gap-2 mb-8 ${theme.text} ${theme.textHover} transition-colors`}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Menu</span>
        </motion.button>

        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{
              color: theme.hex,
              textShadow: theme.glow,
              fontFamily: '"Neon Light", Monoton, sans-serif'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {variant === 'birthday' ? 'BIRTHDAY PARTY BOOKING' : 'PLAY ROOM BOOKING'}
          </motion.h2>
          <p className={`${theme.textDim} text-lg`}>
            {variant === 'birthday'
              ? "Make your child's birthday unforgettable at Xplorium!"
              : "Book your Play Room adventure at Xplorium!"}
          </p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          noValidate
          className={`bg-black/40 backdrop-blur-sm border ${theme.border} rounded-2xl p-6 md:p-8 lg:p-10`}
          style={{
            boxShadow: `0 0 40px ${variant === 'birthday' ? 'rgba(34, 211, 238, 0.1)' : 'rgba(236, 72, 153, 0.1)'}`
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Child Information */}
          <div className="mb-8">
            <h3 className={`text-xl font-semibold ${theme.text} mb-4 flex items-center gap-2`}>
              <Cake className="w-5 h-5" />
              Child Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block ${theme.textDim} text-sm mb-2`}>Child's Name *</label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textDimmer} z-10`} />
                  <div className="relative">
                    <input
                      type="text"
                      name="childName"
                      value={formData.childName}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 bg-black/50 border ${errors.childName ? 'border-red-400' : `${theme.border}`} rounded-lg text-white focus:outline-none ${errors.childName ? 'focus:border-red-400' : theme.borderFocus} transition-colors relative z-0`}
                    />
                    <AnimatePresence mode="wait">
                      {!formData.childName && (
                        <motion.span
                          key={errors.childName ? 'error' : 'placeholder'}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            x: errors.childName ? [0, -5, 5, -5, 5, 0] : 0
                          }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{
                            duration: 0.2,
                            x: { duration: 0.4, type: "tween", ease: "easeInOut" }
                          }}
                          className={`absolute left-11 top-1/2 -translate-y-1/2 pointer-events-none text-sm ${errors.childName ? 'text-red-400 font-medium' : theme.placeholder
                            }`}
                        >
                          {errors.childName || "Enter child's name"}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <div>
                <label className={`block ${theme.textDim} text-sm mb-2`}>Child's Age *</label>
                <input
                  type="number"
                  name="childAge"
                  value={formData.childAge}
                  onChange={handleChange}
                  min="1"
                  max="18"
                  className={`w-full px-4 py-3 bg-black/50 border ${errors.childAge ? 'border-red-400' : theme.border} rounded-lg text-white ${theme.placeholder} focus:outline-none ${errors.childAge ? 'focus:border-red-400' : theme.borderFocus} transition-colors`}
                  placeholder="Age"
                />
                {errors.childAge && <p className="text-red-400 text-xs mt-1">{errors.childAge}</p>}
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div className="mb-8">
            <h3 className={`text-xl font-semibold ${theme.text} mb-4 flex items-center gap-2`}>
              <User className="w-5 h-5" />
              Parent/Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block ${theme.textDim} text-sm mb-2`}>Your Name *</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-black/50 border ${errors.parentName ? 'border-red-400' : theme.border} rounded-lg text-white ${theme.placeholder} focus:outline-none ${errors.parentName ? 'focus:border-red-400' : theme.borderFocus} transition-colors`}
                  placeholder="Your name"
                />
                {errors.parentName && <p className="text-red-400 text-xs mt-1">{errors.parentName}</p>}
              </div>
              <div>
                <label className={`block ${theme.textDim} text-sm mb-2`}>Email *</label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textDimmer}`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 bg-black/50 border ${errors.email ? 'border-red-400' : theme.border} rounded-lg text-white ${theme.placeholder} focus:outline-none ${errors.email ? 'focus:border-red-400' : theme.borderFocus} transition-colors`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className={`block ${theme.textDim} text-sm mb-2`}>Phone *</label>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textDimmer}`} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 bg-black/50 border ${errors.phone ? 'border-red-400' : theme.border} rounded-lg text-white ${theme.placeholder} focus:outline-none ${errors.phone ? 'focus:border-red-400' : theme.borderFocus} transition-colors`}
                    placeholder="+123 456 789"
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Party Details */}
          <div className="mb-8">
            <h3 className={`text-xl font-semibold ${theme.text} mb-4 flex items-center gap-2`}>
              <Calendar className="w-5 h-5" />
              Event Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block ${theme.textDim} text-sm mb-2`}>Preferred Date *</label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textDimmer}`} />
                  <input
                    type="date"
                    name="partyDate"
                    value={formData.partyDate}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 bg-black/50 border ${errors.partyDate ? 'border-red-400' : theme.border} rounded-lg text-white focus:outline-none ${errors.partyDate ? 'focus:border-red-400' : theme.borderFocus} transition-colors`}
                  />
                </div>
                {errors.partyDate && <p className="text-red-400 text-xs mt-1">{errors.partyDate}</p>}
              </div>
              <div>
                <label className={`block ${theme.textDim} text-sm mb-2`}>Preferred Time *</label>
                <div className="relative">
                  <Clock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textDimmer}`} />
                  <input
                    type="time"
                    name="partyTime"
                    value={formData.partyTime}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 bg-black/50 border ${errors.partyTime ? 'border-red-400' : theme.border} rounded-lg text-white focus:outline-none ${errors.partyTime ? 'focus:border-red-400' : theme.borderFocus} transition-colors`}
                  />
                </div>
                {errors.partyTime && <p className="text-red-400 text-xs mt-1">{errors.partyTime}</p>}
              </div>
              <div>
                <label className={`block ${theme.textDim} text-sm mb-2`}>Number of Guests *</label>
                <div className="relative">
                  <Users className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textDimmer}`} />
                  <input
                    type="number"
                    name="numberOfGuests"
                    value={formData.numberOfGuests}
                    onChange={handleChange}
                    min="5"
                    max="50"
                    className={`w-full pl-11 pr-4 py-3 bg-black/50 border ${errors.numberOfGuests ? 'border-red-400' : theme.border} rounded-lg text-white ${theme.placeholder} focus:outline-none ${errors.numberOfGuests ? 'focus:border-red-400' : theme.borderFocus} transition-colors`}
                    placeholder="Number of kids"
                  />
                </div>
                {errors.numberOfGuests && <p className="text-red-400 text-xs mt-1">{errors.numberOfGuests}</p>}
              </div>
            </div>
          </div>

          {/* Selected Rooms Display (Read-only) */}
          {formData.selectedRooms.length > 0 && (
            <div className="mb-8">
              <h3 className={`text-xl font-semibold ${theme.text} mb-2 flex items-center gap-2`}>
                Selected Rooms
              </h3>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 ${theme.bgDim} border ${theme.border} rounded-lg`}
              >
                <p className={`${theme.textDim} text-sm font-semibold mb-2`}>
                  Your Selection ({formData.selectedRooms.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedRooms.map(roomId => {
                    const room = AVAILABLE_ROOMS.find(r => r.id === roomId)
                    return room ? (
                      <span
                        key={roomId}
                        className={`inline-flex items-center gap-1 px-3 py-1 ${theme.bgDim} border ${theme.border} rounded-full ${theme.textDim} text-sm`}
                      >
                        {room.icon} {room.name}
                      </span>
                    ) : null
                  })}
                </div>
              </motion.div>
            </div>
          )}

          {/* Food & Beverages */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-4">
              {/* Add Food & Beverages Button */}
              <motion.button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    includeFoodBeverages: !prev.includeFoodBeverages,
                    selectedFood: !prev.includeFoodBeverages ? prev.selectedFood : [],
                    selectedBeverages: !prev.includeFoodBeverages ? prev.selectedBeverages : []
                  }))
                }}
                className={`flex-1 flex items-center gap-3 px-6 py-4 border-2 rounded-lg transition-all ${formData.includeFoodBeverages
                  ? `border-${theme.primary}-400 ${theme.bgDim}`
                  : `${theme.border} bg-black/30 ${theme.borderHover}`
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-3xl">🍕🥤</div>
                <div className="text-left flex-1">
                  <div className={`${theme.text} font-semibold text-lg`}>Add Food & Beverages</div>
                  <div className={`${theme.textDim} text-sm`}>
                    {formData.includeFoodBeverages ? 'Included - Click to remove' : 'Click to add food and drinks'}
                  </div>
                </div>
                {formData.includeFoodBeverages && (
                  <motion.div
                    className={`w-6 h-6 ${theme.bg} rounded-full flex items-center justify-center`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>

              {/* Cake + Beverages Button */}
              <motion.button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    includeCakeBeverages: !prev.includeCakeBeverages
                  }))
                }}
                className={`flex-1 flex items-center gap-3 px-6 py-4 border-2 rounded-lg transition-all ${formData.includeCakeBeverages
                  ? `border-${theme.primary}-400 ${theme.bgDim}`
                  : `${theme.border} bg-black/30 ${theme.borderHover}`
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-3xl">🎂🥤</div>
                <div className="text-left flex-1">
                  <div className={`${theme.text} font-semibold text-lg`}>Cake + Beverages</div>
                  <div className={`${theme.textDim} text-sm`}>
                    {formData.includeCakeBeverages ? 'Included - Click to remove' : 'Click to add cake and drinks'}
                  </div>
                </div>
                {formData.includeCakeBeverages && (
                  <motion.div
                    className={`w-6 h-6 ${theme.bg} rounded-full flex items-center justify-center`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            </div>

            {/* Food & Beverage Options - Shown when included */}
            <AnimatePresence>
              {formData.includeFoodBeverages && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Food Options */}
                  <div className="mb-6">
                    <h4 className={`text-lg font-semibold ${theme.text} mb-3`}>Food Options</h4>
                    <p className={`${theme.textDim} text-sm mb-3`}>Select the food items you'd like</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {FOOD_OPTIONS.map((food) => {
                        const isSelected = formData.selectedFood.some(id =>
                          id === food.id || (food.hasSubmenu && food.submenuOptions?.some(sub => id === sub.id))
                        )
                        const hasOpenSubmenu = openSubmenu === food.id

                        return (
                          <div key={food.id} className="relative">
                            <motion.button
                              type="button"
                              onClick={() => {
                                if (food.hasSubmenu) {
                                  // Toggle submenu
                                  setOpenSubmenu(hasOpenSubmenu ? null : food.id)
                                } else {
                                  // Regular selection
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedFood: isSelected
                                      ? prev.selectedFood.filter(id => id !== food.id)
                                      : [...prev.selectedFood, food.id]
                                  }))
                                }
                              }}
                              className={`relative w-full p-4 border-2 rounded-lg transition-all text-left ${isSelected
                                ? `border-${theme.primary}-400 ${theme.bgDim}`
                                : `${theme.border} bg-black/30 ${theme.borderHover}`
                                }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <div className="text-2xl mb-2">{food.icon}</div>
                              <div className={`${theme.text} font-semibold text-sm mb-1 flex items-center justify-between`}>
                                {food.name}
                                {food.hasSubmenu && (
                                  <span className={`text-xs ${theme.textDimmer}`}>▼</span>
                                )}
                              </div>
                              <div className={`${theme.textDimmer} text-xs`}>{food.description}</div>
                              {isSelected && !food.hasSubmenu && (
                                <motion.div
                                  className={`absolute -top-1 -right-1 w-5 h-5 ${theme.bg} rounded-full flex items-center justify-center`}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                >
                                  <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </motion.div>
                              )}
                            </motion.button>

                            {/* Submenu */}
                            <AnimatePresence>
                              {hasOpenSubmenu && food.submenuOptions && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                  animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className={`p-2 border ${theme.border} rounded-lg ${theme.bgDimmer} space-y-2`}>
                                    {food.submenuOptions.map((submenu) => {
                                      const isSubmenuSelected = formData.selectedFood.includes(submenu.id)
                                      return (
                                        <motion.button
                                          key={submenu.id}
                                          type="button"
                                          onClick={() => {
                                            setFormData(prev => ({
                                              ...prev,
                                              selectedFood: isSubmenuSelected
                                                ? prev.selectedFood.filter(id => id !== submenu.id)
                                                : [...prev.selectedFood, submenu.id]
                                            }))
                                          }}
                                          className={`w-full p-2 border rounded text-left text-xs transition-all ${isSubmenuSelected
                                            ? `border-${theme.primary}-400 ${theme.bgDim} ${theme.text}`
                                            : `${theme.border} bg-black/20 ${theme.textDim} ${theme.borderHover}`
                                            }`}
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                        >
                                          <div className="font-semibold">{submenu.name}</div>
                                          <div className={`${theme.textDimmer} text-[10px]`}>{submenu.description}</div>
                                        </motion.button>
                                      )
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                    {formData.selectedFood.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-3 p-3 ${theme.bgDimmer} border ${theme.border} rounded-lg`}
                      >
                        <p className={`${theme.textDim} text-xs mb-2`}>Selected Food ({formData.selectedFood.length}):</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.selectedFood.map(foodId => {
                            // Check if it's a main food item
                            const food = FOOD_OPTIONS.find(f => f.id === foodId)
                            if (food) {
                              return (
                                <span key={foodId} className={`inline-flex items-center gap-1 px-2 py-1 ${theme.bgDim} rounded-full ${theme.textDim} text-xs`}>
                                  {food.icon} {food.name}
                                </span>
                              )
                            }

                            // Check if it's a submenu item
                            for (const mainFood of FOOD_OPTIONS) {
                              if (mainFood.submenuOptions) {
                                const submenu = mainFood.submenuOptions.find(s => s.id === foodId)
                                if (submenu) {
                                  return (
                                    <span key={foodId} className={`inline-flex items-center gap-1 px-2 py-1 ${theme.bgDim} rounded-full ${theme.textDim} text-xs`}>
                                      {mainFood.icon} {mainFood.name} - {submenu.name}
                                    </span>
                                  )
                                }
                              }
                            }
                            return null
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Beverage Options */}
                  <div>
                    <h4 className={`text-lg font-semibold ${theme.text} mb-3`}>Beverage Options</h4>
                    <p className={`${theme.textDim} text-sm mb-3`}>Select the drinks you'd like</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {BEVERAGE_OPTIONS.map((beverage) => {
                        const isSelected = formData.selectedBeverages.includes(beverage.id)
                        return (
                          <motion.button
                            key={beverage.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                selectedBeverages: isSelected
                                  ? prev.selectedBeverages.filter(id => id !== beverage.id)
                                  : [...prev.selectedBeverages, beverage.id]
                              }))
                            }}
                            className={`relative p-4 border-2 rounded-lg transition-all text-left ${isSelected
                              ? `border-${theme.primary}-400 ${theme.bgDim}`
                              : `${theme.border} bg-black/30 ${theme.borderHover}`
                              }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="text-2xl mb-2">{beverage.icon}</div>
                            <div className={`${theme.text} font-semibold text-sm mb-1`}>{beverage.name}</div>
                            <div className={`${theme.textDimmer} text-xs`}>{beverage.description}</div>
                            {isSelected && (
                              <motion.div
                                className={`absolute -top-1 -right-1 w-5 h-5 ${theme.bg} rounded-full flex items-center justify-center`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              >
                                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </motion.div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                    {formData.selectedBeverages.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-3 p-3 ${theme.bgDimmer} border ${theme.border} rounded-lg`}
                      >
                        <p className={`${theme.textDim} text-xs mb-2`}>Selected Beverages ({formData.selectedBeverages.length}):</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.selectedBeverages.map(bevId => {
                            const beverage = BEVERAGE_OPTIONS.find(b => b.id === bevId)
                            return beverage ? (
                              <span key={bevId} className={`inline-flex items-center gap-1 px-2 py-1 ${theme.bgDim} rounded-full ${theme.textDim} text-xs`}>
                                {beverage.icon} {beverage.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Special Requests */}
          <div className="mb-8">
            <label className={`block ${theme.textDim} text-sm mb-2`}>Special Requests or Dietary Requirements</label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 bg-black/50 border ${theme.border} rounded-lg text-white ${theme.placeholder} focus:outline-none ${theme.borderFocus} transition-colors resize-none`}
              placeholder="Any special requests, themes, allergies, or dietary requirements..."
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting || formData.selectedRooms.length === 0}
            className={`w-full py-4 ${theme.bg} ${theme.bgHover} text-black font-bold text-lg rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{
              boxShadow: theme.glow
            }}
            whileHover={{ scale: formData.selectedRooms.length > 0 ? 1.02 : 1 }}
            whileTap={{ scale: formData.selectedRooms.length > 0 ? 0.98 : 1 }}
          >
            {isSubmitting ? 'Submitting...' : 'Request Booking'}
          </motion.button>

          <p className={`text-center ${theme.textDimmer} text-sm mt-4`}>
            We'll contact you within 24 hours to confirm availability
          </p>
        </motion.form>
      </motion.div>
    </div >
  )
}

'use client'

import { useState, memo, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { EventCalendar, BookingForm, type CalendarEvent } from '@/components/common'
import { getApprovedBookings, createBooking } from '@/app/actions/bookings'
import { getPublishedEvents } from '@/app/actions/events'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { sr } from 'date-fns/locale'

interface CafeSectionProps {
  cafeSubView: string | null
  setCafeSubView: (view: string | null) => void
}

/**
 * CafeSection Component
 *
 * Cafe section with glass frame navigation and multiple subsections
 *
 * Features:
 * - Glass frame menu with neon-glowing items
 * - 6 subsections: Meni, Pricing, Zakup, Dogadjaji, Radno vreme, Kontakt
 * - Corner screws decoration
 * - Scrollable content inside glass frame
 * - Pricing cards with animations
 * - Booking form
 * - Contact information with map
 *
 * Optimized with React.memo, useCallback, and memoized constants
 *
 * Navigation Flow:
 * 1. Shows glass frame menu with 6 options
 * 2. Click option → Shows subsection content inside glass frame
 * 3. Each subsection has unique content and styling
 */
export const CafeSection = memo(({ cafeSubView, setCafeSubView }: CafeSectionProps) => {
  const { data: session } = useSession()

  // Event calendar state
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Published events state (for Dogadjaji section)
  const [publishedEvents, setPublishedEvents] = useState<any[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)

  // Fetch approved bookings from database
  const fetchBookings = useCallback(async () => {
    const result = await getApprovedBookings()
    if (result.success && result.bookings) {
      // Transform database bookings to CalendarEvent format
      const calendarEvents: CalendarEvent[] = result.bookings.map((booking) => ({
        id: booking.id,
        title: booking.title,
        date: new Date(booking.date),
        time: booking.time,
        type: booking.type as CalendarEvent['type'],
        guestCount: booking.guestCount || undefined,
        phone: booking.phone || undefined,
        email: booking.email || undefined,
      }))
      setEvents(calendarEvents)
    }
  }, [])

  // Fetch published events from database
  const fetchPublishedEvents = useCallback(async () => {
    setEventsLoading(true)
    try {
      const result = await getPublishedEvents(10) // Get up to 10 upcoming events
      if (result.success && result.events) {
        // Filter only future events (compare by date only, not time)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const futureEvents = result.events.filter(event => {
          const eventDate = new Date(event.date)
          eventDate.setHours(0, 0, 0, 0)
          return eventDate >= today
        })
        setPublishedEvents(futureEvents)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setEventsLoading(false)
    }
  }, [])

  // Load bookings on mount and when "zakup" view is opened
  useEffect(() => {
    if (cafeSubView === 'zakup') {
      fetchBookings()
    }
  }, [cafeSubView, fetchBookings])

  // Load published events when "dogadjaji" view is opened
  useEffect(() => {
    if (cafeSubView === 'dogadjaji') {
      fetchPublishedEvents()
    }
  }, [cafeSubView, fetchPublishedEvents])

  // Handle new booking submission (memoized)
  const handleBookingSubmit = useCallback(async (newEvent: Omit<CalendarEvent, 'id'> & { specialRequests?: string }) => {
    try {
      setIsLoading(true)

      // Create booking in database
      const result = await createBooking({
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        type: newEvent.type,
        guestCount: newEvent.guestCount || 1,
        phone: newEvent.phone || '',
        email: newEvent.email || '',
        specialRequests: newEvent.specialRequests,
      })

      if (result.success) {
        toast.success('Rezervacija poslata! Kontaktiraćemo vas uskoro.')
        setShowBookingForm(false)
        setSelectedDate(null)
        // Refresh bookings list
        await fetchBookings()
      } else {
        toast.error(result.error || 'Greška pri slanju rezervacije')
      }
    } catch (error) {
      console.error('Booking submit error:', error)
      toast.error('Došlo je do greške. Pokušajte ponovo.')
    } finally {
      setIsLoading(false)
    }
  }, [fetchBookings])

  // Handle date click from calendar (memoized)
  const handleDateClick = useCallback((date: Date) => {
    if (!session?.user) {
      toast.error('Morate biti prijavljeni da biste kreirali rezervaciju')
      return
    }
    setSelectedDate(date)
    setShowBookingForm(true)
  }, [session])

  // Memoized menu items
  const MENU_ITEMS = useMemo(() => [
    {
      label: "Meni",
      section: "meni",
      color: "cyan",
      shadow: "0 0 20px #22d3ee, 0 0 40px #22d3ee, 0 0 60px #22d3ee",
    },
    {
      label: "Pricing",
      section: "pricing",
      color: "emerald",
      shadow: "0 0 20px #10b981, 0 0 40px #10b981, 0 0 60px #10b981",
    },
    {
      label: "Zakup prostora",
      section: "zakup",
      color: "pink",
      shadow: "0 0 20px #ec4899, 0 0 40px #ec4899, 0 0 60px #ec4899",
    },
    {
      label: "Dogadjaji",
      section: "dogadjaji",
      color: "purple",
      shadow: "0 0 20px #a855f7, 0 0 40px #a855f7, 0 0 60px #a855f7",
    },
    {
      label: "Radno vreme",
      section: "radno",
      color: "yellow",
      shadow: "0 0 20px #fbbf24, 0 0 40px #fbbf24, 0 0 60px #fbbf24",
    },
    {
      label: "Kontakt",
      section: "kontakt",
      color: "cyan",
      shadow: "0 0 20px #22d3ee, 0 0 40px #22d3ee, 0 0 60px #22d3ee",
    },
  ], [])

  // Memoized corner screws positions
  const CORNER_SCREWS = useMemo(() => [
    { top: "1rem", left: "1rem" },
    { top: "1rem", right: "1rem" },
    { bottom: "1rem", left: "1rem" },
    { bottom: "1rem", right: "1rem" },
  ], [])

  return (
    <>
      {!cafeSubView ? (
        // Glass Frame Menu
        <motion.div
          className="relative w-full max-w-2xl mx-auto aspect-[3/4] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Glass frame with border glow */}
          <motion.div
            className="relative w-full h-full border-2 border-cyan-400/40 rounded-lg bg-black/10"
            style={{
              boxShadow: "0 0 20px rgba(34, 211, 238, 0.3), inset 0 0 20px rgba(34, 211, 238, 0.1)",
            }}
            initial={{ opacity: 5, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Corner screws */}
            {CORNER_SCREWS.map((position, i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-gray-700"
                style={{
                  ...position,
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              >
                {/* Screw slot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-gray-900 rounded-full" />
                </div>
              </motion.div>
            ))}

            {/* Menu items */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 px-8">
              {MENU_ITEMS.map((item, index) => (
                <motion.button
                  key={item.section}
                  onClick={() => setCafeSubView(item.section)}
                  aria-label={`View ${item.label} information`}
                  className={`text-${item.color}-400 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-['Great_Vibes'] cursor-pointer transition-all duration-300 hover:scale-110`}
                  style={{
                    textShadow: item.shadow,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{
                    textShadow: item.shadow
                      .replace(/20px/g, "30px")
                      .replace(/40px/g, "50px")
                      .replace(/60px/g, "70px"),
                  }}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : (
        // Subsection Content
        <motion.div
          className="relative w-full max-w-2xl mx-auto aspect-[3/4] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Glass frame container for content */}
          <motion.div
            className="relative w-full h-full border-2 border-cyan-400/40 rounded-lg bg-black/10 overflow-hidden"
            style={{
              boxShadow: "0 0 20px rgba(34, 211, 238, 0.3), inset 0 0 20px rgba(34, 211, 238, 0.1)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Corner screws */}
            {CORNER_SCREWS.map((position, i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-gray-700 z-10"
                style={{
                  ...position,
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              >
                {/* Screw slot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-gray-900 rounded-full" />
                </div>
              </motion.div>
            ))}

            {/* Scrollable content inside glass frame */}
            <div className={`h-full p-8 sm:p-12 ${cafeSubView === "kontakt" || cafeSubView === "zakup" || cafeSubView === "meni" || cafeSubView === "dogadjaji" || cafeSubView === "pricing" ? "overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-cyan-400/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-white/5" : "flex items-center justify-center"}`}>
              <div className="text-center w-full">
                <motion.h2
                  className="text-4xl sm:text-5xl md:text-6xl text-cyan-400 mb-6 tracking-tight font-['Great_Vibes'] capitalize"
                  style={{
                    textShadow: "0 0 20px #22d3ee, 0 0 40px #22d3ee",
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {cafeSubView === "meni"
                    ? "Meni"
                    : cafeSubView === "pricing"
                      ? "Pricing"
                      : cafeSubView === "zakup"
                        ? "Zakup prostora"
                        : cafeSubView === "dogadjaji"
                          ? "Dogadjaji"
                          : cafeSubView === "radno"
                            ? "Radno vreme"
                            : "Kontakt"}
                </motion.h2>

                {/* Meni Subsection */}
                {cafeSubView === "meni" && (
                  <motion.div
                    className="max-w-lg mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    {/* Pricing Section */}
                    <div className="mb-8">
                      <h3 className="text-cyan-400 font-['Great_Vibes'] text-3xl mb-6">
                        Cenovnik
                      </h3>
                      <div className="space-y-3">
                        {[
                          { item: "Kafa (espresso, kapućino)", price: "200 RSD" },
                          { item: "Čaj (razne vrste)", price: "150 RSD" },
                          { item: "Sokovi (prirodni)", price: "250 RSD" },
                          { item: "Palačinke", price: "300 RSD" },
                          { item: "Sendviči", price: "350 RSD" },
                          { item: "Torte i kolači", price: "280 RSD" },
                          { item: "Voćna salata", price: "320 RSD" },
                          { item: "Dečije meni", price: "450 RSD" },
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            className="flex justify-between items-center py-2 px-4 bg-white/5 border border-cyan-400/20 rounded-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                            whileHover={{
                              borderColor: "rgba(34, 211, 238, 0.5)",
                              backgroundColor: "rgba(255, 255, 255, 0.08)"
                            }}
                          >
                            <span className="text-white/90 text-sm text-left">
                              {item.item}
                            </span>
                            <span className="text-cyan-400 font-medium text-sm whitespace-nowrap ml-4">
                              {item.price}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Pricing Subsection */}
                {cafeSubView === "pricing" && (
                  <motion.div
                    className="max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <motion.p
                      className="text-white/70 text-sm mb-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    >
                      Izaberite paket koji najbolje odgovara Vašim potrebama
                    </motion.p>

                    {/* Playground Pricing */}
                    <motion.div
                      className="mb-10"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.6 }}
                    >
                      <motion.h3
                        className="text-pink-400 font-['Great_Vibes'] text-4xl mb-6 text-center"
                        style={{ textShadow: "0 0 20px rgba(236, 72, 153, 0.5)" }}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.6 }}
                      >
                        Igraonica Paketi
                      </motion.h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          {
                            name: "1 Sat Igre",
                            price: "500 RSD",
                            popular: false,
                            features: ["1 sat igranja", "Pristup svim aktivnostima", "Roditeljski nadzor"],
                          },
                          {
                            name: "3 Sata Igre",
                            price: "1200 RSD",
                            popular: true,
                            features: ["3 sata igranja", "Sve aktivnosti", "Besplatan napitak", "10% popust"],
                          },
                          {
                            name: "Rođendanski Paket",
                            price: "8000 RSD",
                            popular: false,
                            features: ["4 sata ekskluzivno", "Dekoracija prostora", "Torta i piće", "Animator", "Do 15 dece"],
                          },
                        ].map((pkg, index) => (
                          <motion.div
                            key={index}
                            className={`relative bg-gradient-to-br ${pkg.popular ? "from-pink-400/10 to-pink-600/5" : "from-white/5 to-white/0"} border-2 ${pkg.popular ? "border-pink-400/60" : "border-pink-400/20"} rounded-xl p-6 backdrop-blur-sm`}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{
                              borderColor: "rgba(236, 72, 153, 0.8)",
                              scale: pkg.popular ? 1.05 : 1.03,
                              y: -10,
                            }}
                            style={pkg.popular ? { boxShadow: "0 0 30px rgba(236, 72, 153, 0.3)" } : {}}
                          >
                            {pkg.popular && (
                              <motion.div
                                className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs px-4 py-1.5 rounded-full font-medium"
                                style={{ textShadow: "0 0 10px rgba(236, 72, 153, 0.8)", boxShadow: "0 0 20px rgba(236, 72, 153, 0.5)" }}
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: false }}
                                transition={{ duration: 0.5, delay: 0.3, type: "spring", bounce: 0.5 }}
                              >
                                ⭐ Najpopularnije
                              </motion.div>
                            )}
                            <motion.h4
                              className="text-white font-['Great_Vibes'] text-3xl mb-3"
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: false }}
                              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                            >
                              {pkg.name}
                            </motion.h4>
                            <motion.p
                              className="text-pink-400 text-3xl font-bold mb-6"
                              style={{ textShadow: "0 0 10px rgba(236, 72, 153, 0.5)" }}
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: false }}
                              transition={{ duration: 0.5, delay: 0.3 + index * 0.1, type: "spring" }}
                            >
                              {pkg.price}
                            </motion.p>
                            <ul className="space-y-3 mb-6">
                              {pkg.features.map((feature, i) => (
                                <motion.li
                                  key={i}
                                  className="text-white/80 text-sm flex items-start"
                                  initial={{ opacity: 0, x: -20 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  viewport={{ once: false }}
                                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                                >
                                  <span className="text-pink-400 mr-2 text-lg">✓</span>
                                  {feature}
                                </motion.li>
                              ))}
                            </ul>
                            <motion.button
                              onClick={() => setCafeSubView("zakup")}
                              aria-label="Book this event now"
                              className="w-full py-3 bg-pink-400/20 border-2 border-pink-400/50 rounded-lg text-pink-400 text-sm font-medium hover:bg-pink-400/30 transition-all"
                              style={{ boxShadow: "0 0 15px rgba(236, 72, 153, 0.2)" }}
                              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(236, 72, 153, 0.4)" }}
                              whileTap={{ scale: 0.95 }}
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: false }}
                              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                            >
                              Rezerviši Sada
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Sensory Room Pricing */}
                    <motion.div
                      className="mb-10"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.6 }}
                    >
                      <motion.h3
                        className="text-purple-400 font-['Great_Vibes'] text-4xl mb-6 text-center"
                        style={{ textShadow: "0 0 20px rgba(168, 85, 247, 0.5)" }}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.6 }}
                      >
                        Sensory Soba Paketi
                      </motion.h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          {
                            name: "Sesija 30 min",
                            price: "600 RSD",
                            popular: false,
                            features: ["30 minuta", "Vođena sesija", "Individualni pristup"],
                          },
                          {
                            name: "Sesija 1 sat",
                            price: "1000 RSD",
                            popular: true,
                            features: ["1 sat terapije", "Personalizovana sesija", "Stručni terapeut", "Besplatan čaj"],
                          },
                          {
                            name: "Mesečni Paket",
                            price: "7000 RSD",
                            popular: false,
                            features: ["8 sesija (1 sat)", "Fleksibilno zakazivanje", "Praćenje napretka", "20% ušteda"],
                          },
                        ].map((pkg, index) => (
                          <motion.div
                            key={index}
                            className={`relative bg-gradient-to-br ${pkg.popular ? "from-purple-400/10 to-purple-600/5" : "from-white/5 to-white/0"} border-2 ${pkg.popular ? "border-purple-400/60" : "border-purple-400/20"} rounded-xl p-6 backdrop-blur-sm`}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{
                              borderColor: "rgba(168, 85, 247, 0.8)",
                              scale: pkg.popular ? 1.05 : 1.03,
                              y: -10,
                            }}
                            style={pkg.popular ? { boxShadow: "0 0 30px rgba(168, 85, 247, 0.3)" } : {}}
                          >
                            {pkg.popular && (
                              <motion.div
                                className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-4 py-1.5 rounded-full font-medium"
                                style={{ textShadow: "0 0 10px rgba(168, 85, 247, 0.8)", boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)" }}
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: false }}
                                transition={{ duration: 0.5, delay: 0.3, type: "spring", bounce: 0.5 }}
                              >
                                ⭐ Najpopularnije
                              </motion.div>
                            )}
                            <motion.h4
                              className="text-white font-['Great_Vibes'] text-3xl mb-3"
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: false }}
                              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                            >
                              {pkg.name}
                            </motion.h4>
                            <motion.p
                              className="text-purple-400 text-3xl font-bold mb-6"
                              style={{ textShadow: "0 0 10px rgba(168, 85, 247, 0.5)" }}
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: false }}
                              transition={{ duration: 0.5, delay: 0.3 + index * 0.1, type: "spring" }}
                            >
                              {pkg.price}
                            </motion.p>
                            <ul className="space-y-3 mb-6">
                              {pkg.features.map((feature, i) => (
                                <motion.li
                                  key={i}
                                  className="text-white/80 text-sm flex items-start"
                                  initial={{ opacity: 0, x: -20 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  viewport={{ once: false }}
                                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                                >
                                  <span className="text-purple-400 mr-2 text-lg">✓</span>
                                  {feature}
                                </motion.li>
                              ))}
                            </ul>
                            <motion.button
                              onClick={() => setCafeSubView("zakup")}
                              aria-label="Book party package now"
                              className="w-full py-3 bg-purple-400/20 border-2 border-purple-400/50 rounded-lg text-purple-400 text-sm font-medium hover:bg-purple-400/30 transition-all"
                              style={{ boxShadow: "0 0 15px rgba(168, 85, 247, 0.2)" }}
                              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(168, 85, 247, 0.4)" }}
                              whileTap={{ scale: 0.95 }}
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: false }}
                              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                            >
                              Rezerviši Sada
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Cafe Pricing */}
                    <div className="mb-10">
                      <h3 className="text-cyan-400 font-['Great_Vibes'] text-3xl mb-6">
                        Cafe Paketi
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            name: "Individualni Gost",
                            price: "Od 200 RSD",
                            popular: false,
                            features: ["À la carte meni", "Sve pije i hrana", "WiFi pristup", "Udoban prostor"],
                          },
                          {
                            name: "Porodični Paket",
                            price: "1500 RSD",
                            popular: true,
                            features: ["2 odraslih + 2 dece", "Napici i zalogaji", "1 sat igraonica", "15% popust"],
                          },
                          {
                            name: "Grupni Događaj",
                            price: "Od 5000 RSD",
                            popular: false,
                            features: ["Ekskluzivan prostor", "Prilagođen meni", "Catering usluga", "Do 30 osoba"],
                          },
                        ].map((pkg, index) => (
                          <motion.div
                            key={index}
                            className={`relative bg-white/5 border ${pkg.popular ? "border-cyan-400/50" : "border-cyan-400/20"} rounded-lg p-4`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                            whileHover={{
                              borderColor: pkg.popular ? "rgba(34, 211, 238, 0.8)" : "rgba(34, 211, 238, 0.5)",
                              scale: 1.02,
                            }}
                            style={pkg.popular ? { boxShadow: "0 0 20px rgba(34, 211, 238, 0.2)" } : {}}
                          >
                            {pkg.popular && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs px-3 py-1 rounded-full font-medium"
                                style={{ textShadow: "0 0 10px rgba(34, 211, 238, 0.8)" }}>
                                Najpopularnije
                              </div>
                            )}
                            <h4 className="text-white font-['Great_Vibes'] text-2xl mb-2">{pkg.name}</h4>
                            <p className="text-cyan-400 text-2xl font-bold mb-4">{pkg.price}</p>
                            <ul className="space-y-2 mb-4">
                              {pkg.features.map((feature, i) => (
                                <li key={i} className="text-white/70 text-xs flex items-start">
                                  <span className="text-cyan-400 mr-2">✓</span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                            <motion.button
                              onClick={() => setCafeSubView("zakup")}
                              aria-label="Book this menu package"
                              className="w-full py-2 bg-cyan-400/20 border border-cyan-400/40 rounded-lg text-cyan-400 text-sm hover:bg-cyan-400/30 transition-all"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Rezerviši
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Group Discount Info */}
                    <motion.div
                      className="bg-gradient-to-r from-emerald-400/10 via-cyan-400/10 to-purple-400/10 border border-emerald-400/30 rounded-lg p-6 mt-8"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 1.5 }}
                    >
                      <h4 className="text-emerald-400 font-['Great_Vibes'] text-2xl mb-3">
                        Grupni Popusti
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/80 text-xs">
                        <div className="text-center">
                          <p className="text-emerald-400 text-xl font-bold mb-1">10%</p>
                          <p>Grupe 10-20 osoba</p>
                        </div>
                        <div className="text-center">
                          <p className="text-cyan-400 text-xl font-bold mb-1">15%</p>
                          <p>Grupe 20-30 osoba</p>
                        </div>
                        <div className="text-center">
                          <p className="text-purple-400 text-xl font-bold mb-1">20%</p>
                          <p>Grupe 30+ osoba</p>
                        </div>
                      </div>
                      <p className="text-white/60 text-xs text-center mt-4">
                        Kontaktirajte nas za prilagođene pakete za škole i organizacije
                      </p>
                    </motion.div>
                  </motion.div>
                )}

                {/* Dogadjaji Subsection */}
                {cafeSubView === "dogadjaji" && (
                  <motion.div
                    className="max-w-lg mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    {/* Event Calendar */}
                    <div className="mb-4">
                      <p className="text-white/70 text-sm mb-8">
                        Nadolazeći događaji u Xplorium-u
                      </p>

                      {eventsLoading ? (
                        <div className="text-center py-8">
                          <div className="inline-block w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
                          <p className="text-white/60 text-sm mt-4">Učitavanje događaja...</p>
                        </div>
                      ) : publishedEvents.length > 0 ? (
                        <div className="space-y-4">
                          {publishedEvents.map((event, index) => (
                            <motion.div
                              key={event.id}
                              className="bg-white/5 border border-purple-400/20 rounded-lg p-4"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                              whileHover={{
                                borderColor: "rgba(168, 85, 247, 0.5)",
                                backgroundColor: "rgba(255, 255, 255, 0.08)",
                                scale: 1.02
                              }}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-white font-['Great_Vibes'] text-xl">
                                  {event.title}
                                </h4>
                                <span className="text-purple-400 text-xs font-medium">
                                  {event.time}
                                </span>
                              </div>
                              <p className="text-purple-400/80 text-xs mb-2">
                                {format(new Date(event.date), 'd. MMMM yyyy', { locale: sr })}
                              </p>
                              <p className="text-white/70 text-xs leading-relaxed">
                                {event.description}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-white/60 text-sm">Trenutno nema zakazanih događaja</p>
                          <p className="text-white/40 text-xs mt-2">Vratite se uskoro!</p>
                        </div>
                      )}
                    </div>

                    {/* Special Note */}
                    <motion.div
                      className="bg-purple-400/10 border border-purple-400/30 rounded-lg p-4 mt-6"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                    >
                      <p className="text-white/80 text-xs leading-relaxed">
                        Svi događaji zahtevaju rezervaciju. Kontaktirajte nas za više informacija ili koristite formu za zakup prostora.
                      </p>
                    </motion.div>
                  </motion.div>
                )}

                {/* Radno Vreme Subsection */}
                {cafeSubView === "radno" && (
                  <motion.div
                    className="max-w-md mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <p className="text-white/70 text-sm mb-8">
                      Otvoreni smo svakog dana
                    </p>

                    {/* Days of Week */}
                    <div className="space-y-3 mb-8">
                      {[
                        { day: "Ponedeljak", hours: "07:00 - 22:00" },
                        { day: "Utorak", hours: "07:00 - 22:00" },
                        { day: "Sreda", hours: "07:00 - 22:00" },
                        { day: "Četvrtak", hours: "07:00 - 22:00" },
                        { day: "Petak", hours: "07:00 - 22:00" },
                        { day: "Subota", hours: "07:00 - 22:00" },
                        { day: "Nedelja", hours: "07:00 - 22:00" },
                      ].map((item, index) => (
                        <motion.div
                          key={item.day}
                          className="flex justify-between items-center py-3 px-4 bg-white/5 border border-cyan-400/20 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                          whileHover={{
                            borderColor: "rgba(34, 211, 238, 0.5)",
                            backgroundColor: "rgba(255, 255, 255, 0.08)"
                          }}
                        >
                          <span className="text-white/90 font-['Great_Vibes'] text-xl">
                            {item.day}
                          </span>
                          <span className="text-cyan-400 font-medium text-sm">
                            {item.hours}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Special Note */}
                    <motion.div
                      className="bg-cyan-400/10 border border-cyan-400/30 rounded-lg p-4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                    >
                      <p className="text-cyan-400 font-['Great_Vibes'] text-2xl mb-2">
                        Napomena
                      </p>
                      <p className="text-white/80 text-sm leading-relaxed">
                        Za rezervacije prostora kontaktirajte nas unapred.
                        Praznici mogu imati izmenjeno radno vreme.
                      </p>
                    </motion.div>
                  </motion.div>
                )}

                {/* Zakup Prostora Subsection */}
                {cafeSubView === "zakup" && (
                  <motion.div
                    className="max-w-6xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    {!showBookingForm ? (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <p className="text-white/70 text-sm">
                            Pregledajte dostupne termine i rezervišite prostor
                          </p>
                          <motion.button
                            onClick={() => {
                              if (!session?.user) {
                                toast.error('Morate biti prijavljeni da biste kreirali rezervaciju')
                                return
                              }
                              setShowBookingForm(true)
                            }}
                            className="px-6 py-2 bg-cyan-400/20 border-2 border-cyan-400/40 rounded-lg text-cyan-400 text-sm font-['Great_Vibes'] text-xl hover:bg-cyan-400/30 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Nova rezervacija
                          </motion.button>
                        </div>

                        <EventCalendar
                          events={events}
                          onDateClick={handleDateClick}
                          showAddButton={true}
                        />
                      </>
                    ) : (
                      <div className="max-w-lg mx-auto">
                        <h3 className="text-cyan-400 font-['Great_Vibes'] text-3xl mb-6 text-center">
                          Nova rezervacija
                        </h3>
                        <BookingForm
                          onSubmit={handleBookingSubmit}
                          onCancel={() => {
                            setShowBookingForm(false)
                            setSelectedDate(null)
                          }}
                          existingEvents={events}
                          initialDate={selectedDate}
                          isLoading={isLoading}
                        />
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Kontakt Subsection */}
                {cafeSubView === "kontakt" && (
                  <>
                    <motion.div
                      className="mx-auto text-white/80"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <p className="text-sm sm:text-base leading-relaxed mb-4">
                        Posetite nas u srcu grada! Xplorium se nalazi na idealnoj lokaciji.
                      </p>

                      <div className="space-y-3 text-left bg-white/5 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-4">
                        <div>
                          <h3 className="text-cyan-400 font-['Great_Vibes'] text-xl mb-1">Adresa</h3>
                          <p className="text-white/90 text-sm">Unesite vašu adresu ovde</p>
                        </div>

                        <div>
                          <h3 className="text-cyan-400 font-['Great_Vibes'] text-xl mb-1">Telefon</h3>
                          <p className="text-white/90 text-sm">+381 XX XXX XXXX</p>
                        </div>

                        <div>
                          <h3 className="text-cyan-400 font-['Great_Vibes'] text-xl mb-1">Email</h3>
                          <p className="text-white/90 text-sm">info@xplorium.com</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="mx-auto mt-4 rounded-lg overflow-hidden border-2 border-cyan-400/40"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      style={{
                        boxShadow: "0 0 20px rgba(34, 211, 238, 0.2)",
                      }}
                    >
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d375.855485521623!2d21.907374439255186!3d43.323535465737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2srs!4v1762308540330!5m2!1sen!2srs"
                        width="100%"
                        height="200"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full"
                      />
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
})

CafeSection.displayName = 'CafeSection'

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Users, Mail, Phone, MessageSquare } from "lucide-react"
import { createBooking } from "@/app/actions/bookings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

/**
 * Public Booking Page
 *
 * Allows anyone to create a booking that goes into the database
 * Admin can then approve/reject from the admin panel
 */

export default function BookingPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    type: "CAFE" as "CAFE" | "SENSORY_ROOM" | "PLAYGROUND" | "PARTY" | "EVENT",
    guestCount: "1",
    phone: "",
    email: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      const result = await createBooking({
        title: formData.title,
        date: new Date(formData.date),
        time: formData.time,
        type: formData.type,
        guestCount: parseInt(formData.guestCount),
        phone: formData.phone,
        email: formData.email,
      })

      if (result.success) {
        toast.success("Booking submitted successfully! We'll contact you soon.")

        // Reset form
        setFormData({
          title: "",
          date: "",
          time: "",
          type: "CAFE",
          guestCount: "1",
          phone: "",
          email: "",
        })

        // Optionally redirect to home
        setTimeout(() => router.push("/"), 2000)
      } else {
        toast.error(result.error || "Failed to submit booking")
      }
    } catch (error) {
      console.error("Booking error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-cyan-400/20">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1
              className="text-3xl font-bold text-cyan-400 mb-2"
              style={{
                textShadow: "0 0 30px rgba(34, 211, 238, 0.6)"
              }}
            >
              Make a Booking
            </h1>
            <p className="text-cyan-100/60">
              Fill out the form below and we'll get back to you soon!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-cyan-300">
                Event Title *
              </Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Birthday Party, Family Visit, etc."
                className="mt-2 bg-black/40 border-cyan-400/30 text-white"
              />
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="type" className="text-cyan-300">
                Booking Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="mt-2 bg-black/40 border-cyan-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAFE">Cafe</SelectItem>
                  <SelectItem value="SENSORY_ROOM">Sensory Room</SelectItem>
                  <SelectItem value="PLAYGROUND">Playground</SelectItem>
                  <SelectItem value="PARTY">Party</SelectItem>
                  <SelectItem value="EVENT">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-cyan-300">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-2 bg-black/40 border-cyan-400/30 text-white"
                />
              </div>

              <div>
                <Label htmlFor="time" className="text-cyan-300">
                  Time *
                </Label>
                <Input
                  id="time"
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="mt-2 bg-black/40 border-cyan-400/30 text-white"
                />
              </div>
            </div>

            {/* Guest Count */}
            <div>
              <Label htmlFor="guestCount" className="text-cyan-300">
                Number of Guests *
              </Label>
              <Input
                id="guestCount"
                type="number"
                min="1"
                max="100"
                required
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                className="mt-2 bg-black/40 border-cyan-400/30 text-white"
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-cyan-300">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="mt-2 bg-black/40 border-cyan-400/30 text-white"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-cyan-300">
                  Phone *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1234567890"
                  className="mt-2 bg-black/40 border-cyan-400/30 text-white"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1 border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                {isSubmitting ? "Submitting..." : "Submit Booking"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, XCircle, Trash2, Calendar, Users, Mail, Phone, Clock } from "lucide-react"
import { getBookingById, approveBooking, rejectBooking, deleteBooking } from "@/app/actions/bookings"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const STATUS_COLORS = {
  PENDING: "bg-yellow-400/20 text-yellow-400 border-yellow-400/50",
  APPROVED: "bg-green-400/20 text-green-400 border-green-400/50",
  REJECTED: "bg-red-400/20 text-red-400 border-red-400/50",
  CANCELLED: "bg-gray-400/20 text-gray-400 border-gray-400/50",
  COMPLETED: "bg-blue-400/20 text-blue-400 border-blue-400/50",
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [adminNotes, setAdminNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  useEffect(() => {
    fetchBooking()
  }, [params.id])

  const fetchBooking = async () => {
    try {
      setIsLoading(true)
      const result = await getBookingById(params.id as string)

      if (result.success && result.booking) {
        setBooking(result.booking)
        setAdminNotes(result.booking.adminNotes || "")
      } else {
        toast.error("Booking not found")
        router.push("/admin/bookings")
      }
    } catch (error) {
      console.error("Failed to fetch booking:", error)
      toast.error("Failed to load booking")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      setIsApproving(true)
      const result = await approveBooking(booking.id, adminNotes)

      if (result.success) {
        toast.success("Booking approved successfully")
        fetchBooking()
      } else {
        toast.error(result.error || "Failed to approve booking")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    try {
      setIsRejecting(true)
      const result = await rejectBooking(booking.id, rejectionReason)

      if (result.success) {
        toast.success("Booking rejected")
        fetchBooking()
        setRejectionReason("")
      } else {
        toast.error(result.error || "Failed to reject booking")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsRejecting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      return
    }

    try {
      const result = await deleteBooking(booking.id)

      if (result.success) {
        toast.success("Booking deleted")
        router.push("/admin/bookings")
      } else {
        toast.error(result.error || "Failed to delete booking")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  if (!booking) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/bookings")}
            className="border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">{booking.title}</h1>
            <p className="text-sm text-cyan-100/60 mt-1">Booking Details</p>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border",
            STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS]
          )}
        >
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Details */}
          <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20">
            <h2 className="text-lg font-semibold text-cyan-300 mb-4">Booking Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-xs text-cyan-100/50">Date</p>
                  <p className="text-sm text-cyan-100">
                    {format(new Date(booking.date), "MMMM dd, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-xs text-cyan-100/50">Time</p>
                  <p className="text-sm text-cyan-100">{booking.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-xs text-cyan-100/50">Guests</p>
                  <p className="text-sm text-cyan-100">{booking.guestCount}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-xs text-cyan-100/50">Type</p>
                  <p className="text-sm text-cyan-100">{booking.type}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20">
            <h2 className="text-lg font-semibold text-cyan-300 mb-4">Contact Information</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-xs text-cyan-100/50">Email</p>
                  <p className="text-sm text-cyan-100">{booking.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-xs text-cyan-100/50">Phone</p>
                  <p className="text-sm text-cyan-100">{booking.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20">
              <h2 className="text-lg font-semibold text-cyan-300 mb-4">Posebni Zahtevi</h2>
              <p className="text-sm text-cyan-100/70 whitespace-pre-wrap">{booking.specialRequests}</p>
            </div>
          )}

          {/* Admin Notes */}
          {booking.adminNotes && (
            <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20">
              <h2 className="text-lg font-semibold text-cyan-300 mb-4">Admin Notes</h2>
              <p className="text-sm text-cyan-100/70 whitespace-pre-wrap">{booking.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-6">
          {/* Approve/Reject */}
          {booking.status === "PENDING" && (
            <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 space-y-4">
              <h2 className="text-lg font-semibold text-cyan-300">Actions</h2>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-cyan-100/70 mb-2 block">
                    Admin Notes (Optional)
                  </label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this booking..."
                    className="bg-black/40 border-cyan-400/30 text-white min-h-[80px]"
                  />
                </div>

                <Button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isApproving ? "Approving..." : "Approve Booking"}
                </Button>

                <div>
                  <label className="text-sm text-cyan-100/70 mb-2 block">
                    Rejection Reason *
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide reason for rejection..."
                    className="bg-black/40 border-cyan-400/30 text-white min-h-[80px]"
                  />
                </div>

                <Button
                  onClick={handleReject}
                  disabled={isRejecting || !rejectionReason.trim()}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {isRejecting ? "Rejecting..." : "Reject Booking"}
                </Button>
              </div>
            </div>
          )}

          {/* Delete */}
          <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-red-400/20">
            <h2 className="text-lg font-semibold text-red-300 mb-4">Danger Zone</h2>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

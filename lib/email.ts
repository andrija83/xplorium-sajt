import { Resend } from 'resend'
import { logger } from './logger'

/**
 * Email Service Utility
 *
 * Handles all email sending using Resend API
 * Supports development mode (logs to console) and production mode (sends real emails)
 */

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Default from email
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@xplorium.com'

// Check if Resend is configured
const isResendConfigured = () => {
  return !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== '')
}

/**
 * Base email sending function
 */
export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  react?: React.ReactElement
  replyTo?: string
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    console.log('📧 [EMAIL] Attempting to send email:', {
      to: options.to,
      subject: options.subject,
      from: FROM_EMAIL,
      hasApiKey: !!process.env.RESEND_API_KEY
    })

    // If Resend is not configured, log to console (development mode)
    if (!isResendConfigured()) {
      console.warn('⚠️  [EMAIL] Resend not configured - Email would be sent:', {
        to: options.to,
        subject: options.subject,
        from: FROM_EMAIL
      })
      logger.warn('Resend not configured - Email would be sent:', {
        to: options.to,
        subject: options.subject,
        from: FROM_EMAIL
      })
      return {
        success: true,
        id: 'dev-mock-id',
        message: 'Email logged (Resend not configured)'
      }
    }

    console.log('🚀 [EMAIL] Resend configured, sending via API...')

    // Send real email via Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      react: options.react,
      replyTo: options.replyTo
    })

    if (error) {
      console.error('❌ [EMAIL] Failed to send email via Resend:', error)
      logger.error('Failed to send email via Resend', error)
      return {
        success: false,
        error: error.message || 'Failed to send email'
      }
    }

    console.log('✅ [EMAIL] Email sent successfully!', { emailId: data?.id, to: options.to })
    logger.info('Email sent successfully', { emailId: data?.id, to: options.to, subject: options.subject })
    return {
      success: true,
      id: data?.id,
      message: 'Email sent successfully'
    }
  } catch (error) {
    console.error('💥 [EMAIL] Unexpected error sending email:', error)
    logger.error('Error sending email', error instanceof Error ? error : new Error(String(error)))
    return {
      success: false,
      error: 'Failed to send email'
    }
  }
}

/**
 * Send booking confirmation email to customer
 */
export async function sendBookingConfirmationEmail(data: {
  to: string
  customerName: string
  bookingId: string
  bookingTitle: string
  bookingDate: string
  bookingTime: string
  guestCount: number
  specialRequests?: string
}) {
  return sendEmail({
    to: data.to,
    subject: `Booking Confirmation - ${data.bookingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Xplorium</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your Booking Confirmation</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi ${data.customerName},
          </p>

          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Thank you for booking with Xplorium! Your booking has been received and is awaiting confirmation from our team.
          </p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #06b6d4; margin-top: 0; font-size: 20px;">Booking Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Booking ID:</td>
                <td style="padding: 8px 0; color: #374151;">${data.bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Event:</td>
                <td style="padding: 8px 0; color: #374151;">${data.bookingTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Date:</td>
                <td style="padding: 8px 0; color: #374151;">${data.bookingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Time:</td>
                <td style="padding: 8px 0; color: #374151;">${data.bookingTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Guests:</td>
                <td style="padding: 8px 0; color: #374151;">${data.guestCount}</td>
              </tr>
              ${data.specialRequests ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600; vertical-align: top;">Special Requests:</td>
                <td style="padding: 8px 0; color: #374151;">${data.specialRequests}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <p style="font-size: 16px; color: #374151; margin: 20px 0;">
            We'll review your booking and send you a confirmation email shortly. If you have any questions, feel free to contact us.
          </p>

          <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong style="color: #06b6d4;">The Xplorium Team</strong>
            </p>
          </div>
        </div>

        <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Xplorium. All rights reserved.
          </p>
        </div>
      </div>
    `
  })
}

/**
 * Send booking approved email to customer
 */
export async function sendBookingApprovedEmail(data: {
  to: string
  customerName: string
  bookingId: string
  bookingTitle: string
  bookingDate: string
  bookingTime: string
  adminNotes?: string
}) {
  return sendEmail({
    to: data.to,
    subject: `Booking Approved - ${data.bookingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✓ Booking Approved!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your booking has been confirmed</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi ${data.customerName},
          </p>

          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Great news! Your booking at Xplorium has been <strong style="color: #10b981;">approved</strong> and confirmed.
          </p>

          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h2 style="color: #059669; margin-top: 0; font-size: 20px;">Confirmed Booking Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Booking ID:</td>
                <td style="padding: 8px 0; color: #374151;">${data.bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Event:</td>
                <td style="padding: 8px 0; color: #374151;">${data.bookingTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Date:</td>
                <td style="padding: 8px 0; color: #374151;">${data.bookingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Time:</td>
                <td style="padding: 8px 0; color: #374151;">${data.bookingTime}</td>
              </tr>
            </table>
            ${data.adminNotes ? `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #d1fae5;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0; font-weight: 600;">Note from our team:</p>
              <p style="color: #374151; font-size: 14px; margin: 0;">${data.adminNotes}</p>
            </div>
            ` : ''}
          </div>

          <p style="font-size: 16px; color: #374151; margin: 20px 0;">
            We're looking forward to seeing you! If you need to make any changes or have questions, please contact us.
          </p>

          <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              See you soon!<br>
              <strong style="color: #10b981;">The Xplorium Team</strong>
            </p>
          </div>
        </div>

        <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Xplorium. All rights reserved.
          </p>
        </div>
      </div>
    `
  })
}

/**
 * Send booking rejected email to customer
 */
export async function sendBookingRejectedEmail(data: {
  to: string
  customerName: string
  bookingId: string
  bookingTitle: string
  bookingDate: string
  bookingTime: string
  reason?: string
}) {
  return sendEmail({
    to: data.to,
    subject: `Booking Update - ${data.bookingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Booking Update</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Important information about your booking</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi ${data.customerName},
          </p>

          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            We regret to inform you that we're unable to accommodate your booking request at this time.
          </p>

          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h2 style="color: #dc2626; margin-top: 0; font-size: 20px;">Booking Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Booking ID:</td>
                <td style="padding: 8px 0; color: #374151;">${data.bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Event:</td>
                <td style="padding: 8px 0; color: #374151;">${data.bookingTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Date:</td>
                <td style="padding: 8px 0; color: #374151;">${data.bookingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Time:</td>
                <td style="padding: 8px 0; color: #374151;">${data.bookingTime}</td>
              </tr>
            </table>
            ${data.reason ? `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #fecaca;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0; font-weight: 600;">Reason:</p>
              <p style="color: #374151; font-size: 14px; margin: 0;">${data.reason}</p>
            </div>
            ` : ''}
          </div>

          <p style="font-size: 16px; color: #374151; margin: 20px 0;">
            We apologize for any inconvenience. Please feel free to contact us to discuss alternative dates or arrangements that might work better.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${FROM_EMAIL}" style="display: inline-block; background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Contact Us
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              We hope to serve you soon,<br>
              <strong style="color: #06b6d4;">The Xplorium Team</strong>
            </p>
          </div>
        </div>

        <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Xplorium. All rights reserved.
          </p>
        </div>
      </div>
    `
  })
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: {
  to: string
  name: string
}) {
  return sendEmail({
    to: data.to,
    subject: 'Welcome to Xplorium!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to Xplorium!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your adventure begins here</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi ${data.name},
          </p>

          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Thank you for joining Xplorium! We're excited to have you as part of our community.
          </p>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #06b6d4; margin-top: 0; font-size: 20px;">What's Next?</h2>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px;">
              <li>Explore our cafe menu and sensory experiences</li>
              <li>Book your first visit to our interactive playground</li>
              <li>Stay updated on special events and promotions</li>
              <li>Earn loyalty points with every booking</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000" style="display: inline-block; background: #06b6d4; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Start Exploring
            </a>
          </div>

          <p style="font-size: 16px; color: #374151; margin: 20px 0;">
            If you have any questions, our team is always here to help!
          </p>

          <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              See you soon,<br>
              <strong style="color: #06b6d4;">The Xplorium Team</strong>
            </p>
          </div>
        </div>

        <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Xplorium. All rights reserved.
          </p>
        </div>
      </div>
    `
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: {
  to: string
  name: string
  resetToken: string
}) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${data.resetToken}`

  return sendEmail({
    to: data.to,
    subject: 'Reset Your Password - Xplorium',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Xplorium Account</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi ${data.name},
          </p>

          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            We received a request to reset your password for your Xplorium account. Click the button below to set a new password:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #06b6d4; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 6px;">
            <strong>Note:</strong> This link will expire in 1 hour for security reasons.
          </p>

          <p style="font-size: 16px; color: #374151; margin: 20px 0;">
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>

          <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong style="color: #06b6d4;">The Xplorium Team</strong>
            </p>
          </div>
        </div>

        <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Xplorium. All rights reserved.
          </p>
          <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="color: #06b6d4;">${resetLink}</span>
          </p>
        </div>
      </div>
    `
  })
}

/**
 * Send admin notification email
 */
export async function sendAdminNotificationEmail(data: {
  to: string | string[]
  subject: string
  message: string
  bookingId?: string
  priority?: 'low' | 'normal' | 'high'
}) {
  const priorityColors = {
    low: '#10b981',
    normal: '#06b6d4',
    high: '#ef4444'
  }

  const priorityColor = priorityColors[data.priority || 'normal']

  return sendEmail({
    to: data.to,
    subject: `[Admin] ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, ${priorityColor} 0%, ${priorityColor}dd 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Admin Notification</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${data.subject}</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${priorityColor};">
            <p style="font-size: 16px; color: #374151; margin: 0;">
              ${data.message}
            </p>
          </div>

          ${data.bookingId ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/admin/bookings/${data.bookingId}" style="display: inline-block; background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Booking
            </a>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong style="color: #06b6d4;">Xplorium Admin System</strong>
            </p>
          </div>
        </div>

        <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This is an automated notification from Xplorium Admin Panel
          </p>
        </div>
      </div>
    `
  })
}

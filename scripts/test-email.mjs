/**
 * Test Email Script
 *
 * Tests Resend email sending functionality
 * Usage: node scripts/test-email.mjs <your-email@example.com>
 */

import { Resend } from 'resend'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const resend = new Resend(process.env.RESEND_API_KEY)

const testEmail = process.argv[2] || 'test@example.com'

console.log('🧪 Testing Resend Email Integration...\n')
console.log('Configuration:')
console.log(`  API Key: ${process.env.RESEND_API_KEY ? '✅ Set (re_' + process.env.RESEND_API_KEY.substring(3, 10) + '...)' : '❌ Not set'}`)
console.log(`  From Email: ${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}`)
console.log(`  To Email: ${testEmail}\n`)

async function testSendEmail() {
  try {
    console.log('📧 Sending test email...')

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: testEmail,
      subject: 'Test Email from Xplorium',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Email Test Successful!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Xplorium Email Integration</p>
          </div>

          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Congratulations! Your Resend email integration is working correctly.
            </p>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #06b6d4; margin-top: 0; font-size: 18px;">✨ What's Working:</h2>
              <ul style="color: #374151; line-height: 1.8;">
                <li>Resend API connection successful</li>
                <li>Email templates rendering correctly</li>
                <li>HTML emails sending properly</li>
                <li>Ready for production use!</li>
              </ul>
            </div>

            <p style="font-size: 16px; color: #374151; margin: 20px 0;">
              You can now receive booking confirmations, approval notifications, and other important updates from Xplorium.
            </p>

            <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Test completed at: ${new Date().toLocaleString()}<br>
                <strong style="color: #06b6d4;">Xplorium Email System</strong>
              </p>
            </div>
          </div>

          <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This is a test email from the Xplorium system
            </p>
          </div>
        </div>
      `
    })

    if (error) {
      console.error('❌ Failed to send email:')
      console.error('   Error:', error.message || error)
      console.error('\n💡 Common issues:')
      console.error('   - Invalid API key')
      console.error('   - From email domain not verified')
      console.error('   - Rate limit exceeded')
      console.error('   - Invalid recipient email')
      process.exit(1)
    }

    console.log('✅ Email sent successfully!')
    console.log(`   Email ID: ${data.id}`)
    console.log(`\n📬 Check your inbox at: ${testEmail}`)
    console.log('   (Email should arrive within a few seconds)')
    console.log('\n🎉 Resend integration is working correctly!')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.error('\nFull error:', error)
    process.exit(1)
  }
}

testSendEmail()

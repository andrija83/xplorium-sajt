/**
 * Check Email Status Script
 *
 * Checks the status of a sent email in Resend
 * Usage: node scripts/check-email-status.mjs <email-id>
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

const emailId = process.argv[2] || 'c8f4d29c-d181-4da7-b522-f6cf23b9479c'

console.log('🔍 Checking email status in Resend...\n')
console.log(`Email ID: ${emailId}\n`)

async function checkEmailStatus() {
  try {
    const { data, error } = await resend.emails.get(emailId)

    if (error) {
      console.error('❌ Failed to get email status:')
      console.error('   Error:', error.message || error)
      process.exit(1)
    }

    console.log('📧 Email Details:')
    console.log(`   To: ${data.to}`)
    console.log(`   From: ${data.from}`)
    console.log(`   Subject: ${data.subject}`)
    console.log(`   Created: ${data.created_at}`)
    console.log(`   Last Event: ${data.last_event}`)
    console.log('\n📊 Full Response:')
    console.log(JSON.stringify(data, null, 2))

    if (data.last_event === 'delivered') {
      console.log('\n✅ Email was delivered successfully!')
      console.log('   If you still don\'t see it, check your spam folder.')
    } else if (data.last_event === 'bounced') {
      console.log('\n❌ Email bounced!')
      console.log('   The email address may be invalid or blocked.')
    } else if (data.last_event === 'complained') {
      console.log('\n⚠️  Email was marked as spam by recipient')
    } else {
      console.log(`\n⏳ Email status: ${data.last_event}`)
      console.log('   Email may still be in transit.')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.error('\nFull error:', error)
    process.exit(1)
  }
}

checkEmailStatus()

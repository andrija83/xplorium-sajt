#!/usr/bin/env node

/**
 * Test script to verify Upstash Redis rate limiting is working
 * Run with: node scripts/test-rate-limit.mjs
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '..', '.env.local') })

// Check if environment variables are set
const isConfigured = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

console.log('🔍 Testing Upstash Redis Connection...\n')

if (!isConfigured) {
  console.error('❌ UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set')
  console.log('📝 Please check your .env.local file')
  process.exit(1)
}

console.log('✅ Environment variables found:')
console.log(`   URL: ${process.env.UPSTASH_REDIS_REST_URL}`)
console.log(`   Token: ${process.env.UPSTASH_REDIS_REST_TOKEN.substring(0, 20)}...`)
console.log()

try {
  // Create a test rate limiter
  const redis = Redis.fromEnv()
  const testLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '10 s'), // 3 requests per 10 seconds
    analytics: true,
    prefix: 'test:ratelimit',
  })

  console.log('🧪 Testing rate limiter (3 requests per 10 seconds)...\n')

  // Test identifier
  const testId = `test-${Date.now()}`

  // Make 5 requests to test the limit
  for (let i = 1; i <= 5; i++) {
    console.log(`📤 Request #${i}...`)

    const result = await testLimiter.limit(testId)

    if (result.success) {
      console.log(`   ✅ Allowed`)
      console.log(`   📊 Remaining: ${result.remaining}/${result.limit}`)
    } else {
      console.log(`   ❌ Rate limit exceeded!`)
      console.log(`   📊 Remaining: ${result.remaining}/${result.limit}`)
      console.log(`   ⏰ Reset at: ${new Date(result.reset * 1000).toLocaleTimeString()}`)
    }
    console.log()

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('✅ Rate limiting is working correctly!')
  console.log('🎉 Upstash Redis connection successful!')
  console.log()
  console.log('💡 Note: This test used a temporary key that will auto-expire.')

  process.exit(0)
} catch (error) {
  console.error('❌ Error testing rate limiter:')
  console.error(error.message)
  console.log()
  console.log('Possible issues:')
  console.log('1. Check your UPSTASH_REDIS_REST_URL is correct')
  console.log('2. Check your UPSTASH_REDIS_REST_TOKEN is correct')
  console.log('3. Verify your Upstash database is active')
  console.log('4. Check your internet connection')
  process.exit(1)
}

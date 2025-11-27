#!/usr/bin/env node

/**
 * Backfill price data from String format to Decimal
 * Extracts numeric values from price strings like "500 RSD" or "1,200 RSD"
 *
 * Run with: node scripts/backfill-pricing.mjs
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '..', '.env.local') })

const prisma = new PrismaClient()

async function backfillPricing() {
  console.log('🔄 Starting price data backfill...\n')

  try {
    // Get all pricing packages that need backfilling
    const allPackages = await prisma.pricingPackage.findMany()
    const packages = allPackages.filter(pkg => pkg.price && !pkg.priceAmount)

    console.log(`📦 Found ${packages.length} pricing packages to update\n`)

    if (packages.length === 0) {
      console.log('✅ No packages need updating!')
      return
    }

    let updated = 0
    let failed = 0

    for (const pkg of packages) {
      try {
        // Extract numeric value from price string
        // Handles formats like: "500 RSD", "1,200 RSD", "1.500,00 RSD"
        const priceMatch = pkg.price.match(/[\d,\.]+/)

        if (!priceMatch) {
          console.log(`⚠️  Could not extract price from: "${pkg.price}" (${pkg.name})`)
          failed++
          continue
        }

        // Remove commas and convert to number
        const priceStr = priceMatch[0].replace(/,/g, '')
        const priceAmount = parseFloat(priceStr)

        if (isNaN(priceAmount)) {
          console.log(`⚠️  Invalid price number: "${priceStr}" (${pkg.name})`)
          failed++
          continue
        }

        // Extract currency (defaults to RSD)
        const currencyMatch = pkg.price.match(/[A-Z]{3}/)
        const priceCurrency = currencyMatch ? currencyMatch[0] : 'RSD'

        // Update the package
        await prisma.pricingPackage.update({
          where: { id: pkg.id },
          data: {
            priceAmount,
            priceCurrency,
          },
        })

        console.log(`✅ ${pkg.name}: "${pkg.price}" → ${priceAmount} ${priceCurrency}`)
        updated++
      } catch (error) {
        console.log(`❌ Error updating ${pkg.name}:`, error.message)
        failed++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Updated: ${updated}`)
    console.log(`   ❌ Failed: ${failed}`)
    console.log(`   📦 Total: ${packages.length}`)

    if (updated === packages.length) {
      console.log('\n🎉 All pricing packages updated successfully!')
    }
  } catch (error) {
    console.error('❌ Error during backfill:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

backfillPricing()

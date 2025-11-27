#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

// Load environment variables from .env
config({ path: join(__dirname, '..', '.env') });
config({ path: join(__dirname, '..', '.env.local') });

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('🔐 Phase 3: Adding GDPR compliance fields...\n');

async function applyGDPRFields() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    // Step 1: Add columns
    console.log('📝 Step 1: Adding GDPR columns...');
    const sqlPath1 = join(__dirname, 'add_gdpr_fields.sql');
    const sqlContent1 = readFileSync(sqlPath1, 'utf-8');

    // Execute the entire DO block as one statement
    await pool.query(sqlContent1);
    console.log('✓ Columns added');

    // Step 2: Add indexes and comments
    console.log('📝 Step 2: Adding indexes and documentation...');
    const sqlPath2 = join(__dirname, 'add_gdpr_indexes.sql');
    const sqlContent2 = readFileSync(sqlPath2, 'utf-8');

    const statements2 = sqlContent2
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements2) {
      if (statement) {
        await pool.query(statement);
      }
    }
    console.log('✓ Indexes and documentation added');

    console.log('\n✅ GDPR compliance fields added successfully!');
    console.log('\n📊 Fields added to User table:');
    console.log('  - consentGivenAt (TIMESTAMP) - When user gave consent');
    console.log('  - consentVersion (VARCHAR) - Privacy policy version');
    console.log('  - dataProcessingConsent (BOOLEAN) - Data processing consent flag');
    console.log('  - marketingConsentUpdatedAt (TIMESTAMP) - Marketing consent update time');
    console.log('  - deletionRequestedAt (TIMESTAMP) - Account deletion request time');
    console.log('  - deletionScheduledFor (TIMESTAMP) - Scheduled deletion date');
    console.log('  - deletionReason (TEXT) - Reason for deletion');

    console.log('\n🔒 GDPR Compliance Benefits:');
    console.log('  - Right to be informed: Track consent versions');
    console.log('  - Right to erasure: Track deletion requests');
    console.log('  - Consent management: Track when consent was given/updated');
    console.log('  - Audit trail: Complete history of user consent');

    console.log('\n📋 Next Steps:');
    console.log('  1. Update Prisma schema with new fields');
    console.log('  2. Add consent forms to registration flow');
    console.log('  3. Implement "Delete My Account" feature');
    console.log('  4. Create scheduled job to process deletion requests');
    console.log('  5. Update privacy policy with data retention policy');

  } catch (error) {
    console.error('\n❌ Error applying GDPR fields:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyGDPRFields();

-- Phase 3: Add GDPR compliance fields to User table
-- This ensures compliance with EU data protection regulations

-- Step 1: Add GDPR consent tracking columns (one at a time with IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'consentGivenAt') THEN
    ALTER TABLE "User" ADD COLUMN "consentGivenAt" TIMESTAMP(3);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'consentVersion') THEN
    ALTER TABLE "User" ADD COLUMN "consentVersion" VARCHAR(10) DEFAULT '1.0';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'dataProcessingConsent') THEN
    ALTER TABLE "User" ADD COLUMN "dataProcessingConsent" BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'marketingConsentUpdatedAt') THEN
    ALTER TABLE "User" ADD COLUMN "marketingConsentUpdatedAt" TIMESTAMP(3);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'deletionRequestedAt') THEN
    ALTER TABLE "User" ADD COLUMN "deletionRequestedAt" TIMESTAMP(3);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'deletionScheduledFor') THEN
    ALTER TABLE "User" ADD COLUMN "deletionScheduledFor" TIMESTAMP(3);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'deletionReason') THEN
    ALTER TABLE "User" ADD COLUMN "deletionReason" TEXT;
  END IF;
END $$;

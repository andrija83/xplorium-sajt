-- Step 2: Add indexes for GDPR-related queries
CREATE INDEX IF NOT EXISTS user_deletion_requested_idx
ON "User" ("deletionRequestedAt")
WHERE "deletionRequestedAt" IS NOT NULL;

CREATE INDEX IF NOT EXISTS user_deletion_scheduled_idx
ON "User" ("deletionScheduledFor")
WHERE "deletionScheduledFor" IS NOT NULL;

-- Step 3: Add column comments for documentation
COMMENT ON COLUMN "User"."consentGivenAt" IS 'Timestamp when user gave GDPR consent';
COMMENT ON COLUMN "User"."consentVersion" IS 'Version of privacy policy/terms user consented to';
COMMENT ON COLUMN "User"."dataProcessingConsent" IS 'Whether user consented to data processing';
COMMENT ON COLUMN "User"."marketingConsentUpdatedAt" IS 'When marketing consent was last updated';
COMMENT ON COLUMN "User"."deletionRequestedAt" IS 'When user requested account deletion (GDPR right to erasure)';
COMMENT ON COLUMN "User"."deletionScheduledFor" IS 'When account is scheduled for permanent deletion';
COMMENT ON COLUMN "User"."deletionReason" IS 'User-provided reason for account deletion';

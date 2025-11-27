-- Phase 3: Add text search indexes using pg_trgm extension
-- This script improves search performance for email, title, and phone searches

-- Enable pg_trgm extension for trigram-based text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- User table: trigram index for email search
-- Improves performance of LIKE '%search%' and ILIKE queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS user_email_trgm_idx
ON "User" USING gin (email gin_trgm_ops);

-- User table: trigram index for name search
CREATE INDEX CONCURRENTLY IF NOT EXISTS user_name_trgm_idx
ON "User" USING gin (name gin_trgm_ops);

-- User table: trigram index for phone search
CREATE INDEX CONCURRENTLY IF NOT EXISTS user_phone_trgm_idx
ON "User" USING gin (phone gin_trgm_ops);

-- Booking table: trigram index for email search
CREATE INDEX CONCURRENTLY IF NOT EXISTS booking_email_trgm_idx
ON "Booking" USING gin (email gin_trgm_ops);

-- Booking table: trigram index for phone search
CREATE INDEX CONCURRENTLY IF NOT EXISTS booking_phone_trgm_idx
ON "Booking" USING gin (phone gin_trgm_ops);

-- Booking table: trigram index for title search
CREATE INDEX CONCURRENTLY IF NOT EXISTS booking_title_trgm_idx
ON "Booking" USING gin (title gin_trgm_ops);

-- Event table: trigram index for title search
CREATE INDEX CONCURRENTLY IF NOT EXISTS event_title_trgm_idx
ON "Event" USING gin (title gin_trgm_ops);

-- Event table: trigram index for description search
CREATE INDEX CONCURRENTLY IF NOT EXISTS event_description_trgm_idx
ON "Event" USING gin (description gin_trgm_ops);

-- InventoryItem table: trigram index for name search
CREATE INDEX CONCURRENTLY IF NOT EXISTS inventory_name_trgm_idx
ON "InventoryItem" USING gin (name gin_trgm_ops);

-- MaintenanceLog table: trigram index for equipment search
CREATE INDEX CONCURRENTLY IF NOT EXISTS maintenance_equipment_trgm_idx
ON "MaintenanceLog" USING gin (equipment gin_trgm_ops);

-- Verification: Check that indexes were created
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE indexname LIKE '%trgm_idx'
ORDER BY tablename, indexname;

-- Booking Conflict Prevention Migration
-- Prevents race conditions when creating concurrent bookings for the same time slot

-- Create a partial unique index that prevents overlapping bookings
-- This index only applies to active bookings (PENDING, APPROVED, COMPLETED)
-- Using scheduledAt directly for precise timestamp comparison

CREATE UNIQUE INDEX "Booking_scheduledAt_type_active_idx"
ON "Booking"("scheduledAt", "type")
WHERE "status" IN ('PENDING', 'APPROVED', 'COMPLETED');

-- This index will:
-- 1. Prevent two bookings with same scheduledAt and type if both are active
-- 2. Allow rejected/cancelled bookings with same time (they don't conflict)
-- 3. Cause unique constraint violations on conflicts (caught by application)
-- 4. Work at database level, preventing race conditions

-- Note: We use scheduledAt + type combination because:
-- - Different venues (CAFE, SENSORY, IGRAONICA) can have same time slot
-- - scheduledAt combines date + time into single timestamp for atomic comparison
-- - Partial index (WHERE clause) keeps index small and performant

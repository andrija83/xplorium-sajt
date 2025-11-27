-- Add CHECK constraints for data integrity

-- User table constraints
ALTER TABLE "User" ADD CONSTRAINT "check_user_loyalty_points_positive" CHECK ("loyaltyPoints" >= 0);
ALTER TABLE "User" ADD CONSTRAINT "check_user_total_spent_positive" CHECK ("totalSpent" >= 0);
ALTER TABLE "User" ADD CONSTRAINT "check_user_total_bookings_positive" CHECK ("totalBookings" >= 0);

-- Booking table constraints
ALTER TABLE "Booking" ADD CONSTRAINT "check_booking_guest_count_positive" CHECK ("guestCount" > 0);

-- MaintenanceLog table constraints
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "check_maintenance_cost_positive" CHECK ("cost" IS NULL OR "cost" >= 0);

-- InventoryItem table constraints
ALTER TABLE "InventoryItem" ADD CONSTRAINT "check_inventory_quantity_positive" CHECK ("quantity" >= 0);
ALTER TABLE "InventoryItem" ADD CONSTRAINT "check_inventory_reorder_point_positive" CHECK ("reorderPoint" >= 0);

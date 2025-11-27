-- Add scheduledAt column to Booking table
ALTER TABLE "Booking" ADD COLUMN "scheduledAt" TIMESTAMP(3) NOT NULL;

-- Add indexes for scheduledAt
CREATE INDEX "Booking_scheduledAt_idx" ON "Booking"("scheduledAt");
CREATE INDEX "Booking_status_scheduledAt_idx" ON "Booking"("status", "scheduledAt");

-- Add pricing columns to PricingPackage table
ALTER TABLE "PricingPackage" ADD COLUMN "priceAmount" DECIMAL(10,2);
ALTER TABLE "PricingPackage" ADD COLUMN "priceCurrency" VARCHAR(3) DEFAULT 'RSD';
ALTER TABLE "PricingPackage" ALTER COLUMN "price" DROP NOT NULL;

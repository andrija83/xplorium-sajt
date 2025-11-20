-- CreateEnum
CREATE TYPE "PricingCategory" AS ENUM ('PLAYGROUND', 'SENSORY_ROOM', 'CAFE', 'PARTY');

-- CreateEnum
CREATE TYPE "PricingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "PricingPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "category" "PricingCategory" NOT NULL,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "features" JSONB NOT NULL,
    "description" TEXT,
    "status" "PricingStatus" NOT NULL DEFAULT 'PUBLISHED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PricingPackage_category_idx" ON "PricingPackage"("category");

-- CreateIndex
CREATE INDEX "PricingPackage_status_idx" ON "PricingPackage"("status");

-- CreateIndex
CREATE INDEX "PricingPackage_order_idx" ON "PricingPackage"("order");

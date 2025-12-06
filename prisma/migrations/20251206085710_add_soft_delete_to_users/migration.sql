-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "originalEmail" TEXT;

-- CreateIndex
CREATE INDEX "User_deleted_idx" ON "User"("deleted");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

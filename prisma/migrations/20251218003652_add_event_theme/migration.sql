-- CreateEnum
CREATE TYPE "EventTheme" AS ENUM ('WINTER', 'CHRISTMAS', 'HALLOWEEN', 'EASTER', 'SUMMER', 'SPACE', 'UNICORN', 'DINOSAUR', 'DEFAULT');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "theme" "EventTheme";

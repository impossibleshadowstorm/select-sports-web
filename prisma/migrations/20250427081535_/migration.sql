-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'ADMIN', 'HOST');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('SPECIFIC_USER', 'ALL_USERS', 'SPECIFIC_SLOT', 'ALL_SLOTS', 'SLOT_USERS', 'ALL_HOSTS', 'SPECIFIC_HOST');

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" UUID,
    "slotId" UUID,
    "target" "TargetType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

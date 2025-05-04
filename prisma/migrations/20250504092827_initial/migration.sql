-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'ADMIN', 'HOST');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('SPECIFIC_USER', 'ALL_USERS', 'SPECIFIC_SLOT', 'ALL_SLOTS', 'SLOT_USERS', 'ALL_HOSTS', 'SPECIFIC_HOST');

-- CreateEnum
CREATE TYPE "YesNo" AS ENUM ('NO', 'YES');

-- CreateEnum
CREATE TYPE "CommitHours" AS ENUM ('LESS_THAN_5_HOURS', 'FIVE_TO_TEN_HOURS', 'MORE_THAN_TEN_HOURS');

-- CreateEnum
CREATE TYPE "Occupation" AS ENUM ('EMPLOYED_FULL_TIME', 'EMPLOYED_PART_TIME', 'UNEMPLOYED', 'STUDENT', 'ATHELETE', 'SPORTS_MAN');

-- CreateEnum
CREATE TYPE "Schedule" AS ENUM ('WEEKDAYS_MORNING', 'WEEKDAYS_EVENING', 'WEEKEND_MORNING', 'WEEKEND_EVENING', 'WEEKDAYS_AFTERNOON', 'WEEKEND_AFTERNOON');

-- CreateEnum
CREATE TYPE "HostStatus" AS ENUM ('PENDING', 'APRROVED', 'REJECTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('WALLET', 'RAZORPAY', 'STRIPE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUND_PROCESSING', 'REFUND_SUCCESSFUL');

-- CreateEnum
CREATE TYPE "SlotType" AS ENUM ('PRACTICE', 'MATCH', 'TRAINING');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'CANCELLED', 'EXECUTED');

-- CreateEnum
CREATE TYPE "AvailableSports" AS ENUM ('FOOTBALL');

-- CreateEnum
CREATE TYPE "AvailableStates" AS ENUM ('DELHI', 'DELHI_NCR', 'GURGAON');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'ACADEMY', 'INTERMEDIATE', 'SEMI_PRO', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "PreferredFoot" AS ENUM ('RIGHT', 'LEFT');

-- CreateEnum
CREATE TYPE "PreferredPosition" AS ENUM ('GOALKEEPER', 'DEFENDER_RIGHT_CENTER_BACK', 'DEFENDER_LEFT_CENTER_BACK', 'DEFENDER_RIGHT_FULL_BACK', 'DEFENDER_LEFT_FULL_BACK', 'DEFENSIVE_MIDFIELDER', 'RIGHT_ATTACKING_MIDFIELDER', 'LEFT_ATTACKING_MIDFIELDER', 'STRIKER', 'RIGHT_WINGER', 'LEFT_WINGER');

-- CreateEnum
CREATE TYPE "VenueAmenities" AS ENUM ('DRINKING_WATER', 'WALKING_TRACK', 'WASHROOM', 'WARM_UP_AREA', 'COACHING_AVAILABLE', 'PARKING', 'BALL_BOY', 'ARTIFICIAL_TURF', 'LOCKER_ROOM', 'CAFE', 'SITTING_AREA', 'SHOWERS', 'SOUND_SYSTEM', 'WIFI', 'FLOOD_LIGHTS');

-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('PENDING', 'WIN', 'LOSE');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "role" "Role" NOT NULL,
    "gender" "Gender" NOT NULL,
    "skillsRating" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "otp" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "addressId" UUID,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" UUID NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" "AvailableStates" NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'INDIA',
    "nearby" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsProfile" (
    "id" UUID NOT NULL,
    "skillLevel" "SkillLevel" NOT NULL,
    "preferredPosition" "PreferredPosition" NOT NULL,
    "strength" TEXT,
    "weakness" TEXT,
    "preferredFoot" "PreferredFoot" NOT NULL,
    "favoriteNumber" INTEGER,
    "favoritePlayer" TEXT,
    "favoriteClub" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "SportsProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "images" TEXT[],
    "description" TEXT NOT NULL,
    "locationUrl" TEXT NOT NULL,
    "amenities" "VenueAmenities"[],
    "addressId" UUID NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sport" (
    "id" UUID NOT NULL,
    "name" "AvailableSports" NOT NULL,
    "rules" TEXT[],
    "totalPlayer" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" UUID NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "maxPlayer" INTEGER NOT NULL,
    "slotType" "SlotType" NOT NULL DEFAULT 'MATCH',
    "status" "SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION NOT NULL,
    "sportId" UUID NOT NULL,
    "venueId" UUID NOT NULL,
    "team1Id" UUID,
    "team2Id" UUID,
    "hostId" UUID,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "cancellationFee" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slotId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "transactionId" UUID,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RazorpayTransaction" (
    "id" UUID NOT NULL,
    "transactionId" UUID NOT NULL,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RazorpayTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" UUID NOT NULL,
    "transactionId" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Host" (
    "id" UUID NOT NULL,
    "occupation" "Occupation" NOT NULL DEFAULT 'EMPLOYED_FULL_TIME',
    "userId" UUID NOT NULL,
    "playFootball" "YesNo" NOT NULL DEFAULT 'NO',
    "car" "YesNo" NOT NULL DEFAULT 'NO',
    "bike" "YesNo" NOT NULL DEFAULT 'NO',
    "usedThisApp" "YesNo" NOT NULL DEFAULT 'NO',
    "experienceInOrgCS" "YesNo" NOT NULL DEFAULT 'NO',
    "commitHours" "CommitHours" NOT NULL DEFAULT 'LESS_THAN_5_HOURS',
    "preferredSchedule" "Schedule"[],
    "status" "HostStatus" NOT NULL DEFAULT 'PENDING',
    "keyHighlights" TEXT,
    "currentLocation" "AvailableStates" NOT NULL DEFAULT 'DELHI_NCR',

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "status" "TeamStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "_SportToVenue" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_SportToVenue_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TeamUsers" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_TeamUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_addressId_key" ON "User"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "SportsProfile_userId_key" ON "SportsProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_addressId_key" ON "Venue"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "Sport_name_key" ON "Sport"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RazorpayTransaction_transactionId_key" ON "RazorpayTransaction"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "RazorpayTransaction_razorpayOrderId_key" ON "RazorpayTransaction"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "RazorpayTransaction_razorpayPaymentId_key" ON "RazorpayTransaction"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_transactionId_key" ON "WalletTransaction"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Host_userId_key" ON "Host"("userId");

-- CreateIndex
CREATE INDEX "_SportToVenue_B_index" ON "_SportToVenue"("B");

-- CreateIndex
CREATE INDEX "_TeamUsers_B_index" ON "_TeamUsers"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsProfile" ADD CONSTRAINT "SportsProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RazorpayTransaction" ADD CONSTRAINT "RazorpayTransaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Host" ADD CONSTRAINT "Host_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SportToVenue" ADD CONSTRAINT "_SportToVenue_A_fkey" FOREIGN KEY ("A") REFERENCES "Sport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SportToVenue" ADD CONSTRAINT "_SportToVenue_B_fkey" FOREIGN KEY ("B") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamUsers" ADD CONSTRAINT "_TeamUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamUsers" ADD CONSTRAINT "_TeamUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

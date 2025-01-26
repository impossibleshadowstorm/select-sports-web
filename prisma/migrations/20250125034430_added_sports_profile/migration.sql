-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "PreferredFoot" AS ENUM ('RIGHT', 'LEFT');

-- CreateEnum
CREATE TYPE "PreferredPosition" AS ENUM ('GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'ATTACKER');

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

-- CreateIndex
CREATE UNIQUE INDEX "SportsProfile_userId_key" ON "SportsProfile"("userId");

-- AddForeignKey
ALTER TABLE "SportsProfile" ADD CONSTRAINT "SportsProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

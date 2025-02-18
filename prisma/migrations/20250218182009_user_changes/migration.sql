/*
  Warnings:

  - You are about to drop the column `age` on the `User` table. All the data in the column will be lost.
  - Added the required column `actualPrice` to the `Slot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `showPrice` to the `Slot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "Slot" ADD COLUMN     "actualPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "showPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "age",
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender" NOT NULL;

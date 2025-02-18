/*
  Warnings:

  - You are about to drop the column `actualPrice` on the `Slot` table. All the data in the column will be lost.
  - You are about to drop the column `showPrice` on the `Slot` table. All the data in the column will be lost.
  - Added the required column `discountedPrice` to the `Slot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Slot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Slot" DROP COLUMN "actualPrice",
DROP COLUMN "showPrice",
ADD COLUMN     "discountedPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "_SportToVenue" ADD CONSTRAINT "_SportToVenue_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_SportToVenue_AB_unique";

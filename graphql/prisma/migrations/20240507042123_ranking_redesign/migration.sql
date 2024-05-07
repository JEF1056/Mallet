/*
  Warnings:

  - You are about to drop the column `betterThanLast` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `createdTime` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `Rating` table. All the data in the column will be lost.
  - The primary key for the `RatingRelationships` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "RatingRelationships" DROP CONSTRAINT "RatingRelationships_projectId_fkey";

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "betterThanLast",
DROP COLUMN "createdTime",
DROP COLUMN "lastUpdated";

-- AlterTable
ALTER TABLE "RatingRelationships" DROP CONSTRAINT "RatingRelationships_pkey",
ALTER COLUMN "projectId" DROP NOT NULL,
ADD CONSTRAINT "RatingRelationships_pkey" PRIMARY KEY ("ratingId", "judgeId", "categoryId");

-- CreateTable
CREATE TABLE "WorseRating" (
    "ratingId" TEXT NOT NULL,
    "worseProjectId" TEXT NOT NULL,

    CONSTRAINT "WorseRating_pkey" PRIMARY KEY ("ratingId","worseProjectId")
);

-- CreateTable
CREATE TABLE "BetterRating" (
    "ratingId" TEXT NOT NULL,
    "betterProjectId" TEXT NOT NULL,

    CONSTRAINT "BetterRating_pkey" PRIMARY KEY ("ratingId","betterProjectId")
);

-- AddForeignKey
ALTER TABLE "RatingRelationships" ADD CONSTRAINT "RatingRelationships_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorseRating" ADD CONSTRAINT "WorseRating_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "Rating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorseRating" ADD CONSTRAINT "WorseRating_worseProjectId_fkey" FOREIGN KEY ("worseProjectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetterRating" ADD CONSTRAINT "BetterRating_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "Rating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetterRating" ADD CONSTRAINT "BetterRating_betterProjectId_fkey" FOREIGN KEY ("betterProjectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `lastRatingId` on the `Rating` table. All the data in the column will be lost.
  - Added the required column `dateTime` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_lastRatingId_fkey";

-- DropIndex
DROP INDEX "Rating_id_lastRatingId_key";

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "lastRatingId",
ADD COLUMN     "dateTime" TIMESTAMP(3) NOT NULL;

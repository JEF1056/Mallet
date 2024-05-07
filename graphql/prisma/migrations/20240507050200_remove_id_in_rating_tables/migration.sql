/*
  Warnings:

  - The primary key for the `BetterRating` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WorseRating` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "BetterRating" DROP CONSTRAINT "BetterRating_pkey",
ADD CONSTRAINT "BetterRating_pkey" PRIMARY KEY ("ratingId");

-- AlterTable
ALTER TABLE "WorseRating" DROP CONSTRAINT "WorseRating_pkey",
ADD CONSTRAINT "WorseRating_pkey" PRIMARY KEY ("ratingId");

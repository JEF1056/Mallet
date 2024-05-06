/*
  Warnings:

  - You are about to drop the `Hacker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMembers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamProject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamRatings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TeamLocation" DROP CONSTRAINT "TeamLocation_locationId_fkey";

-- DropForeignKey
ALTER TABLE "TeamLocation" DROP CONSTRAINT "TeamLocation_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMembers" DROP CONSTRAINT "TeamMembers_hackerId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMembers" DROP CONSTRAINT "TeamMembers_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamProject" DROP CONSTRAINT "TeamProject_projectId_fkey";

-- DropForeignKey
ALTER TABLE "TeamProject" DROP CONSTRAINT "TeamProject_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamRatings" DROP CONSTRAINT "TeamRatings_ratingId_fkey";

-- DropForeignKey
ALTER TABLE "TeamRatings" DROP CONSTRAINT "TeamRatings_teamId_fkey";

-- DropTable
DROP TABLE "Hacker";

-- DropTable
DROP TABLE "Team";

-- DropTable
DROP TABLE "TeamLocation";

-- DropTable
DROP TABLE "TeamMembers";

-- DropTable
DROP TABLE "TeamProject";

-- DropTable
DROP TABLE "TeamRatings";

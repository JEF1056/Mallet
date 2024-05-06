/*
  Warnings:

  - You are about to drop the column `judgeId` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the `JudgeLocations` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id,lastRatingId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `url` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "JudgeLocations" DROP CONSTRAINT "JudgeLocations_judgeId_fkey";

-- DropForeignKey
ALTER TABLE "JudgeLocations" DROP CONSTRAINT "JudgeLocations_locationId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_judgeId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "url" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "judgeId";

-- DropTable
DROP TABLE "JudgeLocations";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgeRelationships" (
    "judgeId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "JudgeRelationships_pkey" PRIMARY KEY ("judgeId","locationId")
);

-- CreateTable
CREATE TABLE "ProjectLocation" (
    "projectId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "ProjectLocation_pkey" PRIMARY KEY ("projectId","locationId")
);

-- CreateTable
CREATE TABLE "ProjectCategory" (
    "projectId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ProjectCategory_pkey" PRIMARY KEY ("projectId","categoryId")
);

-- CreateTable
CREATE TABLE "RatingRelationships" (
    "ratingId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "RatingRelationships_pkey" PRIMARY KEY ("ratingId","projectId","judgeId","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_id_lastRatingId_key" ON "Rating"("id", "lastRatingId");

-- AddForeignKey
ALTER TABLE "JudgeRelationships" ADD CONSTRAINT "JudgeRelationships_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeRelationships" ADD CONSTRAINT "JudgeRelationships_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocation" ADD CONSTRAINT "ProjectLocation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocation" ADD CONSTRAINT "ProjectLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCategory" ADD CONSTRAINT "ProjectCategory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCategory" ADD CONSTRAINT "ProjectCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingRelationships" ADD CONSTRAINT "RatingRelationships_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "Rating"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingRelationships" ADD CONSTRAINT "RatingRelationships_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingRelationships" ADD CONSTRAINT "RatingRelationships_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingRelationships" ADD CONSTRAINT "RatingRelationships_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

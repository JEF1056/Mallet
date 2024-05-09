/*
  Warnings:

  - You are about to drop the `JudgeRelationships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectLocation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[locationNumber]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `locationNumber` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "JudgeRelationships" DROP CONSTRAINT "JudgeRelationships_judgeId_fkey";

-- DropForeignKey
ALTER TABLE "JudgeRelationships" DROP CONSTRAINT "JudgeRelationships_locationId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectLocation" DROP CONSTRAINT "ProjectLocation_locationId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectLocation" DROP CONSTRAINT "ProjectLocation_projectId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "locationNumber" INTEGER NOT NULL,
ADD COLUMN     "noShow" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "JudgeRelationships";

-- DropTable
DROP TABLE "Location";

-- DropTable
DROP TABLE "ProjectLocation";

-- CreateIndex
CREATE UNIQUE INDEX "Project_locationNumber_key" ON "Project"("locationNumber");

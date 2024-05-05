/*
  Warnings:

  - You are about to drop the `_JudgeLocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_JudgeLocation" DROP CONSTRAINT "_JudgeLocation_A_fkey";

-- DropForeignKey
ALTER TABLE "_JudgeLocation" DROP CONSTRAINT "_JudgeLocation_B_fkey";

-- DropTable
DROP TABLE "_JudgeLocation";

-- CreateTable
CREATE TABLE "JudgeLocations" (
    "judgeId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "JudgeLocations_pkey" PRIMARY KEY ("judgeId","locationId")
);

-- AddForeignKey
ALTER TABLE "JudgeLocations" ADD CONSTRAINT "JudgeLocations_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeLocations" ADD CONSTRAINT "JudgeLocations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

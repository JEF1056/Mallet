/*
  Warnings:

  - You are about to drop the column `endingTimeAtLocation` on the `Judge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Judge" DROP COLUMN "endingTimeAtLocation";

-- CreateTable
CREATE TABLE "JudgeProjectAssignments" (
    "judgeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "JudgeProjectAssignments_pkey" PRIMARY KEY ("judgeId","projectId")
);

-- CreateTable
CREATE TABLE "JudgeProjectVisits" (
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3) NOT NULL,
    "judgeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "JudgeProjectVisits_pkey" PRIMARY KEY ("judgeId","projectId")
);

-- AddForeignKey
ALTER TABLE "JudgeProjectAssignments" ADD CONSTRAINT "JudgeProjectAssignments_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeProjectAssignments" ADD CONSTRAINT "JudgeProjectAssignments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeProjectVisits" ADD CONSTRAINT "JudgeProjectVisits_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeProjectVisits" ADD CONSTRAINT "JudgeProjectVisits_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

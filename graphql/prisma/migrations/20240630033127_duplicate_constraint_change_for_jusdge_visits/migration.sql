/*
  Warnings:

  - The primary key for the `JudgeProjectVisits` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `JudgeProjectVisits` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "JudgeProjectVisits" DROP CONSTRAINT "JudgeProjectVisits_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "skipped" BOOLEAN NOT NULL DEFAULT false,
ADD CONSTRAINT "JudgeProjectVisits_pkey" PRIMARY KEY ("judgeId", "projectId", "id");

-- CreateTable
CREATE TABLE "auth" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpires" TIMESTAMP(3),
    "authLevel" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "auth_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "auth" ADD CONSTRAINT "auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Judge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

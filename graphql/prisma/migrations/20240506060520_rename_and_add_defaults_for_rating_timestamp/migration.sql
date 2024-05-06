/*
  Warnings:

  - You are about to drop the column `dateTime` on the `Rating` table. All the data in the column will be lost.
  - Added the required column `lastUpdated` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "dateTime",
ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL;

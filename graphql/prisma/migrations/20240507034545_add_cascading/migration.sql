-- DropForeignKey
ALTER TABLE "JudgeRelationships" DROP CONSTRAINT "JudgeRelationships_judgeId_fkey";

-- DropForeignKey
ALTER TABLE "JudgeRelationships" DROP CONSTRAINT "JudgeRelationships_locationId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectCategory" DROP CONSTRAINT "ProjectCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectCategory" DROP CONSTRAINT "ProjectCategory_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectLocation" DROP CONSTRAINT "ProjectLocation_locationId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectLocation" DROP CONSTRAINT "ProjectLocation_projectId_fkey";

-- DropForeignKey
ALTER TABLE "RatingRelationships" DROP CONSTRAINT "RatingRelationships_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "RatingRelationships" DROP CONSTRAINT "RatingRelationships_judgeId_fkey";

-- DropForeignKey
ALTER TABLE "RatingRelationships" DROP CONSTRAINT "RatingRelationships_projectId_fkey";

-- DropForeignKey
ALTER TABLE "RatingRelationships" DROP CONSTRAINT "RatingRelationships_ratingId_fkey";

-- AddForeignKey
ALTER TABLE "JudgeRelationships" ADD CONSTRAINT "JudgeRelationships_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeRelationships" ADD CONSTRAINT "JudgeRelationships_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocation" ADD CONSTRAINT "ProjectLocation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocation" ADD CONSTRAINT "ProjectLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCategory" ADD CONSTRAINT "ProjectCategory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCategory" ADD CONSTRAINT "ProjectCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingRelationships" ADD CONSTRAINT "RatingRelationships_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "Rating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingRelationships" ADD CONSTRAINT "RatingRelationships_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingRelationships" ADD CONSTRAINT "RatingRelationships_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingRelationships" ADD CONSTRAINT "RatingRelationships_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

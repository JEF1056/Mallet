-- DropForeignKey
ALTER TABLE "RatingRelationships" DROP CONSTRAINT "RatingRelationships_projectId_fkey";

-- AddForeignKey
ALTER TABLE "RatingRelationships" ADD CONSTRAINT "RatingRelationships_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

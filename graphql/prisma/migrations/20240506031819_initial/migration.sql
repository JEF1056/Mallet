-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hacker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePictureUrl" TEXT,

    CONSTRAINT "Hacker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "beingJudged" BOOLEAN NOT NULL DEFAULT false,
    "noShow" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Judge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "profilePictureUrl" TEXT,
    "endingTimeAtLocation" TIMESTAMP(3),

    CONSTRAINT "Judge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgeLocations" (
    "judgeId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "JudgeLocations_pkey" PRIMARY KEY ("judgeId","locationId")
);

-- CreateTable
CREATE TABLE "TeamLocation" (
    "teamId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "TeamLocation_pkey" PRIMARY KEY ("teamId","locationId")
);

-- CreateTable
CREATE TABLE "TeamMembers" (
    "hackerId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "TeamMembers_pkey" PRIMARY KEY ("hackerId","teamId")
);

-- CreateTable
CREATE TABLE "TeamProject" (
    "teamId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "TeamProject_pkey" PRIMARY KEY ("teamId","projectId")
);

-- CreateTable
CREATE TABLE "TeamRatings" (
    "teamId" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,

    CONSTRAINT "TeamRatings_pkey" PRIMARY KEY ("teamId","ratingId")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "lastRatingId" TEXT,
    "betterThanLast" BOOLEAN NOT NULL,
    "judgeId" TEXT NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_number_key" ON "Location"("number");

-- CreateIndex
CREATE UNIQUE INDEX "TeamLocation_teamId_key" ON "TeamLocation"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamLocation_locationId_key" ON "TeamLocation"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMembers_hackerId_key" ON "TeamMembers"("hackerId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamProject_teamId_key" ON "TeamProject"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamProject_projectId_key" ON "TeamProject"("projectId");

-- AddForeignKey
ALTER TABLE "JudgeLocations" ADD CONSTRAINT "JudgeLocations_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeLocations" ADD CONSTRAINT "JudgeLocations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamLocation" ADD CONSTRAINT "TeamLocation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamLocation" ADD CONSTRAINT "TeamLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembers" ADD CONSTRAINT "TeamMembers_hackerId_fkey" FOREIGN KEY ("hackerId") REFERENCES "Hacker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembers" ADD CONSTRAINT "TeamMembers_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamProject" ADD CONSTRAINT "TeamProject_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamProject" ADD CONSTRAINT "TeamProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRatings" ADD CONSTRAINT "TeamRatings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRatings" ADD CONSTRAINT "TeamRatings_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "Rating"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_lastRatingId_fkey" FOREIGN KEY ("lastRatingId") REFERENCES "Rating"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

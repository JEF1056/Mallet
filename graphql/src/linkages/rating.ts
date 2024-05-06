import { ID } from "graphql-ws";
import { prisma } from "../db";
import {
  Rating,
  MutationSetRatingArgs,
} from "../__generated__/resolvers-types";
import { resolveJudge } from "./judge";
import { resolveProject } from "./project";

export async function resolveRating(
  parent,
  args: { ids: ID[] },
  context,
  info
): Promise<Rating[]> {
  const ratingInformationFromDB = await prisma.rating.findMany({
    where: args.ids
      ? {
          id: { in: args.ids },
        }
      : undefined,
  });

  const ratingRelationshipsFromDB = await prisma.ratingRelationships.findMany({
    where: {
      ratingId: {
        in: ratingInformationFromDB.map((rating) => rating.id),
      },
    },
  });

  const resolvedJudges = await resolveJudge(
    null,
    {
      ids: ratingRelationshipsFromDB.map(
        (ratingRelationship) => ratingRelationship.judgeId
      ),
    },
    null,
    null
  );

  const resolvedProjects = await resolveProject(
    null,
    {
      ids: ratingRelationshipsFromDB.map(
        (ratingRelationship) => ratingRelationship.projectId
      ),
    },
    null,
    null
  );

  const mostRecentRating = await prisma.rating.findFirst({
    where: {
      // Filter by projectId, judge and categoryId
      id: {
        not: ratingRelationshipsFromDB[0].ratingId,
      },
      lastUpdated: {
        lt: ratingInformationFromDB[0].lastUpdated,
      },
      RatingRelationships: {
        some: {
          projectId: ratingRelationshipsFromDB[0].projectId,
          categoryId: ratingRelationshipsFromDB[0].categoryId,
          judgeId: ratingRelationshipsFromDB[0].judgeId,
        },
      },
    },
    // Order by lastUpdated in descending order to get the most recent rating first
    orderBy: {
      lastUpdated: "desc",
    },
  });

  console.log("mostRecentRating", mostRecentRating);

  const ratingIdToJudge = ratingRelationshipsFromDB.reduce(
    (obj, { judgeId, ratingId }) => {
      const judgeInfo = resolvedJudges.find((judge) => judge.id === judgeId);
      if (judgeInfo) {
        obj[ratingId] = judgeInfo;
      }
      return obj;
    },
    {}
  );

  const ratingIdToProject = ratingRelationshipsFromDB.reduce(
    (obj, { projectId, ratingId }) => {
      const projectInfo = resolvedProjects.find(
        (project) => project.id === projectId
      );
      if (projectInfo) {
        obj[ratingId] = projectInfo;
      }
      return obj;
    },
    {}
  );

  const ratings: Rating[] = ratingInformationFromDB.map((rating) => ({
    id: rating.id,
    judge: ratingIdToJudge[rating.id],
    project: ratingIdToProject[rating.id],
    betterThanLast: rating.betterThanLast,
  }));

  return ratings;
}

export async function setRating(
  _,
  args: MutationSetRatingArgs
): Promise<Rating> {
  console.info("Creating rating with args: ", args);

  const rating = await prisma.rating.create({
    data: {
      betterThanLast: args.betterThanLast,
    },
  });

  const ratingRelationships = await prisma.ratingRelationships.create({
    data: {
      judgeId: args.judgeId,
      projectId: args.projectId,
      ratingId: rating.id,
      categoryId: args.categoryId,
    },
  });

  console.info("Created rating: ", rating, ratingRelationships);

  const resolvedRating = await resolveRating(
    null,
    { ids: [rating.id] },
    null,
    null
  )[0];

  console.log("resolveRating", resolvedRating);

  return resolvedRating;
}

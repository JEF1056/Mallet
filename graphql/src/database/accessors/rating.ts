import { ID } from "graphql-ws";
import { prisma } from "../db";
import {
  Rating,
  MutationSetRatingArgs,
  Project,
  Judge,
  Category,
} from "../../__generated__/resolvers-types";
import { resolveJudge } from "./judge";
import { resolveProject } from "./project";
import { v4 as uuidv4 } from "uuid";
import { resolveCategory } from "./category";
import { GraphQLError } from "graphql";
import { batchResolveUniqueAndMap } from "../helpers";

export async function resolveRating(
  depth: number,
  args: { ids?: ID[]; categoryId?: ID },
  context,
  info
): Promise<Rating[]> {
  const ratingInformationFromDB = await prisma.rating.findMany({
    where: args.ids
      ? {
          id: { in: args.ids },
        }
      : {
          RatingRelationships: {
            some: {
              categoryId: args.categoryId,
            },
          },
        },
    include: {
      RatingRelationships: true,
      BetterRating: true,
      WorseRating: true,
    },
  });

  let resolvedProjects: { [key: ID]: Project } = {};
  let resolvedJudges: { [key: ID]: Judge } = {};
  let resolvedCategories: { [key: ID]: Category } = {};

  if ((depth || 0) <= 1) {
    // resolvedProjects includes items from RatingRelationships, BetterRating, and WorseRating. Map by ID.
    resolvedProjects = await batchResolveUniqueAndMap(
      depth,
      resolveProject,
      ratingInformationFromDB
        .flatMap((rating) => [
          rating.RatingRelationships[0].projectId,
          rating.BetterRating[0]?.betterProjectId,
          rating.WorseRating[0]?.worseProjectId,
        ])
        .filter((value) => value)
    );

    resolvedJudges = await batchResolveUniqueAndMap(
      depth,
      resolveJudge,
      ratingInformationFromDB.map(
        (rating) => rating.RatingRelationships[0].judgeId
      )
    );

    resolvedCategories = await batchResolveUniqueAndMap(
      depth,
      resolveCategory,
      ratingInformationFromDB.map(
        (rating) => rating.RatingRelationships[0].categoryId
      )
    );
  }

  const ratings: Rating[] = ratingInformationFromDB.map((rating) => ({
    id: rating.id,
    judge: resolvedJudges[rating.RatingRelationships[0].judgeId] || null,
    project: resolvedProjects[rating.RatingRelationships[0].projectId] || null,
    category:
      resolvedCategories[rating.RatingRelationships[0].categoryId] || null,
    betterProject:
      resolvedProjects[rating.BetterRating[0]?.betterProjectId] || null,
    worseProject:
      resolvedProjects[rating.WorseRating[0]?.worseProjectId] || null,
  }));

  return ratings;
}

export async function setRating(
  _,
  args: MutationSetRatingArgs
): Promise<Rating> {
  console.info("Creating rating with args: ", args);

  let ratingId: string = uuidv4();
  let ratingCreatedAt: Date = null;
  await prisma.$transaction(async (tx) => {
    // Try to find an existing rating
    const rating = await prisma.rating.findFirst({
      where: {
        RatingRelationships: {
          some: {
            categoryId: args.categoryId,
            projectId: args.projectId,
            judgeId: args.judgeId,
          },
        },
      },
      include: {
        RatingRelationships: true,
        BetterRating: true,
        WorseRating: true,
      },
    });

    // If no existing rating is found, create it
    if (!rating) {
      await prisma.$transaction(async (tx) => {
        // Create a new rating
        const newRating = await tx.rating.create({
          data: {
            id: ratingId,
          },
        });

        ratingCreatedAt = newRating.createdAt;

        // Create the relationships
        await tx.ratingRelationships.create({
          data: {
            ratingId: ratingId,
            judgeId: args.judgeId,
            projectId: args.projectId,
            categoryId: args.categoryId,
          },
        });
      });
    } else {
      ratingId = rating.id;
      ratingCreatedAt = rating.createdAt;
    }

    // Get the newest rating older than the current one, excluding the current one
    const latestRating = await prisma.rating.findFirst({
      where: {
        id: {
          not: ratingId,
        },
        createdAt: {
          lt: ratingCreatedAt,
        },
        RatingRelationships: {
          some: {
            categoryId: args.categoryId,
            judgeId: args.judgeId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        RatingRelationships: true,
      },
    });

    // If there is a latest rating, compare the two and create a better/worse relationship
    // If there isn't one, don't do anything
    // Use upsert so this function basically won't ever error
    if (latestRating) {
      if (
        args.currentProjectIsBetter == null ||
        args.currentProjectIsBetter == undefined
      ) {
        throw new GraphQLError(
          "currentProjectIsBetter must be provided if a previous rating exists",
          { extensions: { code: "400" } }
        );
      }

      let betterProjectId: string = null;
      let worseProjectId: string = null;

      if (args.currentProjectIsBetter) {
        betterProjectId = args.projectId;
        worseProjectId = latestRating.RatingRelationships[0].projectId;
      } else {
        betterProjectId = latestRating.RatingRelationships[0].projectId;
        worseProjectId = args.projectId;
      }

      await prisma.$transaction([
        prisma.betterRating.upsert({
          where: {
            ratingId: ratingId,
          },
          update: {
            betterProjectId: betterProjectId,
          },
          create: {
            ratingId: ratingId,
            betterProjectId: betterProjectId,
          },
        }),

        prisma.worseRating.upsert({
          where: {
            ratingId: ratingId,
          },
          update: {
            worseProjectId: worseProjectId,
          },
          create: {
            ratingId: ratingId,
            worseProjectId: worseProjectId,
          },
        }),
      ]);
    }
  });

  const resolvedRating = await resolveRating(
    null,
    { ids: [ratingId] },
    null,
    null
  );

  return resolvedRating[0];
}

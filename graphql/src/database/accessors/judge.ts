import { ID } from "graphql-ws";
import { prisma } from "../db";
import {
  Judge,
  Project,
  MutationCreateJudgeArgs,
} from "../../__generated__/resolvers-types";
import { batchResolveUniqueAndMap } from "../helpers";
import { resolveProject } from "./project";

export async function resolveJudge(
  depth: number | undefined,
  args: { ids: ID[] },
  context,
  info
): Promise<Judge[]> {
  const judgeInformationFromDB = await prisma.judge.findMany({
    where: args.ids
      ? {
          id: { in: args.ids },
        }
      : undefined,
    include: {
      RatingRelationships: true,
      JudgeProjectAssignments: true,
      JudgeProjectVisits: true,
    },
  });

  let resolvedProjects: { [key: ID]: Project } = {};

  // If parent is undefined or 0, we are resolving for a query, so we need to resolve children in this schema
  // Otherwise, we only resolve up to depth of 1
  if (depth <= 1) {
    resolvedProjects = await batchResolveUniqueAndMap(
      depth,
      resolveProject,
      judgeInformationFromDB.flatMap((judge) => [
        ...judge.JudgeProjectAssignments.map(
          (assignment) => assignment.projectId
        ),
        ...judge.RatingRelationships.map((rating) => rating.projectId),
      ])
    );
  }

  const judges: Judge[] = judgeInformationFromDB.map((judge) => ({
    id: judge.id,
    profile: {
      name: judge.name,
      description: judge.description,
      profilePictureUrl: judge.profilePictureUrl,
    },
    assignedProjects: judge.JudgeProjectAssignments.map(
      (assignment) => resolvedProjects[assignment.projectId]
    ).filter((element) => element !== undefined),
    ratedProjects: judge.RatingRelationships.map(
      (rating) => resolvedProjects[rating.projectId]
    ).filter((element) => element !== undefined),
  }));

  return judges;
}

export async function createJudge(
  _,
  args: MutationCreateJudgeArgs
): Promise<Judge> {
  console.info("Creating judge with args: ", args);

  const judge = await prisma.judge.create({
    data: {
      name: args.profile.name,
      description: args.profile.description,
      profilePictureUrl: args.profile.profilePictureUrl,
    },
  });

  return {
    id: judge.id,
    profile: {
      name: judge.name,
      profilePictureUrl: judge.profilePictureUrl,
    },
    assignedProjects: [],
    ratedProjects: [],
  };
}

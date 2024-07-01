import { ID } from "graphql-ws";
import { prisma } from "../db";
import {
  Judge,
  Project,
  MutationCreateJudgeArgs,
  MutationGetNextProjectForJudgeArgs,
} from "../../__generated__/resolvers-types";
import { batchResolveUniqueAndMap } from "../helpers";
import { resolveProject } from "./project";
import { pubsub } from "../../pubsub";
import { GraphQLError } from "graphql";
import { defaultConfig } from "../../config";

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
      RatingRelationships: {
        include: {
          rating: true,
        },
      },
      JudgeProjectAssignments: true,
      JudgeProjectVisits: {
        orderBy: [
          {
            startTime: "desc",
          },
          {
            endTime: "desc",
          },
        ],
      },
    },
  });

  let resolvedProjects: { [key: ID]: Project } = {};

  // If parent is undefined or 0, we are resolving for a query, so we need to resolve children in this schema
  // Otherwise, we only resolve up to depth of 1
  if ((depth || 0) <= 1) {
    resolvedProjects = await batchResolveUniqueAndMap(
      depth,
      resolveProject,
      judgeInformationFromDB.flatMap((judge) => [
        ...judge.JudgeProjectAssignments.map(
          (assignment) => assignment.projectId
        ),
        ...judge.RatingRelationships.map((rating) => rating.projectId),
        ...judge.JudgeProjectVisits.map((visit) => visit.projectId),
      ])
    );
  }

  const judges: Judge[] = judgeInformationFromDB.map((judge) => {
    const currentProject = judge.JudgeProjectVisits.find(
      (visit) =>
        visit.judgeId === judge.id &&
        visit.endTime === null &&
        visit.skipped === false
    );
    // Find the most recent project the judge has rated
    const lastProject = judge.RatingRelationships.sort(
      (a, b) => b.rating.createdAt.getTime() - a.rating.createdAt.getTime()
    )[0];

    // Compute the average time spent per project, if it wasn't skipped, in seconds
    const averageTimeSpentPerProject =
      judge.JudgeProjectVisits.reduce((acc, visit) => {
        if (!visit.skipped && visit.endTime) {
          return (
            acc +
            (visit.endTime.getTime() - visit.startTime.getTime()) /
              judge.JudgeProjectVisits.length
          );
        } else {
          return acc;
        }
      }, 0) / 1000;

    console.log("averageTimeSpentPerProject", averageTimeSpentPerProject);

    return {
      id: judge.id,
      profile: {
        name: judge.name,
        description: judge.description,
        profilePictureUrl: judge.profilePictureUrl,
      },
      // EndingTimeAtLocation is the time the judge is expected to finish the current project
      endingTimeAtLocation:
        currentProject &&
        Math.round(
          currentProject.startTime.getTime() / 1000 +
            (averageTimeSpentPerProject
              ? averageTimeSpentPerProject
              : defaultConfig.expectedSecondsPerProject)
        ),
      lastProject: resolvedProjects[lastProject?.projectId],
      judgingProject: resolvedProjects[currentProject?.projectId],
      assignedProjects: judge.JudgeProjectAssignments.map(
        (assignment) => resolvedProjects[assignment.projectId]
      ).filter((element) => element !== undefined),
      ratedProjects: judge.RatingRelationships.map(
        (rating) => resolvedProjects[rating.projectId]
      ).filter((element) => element !== undefined),
    };
  });

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

  pubsub.publish("JUDGE_CREATED", { judgeCreated: judge });

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

export async function getNextProjectForJudge(
  _,
  args: MutationGetNextProjectForJudgeArgs
) {
  const judge = await prisma.judge.findFirst({
    where: args.id
      ? {
          id: args.id,
        }
      : undefined,
    include: {
      JudgeProjectAssignments: true,
      RatingRelationships: true,
      JudgeProjectVisits: true,
    },
  });

  if (!judge) {
    throw new GraphQLError("Judge not found.");
  }

  const currentlyActiveProjectIds = (
    await prisma.judgeProjectVisits.findMany({
      where: {
        endTime: null,
      },
    })
  ).map((project) => project.projectId);

  // Find the first project that the judge has been assigned that they haven't rated yet
  let nextJudgableProject = judge.JudgeProjectAssignments.find(
    (project) =>
      !currentlyActiveProjectIds.includes(project.projectId) &&
      !judge.RatingRelationships.some(
        (rating) => rating.projectId === project.projectId
      )
  )?.projectId;

  console.log("nextJudgableProject", nextJudgableProject);

  // If all the judge's assigned projects are currently active, give them the project that's received the least judging
  if (!nextJudgableProject) {
    const projectAndRatingsFromDB = await prisma.project.findMany({
      include: {
        RatingRelationships: true,
        JudgeProjectVisits: true,
      },
    });

    const projectRatingCounts = projectAndRatingsFromDB
      .map((project) => ({
        projectId: project.id,
        ratingCount:
          project.RatingRelationships.length +
          project.JudgeProjectVisits.length,
      }))
      .sort((a, b) => a.ratingCount - b.ratingCount);

    // Set nextJudgableProject to the project with the least ratings. Do not include projects in currentlyActiveProjectIds or projects the judge has already rated
    nextJudgableProject = projectRatingCounts.filter(
      (project) =>
        !currentlyActiveProjectIds.includes(project.projectId) &&
        !judge.RatingRelationships.some(
          (rating) => rating.projectId === project.projectId
        )
    )[0]?.projectId;
  }

  console.info(
    `Assigning project ${nextJudgableProject} to judge ${judge.id}.`
  );

  if (!nextJudgableProject) {
    throw new GraphQLError("No projects available for judging.");
  }

  await prisma.$transaction(async (tx) => {
    // Make all other projects the judge is currently visiting inactive
    await tx.judgeProjectVisits.updateMany({
      where: {
        judgeId: judge.id,
        endTime: null,
      },
      data: {
        endTime: new Date(),
        skipped: args.skippedCurrent || false,
      },
    });

    // Set the judge to be judging the project
    await tx.judgeProjectVisits.create({
      data: {
        judgeId: judge.id,
        projectId: nextJudgableProject,
      },
    });
  });

  const project = await resolveProject(
    0,
    { ids: [nextJudgableProject] },
    null,
    null
  );

  return project[0];
}

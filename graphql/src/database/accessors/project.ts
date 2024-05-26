import { ID } from "graphql-ws";
import { prisma } from "../db";
import {
  Project,
  MutationSetProjectsArgs,
  ScoredProject,
  Category,
  Judge,
} from "../../__generated__/resolvers-types";
import { v4 as uuidv4 } from "uuid";
import { resolveCategory, setCategories } from "./category";
import {
  batchResolveUniqueAndMap,
  findFirstNonContinuousNumber,
} from "../helpers";
import { resolveJudge } from "./judge";
import { pubsub } from "../../pubsub";

export async function resolveProject(
  depth: number | undefined,
  args: { ids: ID[] },
  context,
  info
): Promise<Project[]> {
  const projectInformationFromDB = await prisma.project.findMany({
    where: args.ids
      ? {
          id: { in: args.ids },
        }
      : undefined,
    include: {
      ProjectCategory: true,
      JudgeProjectVisits: {
        where: {
          endTime: {
            not: null,
          },
        },
      },
      JudgeProjectAssignments: true,
    },
  });

  let resolvedCategories: { [key: ID]: Category } = {};
  let resolvedJudges: { [key: ID]: Judge } = {};

  // If parent is undefined, we are resolving for a query, so we need to resolve children in this schema
  // Otherwise, we are resolving a child and so we don't resolve any deeper.
  if ((depth || 0) <= 1) {
    resolvedCategories = await batchResolveUniqueAndMap(
      depth,
      resolveCategory,
      projectInformationFromDB.flatMap((project) =>
        project.ProjectCategory.map((category) => category.categoryId)
      )
    );

    resolvedJudges = await batchResolveUniqueAndMap(
      depth,
      resolveJudge,
      projectInformationFromDB.flatMap((project) =>
        project.JudgeProjectAssignments.map((assignment) => assignment.judgeId)
      )
    );
  }

  const projects: Project[] = projectInformationFromDB.map((project) => ({
    id: project.id,
    categories: project.ProjectCategory.map(
      (category) => resolvedCategories[category.categoryId]
    ).filter((element) => element !== undefined),
    description: project.description,
    name: project.name,
    url: project.url,
    beingJudgedBy: project.JudgeProjectVisits.map(
      (visit) => resolvedJudges[visit.judgeId]
    ).filter((element) => element !== undefined),
    assignedJudges: project.JudgeProjectAssignments.map(
      (assignment) => resolvedJudges[assignment.judgeId]
    ).filter((element) => element !== undefined),
    noShow: project.noShow,
  }));

  return projects;
}

export async function setProjects(
  _,
  args: MutationSetProjectsArgs
): Promise<Project[]> {
  console.info(`Creating ${args.projects.length} projects`);
  let projectIds: string[] = [];

  // TODO: this is really inefficient. We should batch these up and do them all at once, maybe reassign their number laster?
  for (const project of args.projects) {
    let projectId: ID = uuidv4();
    let locationNumber: number = undefined;
    await prisma.$transaction(async (tx) => {
      // Attempt to get this project if it exists based on its url
      const existingProject = await tx.project.findFirst({
        where: {
          url: project.url,
        },
      });

      if (existingProject) {
        projectId = existingProject.id;
        locationNumber = existingProject.locationNumber;
      } else {
        // Get the next lowest available location number
        const firstUnassignedNumber = findFirstNonContinuousNumber(
          (
            await tx.project.findMany({
              select: {
                locationNumber: true,
              },
              orderBy: {
                locationNumber: "asc",
              },
            })
          ).map((location) => location.locationNumber)
        );

        locationNumber = firstUnassignedNumber;

        await tx.project.create({
          data: {
            id: projectId,
            name: project.name,
            description: project.description,
            url: project.url,
            locationNumber: firstUnassignedNumber,
          },
        });
      }

      // Assign the project to the categories it belongs to by deleting all existing relationships and creating new ones
      await tx.projectCategory.deleteMany({
        where: {
          projectId,
        },
      });

      // Create the categories if they don't exist
      const fetchedCategories = await setCategories(null, {
        categories: project.categories.map((category) => ({
          name: category,
          global: false,
        })),
      });

      await Promise.all(
        fetchedCategories.map((category) =>
          tx.projectCategory.create({
            data: {
              projectId,
              categoryId: category.id,
            },
          })
        )
      );
    });

    projectIds.push(projectId);
  }

  console.info(`Created projects with ids: ${projectIds}`);

  // TODO: this resolve is unfortunately needed, but it's not ideal.
  // We should be able to return the projects with a top level helper function that iterates depth
  const resolvedProjects = await resolveProject(
    1,
    { ids: projectIds },
    null,
    null
  );

  pubsub.publish("PROJECTS_UPDATED", { projects: resolvedProjects });

  return resolvedProjects;
}

export async function clearProjects() {
  console.info("Clearing all projects");
  await prisma.projectCategory.deleteMany({});
  const deleteCount = (await prisma.project.deleteMany({})).count;
  console.info(`Deleted ${deleteCount} projects`);

  return deleteCount;
}

export async function resolveProjectRankingsForCategory(
  _,
  args: { categoryId: ID }
): Promise<ScoredProject[]> {
  const ratingRelationshipsFromDB = await prisma.rating.findMany({
    where: {
      RatingRelationships: {
        some: {
          categoryId: args.categoryId,
        },
      },
    },
    include: {
      WorseRating: true,
      BetterRating: true,
    },
  });

  const rankedProjects = rankProjects(
    ratingRelationshipsFromDB
      .map((rating) => ({
        better: rating.BetterRating[0]?.betterProjectId,
        worse: rating.WorseRating[0]?.worseProjectId,
      }))
      .filter((project) => project.better && project.worse)
  );

  const resolvedProjects: { [key: ID]: Project } =
    await batchResolveUniqueAndMap(
      0,
      resolveProject,
      rankedProjects.map((project) => project.projectId)
    );

  return rankedProjects.map((project) => ({
    project: resolvedProjects[project.projectId],
    score: project.score,
  }));
}

function rankProjects(
  projects: Array<{ better: string; worse: string }>
): { projectId: ID; score: number }[] {
  const projectRank: { [key: string]: number } = {};

  // Iterate through each project to update rankings
  projects.forEach((project) => {
    // Increment the ranking for the better project
    projectRank[project.better] = (projectRank[project.better] || 0) + 1;
    // Decrement the ranking for the worse project
    projectRank[project.worse] = (projectRank[project.worse] || 0) - 1;
  });

  // Sort object by ranking
  const sortedProjects: { projectId: ID; score: number }[] = Object.entries(
    projectRank
  )
    .map(([projectId, score]) => ({
      projectId,
      score,
    }))
    .sort((a, b) => b.score - a.score);

  return sortedProjects;
}

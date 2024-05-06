import { ID } from "graphql-ws";
import { prisma } from "../db";
import {
  Project,
  MutationCreateProjectsArgs,
} from "../__generated__/resolvers-types";
import { v4 as uuidv4 } from "uuid";
import { resolveCategory } from "./category";

export async function resolveProject(
  parent,
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
  });

  const projectCategoriesFromDB = await prisma.projectCategory.findMany({
    where: {
      projectId: {
        in: projectInformationFromDB.map((project) => project.id),
      },
    },
  });

  const resolvedCategories = await resolveCategory(
    null,
    {
      ids: projectCategoriesFromDB.map(
        (projectCategory) => projectCategory.categoryId
      ),
    },
    null,
    null
  );

  const projectIdToCategory = projectCategoriesFromDB.reduce(
    (obj, { projectId, categoryId }) => {
      const categoryInfo = resolvedCategories.find(
        (category) => category.id === categoryId
      );
      if (categoryInfo) {
        if (!obj[projectId]) {
          obj[projectId] = [];
        }
        obj[projectId].push(categoryInfo);
      }
      return obj;
    },
    {}
  );

  const projects: Project[] = projectInformationFromDB.map((project) => ({
    id: project.id,
    categories: projectIdToCategory[project.id] || [],
    description: project.description,
    name: project.name,
    url: project.url,
  }));

  return projects;
}

export async function createProjects(
  _,
  args: MutationCreateProjectsArgs
): Promise<Project[]> {
  console.info(`Creating ${args.projects.length} projects`);
  let projectIds: string[] = [];

  for (const project of args.projects) {
    const projectId: string = uuidv4();
    await prisma.$transaction([
      prisma.project.create({
        data: {
          id: projectId,
          name: project.name,
          description: project.description,
          url: project.url,
        },
      }),
      prisma.projectCategory.createMany({
        data: project.categoryIds.map((categoryId) => ({
          projectId: projectId,
          categoryId,
        })),
      }),
    ]);

    projectIds.push(projectId);
  }

  console.info(`Created projects with ids: ${projectIds}`);

  const resolvedProjects = await resolveProject(
    null,
    { ids: projectIds },
    null,
    null
  );

  return resolvedProjects;
}

export async function clearProjects() {
  console.info("Clearing all projects");
  await prisma.projectCategory.deleteMany({});
  const deleteCount = (await prisma.project.deleteMany({})).count;
  console.info(`Deleted ${deleteCount} projects`);

  return deleteCount;
}

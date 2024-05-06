import { ID } from "graphql-ws";
import { prisma } from "../db";
import {
  Project,
  MutationCreateProjectArgs,
} from "../__generated__/resolvers-types";

export async function resolveProject(
  parent,
  args: { id: ID[] },
  context,
  info
): Promise<Project[]> {
  const projectInformationFromDB = await prisma.project.findMany({
    where: args.id
      ? {
          id: { in: args.id },
        }
      : undefined,
  });

  const projects: Project[] = projectInformationFromDB.map((project) => ({
    id: project.id,
    endingTimeAtLocation: project.endingTimeAtLocation?.getSeconds(),
    projectdLocations: [],
    unprojectdLocations: [],
  }));

  return projects;
}

export async function createProject(
  _,
  args: MutationCreateProjectArgs
): Promise<Project> {
  console.info("Creating project with args: ", args);

  const project = await prisma.project.create({
    data: {
      name: args.profile.name,
      description: args.profile.description,
      profilePictureUrl: args.profile.profilePictureUrl,
    },
  });

  return {
    id: project.id,
    profile: {
      name: project.name,
      profilePictureUrl: project.profilePictureUrl,
    },
    endingTimeAtLocation: project.endingTimeAtLocation?.getSeconds(),
    projectdLocations: [],
    unprojectdLocations: [],
  };
}

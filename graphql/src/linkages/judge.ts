import { ID } from "graphql-ws";
import { prisma } from "../db";
import {
  Judge,
  MutationCreateJudgeArgs,
} from "../__generated__/resolvers-types";

export async function resolveJudge(
  parent,
  args: { id: ID[] },
  context,
  info
): Promise<Judge[]> {
  const judgeInformationFromDB = await prisma.judge.findMany({
    where: args.id
      ? {
          id: { in: args.id },
        }
      : undefined,
  });

  const judges: Judge[] = judgeInformationFromDB.map((judge) => ({
    id: judge.id,
    profile: {
      name: judge.name,
      profilePictureUrl: judge.profilePictureUrl,
    },
    endingTimeAtLocation: judge.endingTimeAtLocation?.getSeconds(),
    judgedLocations: [],
    unjudgedLocations: [],
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
    endingTimeAtLocation: judge.endingTimeAtLocation?.getSeconds(),
    judgedLocations: [],
    unjudgedLocations: [],
  };
}

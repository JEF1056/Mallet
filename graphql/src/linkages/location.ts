import { ID } from "graphql-ws";
import { prisma } from "../db";
import {
  Judge,
  Location,
  MutationAssignJudgesToLocationArgs,
  MutationCreateLocationArgs,
  MutationSetLocationProjectArgs,
} from "../__generated__/resolvers-types";
import { resolveJudge } from "./judge";
import { FindFirstNonContinouous } from "../helpers";
import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import { pubsub } from "../redis";

export async function resolveLocation(
  parent,
  args: { ids: ID[] },
  context,
  info
): Promise<Location[]> {
  console.info("Resolving location with args: ", args);

  const locationInformationFromDB = await prisma.location.findMany({
    where: args.ids
      ? {
          id: { in: args.ids },
        }
      : undefined,
  });

  const assignedJudgesFromDB = await prisma.judgeRelationships.findMany({
    where: {
      locationId: {
        in: locationInformationFromDB.map((location) => location.id),
      },
    },
  });

  const assignedJudges: Judge[] = await resolveJudge(
    parent,
    {
      ids: assignedJudgesFromDB.map((judge) => judge.judgeId),
    },
    context,
    info
  );

  const locationIdToJudge = assignedJudgesFromDB.reduce(
    (obj, { judgeId, locationId }) => {
      const judgeInfo = assignedJudges.find((judge) => judge.id === judgeId);
      if (judgeInfo) {
        if (!obj[locationId]) {
          obj[locationId] = [];
        }
        obj[locationId].push(judgeInfo);
      }
      return obj;
    },
    {}
  );

  const locations: Location[] = locationInformationFromDB.map((location) => ({
    id: location.id,
    number: location.number,
    beingJudged: location.beingJudged,
    assignedJudges: locationIdToJudge[location.id] || [],
    assignedTeam: null,
    noShow: location.noShow,
  }));

  return locations;
}

export async function createLocation(
  _,
  args: MutationCreateLocationArgs
): Promise<Location> {
  console.info("Creating location with args: ", args);

  const firstUnassignedNumber = FindFirstNonContinouous(
    (
      await prisma.location.findMany({
        select: {
          number: true,
        },
        orderBy: {
          number: "asc",
        },
      })
    ).map((location) => location.number)
  );

  const location = await prisma.location.create({
    data: {
      number: args.number ? args.number : firstUnassignedNumber,
    },
  });

  const assignedJudgesFromDB = await prisma.judgeRelationships.findMany({
    where: {
      locationId: location.id,
    },
  });

  const assignedJudges: Judge[] = await resolveJudge(
    null,
    {
      ids: assignedJudgesFromDB.map((judge) => judge.judgeId),
    },
    null,
    null
  );

  return {
    id: location.id,
    number: location.number,
    beingJudged: location.beingJudged,
    assignedJudges: assignedJudges,
    noShow: location.noShow,
  };
}

export async function assignJudgesToLocation(
  _,
  args: MutationAssignJudgesToLocationArgs
): Promise<Location> {
  console.info("Assigning judges to location with args: ", args);

  let publishEvent: boolean = false;
  try {
    if (
      (
        await prisma.judgeRelationships.createMany({
          data: args.judgeIds.map((judgeId) => ({
            judgeId: judgeId,
            locationId: args.locationId,
          })),
          skipDuplicates: true,
        })
      ).count > 0
    ) {
      publishEvent = true;
    }
  } catch (e) {
    // A common error that happens here is a bad user input causes foreign key violation
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      throw new GraphQLError(
        `Error assigning judges to location: ${e.message}`,
        {
          extensions: { code: "400" },
        }
      );
    }
  }

  const location = (
    await resolveLocation(null, { ids: [args.locationId] }, null, null)
  )[0];

  if (publishEvent) {
    pubsub.publish("LOCATION_JUDGES_CHANGED", { location: location });
  }

  return location;
}

export async function unassignJudgesFromLocation(
  _,
  args: MutationAssignJudgesToLocationArgs
): Promise<Location> {
  console.info("Unassigning judges from location with args: ", args);

  let publishEvent: boolean = false;
  try {
    if (
      (
        await prisma.judgeRelationships.deleteMany({
          where: {
            judgeId: {
              in: args.judgeIds,
            },
            locationId: args.locationId,
          },
        })
      ).count > 0
    ) {
      publishEvent = true;
    }
  } catch (e) {
    // A common error that happens here is a bad user input causes foreign key violation
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      throw new GraphQLError(
        `Error unassigning judges from location: ${e.message}`,
        {
          extensions: { code: "400" },
        }
      );
    }
  }

  const location = (
    await resolveLocation(null, { ids: [args.locationId] }, null, null)
  )[0];

  if (publishEvent) {
    pubsub.publish("LOCATION_JUDGES_CHANGED", { location: location });
  }

  return location;
}

export async function setLocationProject(
  _,
  args: MutationSetLocationProjectArgs
): Promise<Location> {
  console.info("Setting project to location with args: ", args);

  try {
    await prisma.projectLocation.upsert({
      where: {
        projectId_locationId: {
          locationId: args.locationId,
          projectId: args.projectId,
        },
      },
      update: {
        projectId: args.projectId,
      },
      create: {
        projectId: args.projectId,
        locationId: args.locationId,
      },
    });
  } catch (e) {
    // A common error that happens here is a bad user input causes foreign key violation
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      throw new GraphQLError(
        `Error setting project to location: ${e.message}`,
        {
          extensions: { code: "400" },
        }
      );
    }
  }

  const location = (
    await resolveLocation(null, { ids: [args.locationId] }, null, null)
  )[0];

  pubsub.publish("LOCATION_PROJECT_CHANGED", { location: location });

  return location;
}

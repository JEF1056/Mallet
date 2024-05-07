import fs from "fs";
import path from "path";
import { pubsub } from "./redis";
import { createJudge, resolveJudge } from "./linkages/judge";
import {
  assignJudgesToLocation,
  createLocation,
  resolveLocation,
  setLocationProject,
  unassignJudgesFromLocation,
} from "./linkages/location";
import { withFilter } from "graphql-subscriptions";
import {
  clearProjects,
  createProjects,
  resolveProject,
  resolveProjectRankingsForCategory,
} from "./linkages/project";
import { createCategory, resolveCategory } from "./linkages/category";
import { resolveRating, setRating } from "./linkages/rating";

let currentNumber = 0;
// In the background, increment a number every second and notify subscribers when it changes.
function incrementNumber() {
  currentNumber++;
  pubsub.publish("NUMBER_INCREMENTED", { uptime: currentNumber });
  setTimeout(incrementNumber, 1000);
}

// Start incrementing
incrementNumber();

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
export const typeDefs = `${fs.readFileSync(
  path.resolve("schema.graphql").toString()
)}`;

export const resolvers = {
  Query: {
    judge: resolveJudge,
    location: resolveLocation,
    category: resolveCategory,
    project: resolveProject,
    rating: resolveRating,
    rankedProjects: resolveProjectRankingsForCategory
  },
  Mutation: {
    createProjects: createProjects,
    createJudge: createJudge,
    createLocation: createLocation,
    createCategory: createCategory,
    setRating: setRating,

    assignJudgesToLocation: assignJudgesToLocation,
    unassignJudgesFromLocation: unassignJudgesFromLocation,
    setLocationProject: setLocationProject,

    clearProjects: clearProjects,
  },
  Subscription: {
    uptime: {
      subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
    },
    location: {
      subscribe: withFilter(
        () =>
          pubsub.asyncIterator([
            "LOCATION_JUDGES_CHANGED",
            "LOCATION_PROJECT_CHANGED",
          ]),
        (payload, variables) => payload.location.id == variables.id
      ),
    },
  },
};

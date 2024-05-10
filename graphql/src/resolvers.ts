import fs from "fs";
import path from "path";
import { pubsub } from "./pubsub";
import { createJudge, resolveJudge } from "./database/accessors/judge";
import { withFilter } from "graphql-subscriptions";
import {
  clearProjects,
  setProjects,
  resolveProject,
  resolveProjectRankingsForCategory,
} from "./database/accessors/project";
import { createCategory, resolveCategory } from "./database/accessors/category";
import { resolveRating, setRating } from "./database/accessors/rating";

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
    category: resolveCategory,
    project: resolveProject,
    rating: resolveRating,
    rankedProjects: resolveProjectRankingsForCategory,
  },
  Mutation: {
    setProjects: setProjects,
    createJudge: createJudge,
    createCategory: createCategory,
    setRating: setRating,

    clearProjects: clearProjects,
  },
  Subscription: {
    uptime: {
      subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
    },
  },
};

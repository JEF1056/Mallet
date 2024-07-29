import fs from "fs";
import path from "path";
import { pubsub, PUBSUB_EVENTS } from "./pubsub";
import {
  createJudge,
  getNextProjectForJudge,
  resolveJudge,
} from "./database/accessors/judge";
import { withFilter } from "graphql-subscriptions";
import {
  clearProjects,
  resolveProject,
  resolveProjectRankingsForCategory,
  createProjects,
  updateProject,
  resolveProjectCount,
} from "./database/accessors/project";
import {
  deleteCategory,
  resolveCategory,
  setCategories,
} from "./database/accessors/category";
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
    projectCount: resolveProjectCount,
  },
  Mutation: {
    createProjects: createProjects,
    updateProject: updateProject,

    createJudge: createJudge,
    getNextProjectForJudge: getNextProjectForJudge,
    setCategories: setCategories,
    deleteCategory: deleteCategory,
    setRating: setRating,

    clearProjects: clearProjects,
  },
  Subscription: {
    uptime: {
      subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
    },
    projectCount: {
      subscribe: () => pubsub.asyncIterator([PUBSUB_EVENTS.PROJECT_UPDATED]),
    },
    judge: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([PUBSUB_EVENTS.JUDGING_PROJECT_UPDATED]),
        (payload, variables) => {
          return variables.ids.includes(payload.judge.id);
        }
      ),
    },
  },
};

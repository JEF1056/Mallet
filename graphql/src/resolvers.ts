import fs from "fs";
import path from "path";
import { mockLocation } from "./mocks";
import { pubsub } from "./redis";
import { createJudge, resolveJudge } from "./linkages/judge";
import {
  assignJudgesToLocation,
  createLocation,
  resolveLocation,
} from "./linkages/location";

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
  },
  Mutation: {
    createJudge: createJudge,
    createLocation: createLocation,
    assignJudgesToLocation: assignJudgesToLocation,
  },
  Subscription: {
    uptime: {
      subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
    },
  },
};

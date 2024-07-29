import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis, { RedisOptions } from "ioredis";

const options: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    // reconnect after
    return Math.min(times * 50, 2000);
  },
};

export const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});

export const PUBSUB_EVENTS = {
  PROJECT_UPDATED: "PROJECT_UPDATED",
  JUDGE_UPDATED: "JUDGE_UPDATED",
  JUDGING_PROJECT_UPDATED: "JUDGING_PROJECT_UPDATED",
};

pubsub.subscribe(PUBSUB_EVENTS.JUDGING_PROJECT_UPDATED, (payload) => {
  console.log("publishing", payload);
});
import Redis from "ioredis";

const redisConnection = new Redis({
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: process.env.REDIS_PORT ?? 6379,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("Redis Connected!");
});

redisConnection.on("error", (error) => {
  console.error("Redis connection error: ", error);
});

const redisPublisher = new Redis({
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: process.env.REDIS_PORT ?? 6379,
});

redisPublisher.on("connect", () => {
  console.log("Redis Publisher Connected!");
});

redisPublisher.on("error", (error) => {
  console.error("Redis Publisher connection error: ", error);
});

// Redis connection used to receive Pub/Sub messages
const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: process.env.REDIS_PORT ?? 6379,
});

redisSubscriber.on("connect", () => {
  console.log("Redis Subscriber Connected!");
});

redisSubscriber.on("error", (error) => {
  console.error("Redis Subscriber connection error: ", error);
});

export {
  redisConnection,
  redisPublisher,
  redisSubscriber,
};
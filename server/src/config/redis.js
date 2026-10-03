import Redis from "ioredis";

const redisOptions = {
  maxRetriesPerRequest: null,
};

const createRedisConnection = (options = {}) => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, options);
  }

  return new Redis({
    host: process.env.REDIS_HOST ?? "127.0.0.1",
    port: Number(process.env.REDIS_PORT ?? 6379),
    ...options,
  });
};

// BullMQ connection
const redisConnection = createRedisConnection(redisOptions);

// Pub/Sub publisher
const redisPublisher = createRedisConnection();

// Pub/Sub subscriber
const redisSubscriber = createRedisConnection();

// Connection events
redisConnection.on("connect", () => {
  console.log("Redis Connected!");
});

redisConnection.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redisPublisher.on("connect", () => {
  console.log("Redis Publisher Connected!");
});

redisPublisher.on("error", (error) => {
  console.error("Redis Publisher connection error:", error);
});

redisSubscriber.on("connect", () => {
  console.log("Redis Subscriber Connected!");
});

redisSubscriber.on("error", (error) => {
  console.error("Redis Subscriber connection error:", error);
});

export {
  redisConnection,
  redisPublisher,
  redisSubscriber,
};
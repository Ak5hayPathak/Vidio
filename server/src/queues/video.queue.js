import { Queue } from "bullmq";

import { redisConnection } from "../config/redis.js";

const videoProcessingQueue = new Queue("video-processing", {
  connection: redisConnection,

  defaultJobOptions: {
    attempts: 3, //BullMQ allows up to three total attempts, including the initial attempt

    backoff: {
      type: "exponential", //Increases the delay between retries
      delay: 5000, //Starts with a 5-second delay
    },

    removeOnComplete: true, //Removes successfully completed jobs from Redis
    removeOnFail: false, //Retains failed jobs so we can inspect their errors
  },
});

export { videoProcessingQueue };

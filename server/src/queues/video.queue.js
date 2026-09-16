import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

const videoProcessingQueue = new Queue("video-processing", {
    connection: redisConnection,
});

//await videoProcessingQueue.obliterate({ force: true });

export { videoProcessingQueue };
import "dotenv/config";
import { redisPublisher } from "../config/redis.js";

const testMessage = {
  videoId: "test-video-123",
  userId: "6aaa477418596955a2b0e1fb",
  progress: 50,
  stage: "Generating HLS",
};

await redisPublisher.publish(
  "video-processing",
  JSON.stringify(testMessage)
);

console.log("Test message published!");

await redisPublisher.quit();
import { Worker } from "bullmq";

import connectDB from "../config/db.js";
import { redisConnection } from "../config/redis.js";
import validateEnv from "../config/validateEnv.js";

import { processVideoJob } from "./video/processVideoJob.js";
import { cleanupFailedJob } from "./video/failureHandler.js";
import { registerGracefulShutdown } from "./video/shutdown.js";

// Validate environment and connect to MongoDB.
validateEnv([
  "MONGODB_URI",
  ...(process.env.NODE_ENV === "production"
    ? ["REDIS_URL"]
    : ["REDIS_HOST", "REDIS_PORT"]),
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "B2_KEY_ID",
  "B2_APPLICATION_KEY",
  "B2_BUCKET_NAME",
  "B2_ENDPOINT",
  "B2_REGION",
]);

await connectDB();

// Initialize the video processing worker.
const worker = new Worker("video-processing", processVideoJob, {
  connection: redisConnection,
  concurrency: 1,
  lockDuration: 5 * 60 * 1000,
  maxStalledCount: 2,
});

// Job completed successfully.
worker.on("completed", (job, result) => {
  console.log(`Video job ${job.id} completed:`, result);
});

// Job failed.
worker.on("failed", async (job, error) => {
  console.error(`Video job ${job?.id} failed:`, error.message);

  if (!job || !(await job.isFailed())) return;

  try {
    const cleaned = await cleanupFailedJob(job);

    if (cleaned) {
      await job.remove();
    }
  } catch (cleanupError) {
    console.error("Failed to clean up failed video job:", cleanupError);
  }
});

// Worker-level errors.
worker.on("error", (error) => {
  console.error("Video worker error:", error);
});

// Register graceful shutdown handlers.
registerGracefulShutdown(worker);

console.log("Video processing worker started.");

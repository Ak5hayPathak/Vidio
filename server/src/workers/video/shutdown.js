import mongoose from "mongoose";

import { redisConnection, redisPublisher } from "../../config/redis.js";
import { killActiveProcesses } from "../../utils/video-processing/processing-utils/processRegistry.js";

let isShuttingDown = false;

const registerGracefulShutdown = (worker) => {
  const shutdown = async (signal) => {
    if (isShuttingDown) return;

    isShuttingDown = true;
    console.log(`${signal} received. Starting graceful shutdown...`);

    try {
      // Stop active FFmpeg processes.
      killActiveProcesses();

      // Stop the worker and wait for its active jobs to finish.
      await worker.close();

      // Close Redis connections.
      await Promise.allSettled([redisConnection.quit(), redisPublisher.quit()]);

      // Disconnect MongoDB.
      await mongoose.disconnect();

      console.log("Graceful shutdown completed.");
      process.exit(0);
    } catch (error) {
      console.error("Error during graceful shutdown:", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

export { registerGracefulShutdown };

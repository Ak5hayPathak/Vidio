import connectDB from "../config/db.js";
import { Worker } from "bullmq";
import { redisConnection, redisPublisher } from "../config/redis.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Notification } from "../models/notification.model.js";
import {
  processAndUploadVideo,
  processAndUploadThumbnail,
} from "../services/videoProcessing.service.js";
import fs from "fs/promises";
import mongoose from "mongoose";
import validateEnv from "../config/validateEnv.js";

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

// Safely delete temporary files without interrupting job execution
const cleanupFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
    console.log(`Temporary file deleted: ${filePath}`);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete temporary file: ${filePath}`, error);
    }
  }
};

// Publish progress through Redis and optionally persist it in MongoDB
const publishProgress = async (
  videoId,
  userId,
  progressData,
  shouldPersist = false
) => {
  const { progress, stage, status } = progressData;

  if (shouldPersist) {
    const update = {};

    if (typeof progress === "number") {
      update.processingProgress = progress;
    }

    if (stage) {
      update.processingStage = stage;
    }

    if (status) {
      update.processingStatus = status;
    }

    await Video.findByIdAndUpdate(videoId, update);
  }

  await redisPublisher.publish(
    "video-processing",
    JSON.stringify({
      videoId,
      userId,
      ...progressData,
    })
  );
};

await connectDB();

const videoWorker = new Worker(
  "video-processing",
  async (job) => {
    const {
      videoId,
      videoFileLocalPath,
      thumbnailLocalPath,
      username,
      userId,
    } = job.data;

    console.log(`Processing video job: ${job.id}`);

    try {
      // 1. Retrieve video document
      let video = await Video.findById(videoId);

      if (!video) {
        throw new Error("Video document not found");
      }

      let thumbnailURL = video.thumbnail;
      let videoFile = video.videoFile;
      let qualities = video.qualities;
      let duration = video.duration;

      // 2. Process thumbnail only if it hasn't been uploaded already
      if (!thumbnailURL) {
        await publishProgress(
          videoId,
          userId,
          {
            progress: 0,
            stage: "Processing thumbnail",
          },
          true
        );

        const {
          thumbnailURL: uploadedThumbnailURL,
          thumbnailLocalPath: processedThumbnailPath,
        } = await processAndUploadThumbnail(
          thumbnailLocalPath,
          videoFileLocalPath
        );

        // Save thumbnail checkpoint immediately
        video.thumbnail = uploadedThumbnailURL;
        await video.save();

        thumbnailURL = uploadedThumbnailURL;

        // Thumbnail is now safely stored in Cloudinary and MongoDB
        await cleanupFile(processedThumbnailPath);

        console.log("Thumbnail uploaded and checkpoint saved");
      } else {
        console.log(`Reusing existing thumbnail for video: ${videoId}`);

        // Clean up any remaining original thumbnail file
        await cleanupFile(thumbnailLocalPath);
      }

      await publishProgress(videoId, userId, {
        progress: 10,
        stage: "Thumbnail completed",
      });

      // 3. Process video only if it isn't already ready
      if (video.processingStatus !== "ready" || !videoFile) {
        // Reset persisted progress when starting/restarting encoding
        await Video.findByIdAndUpdate(videoId, {
          processingProgress: 0,
          processingStage: "Processing video",
        });

        await publishProgress(videoId, userId, {
          progress: 10,
          stage: "Processing video",
        });

        let lastPersistedThreshold = 0;

        const result = await processAndUploadVideo(
          videoFileLocalPath,
          async (progressData) => {
            const { progress } = progressData;

            const currentThreshold = Math.floor(progress / 20) * 20;

            const shouldPersist = currentThreshold > lastPersistedThreshold;

            if (shouldPersist) {
              lastPersistedThreshold = currentThreshold;
            }

            await publishProgress(videoId, userId, progressData, shouldPersist);
          }
        );

        videoFile = result.videoFile;
        qualities = result.qualities;
        duration = result.duration;

        console.log("Video processing completed");

        // 4. Update video document
        video = await Video.findByIdAndUpdate(
          videoId,
          {
            videoFile,
            qualities,
            duration,
            processingStatus: "ready",
            processingProgress: 100,
            processingStage: "completed",
            isPublished: true,
          },
          { returnDocument: "after" }
        );

        if (!video) {
          throw new Error("Video document not found");
        }
      } else {
        console.log(`Video ${videoId} is already ready. Skipping encoding.`);
      }

      console.log(`Video ${videoId} is ready`);

      // 5. Notify uploader that processing is complete
      await publishProgress(
        video._id.toString(),
        video.owner.toString(),
        {
          progress: 100,
          stage: "completed",
          status: "ready",
        },
        true
      );

      // 6. Find subscribers
      const subscriptions = await Subscription.find({
        channel: video.owner,
      }).select("subscriber");

      // 7. Create notifications without duplicates
      for (const subscription of subscriptions) {
        const recipient = subscription.subscriber;

        const notificationData = {
          recipient,
          sender: video.owner,
          type: "new_video",
          message: `${username} posted a new video`,
          resource: video._id,
        };

        const result = await Notification.updateOne(
          {
            recipient,
            type: "new_video",
            resource: video._id,
          },
          {
            $setOnInsert: notificationData,
          },
          {
            upsert: true,
          }
        );

        // Publish real-time notification only when newly created
        if (result.upsertedCount > 0) {
          await redisPublisher.publish(
            "notifications",
            JSON.stringify({
              recipient: recipient.toString(),
              sender: video.owner.toString(),
              type: "new_video",
              message: notificationData.message,
              resource: video._id.toString(),
            })
          );
        }
      }

      console.log("Subscriber notifications processed");

      // 8. Clean up original video after successful processing
      await cleanupFile(videoFileLocalPath);

      return {
        videoId,
        videoFile,
        thumbnailURL,
        qualities,
        duration,
      };
    } catch (error) {
      const maxAttempts = job.opts.attempts ?? 1;
      const isFinalAttempt = job.attemptsMade + 1 >= maxAttempts;

      console.error(
        `Video processing failed for ${videoId}. ` +
          `Attempt ${job.attemptsMade + 1}/${maxAttempts}:`,
        error.message
      );

      if (isFinalAttempt) {
        // Mark video as failed only if it hasn't already been processed
        try {
          const video = await Video.findById(videoId);

          if (video && video.processingStatus !== "ready") {
            video.processingStatus = "failed";
            video.processingStage = "failed";
            video.isPublished = false;
            await video.save();

            await redisPublisher.publish(
              "video-processing",
              JSON.stringify({
                videoId: video._id.toString(),
                userId: video.owner.toString(),
                progress: video.processingProgress,
                stage: "failed",
                status: "failed",
              })
            );
          }
        } catch (failureError) {
          console.error("Failed to update video failure status:", failureError);
        }

        // Clean up temporary files after the final failure
        await cleanupFile(videoFileLocalPath);
        await cleanupFile(thumbnailLocalPath);

        console.error(`Video ${videoId} permanently failed.`);
      } else {
        console.log(`Video ${videoId} will be retried.`);
      }

      // Re-throw so BullMQ can handle the retry
      throw error;
    }
  },
  {
    connection: redisConnection,
  }
);

videoWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

videoWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

// Prevent multiple shutdown sequences if signals arrive close together
let isShuttingDown = false;

// Gracefully shut down the worker and its connections
const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`\n${signal} received. Shutting down worker...`);

  try {
    // Stop accepting new jobs and wait for active jobs to finish
    await videoWorker.close();
    console.log("Worker closed successfully.");

    // Close Redis connections
    await Promise.all([redisConnection.quit(), redisPublisher.quit()]);
    console.log("Redis connections closed.");

    // Disconnect MongoDB
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");

    console.log("Graceful shutdown completed.");

    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Handle terminal interruption and deployment termination
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

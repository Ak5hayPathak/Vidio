import connectDB from "../config/db.js";
import { Worker } from "bullmq";
import { redisConnection, redisPublisher } from "../config/redis.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Notification } from "../models/notification.model.js";
import {
  processAndUploadVideo,
  processAndUploadThumbnail,
  downloadOriginalFileFromB2,
} from "../services/videoProcessing.service.js";
import { deleteOriginalVideoFromB2 } from "../services/b2.service.js";
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

// Safely delete temporary files without interrupting job execution.
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

// Persist progress using MongoDB _id, while publishing that same ID
// to clients so existing progress listeners continue to work.
const publishProgress = async (
  mongoVideoId,
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

    if (stage) update.processingStage = stage;
    if (status) update.processingStatus = status;

    await Video.findByIdAndUpdate(mongoVideoId, update);
  }

  await redisPublisher.publish(
    "video-processing",
    JSON.stringify({
      videoId: mongoVideoId,
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
      mongoVideoId,
      originalKey,
      thumbnailLocalPath,
      username,
      userId,
    } = job.data;

    let videoFileLocalPath;

    console.log(
      `Processing video job: ${job.id} ` +
        `(UUID: ${videoId}, MongoDB ID: ${mongoVideoId})`
    );

    try {
      if (!videoId || !mongoVideoId) {
        throw new Error("Video UUID or MongoDB ID is missing from the job");
      }

      // 1. Retrieve the document using MongoDB _id.
      let video = await Video.findById(mongoVideoId);

      if (!video) {
        throw new Error("Video document not found");
      }

      let thumbnailURL = video.thumbnail;
      let videoFile = video.videoFile;
      let qualities = video.qualities;
      let duration = video.duration;

      const needsThumbnail = !thumbnailURL;
      const needsProcessing = video.processingStatus !== "ready" || !videoFile;

      // 2. Download the original only when processing or thumbnail
      // generation requires it.
      if (needsThumbnail || needsProcessing) {
        if (!originalKey) {
          throw new Error("Original video B2 key is missing from the job");
        }

        videoFileLocalPath = await downloadOriginalFileFromB2(
          originalKey,
          videoId
        );
      }

      // 3. Process and save the thumbnail checkpoint.
      if (needsThumbnail) {
        await publishProgress(
          mongoVideoId,
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

        video.thumbnail = uploadedThumbnailURL;
        await video.save();

        thumbnailURL = uploadedThumbnailURL;

        await cleanupFile(processedThumbnailPath);

        console.log("Thumbnail uploaded and checkpoint saved");
      } else {
        console.log(`Reusing existing thumbnail for video: ${videoId}`);
        await cleanupFile(thumbnailLocalPath);
      }

      await publishProgress(mongoVideoId, userId, {
        progress: 10,
        stage: "Thumbnail completed",
      });

      // 4. Process HLS only if the video isn't already ready.
      if (needsProcessing) {
        await Video.findByIdAndUpdate(mongoVideoId, {
          processingProgress: 0,
          processingStage: "Processing video",
        });

        await publishProgress(mongoVideoId, userId, {
          progress: 10,
          stage: "Processing video",
        });

        let lastPersistedThreshold = 0;

        const result = await processAndUploadVideo(
          videoFileLocalPath,
          videoId,
          async (progressData) => {
            const { progress } = progressData;
            const currentThreshold = Math.floor(progress / 20) * 20;
            const shouldPersist = currentThreshold > lastPersistedThreshold;

            if (shouldPersist) {
              lastPersistedThreshold = currentThreshold;
            }

            await publishProgress(
              mongoVideoId,
              userId,
              progressData,
              shouldPersist
            );
          }
        );

        videoFile = result.videoFile;
        qualities = result.qualities;
        duration = result.duration;

        console.log("Video processing completed");

        // Persist the successful HLS result before deleting the original.
        video = await Video.findByIdAndUpdate(
          mongoVideoId,
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

        console.log(`Video processing completed for UUID: ${videoId}`);
      } else {
        console.log(`Video ${videoId} is already ready. Skipping encoding.`);
      }

      console.log(`Video ${videoId} is ready`);

      // 5. Delete the original only after the database confirms readiness.
      // This also retries cleanup on subsequent attempts without re-encoding.
      if (originalKey) {
        await deleteOriginalVideoFromB2(originalKey);
        console.log(`Original video deleted from B2: ${originalKey}`);
      } else {
        throw new Error(
          "Original video B2 key is missing; cannot complete cleanup."
        );
      }

      // 6. Notify the uploader that processing is complete.
      await publishProgress(
        mongoVideoId,
        video.owner.toString(),
        {
          progress: 100,
          stage: "completed",
          status: "ready",
        },
        true
      );

      // 7. Find subscribers to the video's owner.
      const subscriptions = await Subscription.find({
        channel: video.owner,
      }).select("subscriber");

      // 8. Create notifications without duplicates.
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
          { $setOnInsert: notificationData },
          { upsert: true }
        );

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

      // 9. Remove local temporary files.
      await cleanupFile(videoFileLocalPath);
      await cleanupFile(thumbnailLocalPath);

      return {
        videoId,
        mongoVideoId,
        videoFile,
        thumbnailURL,
        qualities,
        duration,
      };
    } catch (error) {
      const maxAttempts = job.opts.attempts ?? 1;
      const isFinalAttempt = job.attemptsMade + 1 >= maxAttempts;

      console.error(
        `Video processing failed for UUID: ${videoId} ` +
          `(MongoDB ID: ${mongoVideoId}). ` +
          `Attempt ${job.attemptsMade + 1}/${maxAttempts}:`,
        error.message
      );
      console.error(error.stack);

      if (isFinalAttempt) {
        try {
          const video = await Video.findById(mongoVideoId);

          // Preserve ready status if a later operation fails.
          if (video && video.processingStatus !== "ready") {
            video.processingStatus = "failed";
            video.processingStage = "failed";
            video.isPublished = false;
            await video.save();

            await redisPublisher.publish(
              "video-processing",
              JSON.stringify({
                videoId: mongoVideoId,
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

        await cleanupFile(videoFileLocalPath);
        await cleanupFile(thumbnailLocalPath);

        console.error(`Video ${videoId} permanently failed.`);
      } else {
        // Remove this attempt's temporary files before BullMQ retries.
        await cleanupFile(videoFileLocalPath);
        await cleanupFile(thumbnailLocalPath);

        console.log(`Video ${videoId} will be retried.`);
      }

      throw error;
    }
  },

  {
    connection: redisConnection,
    concurrency: 1,
  }
);

videoWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

videoWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

// Prevent multiple shutdown sequences if signals arrive close together.
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`\n${signal} received. Shutting down worker...`);

  try {
    await videoWorker.close();
    console.log("Worker closed successfully.");

    await Promise.all([redisConnection.quit(), redisPublisher.quit()]);
    console.log("Redis connections closed.");

    await mongoose.disconnect();
    console.log("MongoDB disconnected.");

    console.log("Graceful shutdown completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

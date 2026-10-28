import connectDB from "../config/db.js";
import { Worker } from "bullmq";
import { redisConnection, redisPublisher } from "../config/redis.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Notification } from "../models/notification.model.js";
import {
  processAndUploadQuality,
  processAndUploadMasterPlaylist,
  processAndUploadThumbnail,
  downloadOriginalFileFromB2,
} from "../services/videoProcessing.service.js";
import {
  getQualityConfig,
  isQualityComplete,
  limitQualitiesToMax,
  killActiveProcesses,
} from "../utils/videoProcessor.js";
import {
  deleteOriginalVideoFromB2,
  deleteQualityDirectoryFromB2,
} from "../services/b2.service.js";
import fs from "fs/promises";
import path from "path";
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

// Safely delete local HLS output without interrupting successful processing.
const cleanupDirectory = async (directoryPath) => {
  if (!directoryPath) return;

  try {
    await fs.rm(directoryPath, {
      recursive: true,
      force: true,
    });

    console.log(`Local directory deleted: ${directoryPath}`);
  } catch (error) {
    console.error(
      `Failed to delete local directory: ${directoryPath}`,
      error.message
    );
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

// Keep quality processing checkpoints in the BullMQ job data.
const persistQualityStatuses = async (job, qualities) => {
  await job.updateData({
    ...job.data,
    qualities,
  });
};

// Convert quality metadata or status objects into a consistent checkpoint list.
const normalizeQualityStatuses = (qualities) => {
  if (!Array.isArray(qualities) || qualities.length === 0) {
    throw new Error("No required video qualities found in the job.");
  }

  const normalizedQualities = qualities.map((quality) => {
    const qualityName =
      typeof quality === "string"
        ? quality
        : (quality?.quality ?? quality?.name);

    if (!qualityName || !getQualityConfig(qualityName)) {
      throw new Error(`Invalid or unsupported quality: ${qualityName}`);
    }

    const status =
      quality && typeof quality === "object" && quality.status
        ? quality.status
        : "pending";

    if (!["pending", "processing", "uploaded"].includes(status)) {
      throw new Error(
        `Invalid processing status for quality ${qualityName}: ${status}`
      );
    }

    return {
      quality: qualityName,
      status,
    };
  });

  const uniqueNames = new Set(
    normalizedQualities.map((quality) => quality.quality)
  );

  if (uniqueNames.size !== normalizedQualities.length) {
    throw new Error("Duplicate quality entries found in the job.");
  }

  return normalizedQualities;
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
      duration: requiredDuration,
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

      // Read the latest quality checkpoints from the job data.
      // Drop renditions above the memory-safe limit (also covers jobs that
      // were queued before the limit existed).
      const qualityStatuses = limitQualitiesToMax(
        normalizeQualityStatuses(job.data.qualities)
      );

      // Keep complete FFmpeg configurations separate from quality statuses.
      const suppliedQualityConfigs = job.data.qualityConfigs;

      const qualityConfigs = qualityStatuses.map((qualityStatus) => {
        const suppliedConfig = suppliedQualityConfigs?.find(
          (quality) => quality.name === qualityStatus.quality
        );

        return suppliedConfig ?? getQualityConfig(qualityStatus.quality);
      });

      if (
        qualityConfigs.some(
          (quality) =>
            !quality ||
            !Number.isFinite(quality.height) ||
            !Number.isFinite(quality.width) ||
            !Number.isFinite(quality.bandwidth)
        )
      ) {
        throw new Error("One or more quality configurations are invalid.");
      }

      // Persist normalized checkpoints before processing starts.
      await persistQualityStatuses(job, qualityStatuses);

      // Download the original only when a thumbnail or quality generation
      // requires it. Completed uploaded qualities do not need re-encoding.
      const needsQualityGeneration =
        needsProcessing &&
        qualityStatuses.some((quality) => {
          if (quality.status === "uploaded") {
            return false;
          }

          const qualityDirectory = path.join(
            "public",
            "processed",
            videoId,
            quality.quality
          );

          return !isQualityComplete(qualityDirectory);
        });

      const needsOriginalDownload = needsThumbnail || needsQualityGeneration;

      if (needsOriginalDownload) {
        if (!originalKey) {
          throw new Error("Original video B2 key is missing from the job");
        }

        videoFileLocalPath = await downloadOriginalFileFromB2(
          originalKey,
          videoId
        );
      } else {
        console.log(
          `Local output or uploaded checkpoints are sufficient for ${videoId}.`
        );
      }

      // Process the thumbnail and persist its checkpoint.
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

      // Process HLS only if the video is not already ready.
      if (needsProcessing) {
        await Video.findByIdAndUpdate(mongoVideoId, {
          processingProgress: 0,
          processingStage: "Processing video",
        });

        await publishProgress(mongoVideoId, userId, {
          progress: 10,
          stage: "Processing video",
        });

        const totalQualities = qualityStatuses.length;

        // Process and upload each quality independently.
        for (let index = 0; index < qualityStatuses.length; index++) {
          const qualityStatus = qualityStatuses[index];
          const qualityName = qualityStatus.quality;

          if (qualityStatus.status === "uploaded") {
            console.log(
              `Quality ${qualityName} is already uploaded. Skipping.`
            );

            continue;
          }

          // A previous attempt may have uploaded only part of this quality.
          // Remove that quality's remote versions before recovering it.
          if (qualityStatus.status === "processing") {
            console.log(`Recovering interrupted quality ${qualityName}.`);

            await deleteQualityDirectoryFromB2(videoId, qualityName);
          }

          // Persist the processing checkpoint before starting this quality.
          qualityStatuses[index] = {
            ...qualityStatus,
            status: "processing",
          };

          await persistQualityStatuses(job, qualityStatuses);

          const qualityConfig = qualityConfigs[index];

          // Progress callbacks are synchronous and fire many times per second.
          // Throttle them and always catch errors: an unawaited rejected
          // promise would crash the whole worker process.
          let lastPublishedProgress = -1;
          let lastPublishedStage = "";

          const result = await processAndUploadQuality(
            videoFileLocalPath,
            videoId,
            qualityConfig,
            (progressData) => {
              const qualityProgress = progressData.progress ?? 0;

              const overallProgress =
                10 + ((index + qualityProgress / 100) / totalQualities) * 80;

              if (
                progressData.stage === lastPublishedStage &&
                overallProgress - lastPublishedProgress < 1
              ) {
                return;
              }

              lastPublishedProgress = overallProgress;
              lastPublishedStage = progressData.stage;

              publishProgress(mongoVideoId, userId, {
                progress: overallProgress,
                stage: progressData.stage,
                quality: qualityName,
              }).catch((error) => {
                console.error("Failed to publish progress:", error.message);
              });
            },
            5,
            {
              duration: requiredDuration ?? duration,
            }
          );

          // Save the uploaded checkpoint before deleting local quality output.
          qualityStatuses[index] = {
            ...qualityStatuses[index],
            status: "uploaded",
          };

          await persistQualityStatuses(job, qualityStatuses);

          // Keep local output only until its upload checkpoint is saved.
          await cleanupDirectory(result.qualityDirectory);

          duration = result.duration;

          console.log(`Quality ${qualityName} uploaded and checkpoint saved`);
        }

        // Ensure all required qualities are uploaded before finalizing.
        if (qualityStatuses.some((quality) => quality.status !== "uploaded")) {
          throw new Error(
            "Cannot finalize video: one or more qualities are not uploaded."
          );
        }

        // Build and upload the master playlist after all qualities finish.
        const masterResult = await processAndUploadMasterPlaylist(
          videoId,
          qualityConfigs,
          (progressData) => {
            publishProgress(mongoVideoId, userId, progressData).catch(
              (error) => {
                console.error(
                  "Failed to publish master playlist progress:",
                  error.message
                );
              }
            );
          }
        );

        videoFile = masterResult.videoFile;
        qualities = masterResult.qualities;
        duration = duration ?? requiredDuration;

        // Persist readiness before deleting local output or the original.
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

        // Remove the entire local HLS directory after readiness is persisted.
        // Cleanup failure must not turn a successful upload into a failed job.
        await cleanupDirectory(path.join("public", "processed", videoId));
      } else {
        console.log(`Video ${videoId} is already ready. Skipping encoding.`);

        // Also clean up any leftover HLS output when a ready job is retried.
        await cleanupDirectory(path.join("public", "processed", videoId));
      }

      // Delete the original only after the database confirms readiness.
      if (originalKey) {
        await deleteOriginalVideoFromB2(originalKey);
        console.log(`Original video deleted from B2: ${originalKey}`);
      } else {
        throw new Error(
          "Original video B2 key is missing; cannot complete cleanup."
        );
      }

      // Notify the uploader.
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

      // Find subscribers.
      const subscriptions = await Subscription.find({
        channel: video.owner,
      }).select("subscriber");

      // Create notifications without duplicates.
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
          const failedVideo = await Video.findById(mongoVideoId);

          // Do not overwrite a successful ready status.
          if (failedVideo && failedVideo.processingStatus !== "ready") {
            failedVideo.processingStatus = "failed";
            failedVideo.processingStage = "failed";
            failedVideo.isPublished = false;

            await failedVideo.save();

            await redisPublisher.publish(
              "video-processing",
              JSON.stringify({
                videoId: mongoVideoId,
                userId: failedVideo.owner.toString(),
                progress: failedVideo.processingProgress,
                stage: "failed",
                status: "failed",
              })
            );
          }
        } catch (failureError) {
          console.error("Failed to update video failure status:", failureError);
        }

        console.error(`Video ${videoId} permanently failed.`);
      } else {
        console.log(`Video ${videoId} will be retried.`);
      }

      await cleanupFile(videoFileLocalPath);
      await cleanupFile(thumbnailLocalPath);

      throw error;
    }
  },

  {
    connection: redisConnection,
    concurrency: 1,
    // Encoding on a shared CPU is slow; keep the job lock long enough that
    // BullMQ does not mark a healthy job as stalled and start a second one.
    lockDuration: 5 * 60 * 1000,
    maxStalledCount: 2,
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

  // Stop any running FFmpeg/FFprobe so they don't outlive the worker.
  killActiveProcesses();

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

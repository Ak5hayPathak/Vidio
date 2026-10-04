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
import { terminateActiveFFmpeg } from "../utils/videoProcessor.js";
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

const NOTIFICATION_BATCH_SIZE = 500;
const PROGRESS_MIN_INTERVAL_MS = 1000;
// Render sends SIGTERM and force-kills after its own grace period.
// Stop waiting for the active job a little before that.
const SHUTDOWN_GRACE_MS = 20000;

// Optional RSS/heap logging: set LOG_MEMORY=true to enable.
if (process.env.LOG_MEMORY === "true") {
  setInterval(() => {
    const m = process.memoryUsage();
    console.log(
      `[mem] rss=${(m.rss / 1e6) | 0}MB heap=${(m.heapUsed / 1e6) | 0}MB ` +
        `external=${(m.external / 1e6) | 0}MB`
    );
  }, 10000).unref();
}

// A stray rejected promise should be logged, not crash an in-flight encode.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

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

    if (typeof progress === "number") update.processingProgress = progress;
    if (stage) update.processingStage = stage;
    if (status) update.processingStatus = status;

    await Video.findByIdAndUpdate(videoId, update);
  }

  await redisPublisher.publish(
    "video-processing",
    JSON.stringify({ videoId, userId, ...progressData })
  );
};

// Create "new video" notifications for subscribers without loading them all
// into memory: stream the subscriptions and write in bulk batches.
const notifySubscribers = async (video, username) => {
  const message = `${username} posted a new video`;
  const ownerId = video.owner.toString();
  const resourceId = video._id.toString();

  let operations = [];
  let recipients = [];

  const flush = async () => {
    if (operations.length === 0) return;

    const result = await Notification.bulkWrite(operations, {
      ordered: false,
    });

    // Publish real-time events only for notifications that were newly created
    for (const index of Object.keys(result.upsertedIds ?? {})) {
      await redisPublisher.publish(
        "notifications",
        JSON.stringify({
          recipient: recipients[Number(index)],
          sender: ownerId,
          type: "new_video",
          message,
          resource: resourceId,
        })
      );
    }

    operations = [];
    recipients = [];
  };

  const cursor = Subscription.find({ channel: video.owner })
    .select("subscriber")
    .lean()
    .cursor();

  for await (const { subscriber } of cursor) {
    operations.push({
      updateOne: {
        filter: {
          recipient: subscriber,
          type: "new_video",
          resource: video._id,
        },
        update: {
          $setOnInsert: {
            recipient: subscriber,
            sender: video.owner,
            type: "new_video",
            message,
            resource: video._id,
          },
        },
        upsert: true,
      },
    });
    recipients.push(subscriber.toString());

    if (operations.length >= NOTIFICATION_BATCH_SIZE) {
      await flush();
    }
  }

  await flush();
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
          { progress: 0, stage: "Processing thumbnail" },
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

        await cleanupFile(processedThumbnailPath);

        console.log("Thumbnail uploaded and checkpoint saved");
      } else {
        console.log(`Reusing existing thumbnail for video: ${videoId}`);
        await cleanupFile(thumbnailLocalPath);
      }

      await publishProgress(videoId, userId, {
        progress: 10,
        stage: "Thumbnail completed",
      });

      // 3. Process video only if it isn't already ready
      if (video.processingStatus !== "ready" || !videoFile) {
        await Video.findByIdAndUpdate(videoId, {
          processingProgress: 0,
          processingStage: "Processing video",
        });

        await publishProgress(videoId, userId, {
          progress: 10,
          stage: "Processing video",
        });

        let lastPersistedThreshold = 0;
        let lastPercent = -1;
        let lastPublishedAt = 0;

        // Throttled: FFmpeg reports progress several times a second, and
        // un-awaited async callbacks would otherwise pile up if Redis or
        // Mongo is slow. Errors are swallowed so they can't become
        // unhandled rejections.
        const onEncodeProgress = async (progressData) => {
          const percent = Math.floor(progressData.progress);
          const now = Date.now();

          if (
            percent === lastPercent ||
            now - lastPublishedAt < PROGRESS_MIN_INTERVAL_MS
          ) {
            return;
          }

          lastPercent = percent;
          lastPublishedAt = now;

          const currentThreshold = Math.floor(progressData.progress / 20) * 20;
          const shouldPersist = currentThreshold > lastPersistedThreshold;

          if (shouldPersist) lastPersistedThreshold = currentThreshold;

          try {
            await publishProgress(videoId, userId, progressData, shouldPersist);
          } catch (error) {
            console.error("Progress publish failed:", error.message);
          }
        };

        // Stable videoId (Mongo _id) => retries reuse the same local folder
        // and B2 prefix instead of leaving orphans behind.
        const result = await processAndUploadVideo(
          videoFileLocalPath,
          onEncodeProgress,
          { videoId: String(videoId) }
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
        { progress: 100, stage: "completed", status: "ready" },
        true
      );

      // 6. Notify subscribers. The video is already ready at this point, so
      // a notification failure is logged instead of failing the whole job.
      try {
        await notifySubscribers(video, username);
        console.log("Subscriber notifications processed");
      } catch (error) {
        console.error("Subscriber notifications failed:", error.message);
      }

      // 7. Clean up original video after successful processing
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
          const failedVideo = await Video.findById(videoId);

          if (failedVideo && failedVideo.processingStatus !== "ready") {
            failedVideo.processingStatus = "failed";
            failedVideo.processingStage = "failed";
            failedVideo.isPublished = false;
            await failedVideo.save();

            await redisPublisher.publish(
              "video-processing",
              JSON.stringify({
                videoId: failedVideo._id.toString(),
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

    // One encode at a time: FFmpeg memory is the bottleneck on 512 MB.
    concurrency: 1,

    // Lock is auto-renewed while the event loop is responsive.
    lockDuration: 60000,
    maxStalledCount: 1,

    // Keep Redis from accumulating finished job payloads.
    // (If your BullMQ version rejects these here, move them to the
    // producer's defaultJobOptions instead.)
    removeOnComplete: { age: 3600, count: 100 },
    removeOnFail: { age: 86400, count: 200 },
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

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`\n${signal} received. Shutting down worker...`);

  // If the active job doesn't finish in time, kill FFmpeg and force-close.
  // BullMQ will mark the job stalled and re-run it, so nothing is lost.
  const forceTimer = setTimeout(async () => {
    console.warn("Grace period exceeded. Killing FFmpeg and forcing close.");
    terminateActiveFFmpeg();
    await videoWorker.close(true).catch(() => {});
  }, SHUTDOWN_GRACE_MS);

  try {
    await videoWorker.close();
    clearTimeout(forceTimer);
    console.log("Worker closed successfully.");

    await Promise.all([redisConnection.quit(), redisPublisher.quit()]);
    console.log("Redis connections closed.");

    await mongoose.disconnect();
    console.log("MongoDB disconnected.");

    console.log("Graceful shutdown completed.");
    process.exit(0);
  } catch (error) {
    clearTimeout(forceTimer);
    terminateActiveFFmpeg();
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
import "dotenv/config";
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
      // 1. Process and upload thumbnail
      await redisPublisher.publish(
        "video-processing",
        JSON.stringify({
          videoId,
          userId,
          progress: 0,
          stage: "Processing thumbnail",
        })
      );

      const thumbnailURL = await processAndUploadThumbnail(
        thumbnailLocalPath,
        videoFileLocalPath
      );

      await redisPublisher.publish(
        "video-processing",
        JSON.stringify({
          videoId,
          userId,
          progress: 10,
          stage: "Thumbnail completed",
        })
      );

      console.log("Thumbnail processing completed");

      // 2. Process video and upload HLS files to B2
      const { videoFile, qualities, duration } = await processAndUploadVideo(
        videoFileLocalPath,
        async (progressData) => {
          await redisPublisher.publish(
            "video-processing",
            JSON.stringify({
              videoId,
              userId,
              ...progressData,
            })
          );
        }
      );

      console.log("Video processing completed");

      // 3. Update video document
      const video = await Video.findByIdAndUpdate(
        videoId,
        {
          thumbnail: thumbnailURL,
          videoFile,
          qualities,
          duration,
          processingStatus: "ready",
          isPublished: true,
        },
        { returnDocument: "after" }
      );

      if (!video) {
        throw new Error("Video document not found");
      }

      console.log(`Video ${videoId} is ready`);

      // 4. Notify uploader that processing is complete
      await redisPublisher.publish(
        "video-processing",
        JSON.stringify({
          videoId: video._id.toString(),
          userId: video.owner.toString(),
          progress: 100,
          stage: "completed",
          status: "ready",
        })
      );

      // 5. Find subscribers
      const subscriptions = await Subscription.find({
        channel: video.owner,
      }).select("subscriber");

      if (subscriptions.length > 0) {
        // 6. Create database notifications
        const notifications = subscriptions.map((subscription) => ({
          recipient: subscription.subscriber,
          sender: video.owner,
          type: "new_video",
          message: `${username} posted a new video`,
          resource: video._id,
        }));

        await Notification.insertMany(notifications);

        // 7. Send real-time notifications to subscribers
        for (const subscription of subscriptions) {
          await redisPublisher.publish(
            "notifications",
            JSON.stringify({
              recipient: subscription.subscriber.toString(),
              sender: video.owner.toString(),
              type: "new_video",
              message: `${username} posted a new video`,
              resource: video._id.toString(),
            })
          );
        }
      }

      console.log("Subscriber notifications sent");
      await fs.unlink(videoFileLocalPath);

      return {
        videoId,
        videoFile,
        thumbnailURL,
        qualities,
        duration,
      };
    } catch (error) {
      // Mark video as failed
      const video = await Video.findByIdAndUpdate(
        videoId,
        { processingStatus: "failed" },
        { returnDocument: "after" }
      );

      if (video) {
        // Notify uploader that processing failed
        await redisPublisher.publish(
          "video-processing",
          JSON.stringify({
            videoId: video._id.toString(),
            userId: video.owner.toString(),
            progress: 0,
            stage: "failed",
            status: "failed",
          })
        );
      }

      console.error(`Video processing failed for ${videoId}:`, error.message);

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

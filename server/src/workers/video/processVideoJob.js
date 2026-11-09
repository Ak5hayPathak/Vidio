import { Video } from "../../models/video.model.js";

import {
  processAndUploadThumbnail,
  downloadOriginalFileFromB2,
} from "../../services/videoProcessing.service.js";

import { deleteOriginalVideoFromB2 } from "../../services/b2.service.js";

import {
  normalizeQualityStatuses,
  buildSafeQualityConfigs,
  persistQualityStatuses,
} from "./qualityCheckpoints.js";

import {
  processVideoQualities,
  generateMasterPlaylist,
} from "./qualityProcessor.js";

import { cleanupFile, cleanupDirectory, safeStep } from "./cleanup.js";

import { publishProgress } from "./progress.js";
import { notifySubscribersOfNewVideo } from "./notifications.js";

export const processVideoJob = async (job) => {
  const {
    videoId,
    mongoVideoId,
    originalKey,
    thumbnailLocalPath,
    username,
    userId,
    duration: requiredDuration,
    qualities,
  } = job.data;

  if (!videoId || !mongoVideoId || !originalKey) {
    throw new Error("Invalid video processing job data.");
  }

  let videoFileLocalPath;
  let duration = requiredDuration;

  try {
    let video = await Video.findById(mongoVideoId);

    if (!video) {
      throw new Error(`Video not found: ${mongoVideoId}`);
    }

    let { thumbnail: thumbnailURL, videoFile } = video;

    const needsThumbnail = !thumbnailURL;
    const needsProcessing = video.processingStatus !== "ready" || !videoFile;

    console.log("JOB QUALITIES:", qualities);
    // Validate and prepare quality checkpoints.
    let qualityStatuses = normalizeQualityStatuses(qualities);

    const { qualityStatuses: safeQualityStatuses, qualityConfigs } =
      buildSafeQualityConfigs(qualityStatuses);

    qualityStatuses = safeQualityStatuses;

    await persistQualityStatuses(job, qualityStatuses);

    // Download the original only when additional processing is required.
    if (needsThumbnail || needsProcessing) {
      videoFileLocalPath = await downloadOriginalFileFromB2(
        originalKey,
        videoId
      );
    }

    // Generate and save the thumbnail.
    if (needsThumbnail) {
      const thumbnailResult = await processAndUploadThumbnail(
        thumbnailLocalPath,
        videoFileLocalPath
      );

      thumbnailURL = thumbnailResult.thumbnailURL;

      video.thumbnail = thumbnailURL;
      await video.save();

      await cleanupFile(thumbnailResult.thumbnailLocalPath);

      await publishProgress(
        mongoVideoId,
        userId,
        {
          progress: 10,
          stage: "thumbnail",
          status: "processing",
        },
        true
      );
    }

    // Process video qualities and generate the master playlist.
    if (needsProcessing) {
      await publishProgress(
        mongoVideoId,
        userId,
        {
          progress: 0,
          stage: "processing",
          status: "processing",
        },
        true
      );

      const processed = await processVideoQualities({
        job,
        videoFileLocalPath,
        videoId,
        mongoVideoId,
        userId,
        qualityStatuses,
        qualityConfigs,
        duration,
      });

      duration = processed.duration;

      const masterResult = await generateMasterPlaylist({
        videoId,
        mongoVideoId,
        userId,
        qualityConfigs,
      });

      videoFile = masterResult.videoFile;

      duration = masterResult.duration ?? duration;

      const updatedVideo = await Video.findOneAndUpdate(
        {
          _id: mongoVideoId,
          processingStatus: { $ne: "ready" },
        },
        {
          videoFile,
          thumbnail: thumbnailURL,
          qualities: masterResult.qualities,
          duration,
          processingStatus: "ready",
          processingProgress: 100,
          processingStage: "completed",
          isPublished: true,
        },
        { returnDocument: "after" }
      );

      // Another worker may have completed this video already.
      if (!updatedVideo) {
        const currentVideo = await Video.findById(mongoVideoId);

        if (!currentVideo || currentVideo.processingStatus !== "ready") {
          throw new Error("Failed to finalize video processing.");
        }

        videoFile = currentVideo.videoFile;
        duration = currentVideo.duration;
      }

      await cleanupDirectory(`public/processed/${videoId}`);
    } else {
      console.log(`Video ${videoId} is already ready. Skipping processing.`);
    }

    // Remove the original from B2 after successful processing.
    await safeStep("delete original from B2", () =>
      deleteOriginalVideoFromB2(originalKey)
    );

    // Notify the uploader.
    await safeStep("notify uploader", () =>
      publishProgress(
        mongoVideoId,
        userId,
        {
          progress: 100,
          stage: "completed",
          status: "ready",
        },
        true
      )
    );

    // Notify channel subscribers.
    await safeStep("subscriber notifications", () =>
      notifySubscribersOfNewVideo({ video, username })
    );

    return {
      videoId,
      mongoVideoId,
      videoFile,
      thumbnailURL,
      qualities: video.qualities,
      duration,
    };
  } finally {
    // Always clean up local temporary files.
    await cleanupFile(videoFileLocalPath);
    await cleanupFile(thumbnailLocalPath);
    await cleanupDirectory(`public/processed/${videoId}`);
  }
};

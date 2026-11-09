import { Video } from "../../models/video.model.js";

import {
  deleteOriginalVideoFromB2,
  deleteVideoDirectoryFromB2,
} from "../../services/b2.service.js";

import { deleteFromCloudinary } from "../../services/cloudinary.service.js";

import { publishProgress } from "./progress.js";
import {
  cleanupFile,
  cleanupDirectory,
  cleanupTempOriginals,
} from "./cleanup.js";

const cleanupFailedJob = async (job) => {
  const { videoId, mongoVideoId, originalKey, thumbnailLocalPath, userId } =
    job.data ?? {};

  if (!mongoVideoId || !videoId) {
    console.error("Cannot clean up failed job: missing video identifiers.");
    return false;
  }

  let video;

  try {
    video = await Video.findById(mongoVideoId);
  } catch (error) {
    console.error("Failed to verify video before cleanup:", error.message);
    return false;
  }

  if (!video) {
    console.error(`Video ${mongoVideoId} no longer exists.`);
    return false;
  }

  // Never clean up a video that has already become ready.
  if (video.processingStatus === "ready") {
    console.log(`Video ${mongoVideoId} is ready. Skipping cleanup.`);
    return false;
  }

  await Video.findByIdAndUpdate(mongoVideoId, {
    processingStatus: "failed",
  });

  await publishProgress(
    mongoVideoId,
    userId,
    {
      progress: 0,
      stage: "failed",
      status: "failed",
    },
    true
  );

  // Clean local temporary files.
  await Promise.all([
    cleanupFile(thumbnailLocalPath),
    cleanupDirectory(`public/processed/${videoId}`),
    cleanupTempOriginals(videoId),
  ]);

  // Clean remote resources. Track failures so the job is not removed
  // while remote resources may still need cleanup.
  const remoteCleanupTasks = [];

  if (originalKey) {
    remoteCleanupTasks.push(deleteOriginalVideoFromB2(originalKey));
  }

  remoteCleanupTasks.push(deleteVideoDirectoryFromB2(videoId));

  if (video.thumbnail) {
    remoteCleanupTasks.push(deleteFromCloudinary(video.thumbnail));
  }

  const results = await Promise.allSettled(remoteCleanupTasks);

  const remoteCleanupFailed = results.some(
    (result) => result.status === "rejected"
  );

  if (remoteCleanupFailed) {
    console.error(
      `Some remote cleanup operations failed for video ${videoId}.`
    );

    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Remote cleanup error:", result.reason);
      }
    });

    return false;
  }

  // Delete the MongoDB record only if it has not become ready.
  await Video.deleteOne({
    _id: video._id,
    processingStatus: { $ne: "ready" },
  });

  console.log(`Failed video ${videoId} cleaned up successfully.`);

  return true;
};

export { cleanupFailedJob };

import { processVideo, generateThumbnail } from "../utils/videoProcessor.js";
import {
  uploadDirectoryToB2,
  deleteVideoDirectoryFromB2,
} from "./b2.service.js";
import { uploadOnCloudinary } from "./cloudinary.service.js";
import { deleteLocalHLS } from "../utils/fileCleanup.js";
import { APIError } from "../utils/APIError.js";
import fs from "fs/promises";
import path from "path";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Encode to HLS and upload to B2.
 *
 * @param {string} inputPath
 * @param {Function} onProgress
 * @param {object} [options]
 * @param {string} [options.videoId] Stable id (use the Mongo _id) so retries
 *   reuse the same local folder and B2 prefix instead of creating orphans.
 * @param {number} [options.maxUploadAttempts] Whole-directory upload attempts.
 *   Each file is already retried inside uploadDirectoryToB2.
 */
const processAndUploadVideo = async (
  inputPath,
  onProgress,
  { videoId, maxUploadAttempts = 2 } = {}
) => {
  let outputDirectory;
  let resolvedVideoId = videoId;

  try {
    // HLS generation maps to 10-70% overall progress
    const videoInfo = await processVideo(
      inputPath,
      (progressData) => {
        onProgress?.({
          progress: 10 + (progressData.progress * 60) / 100,
          stage: "Generating HLS",
        });
      },
      videoId
    );

    ({ outputDirectory, videoId: resolvedVideoId } = videoInfo);
    const { qualities, duration } = videoInfo;

    let videoFile;

    for (let attempt = 1; attempt <= maxUploadAttempts; attempt++) {
      try {
        console.log(
          `Uploading video to B2. Attempt ${attempt}/${maxUploadAttempts}`
        );

        // B2 upload maps to 70-98% overall progress.
        // uploadDirectoryToB2 clears the prefix first, so retries start clean.
        videoFile = await uploadDirectoryToB2(
          outputDirectory,
          resolvedVideoId,
          3,
          (progressData) => {
            onProgress?.({
              progress: 70 + (progressData.progress * 28) / 100,
              stage: "Uploading HLS",
            });
          }
        );

        break;
      } catch (error) {
        console.error(`Upload attempt ${attempt} failed:`, error.message);

        if (attempt === maxUploadAttempts) {
          // Out of attempts: remove partial objects from B2, then fail.
          try {
            await deleteVideoDirectoryFromB2(resolvedVideoId);
          } catch (deleteError) {
            console.error(
              "Failed to delete partial upload:",
              deleteError.message
            );
          }

          throw error;
        }

        await wait(2000);
      }
    }

    onProgress?.({ progress: 98, stage: "Finalizing" });

    return {
      videoId: resolvedVideoId,
      videoFile,
      qualities,
      duration,
    };
  } catch (error) {
    console.error("Video processing and upload failed:", error.message);
    throw error;
  } finally {
    // Local HLS output is removed on success AND failure.
    if (outputDirectory) {
      try {
        await deleteLocalHLS(outputDirectory);
      } catch (cleanupError) {
        console.error("Failed to delete local HLS:", cleanupError.message);
      }
    }
  }
};

const processAndUploadThumbnail = async (
  thumbnailLocalPath,
  videoFileLocalPath
) => {
  let generatedPath;

  try {
    // Generate a thumbnail if the user didn't provide one
    if (!thumbnailLocalPath) {
      generatedPath = path.join(
        "public",
        "temp",
        `thumbnail-${Date.now()}.jpg`
      );

      await generateThumbnail(videoFileLocalPath, generatedPath);
      thumbnailLocalPath = generatedPath;
    }

    // Upload without deleting the local file (the worker cleans it up)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, false);

    if (!thumbnail) {
      throw new APIError(500, "Failed to upload thumbnail on Cloudinary!");
    }

    return {
      thumbnailURL: thumbnail.url,
      thumbnailLocalPath,
    };
  } catch (error) {
    console.error("Thumbnail processing failed:", error.message);

    // Don't leave generated thumbnails behind on failed attempts.
    if (generatedPath) {
      await fs.unlink(generatedPath).catch(() => {});
    }

    throw error;
  }
};

export { processAndUploadVideo, processAndUploadThumbnail };
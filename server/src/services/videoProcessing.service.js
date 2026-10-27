import { processVideo, generateThumbnail } from "../utils/videoProcessor.js";
import {
  uploadDirectoryToB2,
  deleteVideoDirectoryFromB2,
  getOriginalVideoFromB2,
} from "./b2.service.js";
import { uploadOnCloudinary } from "./cloudinary.service.js";
import { deleteLocalHLS } from "../utils/fileCleanup.js";
import { APIError } from "../utils/APIError.js";
import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const downloadOriginalVideoFromB2 = async (originalKey, videoId) => {
  const extension = path.extname(originalKey) || ".mp4";

  const localPath = path.join(
    "public",
    "temp",
    `original-${videoId}${extension}`
  );

  try {
    await fs.mkdir(path.dirname(localPath), { recursive: true });

    const response = await getOriginalVideoFromB2(originalKey);

    if (!response?.Body) {
      throw new Error(`Original video not found in B2: ${originalKey}`);
    }

    await pipeline(response.Body, createWriteStream(localPath));

    console.log(`Original video downloaded: ${videoId}`);

    return localPath;
  } catch (error) {
    await fs.unlink(localPath).catch(() => {});

    console.error("Failed to download original video:", error.message);
    throw error;
  }
};

const processAndUploadVideo = async (
  inputPath,
  videoId,
  onProgress,
  maxRetries = 5,
  metadata = {}
) => {
  try {
    const videoInfo = await processVideo(
      inputPath,
      videoId,
      (progressData) => {
        const overallProgress = 10 + (progressData.progress * 60) / 100;

        onProgress?.({
          progress: overallProgress,
          stage: "Generating HLS",
        });
      },
      metadata
    );

    const { outputDirectory, qualities, duration } = videoInfo;

    let videoFile;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Uploading video to B2. Attempt ${attempt}/${maxRetries}`);

        videoFile = await uploadDirectoryToB2(
          outputDirectory,
          videoId,
          3,
          (progressData) => {
            const overallProgress = 70 + (progressData.progress * 28) / 100;

            onProgress?.({
              progress: overallProgress,
              stage: "Uploading HLS",
            });
          }
        );

        break;
      } catch (error) {
        lastError = error;

        console.error(`Upload attempt ${attempt} failed:`, error.message);

        try {
          await deleteVideoDirectoryFromB2(videoId);
          console.log(`Partial upload deleted for video: ${videoId}`);
        } catch (deleteError) {
          console.error(
            "Failed to delete partial upload:",
            deleteError.message
          );
        }

        if (attempt === maxRetries) {
          throw lastError;
        }

        console.log("Retrying upload...");
      }
    }

    if (!videoFile) {
      throw lastError ?? new Error("Video upload failed.");
    }

    // Delete local HLS only after the B2 upload succeeds.
    await deleteLocalHLS(outputDirectory);

    onProgress?.({
      progress: 98,
      stage: "Finalizing",
    });

    return {
      videoId,
      videoFile,
      qualities,
      duration,
    };
  } catch (error) {
    console.error("Video processing and upload failed:", error.message);
    throw error;
  }
};

const processAndUploadThumbnail = async (
  thumbnailLocalPath,
  videoFileLocalPath
) => {
  try {
    if (!thumbnailLocalPath) {
      if (!videoFileLocalPath) {
        throw new Error(
          "Original video path is required to generate a thumbnail"
        );
      }

      thumbnailLocalPath = path.join(
        "public",
        "temp",
        `thumbnail-${Date.now()}.jpg`
      );

      await fs.mkdir(path.dirname(thumbnailLocalPath), { recursive: true });

      await generateThumbnail(videoFileLocalPath, thumbnailLocalPath);
    }

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
    throw error;
  }
};

export {
  processAndUploadVideo,
  processAndUploadThumbnail,
  downloadOriginalVideoFromB2,
  // Keep the newer name available too, if another module uses it.
  downloadOriginalVideoFromB2 as downloadOriginalFileFromB2,
};

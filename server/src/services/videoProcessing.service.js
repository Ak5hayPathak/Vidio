import {
  processVideo,
  generateVideoQuality,
  generateThumbnail,
  runFFprobe,
  getQualityConfig,
  createMasterPlaylist,
} from "../utils/videoProcessor.js";

import {
  uploadDirectoryToB2,
  uploadQualityDirectoryToB2,
  uploadMasterPlaylistToB2,
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

// Process and upload one quality independently.
// Local output is retained until the worker confirms the quality status is saved.
const processAndUploadQuality = async (
  inputPath,
  videoId,
  quality,
  onProgress,
  maxRetries = 5,
  metadata = {}
) => {
  if (!videoId) {
    throw new Error("Video ID is required for processing.");
  }

  const qualityName =
    typeof quality === "string" ? quality : (quality?.name ?? quality?.quality);

  const qualityConfig =
    quality?.height && quality?.width && quality?.bitrate
      ? quality
      : getQualityConfig(qualityName);

  if (!qualityConfig) {
    throw new Error(`Unknown quality configuration: ${qualityName}`);
  }

  let duration = Number(metadata.duration);

  // Retrieve duration when it was not provided by the upload controller.
  if (!Number.isFinite(duration) || duration <= 0) {
    if (!inputPath) {
      throw new Error(
        `Original video is required to determine duration for ${qualityName}.`
      );
    }

    const videoMetadata = await runFFprobe(inputPath);

    duration = Number(videoMetadata.format?.duration);

    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("Unable to determine valid video duration.");
    }
  }

  const qualityDirectory = path.join(
    "public",
    "processed",
    videoId,
    qualityName
  );

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Processing quality ${qualityName}. Attempt ${attempt}/${maxRetries}`
      );

      // Generate the quality, or reuse its complete local output.
      await generateVideoQuality(
        inputPath,
        qualityConfig,
        videoId,
        duration,
        (progress) => {
          onProgress?.({
            progress: 10 + (progress * 60) / 100,
            stage: `Generating ${qualityName}`,
            quality: qualityName,
          });
        }
      );

      // Upload only this quality. Failed uploads are retried independently.
      const uploadResult = await uploadQualityDirectoryToB2(
        qualityDirectory,
        videoId,
        qualityName,
        3,
        (progressData) => {
          onProgress?.({
            progress: 70 + (progressData.progress * 28) / 100,
            stage: `Uploading ${qualityName}`,
            quality: qualityName,
          });
        }
      );

      onProgress?.({
        progress: 98,
        stage: `${qualityName} upload completed`,
        quality: qualityName,
      });

      // Keep local output until the worker persists the uploaded status.
      return {
        videoId,
        quality: qualityName,
        qualityDirectory,
        playlistKey: uploadResult.playlistKey,
        uploadedKeys: uploadResult.uploadedKeys,
        duration,
      };
    } catch (error) {
      lastError = error;

      console.error(
        `Processing or upload attempt ${attempt} failed for ${qualityName}:`,
        error.message
      );

      if (attempt === maxRetries) {
        throw lastError;
      }

      console.log(`Retrying quality ${qualityName}...`);
    }
  }

  throw lastError ?? new Error(`Failed to process quality ${qualityName}.`);
};

// Upload the master playlist after all required qualities are uploaded.
const processAndUploadMasterPlaylist = async (
  videoId,
  qualities,
  onProgress
) => {
  if (!videoId || !Array.isArray(qualities) || qualities.length === 0) {
    throw new Error(
      "Video ID and required qualities are needed to create the master playlist."
    );
  }

  // Accept quality configurations or job status objects.
  const qualityConfigs = qualities.map((quality) => {
    if (
      quality?.name &&
      quality?.height &&
      quality?.width &&
      quality?.bandwidth
    ) {
      return quality;
    }

    const qualityName = quality?.quality ?? quality?.name;

    const config = getQualityConfig(qualityName);

    if (!config) {
      throw new Error(`Unknown quality configuration: ${qualityName}`);
    }

    return config;
  });

  const masterPlaylistPath = createMasterPlaylist(qualityConfigs, videoId);

  onProgress?.({
    progress: 95,
    stage: "Uploading master playlist",
  });

  const videoFile = await uploadMasterPlaylistToB2(
    masterPlaylistPath,
    videoId,
    (uploadedBytes) => {
      // Master playlist is small; report its upload stage without
      // treating the callback's byte count as an overall percentage.
      onProgress?.({
        progress: 98,
        stage: "Uploading master playlist",
        uploadedBytes,
      });
    }
  );

  onProgress?.({
    progress: 100,
    stage: "Master playlist uploaded",
  });

  return {
    videoId,
    videoFile,
    masterPlaylistPath,
    qualities: qualityConfigs.map((quality) => quality.name),
  };
};

// Legacy whole-video processing and upload function.
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
  processAndUploadQuality,
  processAndUploadMasterPlaylist,
  processAndUploadThumbnail,
  downloadOriginalVideoFromB2,
  // Keep the newer name available too, if another module uses it.
  downloadOriginalVideoFromB2 as downloadOriginalFileFromB2,
};

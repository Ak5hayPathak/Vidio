import fs from "fs";
import path from "path";

import { PROCESSED_VIDEOS_DIRECTORY } from "./processing-utils/config.js";
import {
  getSupportedQualities,
  getSafeQualityConfig,
} from "./processing-utils/qualityConfig.js";
import { areQualitiesComplete } from "./processing-utils/qualityValidation.js";
import { generateVideoQuality } from "./processing-utils/qualityGenerator.js";
import { createMasterPlaylist } from "./processing-utils/playlist.js";
import { runFFprobe } from "./processing-utils/ffprobe.js";

const processVideo = async (
  inputPath,
  videoId,
  onProgress,
  { qualities: suppliedQualities, duration: suppliedDuration } = {}
) => {
  // Validate videoId to prevent unsafe directory names and paths.
  if (typeof videoId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(videoId)) {
    throw new Error("Invalid video ID");
  }

  // Convert the supplied duration into a number.
  let duration = Number(suppliedDuration);

  // Normalize supplied qualities into an array of quality names.
  // Supports strings ("720p") and objects ({ name: "720p" } or { quality: "720p" }).
  let qualities = Array.isArray(suppliedQualities)
    ? suppliedQualities
        .map((quality) =>
          typeof quality === "string"
            ? quality
            : quality?.name || quality?.quality
        )
        .filter(Boolean) // Remove undefined, null, and empty values.
    : [];

  // Validate supplied quality names against the available quality configurations.
  if (qualities.length > 0) {
    qualities.forEach((quality) => getSafeQualityConfig(quality));
  }

  // Extract metadata if duration or quality information is missing or invalid.
  if (!Number.isFinite(duration) || duration <= 0 || qualities.length === 0) {
    const metadata = await runFFprobe(inputPath);

    // Find the first video stream in the input file.
    const videoStream = metadata.streams?.find(
      (stream) => stream.codec_type === "video"
    );

    if (!videoStream) {
      throw new Error("No video stream found");
    }

    // Get duration from metadata if it wasn't supplied or was invalid.
    if (!Number.isFinite(duration) || duration <= 0) {
      duration = Number(metadata.format?.duration);
    }

    // Ensure a valid video duration was obtained.
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("Unable to determine video duration");
    }

    // Determine supported output qualities from the source video resolution.
    if (qualities.length === 0) {
      const videoHeight = Number(videoStream.height);

      if (!Number.isFinite(videoHeight) || videoHeight <= 0) {
        throw new Error("Unable to determine video resolution");
      }

      qualities = getSupportedQualities(videoHeight);
    }
  }

  // Ensure at least one quality is available for processing.
  if (qualities.length === 0) {
    throw new Error("No supported video qualities available");
  }

  // Prevent duplicate quality entries from being processed.
  if (new Set(qualities).size !== qualities.length) {
    throw new Error("Duplicate video qualities are not allowed");
  }

  // Validate all quality configurations again before processing.
  qualities.forEach((quality) => getSafeQualityConfig(quality));

  // Create the main output directory for this video.
  const outputDirectory = path.join(PROCESSED_VIDEOS_DIRECTORY, videoId);

  fs.mkdirSync(outputDirectory, { recursive: true });

  // Identify qualities whose HLS outputs are already complete.
  const completedQualities = qualities.filter((quality) => {
    return areQualitiesComplete(videoId, [quality]);
  });

  // Identify qualities that still need to be generated.
  const pendingQualities = qualities.filter(
    (quality) => !completedQualities.includes(quality)
  );

  // Total number of qualities required for this video.
  const totalQualities = qualities.length;

  // Count qualities that have already been completed.
  let completedCount = completedQualities.length;

  // Calculate and report overall progress across all qualities.
  const reportOverallProgress = (qualityProgress = 0) => {
    const overallProgress =
      ((completedCount + qualityProgress / 100) / totalQualities) * 100;

    // Round progress and ensure it never exceeds 100%.
    onProgress?.(Math.min(100, Math.round(overallProgress)));
  };

  // Account for qualities that were already completed before this run.
  if (completedCount > 0) {
    reportOverallProgress();
  }

  // Generate each pending quality sequentially (one at a time).
  for (const quality of pendingQualities) {
    await generateVideoQuality(
      inputPath,
      quality,
      videoId,
      duration,
      (qualityProgress) => {
        // Convert the current quality's progress into overall progress.
        reportOverallProgress(qualityProgress);
      }
    );

    // Mark this quality as completed after successful generation.
    completedCount++;

    // Report updated overall progress.
    reportOverallProgress();
  }

  // Verify that every requested quality has been generated successfully.
  if (!areQualitiesComplete(videoId, qualities)) {
    throw new Error("Video processing completed with incomplete qualities");
  }

  // Generate the master playlist referencing all completed quality playlists.
  const masterPlaylistPath = createMasterPlaylist(qualities, videoId);

  // Report final completion.
  onProgress?.(100);

  // Return processing information to the caller.
  return {
    videoId,
    outputDirectory,
    masterPlaylistPath,
    qualities,
    duration,
  };
};

export { processVideo };

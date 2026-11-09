import fs from "fs";
import path from "path";

import {
  FFMPEG_THREADS,
  MAX_OUTPUT_FPS,
  PROCESSED_VIDEOS_DIRECTORY,
} from "./config.js";

import { getSafeQualityConfig } from "./qualityConfig.js";
import { runFFprobe } from "./ffprobe.js";
import { runFFmpeg } from "./ffmpeg.js";
import { isQualityComplete } from "./qualityValidation.js";

const generateVideoQuality = async (
  inputPath,
  quality,
  videoId,
  duration,
  onProgress
) => {
  if (typeof videoId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(videoId)) {
    throw new Error("Invalid video ID");
  }

  if (typeof inputPath !== "string" || !inputPath.trim()) {
    throw new Error("Valid input video path is required.");
  }

  if (typeof quality !== "string" || !quality.trim()) {
    throw new Error("Valid video quality name is required.");
  }

  const qualityName = quality.trim();
  const config = getSafeQualityConfig(qualityName);

  const qualityDirectory = path.join(
    PROCESSED_VIDEOS_DIRECTORY,
    videoId,
    qualityName
  );

  if (isQualityComplete(qualityDirectory)) {
    onProgress?.(100);
    return qualityDirectory;
  }

  fs.mkdirSync(qualityDirectory, { recursive: true });

  try {
    const metadata = await runFFprobe(inputPath);

    const videoStream = metadata.streams?.find(
      (stream) => stream.codec_type === "video"
    );

    if (!videoStream) {
      throw new Error("No video stream found");
    }

    let fps = MAX_OUTPUT_FPS;

    if (videoStream.avg_frame_rate) {
      const [numerator, denominator] = videoStream.avg_frame_rate
        .split("/")
        .map(Number);

      const sourceFps = denominator > 0 ? numerator / denominator : 0;

      if (Number.isFinite(sourceFps) && sourceFps > 0) {
        fps = Math.min(sourceFps, MAX_OUTPUT_FPS);
      }
    }

    const outputPlaylist = path.join(qualityDirectory, "playlist.m3u8");

    const segmentPattern = path.join(qualityDirectory, "segment_%03d.ts");

    const args = [
      "-y", // Overwrite output files without asking.

      "-i", // Specify the input video file.
      inputPath, // Path to the input video.

      "-map", // Select the first video stream.
      "0:v:0",

      "-map", // Select the first audio stream, if available (? makes it optional).
      "0:a:0?",

      "-vf", // Apply video filters.
      `scale=w=${config.width}:h=${config.height}:force_original_aspect_ratio=decrease:force_divisible_by=2,fps=${fps}`,
      // Resize while preserving aspect ratio, ensure even dimensions, and set FPS.

      "-c:v", // Set video encoder.
      "libx264", // Encode video using H.264.

      "-preset", // Control encoding speed vs compression efficiency.
      "veryfast", // Faster encoding, generally larger output.

      "-profile:v", // Set H.264 compatibility profile.
      "main",

      "-pix_fmt", // Set output pixel format.
      "yuv420p", // Commonly supported pixel format.

      "-b:v", // Set target video bitrate.
      config.bitrate,

      "-maxrate", // Set maximum video bitrate.
      config.bitrate,

      "-bufsize", // Set rate-control buffer size.
      config.bitrate,

      "-threads", // Set the number of encoding threads.
      FFMPEG_THREADS,

      "-c:a", // Set audio encoder.
      "aac",

      "-b:a", // Set audio bitrate.
      "128k",

      "-ac", // Set number of audio channels.
      "2", // Stereo audio.

      "-ar", // Set audio sample rate.
      "44100", // 44.1 kHz.

      "-f", // Specify output format.
      "hls", // HTTP Live Streaming format.

      "-hls_time", // Set target duration of each HLS segment.
      "4", // Approximately 4 seconds per segment.

      "-hls_playlist_type", // Specify playlist type.
      "vod", // Video-on-demand playlist.

      "-hls_segment_filename", // Define the filename pattern for segments.
      segmentPattern,

      "-force_key_frames", // Force keyframes at specified intervals.
      "expr:gte(t,n_forced*4)", // Force a keyframe every 4 seconds.

      outputPlaylist, // Output HLS playlist (.m3u8) path.
    ];

    await runFFmpeg(args, {
      duration,
      onProgress,
    });

    if (!isQualityComplete(qualityDirectory)) {
      throw new Error(`Generated HLS output is incomplete for ${qualityName}`);
    }

    return qualityDirectory;
  } catch (error) {
    fs.rmSync(qualityDirectory, {
      recursive: true,
      force: true,
    });

    throw error;
  }
};

export { generateVideoQuality };

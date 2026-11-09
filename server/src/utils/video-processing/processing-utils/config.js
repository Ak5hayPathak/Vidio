import path from "path";

const PROCESSED_VIDEOS_DIRECTORY = path.join("public", "processed");

// Memory safety settings (Render free instance = 512 MB RAM, shared CPU)
// ---------------------------------------------------------------------------
// Highest output height we will ever encode. A 4K/3K encode needs far more RAM
// than a 512 MB instance has, so the default is 720p. We can raise it with the
// HLS_MAX_HEIGHT env var (e.g. 1080) on a bigger plan.
const MAX_OUTPUT_HEIGHT =
  Number.isFinite(Number(process.env.HLS_MAX_HEIGHT)) &&
  Number(process.env.HLS_MAX_HEIGHT) >= 144
    ? Number(process.env.HLS_MAX_HEIGHT)
    : 720;

// Maximum frame rate of the output. Default is 30.
const MAX_OUTPUT_FPS =
  Number.isFinite(Number(process.env.HLS_MAX_FPS)) &&
  Number(process.env.HLS_MAX_FPS) > 0
    ? Number(process.env.HLS_MAX_FPS)
    : 30;

// FFmpeg/FFprobe threads. One thread keeps per-thread frame buffers minimal.
const FFMPEG_THREADS =
  Number.isInteger(Number(process.env.FFMPEG_THREADS)) &&
  Number(process.env.FFMPEG_THREADS) > 0
    ? String(Number(process.env.FFMPEG_THREADS))
    : "1";

// Only keeping the tail of FFmpeg's stderr
const MAX_STDERR_CHARS = 8000;

//Qualities supported by the platform
const AVAILABLE_QUALITIES = {
  "144p": {
    width: 256,
    height: 144,
    bitrate: "200k",
    bandwidth: 300000,
  },
  "240p": {
    width: 426,
    height: 240,
    bitrate: "400k",
    bandwidth: 500000,
  },
  "360p": {
    width: 640,
    height: 360,
    bitrate: "800k",
    bandwidth: 900000,
  },
  "480p": {
    width: 854,
    height: 480,
    bitrate: "1200k",
    bandwidth: 1400000,
  },
  "720p": {
    width: 1280,
    height: 720,
    bitrate: "2500k",
    bandwidth: 2800000,
  },
  "1080p": {
    width: 1920,
    height: 1080,
    bitrate: "5000k",
    bandwidth: 5500000,
  },
  "2K": {
    width: 2560,
    height: 1440,
    bitrate: "8000k",
    bandwidth: 8500000,
  },
  "3K": {
    width: 3200,
    height: 1800,
    bitrate: "12000k",
    bandwidth: 12500000,
  },
  "4K": {
    width: 3840,
    height: 2160,
    bitrate: "20000k",
    bandwidth: 20500000,
  },
};

export {
  PROCESSED_VIDEOS_DIRECTORY,
  MAX_OUTPUT_HEIGHT,
  MAX_OUTPUT_FPS,
  FFMPEG_THREADS,
  MAX_STDERR_CHARS,
  AVAILABLE_QUALITIES,
};

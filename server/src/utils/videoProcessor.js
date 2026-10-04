import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const PROCESSED_VIDEOS_DIRECTORY = path.join("public", "processed");

// ---- Tunables (override via env on bigger instances) ----
// Highest output height we will encode. 720 is a safe ceiling for 512 MB.
const MAX_OUTPUT_HEIGHT = Number(process.env.MAX_OUTPUT_HEIGHT) || 720;
// x264 threads per encode. Fewer threads = fewer frame buffers in memory.
const FFMPEG_THREADS = String(Number(process.env.FFMPEG_THREADS) || 2);
const X264_PRESET = process.env.X264_PRESET || "veryfast";
// Only the tail of FFmpeg's stderr is kept for error messages.
const STDERR_TAIL_CHARS = 8000;

// Full ladder. Anything above MAX_OUTPUT_HEIGHT is filtered out at runtime.
const AVAILABLE_QUALITIES = [
  { name: "144p", height: 144, width: 256, bitrate: "150k", bandwidth: 150000 },
  { name: "240p", height: 240, width: 426, bitrate: "300k", bandwidth: 300000 },
  { name: "360p", height: 360, width: 640, bitrate: "500k", bandwidth: 500000 },
  { name: "480p", height: 480, width: 854, bitrate: "800k", bandwidth: 800000 },
  { name: "720p", height: 720, width: 1280, bitrate: "1500k", bandwidth: 1500000 },
  { name: "1080p", height: 1080, width: 1920, bitrate: "3000k", bandwidth: 3000000 },
  { name: "2K", height: 1440, width: 2560, bitrate: "6000k", bandwidth: 6000000 },
  { name: "3K", height: 1800, width: 3200, bitrate: "10000k", bandwidth: 10000000 },
  { name: "4K", height: 2160, width: 3840, bitrate: "15000k", bandwidth: 15000000 },
];

// ---- Child process tracking ----
// Lets us kill FFmpeg/ffprobe on shutdown so nothing is orphaned.
const activeProcesses = new Set();

const terminateActiveFFmpeg = () => {
  for (const child of activeProcesses) {
    child.kill("SIGKILL");
  }
  activeProcesses.clear();
};

// Qualities that can be generated from the upload, capped by MAX_OUTPUT_HEIGHT.
const getSupportedQualities = (videoHeight) => {
  const ceiling = Math.min(videoHeight, MAX_OUTPUT_HEIGHT);
  const supported = AVAILABLE_QUALITIES.filter((q) => q.height <= ceiling);

  // Very small sources still need at least one rendition.
  return supported.length > 0 ? supported : [AVAILABLE_QUALITIES[0]];
};

// Read only the metadata we need (keeps the JSON tiny).
const runFFprobe = (filePath) =>
  new Promise((resolve, reject) => {
    const ffprobe = spawn(
      "ffprobe",
      [
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_entries",
        "format=duration:stream=codec_type,width,height",
        filePath,
      ],
      { stdio: ["ignore", "pipe", "pipe"] }
    );

    activeProcesses.add(ffprobe);

    let output = "";
    let errorTail = "";

    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffprobe.stderr.on("data", (data) => {
      errorTail = (errorTail + data.toString()).slice(-STDERR_TAIL_CHARS);
    });

    ffprobe.on("error", (error) => {
      activeProcesses.delete(ffprobe);
      reject(error);
    });

    ffprobe.on("close", (code) => {
      activeProcesses.delete(ffprobe);

      if (code !== 0) {
        return reject(
          new Error(`FFprobe failed with exit code ${code}\n${errorTail}`)
        );
      }

      try {
        resolve(JSON.parse(output));
      } catch (error) {
        reject(error);
      }
    });
  });

// Run FFmpeg as a Promise. Memory-safe: bounded stderr, tracked child.
const runFFmpeg = (args, { duration, onProgress } = {}) =>
  new Promise((resolve, reject) => {
    const ffmpeg = spawn(
      "ffmpeg",
      [
        "-nostdin",
        "-loglevel",
        "error",
        "-progress",
        "pipe:1",
        "-nostats",
        ...args,
      ],
      { stdio: ["ignore", "pipe", "pipe"] }
    );

    activeProcesses.add(ffmpeg);

    let errorTail = "";
    let progressBuffer = "";

    ffmpeg.stdout.on("data", (data) => {
      // Stdout must always be drained, but only parsed when someone listens.
      if (!duration || !onProgress) return;

      progressBuffer += data.toString();

      const lines = progressBuffer.split("\n");
      progressBuffer = lines.pop() || "";

      for (const line of lines) {
        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) continue;

        const key = line.slice(0, separatorIndex).trim();
        if (key !== "out_time_ms") continue;

        // FFmpeg reports microseconds here despite the name.
        const currentTime = Number(line.slice(separatorIndex + 1).trim()) / 1_000_000;

        // "N/A" at startup produces NaN; ignore it.
        if (!Number.isFinite(currentTime)) continue;

        onProgress(Math.min(100, Math.max(0, (currentTime / duration) * 100)));
      }
    });

    ffmpeg.stderr.on("data", (data) => {
      errorTail = (errorTail + data.toString()).slice(-STDERR_TAIL_CHARS);
    });

    ffmpeg.on("error", (error) => {
      activeProcesses.delete(ffmpeg);
      reject(error);
    });

    ffmpeg.on("close", (code, signal) => {
      activeProcesses.delete(ffmpeg);

      if (code === 0) {
        onProgress?.(100);
        resolve();
      } else {
        reject(
          new Error(
            `FFmpeg failed with exit code ${code}${
              signal ? ` (signal ${signal})` : ""
            }\n${errorTail}`
          )
        );
      }
    });
  });

// Generate one HLS rendition.
const generateVideoQuality = async (
  inputPath,
  quality,
  videoId,
  duration,
  onProgress
) => {
  const qualityDirectory = path.join(
    PROCESSED_VIDEOS_DIRECTORY,
    videoId,
    quality.name
  );

  fs.mkdirSync(qualityDirectory, { recursive: true });

  const playlistPath = path.join(qualityDirectory, "playlist.m3u8");
  const segmentPath = path.join(qualityDirectory, "segment%d.ts");

  // Buffer size is two seconds of video at the target bitrate.
  const bufferSize = `${Math.round((quality.bandwidth * 2) / 1000)}k`;

  await runFFmpeg(
    [
      "-i",
      inputPath,

      // First video stream, and the first audio stream if one exists.
      "-map",
      "0:v:0",
      "-map",
      "0:a:0?",

      "-vf",
      `scale=-2:${quality.height}`,

      "-c:v",
      "libx264",
      "-preset",
      X264_PRESET,
      "-threads",
      FFMPEG_THREADS,
      "-pix_fmt",
      "yuv420p",

      // Constrained bitrate: caps rate-control buffering and memory.
      "-b:v",
      quality.bitrate,
      "-maxrate",
      quality.bitrate,
      "-bufsize",
      bufferSize,
      "-x264-params",
      "rc-lookahead=10",

      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-ac",
      "2",

      "-hls_time",
      "4",
      "-force_key_frames",
      "expr:gte(t,n_forced*4)",
      "-hls_list_size",
      "0",
      "-hls_playlist_type",
      "vod",
      "-hls_segment_filename",
      segmentPath,

      playlistPath,
    ],
    { duration, onProgress }
  );

  console.log(`${quality.name} generated successfully!`);
};

// Master playlist listing only the renditions that were actually generated.
const createMasterPlaylist = (qualities, videoId) => {
  let playlist = "#EXTM3U\n#EXT-X-VERSION:3\n";

  for (const quality of qualities) {
    playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${quality.bandwidth},`;
    playlist += `RESOLUTION=${quality.width}x${quality.height}\n`;
    playlist += `${videoId}/${quality.name}/playlist.m3u8\n`;
  }

  fs.writeFileSync(
    path.join(PROCESSED_VIDEOS_DIRECTORY, videoId, "master.m3u8"),
    playlist
  );
};

// Remove (possibly incomplete) local output for a video.
const cleanupVideoOutput = (videoId) => {
  const outputDirectory = path.join(PROCESSED_VIDEOS_DIRECTORY, videoId);

  if (fs.existsSync(outputDirectory)) {
    fs.rmSync(outputDirectory, { recursive: true, force: true });
    console.log("Local video output cleaned up.");
  }
};

// Capture a frame at a random point to use as a thumbnail.
const generateThumbnail = async (inputPath, outputPath) => {
  try {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const metadata = await runFFprobe(inputPath);
    const duration = Number(metadata.format?.duration);

    // Stay away from the very end of the file, where seeking can yield no frame.
    const timestamp =
      Number.isFinite(duration) && duration > 0
        ? Math.random() * duration * 0.9
        : 0;

    await runFFmpeg([
      "-ss",
      timestamp.toString(),
      "-i",
      inputPath,
      "-frames:v",
      "1",
      // Downscale large frames so the thumbnail never needs a huge buffer.
      "-vf",
      "scale=w='min(1280,iw)':h=-2",
      "-y",
      "-update",
      "1",
      outputPath,
    ]);

    console.log("Thumbnail generated successfully!");
  } catch (error) {
    console.error("Thumbnail generation failed:", error.message);
    throw error;
  }
};

// Encode renditions one at a time, lowest first.
// Pass a stable videoId (e.g. the Mongo _id) so retries reuse the same folder.
const processVideo = async (
  inputPath,
  onProgress,
  videoId = crypto.randomUUID()
) => {
  const outputDirectory = path.join(PROCESSED_VIDEOS_DIRECTORY, videoId);

  // Remove leftovers from a previous attempt for this video.
  cleanupVideoOutput(videoId);

  try {
    const metadata = await runFFprobe(inputPath);

    const duration = Number(metadata.format?.duration);

    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("Could not determine video duration");
    }

    const videoStream = metadata.streams?.find(
      (stream) => stream.codec_type === "video"
    );

    if (!videoStream?.height) {
      throw new Error("No video stream found in the uploaded file");
    }

    const supportedQualities = getSupportedQualities(videoStream.height);

    console.log(
      "Generating:",
      supportedQualities.map((quality) => quality.name)
    );

    const total = supportedQualities.length;

    // Sequential: only one FFmpeg process (and one set of buffers) at a time.
    for (let i = 0; i < total; i++) {
      await generateVideoQuality(
        inputPath,
        supportedQualities[i],
        videoId,
        duration,
        (progress) => {
          onProgress?.({
            progress: (i * 100 + progress) / total,
            stage: "Generating HLS",
          });
        }
      );
    }

    createMasterPlaylist(supportedQualities, videoId);

    onProgress?.({
      progress: 100,
      stage: "HLS generation completed",
    });

    console.log("All qualities generated successfully!");

    return {
      videoId,
      outputDirectory,
      masterPlaylistPath: path.join(outputDirectory, "master.m3u8"),
      qualities: supportedQualities.map((quality) => quality.name),
      duration,
    };
  } catch (error) {
    console.error("Video processing failed:", error.message);
    cleanupVideoOutput(videoId);
    throw error;
  }
};

export { processVideo, generateThumbnail, terminateActiveFFmpeg };
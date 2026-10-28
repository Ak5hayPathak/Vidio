import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const PROCESSED_VIDEOS_DIRECTORY = path.join("public", "processed");

// ---------------------------------------------------------------------------
// Memory safety settings (Render free instance = 512 MB RAM, shared CPU)
// ---------------------------------------------------------------------------
// Highest output height we will ever encode. A 4K/3K encode needs far more RAM
// than a 512 MB instance has, so the default is 720p. Raise it with the
// HLS_MAX_HEIGHT env var (e.g. 1080) on a bigger plan.
const MAX_OUTPUT_HEIGHT = Number(process.env.HLS_MAX_HEIGHT) || 720;

// Maximum frame rate of the output. High-fps sources (60/120 fps) multiply
// the memory used by x264 lookahead and the decoder, so they are capped.
const MAX_OUTPUT_FPS = Number(process.env.HLS_MAX_FPS) || 30;

// FFmpeg/FFprobe threads. One thread keeps per-thread frame buffers minimal.
const FFMPEG_THREADS = String(Number(process.env.FFMPEG_THREADS) || 1);

// Only keep the tail of FFmpeg's stderr; it can grow without limit otherwise.
const MAX_STDERR_CHARS = 8000;

// Track running child processes so they can be killed on shutdown / timeout.
const activeProcesses = new Set();

const killActiveProcesses = () => {
  for (const child of activeProcesses) {
    try {
      child.kill("SIGKILL");
    } catch {
      // process already exited
    }
  }
  activeProcesses.clear();
};

const appendTail = (current, chunk) => {
  const next = current + chunk;
  return next.length > MAX_STDERR_CHARS
    ? next.slice(next.length - MAX_STDERR_CHARS)
    : next;
};

//video resolutions available to generate
const AVAILABLE_QUALITIES = [
  //144p
  {
    name: "144p",
    height: 144,
    width: 256,
    bitrate: "150k",
    bandwidth: 150000,
  },

  //240p
  {
    name: "240p",
    height: 240,
    width: 426,
    bitrate: "300k",
    bandwidth: 300000,
  },

  //360p
  {
    name: "360p",
    height: 360,
    width: 640,
    bitrate: "500k",
    bandwidth: 500000,
  },

  //480p
  {
    name: "480p",
    width: 854,
    height: 480,
    bitrate: "800k",
    bandwidth: 800000,
  },

  //720p
  {
    name: "720p",
    height: 720,
    width: 1280,
    bitrate: "1500k",
    bandwidth: 1500000,
  },

  //1080p
  {
    name: "1080p",
    height: 1080,
    width: 1920,
    bitrate: "3000k",
    bandwidth: 3000000,
  },

  //1440p
  {
    name: "2K",
    height: 1440,
    width: 2560,
    bitrate: "6000k",
    bandwidth: 6000000,
  },

  //1800p
  {
    name: "3K",
    height: 1800,
    width: 3200,
    bitrate: "10000k",
    bandwidth: 10000000,
  },

  //2160p
  {
    name: "4K",
    height: 2160,
    width: 3840,
    bitrate: "15000k",
    bandwidth: 15000000,
  },
];

//determination of qualities that can be generated from
// the uploaded video based on its height
const getSupportedQualities = (videoHeight) => {
  const limit = Math.min(Number(videoHeight) || 0, MAX_OUTPUT_HEIGHT);

  const supported = AVAILABLE_QUALITIES.filter(
    (quality) => quality.height <= limit
  );

  // Very small videos (e.g. 100p) still get the lowest rendition
  // instead of failing with "No supported video qualities found".
  return supported.length > 0 ? supported : [AVAILABLE_QUALITIES[0]];
};

// Drops any quality above the configured output limit (always keeps at least
// the lowest one). Used for jobs that were queued before the limit existed.
const limitQualitiesToMax = (qualities) => {
  const limited = qualities.filter(
    (quality) =>
      (getQualityConfig(quality.quality ?? quality.name)?.height ?? 0) <=
      MAX_OUTPUT_HEIGHT
  );

  return limited.length > 0 ? limited : qualities.slice(0, 1);
};

//get quality configuration using its name
const getQualityConfig = (qualityName) => {
  return AVAILABLE_QUALITIES.find((quality) => quality.name === qualityName);
};

//get video metadata using runFFprobe
const runFFprobe = (filePath) => {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn("ffprobe", [
      "-v",
      "error",
      // Hide unnecessary logs

      "-print_format",
      "json",
      // Return the result as JSON

      "-show_entries",
      "format=duration:stream=codec_type,width,height,r_frame_rate",
      // Only the fields we need (keeps the JSON tiny)

      filePath,
      // The video file to analyze
    ]);

    activeProcesses.add(ffprobe);

    let output = "";
    let errorOutput = "";

    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffprobe.stderr.on("data", (data) => {
      errorOutput = appendTail(errorOutput, data.toString());
    });

    ffprobe.on("error", (error) => {
      activeProcesses.delete(ffprobe);
      reject(error);
    });

    ffprobe.on("close", (code) => {
      activeProcesses.delete(ffprobe);

      if (code === 0) {
        try {
          const metadata = JSON.parse(output);
          resolve(metadata);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(
          new Error(`FFprobe failed with exit code ${code}\n${errorOutput}`)
        );
      }
    });
  });
};

// Run FFmpeg and handle its completion with a Promise
const runFFmpeg = (args, { duration, onProgress } = {}) => {
  return new Promise((resolve, reject) => {
    //console.log("FFmpeg args:", args);
    const ffmpeg = spawn("ffmpeg", [
      "-hide_banner",
      "-nostdin",
      // Never wait on / buffer stdin

      "-loglevel",
      "error",
      // Only errors on stderr (default logging is very verbose)

      "-progress",
      "pipe:1",
      // Send FFmpeg progress information through stdout

      "-nostats",
      // Disables the default FFmpeg statistics output

      ...args,
    ]);

    activeProcesses.add(ffmpeg);

    let errorOutput = "";
    let progressOutput = "";

    // Read FFmpeg progress information
    ffmpeg.stdout.on("data", (data) => {
      progressOutput += data.toString();

      const lines = progressOutput.split("\n");

      // Keep incomplete lines for the next chunk
      progressOutput = lines.pop() || "";

      for (const line of lines) {
        const [key, value] = line.trim().split("=");

        // Get the current processing time reported by FFmpeg
        if (key === "out_time_ms" && duration && onProgress) {
          const currentTime = Number(value) / 1_000_000;

          // Calculate processing progress based on video duration
          const progress = Math.min(
            100,
            Math.max(0, (currentTime / duration) * 100)
          );

          onProgress(progress);
        }
      }
    });

    ffmpeg.stderr.on("data", (data) => {
      errorOutput = appendTail(errorOutput, data.toString());
    });

    ffmpeg.on("error", (error) => {
      activeProcesses.delete(ffmpeg);
      reject(error);
    });

    ffmpeg.on("close", (code) => {
      activeProcesses.delete(ffmpeg);

      if (code === 0) {
        // Ensure the final progress reaches 100%
        onProgress?.(100);

        resolve();
      } else {
        reject(
          new Error(`FFmpeg failed with exit code ${code}\n${errorOutput}`)
        );
      }
    });
  });
};

//checks that the playlist is finalized and every referenced segment exists
// and is non-empty.
const isQualityComplete = (qualityDirectory) => {
  try {
    const playlistPath = path.join(qualityDirectory, "playlist.m3u8");

    if (!fs.existsSync(playlistPath)) {
      return false;
    }

    const playlist = fs.readFileSync(playlistPath, "utf8");

    if (!playlist.includes("#EXT-X-ENDLIST")) {
      return false;
    }

    const segments = playlist
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.endsWith(".ts"));

    if (segments.length === 0) {
      return false;
    }

    return segments.every((segment) => {
      const segmentPath = path.join(qualityDirectory, segment);

      return (
        fs.existsSync(segmentPath) &&
        fs.statSync(segmentPath).isFile() &&
        fs.statSync(segmentPath).size > 0
      );
    });
  } catch (error) {
    console.error("Quality validation failed:", error.message);
    return false;
  }
};

// generates an HLS version of the video for a specific quality
// Reuses completed local output so interrupted jobs do not regenerate it.
const generateVideoQuality = async (
  inputPath,
  quality,
  videoId,
  duration,
  onProgress
) => {
  if (!videoId) {
    throw new Error("Video ID is required for processing.");
  }

  if (!quality?.name || !Number.isFinite(quality.height)) {
    throw new Error("A valid quality configuration is required.");
  }

  const qualityDirectory = path.join(
    PROCESSED_VIDEOS_DIRECTORY,
    videoId,
    quality.name
  );

  // Reuse the local output if the previous attempt completed generation.
  if (isQualityComplete(qualityDirectory)) {
    console.log(`${quality.name} already complete locally. Reusing output.`);
    onProgress?.(100);
    return qualityDirectory;
  }

  if (!inputPath) {
    throw new Error(
      `Original video is required to generate quality: ${quality.name}`
    );
  }

  // Remove only this quality's incomplete output.
  fs.rmSync(qualityDirectory, {
    recursive: true,
    force: true,
  });

  fs.mkdirSync(qualityDirectory, {
    recursive: true,
  });

  const playlistPath = path.join(qualityDirectory, "playlist.m3u8");
  const segmentPath = path.join(qualityDirectory, "segment%d.ts");

  try {
    // Cap the frame rate only when the source is faster than the limit,
    // so low-fps videos are never upsampled.
    let filter = `scale=-2:${quality.height}:flags=bilinear`;

    try {
      const probe = await runFFprobe(inputPath);
      const rate = probe.streams?.find(
        (stream) => stream.codec_type === "video"
      )?.r_frame_rate;

      if (rate) {
        const [num, den] = rate.split("/").map(Number);
        const fps = den ? num / den : num;

        if (Number.isFinite(fps) && fps > MAX_OUTPUT_FPS + 0.5) {
          filter += `,fps=${MAX_OUTPUT_FPS}`;
        }
      }
    } catch {
      // Frame-rate detection is optional; encode without the cap.
    }

    // bufsize bounds the rate-control buffer (and therefore memory use).
    const bufferSize = `${parseInt(quality.bitrate, 10) * 2}k`;

    await runFFmpeg(
      [
        "-threads",
        FFMPEG_THREADS,
        //limits decoder threads (each thread keeps its own frame buffers)

        "-filter_threads",
        "1",

        "-filter_complex_threads",
        "1",

        "-i",
        inputPath,
        //Input video file

        "-map",
        "0:v:0",
        //first video stream only

        "-map",
        "0:a:0?",
        //first audio stream only, if one exists

        "-sn",
        "-dn",
        //drop subtitles and data streams

        "-vf",
        filter,
        //resize (and cap frame rate if needed)

        "-pix_fmt",
        "yuv420p",
        //8-bit 4:2:0 - HDR / 10-bit / 4:4:4 sources would use much more memory
        // and are not playable everywhere

        "-c:v",
        "libx264",
        //uses the H.264 video codec

        "-preset",
        "veryfast",

        "-threads",
        FFMPEG_THREADS,
        //encoder threads

        "-rc-lookahead",
        "10",
        //default is 30 frames of lookahead; the biggest x264 memory consumer

        "-refs",
        "2",
        "-bf",
        "2",
        //fewer reference frames / B-frames = fewer frames held in memory

        "-b:v",
        quality.bitrate,
        //sets the video bitrate

        "-maxrate",
        quality.bitrate,

        "-bufsize",
        bufferSize,

        "-c:a",
        "aac",
        //uses AAC audio encoding

        "-b:a",
        "128k",
        //sets audio bitrate to 128 kbps

        "-ac",
        "2",
        //stereo (5.1 sources would otherwise be downmixed late)

        "-max_muxing_queue_size",
        "1024",

        "-hls_playlist_type",
        "vod",

        "-hls_time",
        "4",
        //creates HLS segments of approximately 4 seconds

        "-force_key_frames",
        "expr:gte(t,n_forced*4)",
        // forces keyframes approximately every 4 seconds
        // so the video can be segmented properly

        "-hls_list_size",
        "0",
        //keeps all segments in the playlist

        "-hls_segment_filename",
        segmentPath,
        //tells FFmpeg where to save the .ts segment files

        playlistPath,
        //the final output playlist
      ],
      {
        duration,
        onProgress,
      }
    );

    // Verify the generated output before accepting it.
    if (!isQualityComplete(qualityDirectory)) {
      throw new Error(`Generated quality ${quality.name} is incomplete.`);
    }

    console.log(`${quality.name} generated successfully!`);

    return qualityDirectory;
  } catch (error) {
    // Remove only the failed quality's output so other qualities remain intact.
    fs.rmSync(qualityDirectory, {
      recursive: true,
      force: true,
    });

    throw error;
  }
};

//the worker can now check all expected HLS outputs with one function call,
//while the filesystem paths and completeness checks remain inside videoProcessor.js.
// Supports both quality configurations and job quality status objects.
const areQualitiesComplete = (videoId, qualities) => {
  if (!qualities?.length) {
    return false;
  }

  return qualities.every((quality) => {
    const qualityName = quality.name ?? quality.quality;

    if (!qualityName) {
      return false;
    }

    const qualityDirectory = path.join(
      PROCESSED_VIDEOS_DIRECTORY,
      videoId,
      qualityName
    );

    return isQualityComplete(qualityDirectory);
  });
};

//creates the master HLS playlist acts like a directory/map
// that tells the video player which qualities are available.
// The player can then choose the appropriate quality, enabling adaptive bitrate streaming
const createMasterPlaylist = (qualities, videoId) => {
  if (!videoId || !qualities?.length) {
    throw new Error(
      "Video ID and at least one quality are required for the master playlist."
    );
  }

  // Accept either quality configurations or quality status objects.
  const qualityConfigs = qualities.map((quality) => {
    if (quality.name && quality.height && quality.width && quality.bandwidth) {
      return quality;
    }

    const qualityName = quality.quality ?? quality.name;
    const config = getQualityConfig(qualityName);

    if (!config) {
      throw new Error(`Unknown quality configuration: ${qualityName}`);
    }

    return config;
  });

  const outputDirectory = path.join(PROCESSED_VIDEOS_DIRECTORY, videoId);

  fs.mkdirSync(outputDirectory, {
    recursive: true,
  });

  let playlist = "#EXTM3U\n#EXT-X-VERSION:3\n";

  for (const quality of qualityConfigs) {
    playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${quality.bandwidth},`;
    playlist += `RESOLUTION=${quality.width}x${quality.height}\n`;
    playlist += `${videoId}/${quality.name}/playlist.m3u8\n`;
  }

  const masterPlaylistPath = path.join(outputDirectory, "master.m3u8");

  fs.writeFileSync(masterPlaylistPath, playlist);

  return masterPlaylistPath;
};

//cleans up incomplete video output
const cleanupVideoOutput = (videoId) => {
  const outputDirectory = path.join(PROCESSED_VIDEOS_DIRECTORY, videoId);

  if (fs.existsSync(outputDirectory)) {
    fs.rmSync(outputDirectory, {
      recursive: true,
      force: true,
    });

    console.log("Incomplete video output cleaned up.");
  }
};

//randomly captures a video frame to generate thumbnail
const generateThumbnail = async (inputPath, outputPath) => {
  try {
    const metadata = await runFFprobe(inputPath);

    const duration = Number(metadata.format.duration);

    // Stay clear of the very end, where seeking can yield no frame at all.
    const randomTimestamp = Math.random() * duration * 0.9;

    await runFFmpeg([
      "-threads",
      FFMPEG_THREADS,

      "-ss",
      randomTimestamp.toString(),

      "-i",
      inputPath,

      "-frames:v",
      "1",

      "-vf",
      "scale='min(1280,iw)':-2",
      // Thumbnails never need to be larger than 1280px wide

      "-q:v",
      "3",

      "-update",
      "1",

      outputPath,
    ]);

    console.log("Thumbnail generated successfully!");
  } catch (error) {
    console.error("Thumbnail generation failed:");
    console.error(error.message);
    throw error;
  }
};

const processVideo = async (
  inputPath,
  videoId,
  onProgress,
  { qualities: suppliedQualities, duration: suppliedDuration } = {}
) => {
  if (!videoId) {
    throw new Error("Video ID is required for processing.");
  }

  try {
    let supportedQualities = suppliedQualities;
    let duration = Number(suppliedDuration);

    const validQualities =
      Array.isArray(supportedQualities) &&
      supportedQualities.length > 0 &&
      supportedQualities.every(
        (quality) =>
          quality &&
          typeof quality.name === "string" &&
          Number.isFinite(quality.height) &&
          Number.isFinite(quality.width) &&
          typeof quality.bitrate === "string" &&
          Number.isFinite(quality.bandwidth)
      );

    if (!validQualities || !Number.isFinite(duration) || duration <= 0) {
      if (!inputPath) {
        throw new Error(
          "A valid input video path is required when metadata is unavailable."
        );
      }

      const metadata = await runFFprobe(inputPath);

      duration = Number(metadata.format?.duration);

      const videoStream = metadata.streams?.find(
        (stream) => stream.codec_type === "video"
      );

      if (!videoStream?.height || !Number.isFinite(duration) || duration <= 0) {
        throw new Error("Unable to determine valid video metadata.");
      }

      supportedQualities = getSupportedQualities(videoStream.height);

      if (supportedQualities.length === 0) {
        throw new Error("No supported video qualities found.");
      }
    }

    const qualities = supportedQualities.map((quality) => quality.name);

    console.log("Required qualities:", qualities);

    const outputDirectory = path.join(PROCESSED_VIDEOS_DIRECTORY, videoId);

    fs.mkdirSync(outputDirectory, {
      recursive: true,
    });

    const qualityProgress = new Map(
      supportedQualities.map((quality) => [quality.name, 0])
    );

    const reportOverallProgress = () => {
      const values = [...qualityProgress.values()];

      const total =
        values.reduce((sum, value) => sum + value, 0) / values.length;

      onProgress?.({
        progress: total,
        stage: "Generating HLS",
      });
    };

    // Generate and validate each quality independently.
    for (const quality of supportedQualities) {
      const qualityDirectory = path.join(outputDirectory, quality.name);

      if (isQualityComplete(qualityDirectory)) {
        console.log(`${quality.name} already complete. Skipping.`);
        qualityProgress.set(quality.name, 100);
        reportOverallProgress();
        continue;
      }

      await generateVideoQuality(
        inputPath,
        quality,
        videoId,
        duration,
        (progress) => {
          qualityProgress.set(quality.name, progress);
          reportOverallProgress();
        }
      );

      qualityProgress.set(quality.name, 100);
      reportOverallProgress();
    }

    // Validate every required quality before creating the master playlist.
    for (const quality of supportedQualities) {
      const qualityDirectory = path.join(outputDirectory, quality.name);

      if (!isQualityComplete(qualityDirectory)) {
        throw new Error(
          `Quality ${quality.name} is incomplete. Cannot create master playlist.`
        );
      }
    }

    const masterPlaylistPath = createMasterPlaylist(
      supportedQualities,
      videoId
    );

    onProgress?.({
      progress: 100,
      stage: "HLS generation completed",
    });

    console.log("All required qualities are complete.");

    return {
      videoId,
      outputDirectory,
      masterPlaylistPath,
      qualities,
      duration,
    };
  } catch (error) {
    console.error("Video processing failed:", error.message);
    // Preserve completed qualities so a retry can reuse them.
    throw error;
  }
};

export {
  processVideo,
  generateVideoQuality,
  generateThumbnail,
  runFFprobe,
  getSupportedQualities,
  limitQualitiesToMax,
  killActiveProcesses,
  getQualityConfig,
  isQualityComplete,
  areQualitiesComplete,
  createMasterPlaylist,
  cleanupVideoOutput,
};

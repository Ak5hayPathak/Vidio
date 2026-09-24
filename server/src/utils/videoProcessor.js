import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const PROCESSED_VIDEOS_DIRECTORY = path.join("public", "processed");

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
  return AVAILABLE_QUALITIES.filter((quality) => quality.height <= videoHeight);
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

      "-show_format",
      // Get general file information

      "-show_streams",
      // Get information about video/audio streams

      filePath,
      // The video file to analyze
    ]);

    let output = "";
    let errorOutput = "";

    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffprobe.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    ffprobe.on("error", (error) => {
      reject(error);
    });

    ffprobe.on("close", (code) => {
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
      "-progress",
      "pipe:1",
      // Send FFmpeg progress information through stdout

      "-nostats",
      // Disables the default FFmpeg statistics output

      ...args,
    ]);

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
      errorOutput += data.toString();
    });

    ffmpeg.on("error", (error) => {
      reject(error);
    });

    ffmpeg.on("close", (code) => {
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

// generates an HLS version of the video for a specific quality
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

  fs.mkdirSync(qualityDirectory, {
    recursive: true,
  });

  const playlistPath = path.join(qualityDirectory, "playlist.m3u8");
  const segmentPath = path.join(qualityDirectory, "segment%d.ts");

  await runFFmpeg(
    [
      "-i",
      inputPath,
      //Input video file

      "-vf",
      `scale=-2:${quality.height}`,
      //resized the video

      "-c:v",
      "libx264",
      //uses the H.264 video codec

      "-b:v",
      quality.bitrate,
      //sets the video bitrate

      "-c:a",
      "aac",
      //uses AAC audio encoding

      "-b:a",
      "128k",
      //sets audio bitrate to 128 kbps

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

  console.log(`${quality.name} generated successfully!`);
};

//creates the master HLS playlist acts like a directory/map
// that tells the video player which qualities are available.
// The player can then choose the appropriate quality, enabling adaptive bitrate streaming
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

    const randomTimestamp = Math.random() * duration;

    await runFFmpeg([
      "-ss",
      randomTimestamp.toString(),

      "-i",
      inputPath,

      "-frames:v",
      "1",

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

const processVideo = async (inputPath, onProgress) => {
  const videoId = crypto.randomUUID();

  try {
    const metadata = await runFFprobe(inputPath);

    const duration = Number(metadata.format.duration);

    const videoStream = metadata.streams.find(
      (stream) => stream.codec_type === "video"
    );

    const supportedQualities = getSupportedQualities(videoStream.height);

    const qualities = supportedQualities.map((quality) => quality.name);
    console.log("Generating: ", qualities);

    // Track the progress of each quality
    const qualityProgress = new Map();

    supportedQualities.forEach((quality) => {
      qualityProgress.set(quality.name, 0);
    });

    // Calculate the overall processing progress
    const reportOverallProgress = () => {
      const values = [...qualityProgress.values()];

      const total =
        values.reduce((sum, value) => sum + value, 0) / values.length;

      onProgress?.({
        progress: total,
        stage: "Generating HLS",
      });
    };

    await Promise.all(
      supportedQualities.map((quality) =>
        generateVideoQuality(
          inputPath,
          quality,
          videoId,
          duration,
          (progress) => {
            qualityProgress.set(quality.name, progress);
            reportOverallProgress();
          }
        )
      )
    );

    createMasterPlaylist(supportedQualities, videoId);

    // Report that HLS generation has completed
    onProgress?.({
      progress: 100,
      stage: "HLS generation completed",
    });

    console.log("All qualities generated successfully!");

    return {
      videoId,
      outputDirectory: path.join(PROCESSED_VIDEOS_DIRECTORY, videoId),
      masterPlaylistPath: path.join(
        PROCESSED_VIDEOS_DIRECTORY,
        videoId,
        "master.m3u8"
      ),
      qualities: supportedQualities.map((quality) => quality.name),
      duration,
    };
  } catch (error) {
    console.error("Video processing failed:");
    console.error(error.message);
    cleanupVideoOutput(videoId);
    throw error;
  }
};

export { processVideo, generateThumbnail };

import { runFFprobe } from "./ffprobe.js";
import { runFFmpeg } from "./ffmpeg.js";

const generateThumbnail = async (inputPath, outputPath) => {
  const metadata = await runFFprobe(inputPath);

  const duration = Number(metadata.format?.duration);

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("Invalid video duration for thumbnail generation");
  }

  const timestamp = Math.random() * duration * 0.9;

  const args = [
    "-y", // Overwrite output file without asking.

    "-ss", // Seek to a specific timestamp in the input video.
    String(timestamp), // Timestamp (in seconds) from which to extract the frame.

    "-i", // Specify the input video file.
    inputPath, // Path to the input video.

    "-frames:v", // Specify the number of video frames to extract.
    "1", // Extract exactly one frame.

    "-vf", // Apply video filters.
    "scale='min(1280,iw)':-2", // Set maximum width to 1280px, preserve aspect ratio, and ensure even height.

    "-q:v", // Set output image quality.
    "2", // High-quality output (lower value means better quality).

    outputPath, // Destination path where the thumbnail will be saved.
  ];

  await runFFmpeg(args, { duration: 1 });

  return outputPath;
};

export { generateThumbnail };

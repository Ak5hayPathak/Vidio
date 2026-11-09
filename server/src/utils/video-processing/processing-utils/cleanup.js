import fs from "fs";
import path from "path";

import { PROCESSED_VIDEOS_DIRECTORY } from "./config.js";

const cleanupVideoOutput = (videoId) => {
  if (typeof videoId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(videoId)) {
    throw new Error("Invalid video ID");
  }

  const outputDirectory = path.join(PROCESSED_VIDEOS_DIRECTORY, videoId);

  fs.rmSync(outputDirectory, {
    recursive: true,
    force: true,
  });
};

// Safely remove temporary files uploaded through Multer.
const cleanupUploadedFiles = async (...filePaths) => {
  const uniquePaths = [...new Set(filePaths.filter(Boolean))];

  await Promise.allSettled(
    uniquePaths.map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error(
            `Failed to remove temporary file: ${filePath}`,
            error.message
          );
        }
      }
    })
  );
};

export { cleanupVideoOutput, cleanupUploadedFiles };

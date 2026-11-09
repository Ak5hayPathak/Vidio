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

export { cleanupVideoOutput };

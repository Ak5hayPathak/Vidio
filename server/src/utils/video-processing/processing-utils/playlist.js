import fs from "fs";
import path from "path";

import { PROCESSED_VIDEOS_DIRECTORY } from "./config.js";
import { getQualityConfig } from "./qualityConfig.js";

const createMasterPlaylist = (qualities, videoId) => {
  if (
    typeof videoId !== "string" ||
    !/^[a-zA-Z0-9_-]+$/.test(videoId) ||
    !Array.isArray(qualities) ||
    qualities.length === 0
  ) {
    throw new Error("Invalid video ID or qualities");
  }

  const normalizedQualities = qualities.map((quality) => {
    const name =
      typeof quality === "string" ? quality : quality?.name || quality?.quality;

    const config = getQualityConfig(name);

    if (!config) {
      throw new Error(`Unsupported video quality: ${name}`);
    }

    return { name, ...config };
  });

  const names = normalizedQualities.map(({ name }) => name);

  if (new Set(names).size !== names.length) {
    throw new Error("Duplicate video qualities are not allowed");
  }

  const outputDirectory = path.join(PROCESSED_VIDEOS_DIRECTORY, videoId);

  fs.mkdirSync(outputDirectory, { recursive: true });

  const playlistContent =
    [
      "#EXTM3U",
      "#EXT-X-VERSION:3",
      ...normalizedQualities.flatMap((quality) => [
        `#EXT-X-STREAM-INF:BANDWIDTH=${quality.bandwidth},RESOLUTION=${quality.width}x${quality.height}`,
        `${quality.name}/playlist.m3u8`,
      ]),
    ].join("\n") + "\n";

  const masterPlaylistPath = path.join(outputDirectory, "master.m3u8");

  fs.writeFileSync(masterPlaylistPath, playlistContent);

  return masterPlaylistPath;
};

export { createMasterPlaylist };

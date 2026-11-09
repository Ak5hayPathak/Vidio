import fs from "node:fs";
import path from "node:path";

import { PROCESSED_VIDEOS_DIRECTORY } from "./config.js";
import { getQualityConfig } from "./qualityConfig.js";

const isQualityComplete = (qualityDirectory) => {
  try {
    const playlistPath = path.join(qualityDirectory, "playlist.m3u8");

    if (!fs.existsSync(playlistPath)) return false;

    const playlist = fs.readFileSync(playlistPath, "utf8");

    if (!playlist.includes("#EXT-X-ENDLIST")) return false;

    // extract all .ts video segment filenames from an HLS playlist
    const segments = playlist
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.endsWith(".ts"));

    if (segments.length === 0) return false;

    return segments.every((segment) => {
      const segmentPath = path.resolve(qualityDirectory, segment);
      const relativePath = path.relative(
        path.resolve(qualityDirectory),
        segmentPath
      );

      // prevent paths from escaping the quality directory
      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        return false;
      }

      return (
        fs.existsSync(segmentPath) &&
        fs.statSync(segmentPath).isFile() &&
        fs.statSync(segmentPath).size > 0
      );
    });
  } catch (error) {
    return false;
  }
};

function areQualitiesComplete(videoId, qualities) {
  if (
    typeof videoId !== "string" ||
    !/^[a-zA-Z0-9_-]+$/.test(videoId) ||
    !Array.isArray(qualities) ||
    qualities.length === 0
  ) {
    return false;
  }

  return qualities.every((quality) => {
    const name =
      typeof quality === "string" ? quality : quality?.name || quality?.quality;

    const config = getQualityConfig(name);

    if (!config) return false;

    const qualityDirectory = path.join(
      PROCESSED_VIDEOS_DIRECTORY,
      videoId,
      name
    );

    return isQualityComplete(qualityDirectory);
  });
}

export { isQualityComplete, areQualitiesComplete };

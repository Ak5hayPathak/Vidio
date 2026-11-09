import {
  getQualityConfig,
  limitQualitiesToMax,
} from "../../utils/video-processing/processing-utils/qualityConfig.js";

import { MAX_OUTPUT_HEIGHT } from "../../utils/video-processing/processing-utils/config.js";

const persistQualityStatuses = async (job, qualities) => {
  await job.updateData({
    ...job.data,
    qualities,
  });
};

//ensures that every required video quality has a valid name and
//processing status before proceeding with video processing
const normalizeQualityStatuses = (qualities) => {
  if (!Array.isArray(qualities) || qualities.length === 0) {
    throw new Error("No required video qualities found in the job.");
  }

  const normalizedQualities = qualities.map((quality) => {
    const qualityName =
      typeof quality === "string"
        ? quality
        : (quality?.quality ?? quality?.name);

    if (
      typeof qualityName !== "string" ||
      !qualityName.trim() ||
      !getQualityConfig(qualityName)
    ) {
      throw new Error(`Invalid or unsupported quality: ${qualityName}`);
    }

    const status =
      quality && typeof quality === "object" && quality.status
        ? quality.status
        : "pending";

    if (!["pending", "processing", "uploaded"].includes(status)) {
      throw new Error(
        `Invalid processing status for quality ${qualityName}: ${status}`
      );
    }

    return {
      quality: qualityName,
      status,
    };
  });

  const uniqueNames = new Set(
    normalizedQualities.map((quality) => quality.quality)
  );

  if (uniqueNames.size !== normalizedQualities.length) {
    throw new Error("Duplicate quality entries found in the job.");
  }

  return normalizedQualities;
};

// takes validated video quality statuses,
// filters out qualities that exceed the maximum allowed resolution,
// builds trusted FFmpeg configurations for the remaining qualities
const buildSafeQualityConfigs = (qualityStatuses) => {
  const safeStatuses = limitQualitiesToMax(qualityStatuses);

  if (!safeStatuses.length) {
    throw new Error(
      "No video qualities remain after applying the height limit."
    );
  }

  const qualityConfigs = safeStatuses.map(({ quality }) => {
    const config = getQualityConfig(quality);

    if (!config) {
      throw new Error(`Missing quality configuration: ${quality}`);
    }

    if (
      !Number.isFinite(config.height) ||
      config.height <= 0 ||
      config.height > MAX_OUTPUT_HEIGHT
    ) {
      throw new Error(
        `Quality ${quality} exceeds the configured maximum output height.`
      );
    }

    if (
      !Number.isFinite(config.width) ||
      config.width <= 0 ||
      !Number.isFinite(config.bandwidth) ||
      config.bandwidth <= 0
    ) {
      throw new Error(`Invalid quality configuration: ${quality}`);
    }

    return {
      name: quality,
      ...config,
    };
  });

  return {
    qualityStatuses: safeStatuses,
    qualityConfigs,
  };
};

export {
  persistQualityStatuses,
  normalizeQualityStatuses,
  buildSafeQualityConfigs,
};

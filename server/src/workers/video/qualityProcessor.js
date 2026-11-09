import {
  processAndUploadQuality,
  processAndUploadMasterPlaylist,
} from "../../services/videoProcessing.service.js";

import { deleteQualityDirectoryFromB2 } from "../../services/b2.service.js";
import { persistQualityStatuses } from "./qualityCheckpoints.js";
import { cleanupDirectory } from "./cleanup.js";
import { publishProgress } from "./progress.js";

const processVideoQualities = async ({
  job,
  videoFileLocalPath,
  videoId,
  mongoVideoId,
  userId,
  qualityStatuses,
  qualityConfigs,
  duration,
}) => {
  const totalQualities = qualityStatuses.length;

  for (let index = 0; index < totalQualities; index++) {
    const qualityStatus = qualityStatuses[index];
    const qualityName = qualityStatus.quality;

    // Skip qualities that have already been uploaded successfully.
    if (qualityStatus.status === "uploaded") {
      console.log(`Quality ${qualityName} is already uploaded. Skipping.`);
      continue;
    }

    // Remove partial remote output from an interrupted attempt.
    if (qualityStatus.status === "processing") {
      console.log(`Recovering interrupted quality ${qualityName}.`);

      await deleteQualityDirectoryFromB2(videoId, qualityName);
    }

    // Persist the processing checkpoint before starting FFmpeg.
    qualityStatuses[index] = {
      ...qualityStatus,
      status: "processing",
    };

    await persistQualityStatuses(job, qualityStatuses);

    const qualityConfig = qualityConfigs[index];

    // Throttle progress callbacks to avoid excessive Redis publishing.
    let lastPublishedProgress = -1;
    let lastPublishedStage = "";

    const result = await processAndUploadQuality(
      videoFileLocalPath,
      videoId,
      qualityConfig,
      (progressData) => {
        const qualityProgress = progressData.progress ?? 0;

        const overallProgress =
          10 + ((index + qualityProgress / 100) / totalQualities) * 80;

        if (
          progressData.stage === lastPublishedStage &&
          overallProgress - lastPublishedProgress < 1
        ) {
          return;
        }

        lastPublishedProgress = overallProgress;
        lastPublishedStage = progressData.stage;

        publishProgress(mongoVideoId, userId, {
          progress: overallProgress,
          stage: progressData.stage,
          quality: qualityName,
        }).catch((error) => {
          console.error("Failed to publish progress:", error.message);
        });
      },
      5,
      { duration }
    );

    // Persist the uploaded checkpoint before deleting local output.
    qualityStatuses[index] = {
      ...qualityStatuses[index],
      status: "uploaded",
    };

    await persistQualityStatuses(job, qualityStatuses);

    await cleanupDirectory(result.qualityDirectory);

    console.log(`Quality ${qualityName} uploaded and checkpoint saved`);

    // Keep the latest duration returned by FFmpeg.
    duration = result.duration ?? duration;
  }

  // Do not generate the master playlist until every quality is uploaded.
  if (qualityStatuses.some((quality) => quality.status !== "uploaded")) {
    throw new Error(
      "Cannot finalize video: one or more qualities are not uploaded."
    );
  }

  return {
    duration,
  };
};

// Generate and upload the master HLS playlist.
const generateMasterPlaylist = async ({
  videoId,
  mongoVideoId,
  userId,
  qualityConfigs,
}) => {
  return processAndUploadMasterPlaylist(
    videoId,
    qualityConfigs,
    (progressData) => {
      publishProgress(mongoVideoId, userId, progressData).catch((error) => {
        console.error(
          "Failed to publish master playlist progress:",
          error.message
        );
      });
    }
  );
};

export { processVideoQualities, generateMasterPlaylist };

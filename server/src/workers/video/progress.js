import { Video } from "../../models/video.model.js";
import { redisPublisher } from "../../config/redis.js";

// Persist progress in MongoDB and publish updates to connected clients.
const publishProgress = async (
  mongoVideoID,
  userId,
  progressData,
  shouldPersist = false
) => {
  const { progress, stage, status } = progressData;

  if (shouldPersist) {
    const update = {};

    if (typeof progress === "number") {
      update.processingProgress = progress;
    }
    if (stage) {
      update.processingStage = stage;
    }
    if (status) {
      update.processingStatus = status;
    }

    await Video.findByIdAndUpdate(mongoVideoID, update);
  }

  await redisPublisher.publish(
    "video-processing",
    JSON.stringify({
      videoId: mongoVideoID,
      userId,
      ...progressData,
    })
  );
};

export { publishProgress };

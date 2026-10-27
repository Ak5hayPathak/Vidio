import { videoProcessingQueue } from "./video.queue.js";

const counts = await videoProcessingQueue.getJobCounts(
  "waiting",
  "active",
  "completed",
  "failed",
  "delayed"
);

console.log(counts);

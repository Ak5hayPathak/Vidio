import { videoProcessingQueue } from "./video.queue.js";

await videoProcessingQueue.obliterate({ force: true });

console.log("Video processing queue cleared");

process.exit(0);
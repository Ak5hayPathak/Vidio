import { MAX_STDERR_CHARS } from "./config.js";

// used by both FFmpeg and FFprobe to write logs
// keeps only the latest 8,000 characters of stderr output
// preventing excessive memory usage while retaining useful error details.
const appendTail = (current, chunk) => {
  const combined = current + chunk.toString();

  return combined.length > MAX_STDERR_CHARS
    ? combined.slice(-MAX_STDERR_CHARS)
    : combined;
};

export { appendTail };

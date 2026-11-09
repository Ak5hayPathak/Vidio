import { spawn } from "node:child_process";
import { trackProcess } from "./processRegistry.js";
import { appendTail } from "./processUtils.js";

// No async needed because we manually create and return a Promise.
// The Promise allows us to handle FFprobe's asynchronous process events.
const runFFprobe = (filePath) => {
  return new Promise((resolve, reject) => {
    if (typeof filePath !== "string" || !filePath.trim()) {
      reject(new Error("A valid media file path is required."));
      return;
    }

    const child = spawn(
      "ffprobe", // Executable to run (FFprobe).
      [
        "-v",
        "error", // Show only error-level logs.

        "-show_streams", // Include information about each media stream (video, audio, etc.).

        "-show_format", // Include container/format information (duration, bitrate, etc.).

        "-of",
        "json", // Format the output as JSON.

        filePath, // Path to the media file to analyze.
      ]
    );

    // Register the FFprobe process so it can be tracked and terminated if necessary.
    trackProcess(child);

    let stderr = ""; // Stores error output from FFprobe.
    let stdout = ""; // Stores FFprobe's JSON output.
    let settled = false;

    const rejectOnce = (error) => {
      if (settled) return;

      settled = true;
      reject(error);
    };

    // Collect standard output in chunks.
    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    // Collect error output while retaining only its last MAX_STDERR_CHARS characters.
    child.stderr?.on("data", (chunk) => {
      stderr = appendTail(stderr, chunk);
    });

    // Handle errors when spawning or running the child process.
    child.on("error", (error) => {
      rejectOnce(error);
    });

    // Handle process completion.
    child.on("close", (code, signal) => {
      if (settled) return;

      // Reject if FFprobe exits with a non-zero exit code.
      if (code !== 0) {
        const reason = signal
          ? `terminated by signal ${signal}`
          : `exit code ${code}`;

        rejectOnce(new Error(`FFprobe failed (${reason}): ${stderr}`));
        return; // Stop execution so JSON parsing isn't attempted.
      }

      try {
        // Parse FFprobe's JSON output and fulfill the Promise.
        settled = true;
        resolve(JSON.parse(stdout));
      } catch (error) {
        // Reject if FFprobe's output isn't valid JSON.
        rejectOnce(
          new Error(`Failed to parse FFprobe output: ${error.message}`)
        );
      }
    });
  });
};

export { runFFprobe };

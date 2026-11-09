import { spawn } from "child_process";
import { trackProcess } from "./processRegistry.js";
import { appendTail } from "./processUtils.js";

const runFFmpeg = (args, { duration, onProgress } = {}) => {
  return new Promise((resolve, reject) => {
    // Spawn an FFmpeg child process with the provided arguments.
    // -progress pipe:1 sends progress information to stdout.
    // -nostats disables the default progress statistics output.
    const child = spawn("ffmpeg", [...args, "-progress", "pipe:1", "-nostats"]);

    // Register the child process for tracking and shutdown management.
    trackProcess(child);

    // Initialize variables for collecting stderr and buffering stdout.
    let stderr = "";
    let stdoutBuffer = "";

    // Track whether the Promise has already been resolved or rejected.
    let settled = false;

    // Reject the Promise only once, preventing duplicate rejection attempts.
    const rejectOnce = (error) => {
      if (settled) return;

      settled = true;
      reject(error);
    };

    // Handle progress output from FFmpeg.
    if (child.stdout) {
      child.stdout.on("data", (chunk) => {
        // Append incoming data to the existing buffer.
        stdoutBuffer += chunk.toString();

        // Split the buffer into individual lines.
        const lines = stdoutBuffer.split("\n");

        // Keep the last incomplete line for the next incoming chunk.
        stdoutBuffer = lines.pop() || "";

        // Process each complete progress line.
        for (const line of lines) {
          const [key, value] = line.trim().split("=");

          // Extract elapsed processing time when available.
          if (
            key === "out_time_ms" &&
            Number.isFinite(duration) &&
            duration > 0
          ) {
            // Convert FFmpeg's output time from microseconds to seconds.
            const elapsedSeconds = Number(value) / 1_000_000;

            // Ensure the calculated elapsed time is a valid number.
            if (Number.isFinite(elapsedSeconds)) {
              // Calculate progress percentage and cap it at 100%.
              const progress = Math.min(
                100,
                Math.max(0, Math.round((elapsedSeconds / duration) * 100))
              );

              // Notify the caller about the current progress.
              // Optional chaining skips the call if onProgress isn't provided.
              try {
                onProgress?.(progress);
              } catch (error) {
                console.error("FFmpeg progress callback failed:", error);
              }
            }
          }
        }
      });
    }

    // Listen for stderr data and retain only its most recent characters.
    if (child.stderr) {
      child.stderr.on("data", (chunk) => {
        stderr = appendTail(stderr, chunk);
      });
    }

    // Handle errors that occur while spawning or running FFmpeg.
    child.on("error", (error) => {
      rejectOnce(error);
    });

    // Listen for the child process closing.
    child.on("close", (code, signal) => {
      // If the exit code is 0, FFmpeg completed successfully.
      if (code === 0) {
        if (!settled) {
          settled = true;

          // Report 100% progress after successful completion.
          try {
            onProgress?.(100);
          } catch (error) {
            console.error("FFmpeg progress callback failed:", error);
          }

          // Resolve the Promise to indicate successful completion.
          resolve();
        }

        return;
      }

      // Reject the Promise if FFmpeg exits unsuccessfully.
      const reason = signal
        ? `terminated by signal ${signal}`
        : `exit code ${code}`;

      rejectOnce(new Error(`FFmpeg failed (${reason}): ${stderr}`));
    });
  });
};

export { runFFmpeg };

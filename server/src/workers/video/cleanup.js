import fs from "node:fs/promises";
import path from "node:path";

const cleanupFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
    console.log(`Temporary file deleted: ${filePath}`);
  } catch (error) {
    if (error.code !== "ENOENT") {
      //ENOENT stands for Error NO ENTry.
      //It means the specified file or directory doesn't exist at the given path.

      console.error(`Failed to delete temporary file: ${filePath}`, error);
      //Any other error except ENOENT is logged.
    }
  }
};

// Safely delete local HLS output.
const cleanupDirectory = async (directoryPath) => {
  if (!directoryPath) return;

  try {
    await fs.rm(directoryPath, { recursive: true, force: true });
    console.log(`Local directory deleted: ${directoryPath}`);
  } catch (error) {
    console.error(
      `Failed to delete local directory: ${directoryPath}`,
      error.message
    );
  }
};

// Remove downloaded originals associated with a video.
const cleanupTempOriginals = async (videoId) => {
  if (!videoId) return;

  try {
    const tempDirectory = path.join("public", "temp");
    const files = await fs.readdir(tempDirectory);

    await Promise.all(
      files
        .filter((file) => file.startsWith(`original-${videoId}`))
        .map((file) => cleanupFile(path.join(tempDirectory, file)))
    );
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to clean temporary originals:", error.message);
    }
  }
};

// Run a cleanup step without allowing its failure to stop other steps.
const safeStep = async (label, step) => {
  try {
    await step();
  } catch (error) {
    console.error(`Cleanup step failed (${label}):`, error.message);
  }
};

export { cleanupFile, cleanupDirectory, cleanupTempOriginals, safeStep };

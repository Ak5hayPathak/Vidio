import fs from "fs";
import path from "path";

import {
  GetObjectCommand,
  ListObjectVersionsCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

import { Upload } from "@aws-sdk/lib-storage";

import { b2Client } from "../config/b2Client.js";
import { APIError } from "../utils/APIError.js";

const BUCKET_NAME = process.env.B2_BUCKET_NAME;

const MAX_UPLOAD_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;
const QUEUE_SIZE = 2;
const PART_SIZE = 8 * 1024 * 1024;

// Wait before retrying a failed operation.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Exponential backoff with jitter.
const getRetryDelay = (attempt) => {
  const exponentialDelay = Math.min(
    INITIAL_RETRY_DELAY * 2 ** (attempt - 1),
    MAX_RETRY_DELAY
  );

  const jitter = Math.random() * 1000;

  return exponentialDelay + jitter;
};

// Upload a single file to B2 with retries.
const uploadFileToB2 = async (
  filePath,
  key,
  onProgress,
  maxAttempts = MAX_UPLOAD_ATTEMPTS
) => {
  let lastError;

  const fileSize = fs.statSync(filePath).size;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let upload;

    try {
      console.log(`Uploading ${key}. Attempt ${attempt}/${maxAttempts}`);

      // A fresh stream is required for every attempt.
      const fileStream = fs.createReadStream(filePath);

      upload = new Upload({
        client: b2Client,

        params: {
          Bucket: BUCKET_NAME,
          Key: key,
          Body: fileStream,
          ContentLength: fileSize,
        },

        // Number of concurrent multipart parts per file.
        queueSize: QUEUE_SIZE,

        // Multipart part size: 8 MiB.
        partSize: PART_SIZE,

        leavePartsOnError: false,
      });

      upload.on("httpUploadProgress", (progress) => {
        onProgress?.(progress.loaded || 0);
      });

      await upload.done();

      console.log(`Successfully uploaded: ${key}`);

      return;
    } catch (error) {
      lastError = error;

      console.error(
        `Upload failed for ${key}. Attempt ${attempt}/${maxAttempts}`
      );

      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error(
        "HTTP status:",
        error.$metadata?.httpStatusCode ?? "Unavailable"
      );
      console.error(
        "B2 request ID:",
        error.$metadata?.requestId ?? "Unavailable"
      );

      // Abort any unfinished multipart upload.
      if (upload) {
        try {
          await upload.abort();
        } catch (abortError) {
          console.error(
            `Failed to abort upload for ${key}:`,
            abortError.message
          );
        }
      }

      if (attempt === maxAttempts) {
        console.error(`All ${maxAttempts} upload attempts failed for ${key}`);

        throw lastError;
      }

      const delay = getRetryDelay(attempt);

      console.log(`Retrying ${key} in ${(delay / 1000).toFixed(1)} seconds...`);

      await wait(delay);
    }
  }

  throw lastError;
};

// Recursively collect file paths from an HLS directory.
const getFilesRecursively = (directoryPath) => {
  const items = fs.readdirSync(directoryPath, {
    withFileTypes: true,
  });

  let files = [];

  for (const item of items) {
    const itemPath = path.join(directoryPath, item.name);

    if (item.isDirectory()) {
      files = files.concat(getFilesRecursively(itemPath));
    } else {
      files.push(itemPath);
    }
  }

  return files;
};

// Delete all versions and delete markers for a video.
const deleteVideoDirectoryFromB2 = async (videoId) => {
  const prefix = `videos/${videoId}/`;

  let keyMarker;
  let versionIdMarker;

  try {
    do {
      const listResponse = await b2Client.send(
        new ListObjectVersionsCommand({
          Bucket: BUCKET_NAME,
          Prefix: prefix,
          KeyMarker: keyMarker,
          VersionIdMarker: versionIdMarker,
        })
      );

      const objectsToDelete = [
        ...(listResponse.Versions || []),
        ...(listResponse.DeleteMarkers || []),
      ].map((object) => ({
        Key: object.Key,
        VersionId: object.VersionId,
      }));

      // S3 DeleteObjects supports a maximum of 1000 objects per request.
      for (let i = 0; i < objectsToDelete.length; i += 1000) {
        const batch = objectsToDelete.slice(i, i + 1000);

        if (batch.length === 0) continue;

        const deleteResponse = await b2Client.send(
          new DeleteObjectsCommand({
            Bucket: BUCKET_NAME,
            Delete: {
              Objects: batch,
              Quiet: false,
            },
          })
        );

        if (deleteResponse.Errors?.length > 0) {
          console.error(
            "Some B2 objects could not be deleted:",
            deleteResponse.Errors
          );

          throw new Error(
            `Failed to delete ${deleteResponse.Errors.length} B2 objects`
          );
        }

        console.log(`Deleted ${batch.length} file versions from B2`);
      }

      keyMarker = listResponse.NextKeyMarker;
      versionIdMarker = listResponse.NextVersionIdMarker;
    } while (keyMarker || versionIdMarker);

    console.log(`Deleted all existing versions for video: ${videoId}`);
  } catch (error) {
    console.error(`Failed to delete video versions from B2: ${videoId}`);

    console.error("Error details:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      statusCode: error?.$metadata?.httpStatusCode,
      requestId: error?.$metadata?.requestId,
      cause: error?.cause,
    });

    console.dir(error, { depth: 5 });

    throw error;
  }
};

// Upload an entire HLS directory to B2.
const uploadDirectoryToB2 = async (
  directoryPath,
  videoId,
  concurrency = 5,
  onProgress
) => {
  const files = getFilesRecursively(directoryPath);

  if (files.length === 0) {
    throw new Error(`No files found in directory: ${directoryPath}`);
  }

  // Remove existing versions before starting a fresh upload.
  await deleteVideoDirectoryFromB2(videoId);

  // Calculate total size of all HLS files.
  const totalBytes = files.reduce(
    (total, filePath) => total + fs.statSync(filePath).size,
    0
  );

  if (totalBytes === 0) {
    throw new Error("HLS directory contains no uploadable data.");
  }

  // Track uploaded bytes for each file.
  const fileProgress = new Map();

  files.forEach((filePath) => {
    fileProgress.set(filePath, 0);
  });

  const reportProgress = () => {
    const totalUploadedBytes = [...fileProgress.values()].reduce(
      (total, bytes) => total + bytes,
      0
    );

    const progress = (totalUploadedBytes / totalBytes) * 100;

    onProgress?.({
      progress: Math.min(100, progress),
      stage: "Uploading HLS",
    });
  };

  // Upload files in batches to control concurrency.
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);

    await Promise.all(
      batch.map(async (filePath) => {
        const relativePath = path.relative(directoryPath, filePath);

        const key = path
          .join("videos", videoId, relativePath)
          .replace(/\\/g, "/");

        await uploadFileToB2(filePath, key, (uploadedBytes) => {
          fileProgress.set(filePath, uploadedBytes);
          reportProgress();
        });

        // Mark the file complete after its upload succeeds.
        fileProgress.set(filePath, fs.statSync(filePath).size);

        reportProgress();

        console.log(`Uploaded: ${key}`);
      })
    );
  }

  const masterPlaylistPath = `videos/${videoId}/master.m3u8`;

  console.log("All files uploaded successfully!");

  onProgress?.({
    progress: 100,
    stage: "HLS upload completed",
  });

  return masterPlaylistPath;
};

// Retrieve a file from B2.
const getFileFromB2 = async (key) => {
  try {
    const response = await b2Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );

    return response;
  } catch (error) {
    if (error.name === "NoSuchKey") {
      throw new APIError(404, "HLS file not found");
    }

    throw error;
  }
};

export { uploadDirectoryToB2, deleteVideoDirectoryFromB2, getFileFromB2 };

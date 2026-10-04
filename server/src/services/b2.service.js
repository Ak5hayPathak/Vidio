import fs from "fs";
import fsp from "fs/promises";
import path from "path";

import {
  GetObjectCommand,
  PutObjectCommand,
  ListObjectVersionsCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

import { b2Client } from "../config/b2Client.js";
import { APIError } from "../utils/APIError.js";

const BUCKET_NAME = process.env.B2_BUCKET_NAME;

const MAX_UPLOAD_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 15000;

const CONTENT_TYPES = {
  ".m3u8": "application/vnd.apple.mpegurl",
  ".ts": "video/mp2t",
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Exponential backoff with jitter.
const getRetryDelay = (attempt) => {
  const exponentialDelay = Math.min(
    INITIAL_RETRY_DELAY * 2 ** (attempt - 1),
    MAX_RETRY_DELAY
  );

  return exponentialDelay + Math.random() * 1000;
};

// Upload one file with a plain PutObject.
// HLS segments are small, so multipart buffering would only waste memory.
const uploadFileToB2 = async (
  filePath,
  key,
  size,
  maxAttempts = MAX_UPLOAD_ATTEMPTS
) => {
  const contentType =
    CONTENT_TYPES[path.extname(filePath).toLowerCase()] ||
    "application/octet-stream";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // A fresh stream is required for every attempt.
    const stream = fs.createReadStream(filePath);

    try {
      await b2Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: stream,
          ContentLength: size,
          ContentType: contentType,
        })
      );

      return;
    } catch (error) {
      console.error(
        `Upload failed for ${key} (attempt ${attempt}/${maxAttempts}): ` +
          `${error.name} - ${error.message} ` +
          `[status ${error.$metadata?.httpStatusCode ?? "n/a"}, ` +
          `request ${error.$metadata?.requestId ?? "n/a"}]`
      );

      if (attempt === maxAttempts) throw error;

      await wait(getRetryDelay(attempt));
    } finally {
      // Always release the file descriptor, even after a failed request.
      stream.destroy();
    }
  }
};

// Recursively collect files together with their sizes (stat once, reuse).
const collectFiles = async (directoryPath) => {
  const entries = await fsp.readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else {
      const { size } = await fsp.stat(entryPath);
      files.push({ filePath: entryPath, size });
    }
  }

  return files;
};

// Delete all versions and delete markers for a video.
const deleteVideoDirectoryFromB2 = async (videoId) => {
  const prefix = `videos/${videoId}/`;

  let keyMarker;
  let versionIdMarker;
  let isTruncated = false;

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

      // DeleteObjects supports at most 1000 objects per request.
      for (let i = 0; i < objectsToDelete.length; i += 1000) {
        const batch = objectsToDelete.slice(i, i + 1000);

        const deleteResponse = await b2Client.send(
          new DeleteObjectsCommand({
            Bucket: BUCKET_NAME,
            Delete: { Objects: batch, Quiet: true },
          })
        );

        if (deleteResponse.Errors?.length > 0) {
          console.error(
            "Some B2 objects could not be deleted:",
            deleteResponse.Errors.slice(0, 5)
          );

          throw new Error(
            `Failed to delete ${deleteResponse.Errors.length} B2 objects`
          );
        }
      }

      isTruncated = Boolean(listResponse.IsTruncated);
      keyMarker = listResponse.NextKeyMarker;
      versionIdMarker = listResponse.NextVersionIdMarker;
    } while (isTruncated && (keyMarker || versionIdMarker));

    console.log(`Deleted all existing versions for video: ${videoId}`);
  } catch (error) {
    console.error(`Failed to delete video versions from B2: ${videoId}`, {
      name: error?.name,
      message: error?.message,
      statusCode: error?.$metadata?.httpStatusCode,
      requestId: error?.$metadata?.requestId,
    });

    throw error;
  }
};

// Upload an entire HLS directory to B2.
const uploadDirectoryToB2 = async (
  directoryPath,
  videoId,
  concurrency = 3,
  onProgress
) => {
  const files = await collectFiles(directoryPath);

  if (files.length === 0) {
    throw new Error(`No files found in directory: ${directoryPath}`);
  }

  const totalBytes = files.reduce((total, file) => total + file.size, 0);

  if (totalBytes === 0) {
    throw new Error("HLS directory contains no uploadable data.");
  }

  // Remove existing versions before starting a fresh upload.
  await deleteVideoDirectoryFromB2(videoId);

  let uploadedBytes = 0;

  const uploadOne = async ({ filePath, size }) => {
    const relativePath = path.relative(directoryPath, filePath);
    const key = path.join("videos", videoId, relativePath).replace(/\\/g, "/");

    await uploadFileToB2(filePath, key, size);

    uploadedBytes += size;

    onProgress?.({
      progress: Math.min(100, (uploadedBytes / totalBytes) * 100),
      stage: "Uploading HLS",
    });
  };

  // The master playlist goes last so it never points at missing renditions.
  const isMaster = (file) => path.basename(file.filePath) === "master.m3u8";
  const mainFiles = files.filter((file) => !isMaster(file));
  const masterFiles = files.filter(isMaster);

  // Fixed-size worker pool: no waiting on the slowest file in a batch.
  let nextIndex = 0;
  let failed = false;

  const runWorker = async () => {
    while (!failed) {
      const index = nextIndex++;
      if (index >= mainFiles.length) return;

      try {
        await uploadOne(mainFiles[index]);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  };

  const results = await Promise.allSettled(
    Array.from(
      { length: Math.min(concurrency, mainFiles.length) },
      runWorker
    )
  );

  // allSettled guarantees no upload is still in flight when we throw,
  // so the caller can safely clean up.
  const rejected = results.find((result) => result.status === "rejected");
  if (rejected) throw rejected.reason;

  for (const file of masterFiles) {
    await uploadOne(file);
  }

  onProgress?.({ progress: 100, stage: "HLS upload completed" });

  console.log(`All files uploaded for video: ${videoId}`);

  return `videos/${videoId}/master.m3u8`;
};

// Retrieve a file from B2.
const getFileFromB2 = async (key) => {
  try {
    return await b2Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
  } catch (error) {
    if (error.name === "NoSuchKey") {
      throw new APIError(404, "HLS file not found");
    }

    throw error;
  }
};

export { uploadDirectoryToB2, deleteVideoDirectoryFromB2, getFileFromB2 };
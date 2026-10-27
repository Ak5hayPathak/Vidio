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
    } else if (item.isFile()) {
      files.push(itemPath);
    }
  }

  return files;
};

// Delete all versions and delete markers under a B2 prefix.
const deleteB2Prefix = async (prefix) => {
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

    console.log(`Deleted all existing versions under prefix: ${prefix}`);
  } catch (error) {
    console.error(`Failed to delete B2 objects under prefix: ${prefix}`);

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

// Delete all versions and delete markers for a video.
const deleteVideoDirectoryFromB2 = async (videoId) => {
  if (!videoId) {
    throw new Error("Video ID is required to delete the video directory.");
  }

  await deleteB2Prefix(`videos/${videoId}/`);

  console.log(`Deleted all existing versions for video: ${videoId}`);
};

// Delete all versions and delete markers for a specific quality.
const deleteQualityDirectoryFromB2 = async (videoId, qualityName) => {
  if (!videoId || !qualityName) {
    throw new Error(
      "Video ID and quality name are required to delete a quality directory."
    );
  }

  // Restrict the quality name to a single directory component.
  if (
    path.basename(qualityName) !== qualityName ||
    qualityName.includes("/") ||
    qualityName.includes("\\")
  ) {
    throw new Error("Invalid quality name.");
  }

  const prefix = `videos/${videoId}/${qualityName}/`;

  await deleteB2Prefix(prefix);

  console.log(
    `Deleted all existing versions for quality ${qualityName} of video ${videoId}`
  );
};

// Upload files from a directory to a specific B2 prefix.
const uploadDirectoryToPrefix = async (
  directoryPath,
  prefix,
  concurrency = 5,
  onProgress,
  { deleteExisting = false } = {}
) => {
  if (
    !fs.existsSync(directoryPath) ||
    !fs.statSync(directoryPath).isDirectory()
  ) {
    throw new Error(`Directory not found: ${directoryPath}`);
  }

  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error("Upload concurrency must be a positive integer.");
  }

  const files = getFilesRecursively(directoryPath);

  if (files.length === 0) {
    throw new Error(`No files found in directory: ${directoryPath}`);
  }

  // Remove existing versions only when explicitly requested.
  if (deleteExisting) {
    await deleteB2Prefix(prefix.endsWith("/") ? prefix : `${prefix}/`);
  }

  // Calculate total size of all files.
  const totalBytes = files.reduce(
    (total, filePath) => total + fs.statSync(filePath).size,
    0
  );

  if (totalBytes === 0) {
    throw new Error("Directory contains no uploadable data.");
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

        const key = `${prefix.replace(/\/+$/, "")}/${relativePath
          .split(path.sep)
          .join("/")}`;

        await uploadFileToB2(filePath, key, (uploadedBytes) => {
          fileProgress.set(
            filePath,
            Math.min(uploadedBytes, fs.statSync(filePath).size)
          );

          reportProgress();
        });

        // Mark the file complete after its upload succeeds.
        fileProgress.set(filePath, fs.statSync(filePath).size);

        reportProgress();

        console.log(`Uploaded: ${key}`);
      })
    );
  }

  onProgress?.({
    progress: 100,
    stage: "HLS upload completed",
  });

  return files.map((filePath) => {
    const relativePath = path.relative(directoryPath, filePath);

    return `${prefix.replace(/\/+$/, "")}/${relativePath
      .split(path.sep)
      .join("/")}`;
  });
};

// Upload a single quality directory to B2.
const uploadQualityDirectoryToB2 = async (
  qualityDirectoryPath,
  videoId,
  qualityName,
  concurrency = 5,
  onProgress
) => {
  if (!videoId || !qualityName) {
    throw new Error(
      "Video ID and quality name are required to upload a quality directory."
    );
  }

  // Restrict the quality name to a single directory component.
  if (
    path.basename(qualityName) !== qualityName ||
    qualityName.includes("/") ||
    qualityName.includes("\\")
  ) {
    throw new Error("Invalid quality name.");
  }

  const prefix = `videos/${videoId}/${qualityName}`;

  // Remove only this quality's existing versions before uploading it.
  await deleteQualityDirectoryFromB2(videoId, qualityName);

  const uploadedKeys = await uploadDirectoryToPrefix(
    qualityDirectoryPath,
    prefix,
    concurrency,
    onProgress
  );

  // Verify the playlist and every referenced segment were included in the upload.
  const playlistPath = path.join(qualityDirectoryPath, "playlist.m3u8");

  if (!fs.existsSync(playlistPath)) {
    throw new Error(`Playlist not found for quality ${qualityName}.`);
  }

  const playlist = fs.readFileSync(playlistPath, "utf8");

  if (!playlist.includes("#EXT-X-ENDLIST")) {
    throw new Error(`Playlist for quality ${qualityName} is incomplete.`);
  }

  const segments = playlist
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.endsWith(".ts"));

  if (segments.length === 0) {
    throw new Error(`No segments found for quality ${qualityName}.`);
  }

  for (const segment of segments) {
    const segmentPath = path.join(qualityDirectoryPath, segment);

    if (
      !fs.existsSync(segmentPath) ||
      !fs.statSync(segmentPath).isFile() ||
      fs.statSync(segmentPath).size === 0
    ) {
      throw new Error(
        `Missing or empty segment for quality ${qualityName}: ${segment}`
      );
    }

    const segmentKey = `${prefix}/${segment.split(path.sep).join("/")}`;

    if (!uploadedKeys.includes(segmentKey)) {
      throw new Error(
        `Segment was not uploaded for quality ${qualityName}: ${segment}`
      );
    }
  }

  if (!uploadedKeys.includes(`${prefix}/playlist.m3u8`)) {
    throw new Error(`Playlist was not uploaded for quality ${qualityName}.`);
  }

  return {
    quality: qualityName,
    prefix: `${prefix}/`,
    playlistKey: `${prefix}/playlist.m3u8`,
    uploadedKeys,
  };
};

// Upload the master playlist separately after all qualities are uploaded.
const uploadMasterPlaylistToB2 = async (
  masterPlaylistPath,
  videoId,
  onProgress
) => {
  if (!videoId) {
    throw new Error("Video ID is required to upload the master playlist.");
  }

  if (
    !fs.existsSync(masterPlaylistPath) ||
    !fs.statSync(masterPlaylistPath).isFile() ||
    fs.statSync(masterPlaylistPath).size === 0
  ) {
    throw new Error("Master playlist is missing or empty.");
  }

  const masterPlaylist = fs.readFileSync(masterPlaylistPath, "utf8");

  if (!masterPlaylist.startsWith("#EXTM3U")) {
    throw new Error("Master playlist is invalid.");
  }

  const key = `videos/${videoId}/master.m3u8`;

  // Replace only the master playlist, not the already uploaded qualities.
  await deleteB2Prefix(key);

  await uploadFileToB2(masterPlaylistPath, key, onProgress);

  return key;
};

// Upload an entire HLS directory to B2.
const uploadDirectoryToB2 = async (
  directoryPath,
  videoId,
  concurrency = 5,
  onProgress
) => {
  const files = getFilesRecursively(directoryPath);

  const masterPlaylist = files.find(
    (filePath) => path.basename(filePath) === "master.m3u8"
  );

  const otherFiles = files.filter(
    (filePath) => path.basename(filePath) !== "master.m3u8"
  );

  if (masterPlaylist) {
    otherFiles.push(masterPlaylist);
  }

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
  // Upload the master playlist last so it does not reference unfinished uploads.
  const orderedFiles = otherFiles;

  for (let i = 0; i < orderedFiles.length; i += concurrency) {
    const batch = orderedFiles.slice(i, i + concurrency);

    await Promise.all(
      batch.map(async (filePath) => {
        const relativePath = path.relative(directoryPath, filePath);

        const key = path
          .join("videos", videoId, relativePath)
          .replace(/\\/g, "/");

        await uploadFileToB2(filePath, key, (uploadedBytes) => {
          fileProgress.set(
            filePath,
            Math.min(uploadedBytes, fs.statSync(filePath).size)
          );

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

// Download the original video from B2 as a readable stream.
const getOriginalVideoFromB2 = async (key) => {
  return getFileFromB2(key);
};

const deleteOriginalVideoFromB2 = async (originalKey) => {
  if (!originalKey?.startsWith("originals/")) {
    throw new Error("Invalid original video key.");
  }

  let keyMarker;
  let versionIdMarker;

  try {
    do {
      const response = await b2Client.send(
        new ListObjectVersionsCommand({
          Bucket: BUCKET_NAME,
          Prefix: originalKey,
          KeyMarker: keyMarker,
          VersionIdMarker: versionIdMarker,
        })
      );

      // Match the exact key, not other objects sharing its prefix.
      const objectsToDelete = [
        ...(response.Versions || []),
        ...(response.DeleteMarkers || []),
      ]
        .filter((object) => object.Key === originalKey)
        .map((object) => ({
          Key: object.Key,
          VersionId: object.VersionId,
        }));

      for (let i = 0; i < objectsToDelete.length; i += 1000) {
        const batch = objectsToDelete.slice(i, i + 1000);

        if (batch.length === 0) continue;

        const result = await b2Client.send(
          new DeleteObjectsCommand({
            Bucket: BUCKET_NAME,
            Delete: {
              Objects: batch,
              Quiet: false,
            },
          })
        );

        if (result.Errors?.length) {
          throw new Error(
            `Failed to delete ${result.Errors.length} original video versions.`
          );
        }
      }

      keyMarker = response.NextKeyMarker;
      versionIdMarker = response.NextVersionIdMarker;
    } while (keyMarker || versionIdMarker);

    console.log(`Deleted original video from B2: ${originalKey}`);
  } catch (error) {
    console.error(
      `Failed to delete original video from B2: ${originalKey}`,
      error.message
    );

    throw error;
  }
};

export {
  uploadFileToB2,
  uploadDirectoryToB2,
  uploadQualityDirectoryToB2,
  uploadMasterPlaylistToB2,
  deleteVideoDirectoryFromB2,
  deleteQualityDirectoryFromB2,
  getFileFromB2,
  getOriginalVideoFromB2,
  deleteOriginalVideoFromB2,
};

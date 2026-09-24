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

const uploadFileToB2 = async (filePath, key, onProgress) => {
  const fileStream = fs.createReadStream(filePath);

  const fileSize = fs.statSync(filePath).size;

  const upload = new Upload({
    client: b2Client,

    params: {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentLength: fileSize,
    },
  });

  // Track the number of bytes uploaded for this file
  upload.on("httpUploadProgress", (progress) => {
    onProgress?.(progress.loaded || 0);
  });

  await upload.done();
};

//recursively collects and returns file paths from HLS directory
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

//delete files from backblaze to remove redundancy and delete videos
const deleteVideoDirectoryFromB2 = async (videoId) => {
  const prefix = `videos/${videoId}/`;

  let keyMarker;

  let versionIdMarker;

  try {
    do {
      const listResponse = await b2Client.send(
        new ListObjectVersionsCommand({
          Bucket: process.env.B2_BUCKET_NAME,
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

      if (objectsToDelete.length > 0) {
        await b2Client.send(
          new DeleteObjectsCommand({
            Bucket: process.env.B2_BUCKET_NAME,
            Delete: {
              Objects: objectsToDelete,
              Quiet: false,
            },
          })
        );

        console.log(
          `Deleted ${objectsToDelete.length} file versions from B2`
        );
      }

      keyMarker = listResponse.NextKeyMarker;

      versionIdMarker = listResponse.NextVersionIdMarker;
    } while (keyMarker);

    console.log(`Deleted all existing versions for video: ${videoId}`);
  } catch (error) {
    console.error("Failed to delete video versions from B2: ");

    throw error;
  }
};

//to upload hls on backblaze
const uploadDirectoryToB2 = async (
  directoryPath,
  videoId,
  concurrency = 5,
  onProgress
) => {
  const files = getFilesRecursively(directoryPath);

  await deleteVideoDirectoryFromB2(videoId);

  // Calculate the total size of all HLS files
  const totalBytes = files.reduce(
    (total, filePath) => total + fs.statSync(filePath).size,
    0
  );

  // Track the progress of each file
  const fileProgress = new Map();

  files.forEach((filePath) => {
    fileProgress.set(filePath, 0);
  });

  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);

    await Promise.all(
      batch.map(async (filePath) => {
        const relativePath = path.relative(directoryPath, filePath);

        const key = path
          .join("videos", videoId, relativePath)
          .replace(/\\/g, "/");

        await uploadFileToB2(filePath, key, (uploadedBytes) => {
          // Update the progress of the current file
          fileProgress.set(filePath, uploadedBytes);

          // Calculate total bytes uploaded across all files
          const totalUploadedBytes = [...fileProgress.values()].reduce(
            (total, bytes) => total + bytes,
            0
          );

          const progress =
            (totalUploadedBytes / totalBytes) * 100;

          onProgress?.({
            progress: Math.min(100, progress),
            stage: "Uploading HLS",
          });
        });

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

// const videoId = "f1d9ccf9-7f67-471d-a87b-b1cab3720124";

// const directoryPath = `./public/processed/${videoId}`;

// await uploadDirectoryToB2(directoryPath, videoId);

const getFileFromB2 = async (key) => {
  try {
    const response = await b2Client.send(
      new GetObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: key,
      })
    );

    return response;
  } catch (error) {
    // console.error("\nB2 Object Erro");
    // console.error("Key:", key);
    // console.error("Message:", error.message);
    // console.error("Name:", error.name);
    // console.error("Code:", error.code);
    // console.error("Status Code:", error.$metadata?.httpStatusCode);
    // console.error("Request ID:", error.$metadata?.requestId);
    // console.error("Full error:", error);
    // console.error("-----\n");

    if (error.name === "NoSuchKey") {
      throw new APIError(404, "HLS file not found");
    }

    throw error;
  }
};

export {
  uploadDirectoryToB2,
  deleteVideoDirectoryFromB2,
  getFileFromB2,
};

import mongoose from "mongoose";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { Video } from "../models/video.model.js";
import { VideoView } from "../models/videoView.model.js";
import { SearchHistory } from "../models/searchHistory.model.js";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { videoProcessingQueue } from "../queues/video.queue.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary.service.js";
import {
  uploadFileToB2,
  deleteOriginalVideoFromB2,
  deleteVideoDirectoryFromB2,
  getFileFromB2,
} from "../services/b2.service.js";
import { runFFprobe } from "../utils/video-processing/processing-utils/ffprobe.js";
import { getSupportedQualities } from "../utils/video-processing/processing-utils/qualityConfig.js";
import { generateStreamToken } from "../utils/streamToken.js";

// Drop-in replacement for the publishAVideo handler in your video controller.
// Imports are unchanged (asyncHandler, APIError, APIResponse, Video, fs, path,
// crypto, uploadFileToB2, deleteOriginalVideoFromB2, runFFprobe,
// getSupportedQualities, videoProcessingQueue).

// Longest video accepted, in seconds. Encoding on a free shared CPU is very
// slow, so very long videos would run for hours. Override with the
// MAX_VIDEO_DURATION_SECONDS env var (default: 2 hours).
const MAX_VIDEO_DURATION_SECONDS =
  Number(process.env.MAX_VIDEO_DURATION_SECONDS) || 2 * 60 * 60;

// Safely remove temporary files uploaded through Multer.
const cleanupUploadedFiles = async (...filePaths) => {
  const uniquePaths = [...new Set(filePaths.filter(Boolean))];

  await Promise.allSettled(
    uniquePaths.map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error(
            `Failed to remove temporary file: ${filePath}`,
            error.message
          );
        }
      }
    })
  );
};

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description = "", tags = [] } = req.body;

  const videoFile = req.files?.videoFile?.[0];
  const videoFileLocalPath = videoFile?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  const userId = req.user?._id;

  const videoId = crypto.randomUUID();

  let video;
  let originalKey;

  try {
    // 1. Validate request.
    if (!title?.trim()) {
      throw new APIError(400, "Video title is required!");
    }

    if (!videoFileLocalPath) {
      throw new APIError(400, "Video File is required!");
    }

    if (!userId) {
      throw new APIError(401, "Unauthorized Request!");
    }

    // 2. Validate the uploaded video using FFprobe.
    let metadata;

    try {
      metadata = await runFFprobe(videoFileLocalPath);
    } catch (error) {
      console.error("FFprobe could not read the upload:", error.message);

      throw new APIError(400, "The uploaded file is not a valid video.");
    }

    const videoStream = metadata.streams?.find(
      (stream) => stream.codec_type === "video"
    );

    if (!videoStream?.height) {
      throw new APIError(400, "Unable to determine video dimensions.");
    }

    const duration = Number(metadata.format?.duration);

    if (!Number.isFinite(duration) || duration <= 0) {
      throw new APIError(400, "Unable to determine video duration.");
    }

    if (duration > MAX_VIDEO_DURATION_SECONDS) {
      throw new APIError(
        400,
        `Video is too long. Maximum duration is ${Math.floor(
          MAX_VIDEO_DURATION_SECONDS / 60
        )} minutes.`
      );
    }

    // 3. Determine supported qualities.
    const supportedQualities = getSupportedQualities(videoStream.height);

    if (!supportedQualities.length) {
      throw new APIError(400, "No supported video qualities found.");
    }

    const qualities = supportedQualities.map((quality) => ({
      quality,
      status: "pending",
    }));

    // 4. Determine a safe file extension.
    const suppliedExtension = path
      .extname(videoFile.originalname || "")
      .toLowerCase();

    const extension = /^\.[a-z0-9]{1,10}$/.test(suppliedExtension)
      ? suppliedExtension
      : ".mp4";

    // 5. Upload the original video to B2.
    originalKey = `originals/${videoId}/original${extension}`;

    await uploadFileToB2(videoFileLocalPath, originalKey);

    // 6. Create the video document.
    video = await Video.create({
      title: title.trim(),
      description,
      tags,
      owner: userId,
      duration,
      processingStatus: "processing",
      isPublished: false,
    });

    // 7. Queue the video-processing job.
    await videoProcessingQueue.add(
      "process-video",
      {
        videoId,
        mongoVideoId: video._id.toString(),
        originalKey,
        thumbnailLocalPath,
        username: req.user.username,

        // Temporarily retained for compatibility with the current worker.
        userId: userId.toString(),
        duration,

        qualities,
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 30000,
        },
      }
    );
  } catch (error) {
    console.error("Failed to upload video or queue processing:", error);

    // Remove the database record if it was created.
    if (video) {
      await Video.deleteOne({ _id: video._id }).catch((cleanupError) => {
        console.error("Failed to remove video record:", cleanupError.message);
      });
    }

    // Remove the original from B2 if it was uploaded.
    if (originalKey) {
      await deleteOriginalVideoFromB2(originalKey).catch((cleanupError) => {
        console.error(
          "Failed to remove original from B2:",
          cleanupError.message
        );
      });
    }

    // Clean up all local uploads.
    await cleanupUploadedFiles(videoFileLocalPath, thumbnailLocalPath);

    // Preserve validation and authorization errors.
    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(
      503,
      "Video upload or processing setup failed. Please try again."
    );
  }

  // 8. The original is safely stored in B2 and the job is queued.
  // The worker only needs the local thumbnail at this point.
  await cleanupUploadedFiles(videoFileLocalPath);

  return res
    .status(201)
    .json(
      new APIResponse(201, video, "Video uploaded and processing started!")
    );
});

const getAllVideos = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new APIError(401, "Unauthorized request!");
  }

  let {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pipeline = [];

  if (!userId) {
    userId = req.user._id;
  }
  // Search by title or description
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    });
  }

  // Only published videos
  pipeline.push({
    $match: {
      isPublished: true,
      processingStatus: "ready",
    },
  });

  // Filter by owner (optional)
  if (userId) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new APIError(400, "Invalid user ID");
    }

    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  // Sort
  pipeline.push({
    $sort: {
      [sortBy]: sortType === "asc" ? 1 : -1,
    },
  });

  // Get owner details
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "ownerDetails",
      pipeline: [
        {
          $project: {
            username: 1,
            avatar: 1,
          },
        },
      ],
    },
  });

  // Convert ownerDetails array into an object
  pipeline.push({
    $unwind: "$ownerDetails",
  });

  const result = await Video.aggregatePaginate(Video.aggregate(pipeline), {
    page: Number(page),
    limit: Number(limit),
  });

  return res
    .status(200)
    .json(new APIResponse(200, result, "Videos fetched successfully!"));
});

const getVideosByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new APIError(400, "username is missing");
  }
  let {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;
  /* * Find the user by username first. */ const user = await User.findOne({
    username: username.toLowerCase(),
  }).select("_id");
  if (!user) {
    throw new APIError(404, "Channel does not exist");
  }
  const pipeline = [];
  /* * Search by title or description. */ if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    });
  }
  /* * Only return published and completely processed videos. */ pipeline.push({
    $match: { isPublished: true, processingStatus: "ready" },
  });
  /* * Filter videos by channel owner. */ pipeline.push({
    $match: { owner: user._id },
  });
  /* * Sort videos. */ pipeline.push({
    $sort: { [sortBy]: sortType === "asc" ? 1 : -1 },
  });
  /* * Get owner details. */ pipeline.push({
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "ownerDetails",
      pipeline: [{ $project: { username: 1, avatar: 1 } }],
    },
  });
  /* * Convert ownerDetails array into an object. */ pipeline.push({
    $unwind: "$ownerDetails",
  });
  const result = await Video.aggregatePaginate(Video.aggregate(pipeline), {
    page: Number(page),
    limit: Number(limit),
  });
  return res
    .status(200)
    .json(new APIResponse(200, result, "Channel videos fetched successfully!"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video id is required!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video id!");
  }

  const videoObjectId = new mongoose.Types.ObjectId(videoId);

  const video = await Video.findById(videoObjectId);

  if (!video) {
    throw new APIError(404, "Video not found!");
  }

  /*
   * Update watch history
   *
   * If the video already exists:
   * 1. Remove the old entry.
   * 2. Add it again with the current timestamp.
   *
   * This guarantees that one video can only
   * appear once in watch history.
   */
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        watchHistory: {
          video: videoObjectId,
        },
      },
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        watchHistory: {
          video: videoObjectId,
          watchedAt: new Date(),
        },
      },
    });
  }

  const aggregatedArrayOfVideo = await Video.aggregate([
    {
      $match: {
        _id: videoObjectId,
      },
    },

    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },

    {
      $lookup: {
        from: "subscription",
        localField: "owner",
        foreignField: "channel",
        as: "subscribers",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        owner: {
          $first: "$owner",
        },

        likesCount: {
          $size: "$likes",
        },

        isLiked: {
          $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"],
        },

        subscriberCount: {
          $size: "$subscribers",
        },

        isSubscribed: {
          $in: [
            new mongoose.Types.ObjectId(req.user._id),
            "$subscribers.subscriber",
          ],
        },
      },
    },

    {
      $project: {
        likes: 0,
        subscribers: 0,
      },
    },
  ]);

  if (!aggregatedArrayOfVideo?.length) {
    throw new APIError(404, "Video dataset error");
  }

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        aggregatedArrayOfVideo[0],
        "Video Received Successfully!"
      )
    );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video id is required!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video id!");
  }

  const video = await Video.findOne({
    _id: videoId,
    owner: req.user._id,
  });

  if (!video) {
    throw new APIError(404, "Video not found or access denied!");
  }

  const { title, description, tags, isPublished } = req.body;
  const newThumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (
    title === undefined &&
    description === undefined &&
    tags === undefined &&
    isPublished === undefined &&
    !newThumbnailLocalPath
  ) {
    throw new APIError(400, "At least one field must be provided for editing.");
  }

  const oldThumbnail = video.thumbnail;

  if (title !== undefined) {
    video.title = title;
  }

  if (description !== undefined) {
    video.description = description;
  }

  if (tags !== undefined) {
    video.tags = tags;
  }

  if (isPublished !== undefined) {
    video.isPublished = isPublished;
  }

  if (newThumbnailLocalPath) {
    const newThumbnail = await uploadOnCloudinary(newThumbnailLocalPath);

    if (!newThumbnail?.url) {
      throw new APIError(500, "Error while uploading new thumbnail!");
    }

    video.thumbnail = newThumbnail.url;
  }

  await video.save();

  if (newThumbnailLocalPath && oldThumbnail) {
    try {
      await deleteFromCloudinary(oldThumbnail);
    } catch (err) {
      throw new APIError(500, err.message);
    }
  }

  return res
    .status(200)
    .json(new APIResponse(200, video, "Video updated successfully!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video id is required!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video id!");
  }

  const video = await Video.findOne({
    _id: videoId,
    owner: req.user._id,
  });

  if (!video) {
    throw new APIError(404, "Video not found or access denied!");
  }

  const videoFilePath = video.videoFile;
  const thumbnailPath = video.thumbnail;

  if (videoFilePath) {
    const parts = videoFilePath.split("/");
    const videoId = parts[1];

    try {
      await deleteVideoDirectoryFromB2(videoId);
    } catch (err) {
      throw new APIError(500, err.message);
    }
  }

  if (thumbnailPath) {
    try {
      await deleteFromCloudinary(thumbnailPath);
    } catch (err) {
      throw new APIError(500, err.message);
    }
  }

  await video.deleteOne();

  return res
    .status(200)
    .json(new APIResponse(200, null, "Video deleted successfully!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video id is required!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video id!");
  }

  const video = await Video.findOne({
    _id: videoId,
    owner: req.user._id,
  });

  if (!video) {
    throw new APIError(404, "Video not found or access denied!");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new APIResponse(200, video, "Publish status updated successfully!"));
});

const streamVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video id is required!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video Id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new APIError(404, "Video not found");
  }

  const key = video.videoFile;

  try {
    const response = await getFileFromB2(key);

    if (!response?.Body) {
      throw new Error("B2 returned no response body");
    }

    res.type("application/vnd.apple.mpegurl");

    response.Body.on("error", (error) => {
      console.error("B2 stream error:", error);

      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.destroy(error);
      }
    });

    response.Body.pipe(res);
  } catch (error) {
    throw error;
  }
});

const streamHLSFile = asyncHandler(async (req, res) => {
  const { hlsPath } = req.params;
  //hlsPath: [ '37285b97-6bd8-4b55-9b8e-9dd786371785', '144p', 'playlist.m3u8' ]
  console.log("HLS params:", req.params);
  console.log("Stream token:", req.stream);
  console.log("B2 key:", `videos/${hlsPath.join("/")}`);

  if (!hlsPath) {
    throw new APIError(400, "hlsPath is required!");
  }

  const { processingId } = req.stream;

  if (processingId !== hlsPath[0]) {
    throw new APIError(403, "You are not allowed to access this video");
  }

  const key = `videos/${hlsPath.join("/")}`; //join the hlsPath array element

  // console.log("hlsPath:", hlsPath);
  // console.log("B2 key:", key);
  const response = await getFileFromB2(key);

  const fileName = hlsPath[hlsPath.length - 1];

  if (fileName.endsWith(".m3u8")) {
    res.type("application/vnd.apple.mpegurl");
  } else if (fileName.endsWith(".ts")) {
    res.type("video/mp2t");
  } else {
    res.type("application/octet-stream");
  }

  response.Body.on("error", (error) => {
    console.error("HLS stream error:", error);

    if (!res.headersSent) {
      //if we haven't started sending the response yet send a 500.
      res.status(500).end();
    } else {
      //if we've already started streaming
      //we can't change the HTTP status
      //so we terminate the response connection.
      res.destroy(error);
    }
  });

  response.Body.pipe(res);
});

const createStreamToken = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video id is required!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new APIError(404, "Video not found");
  }

  if (!video.isPublished && !video.owner.equals(req.user._id)) {
    throw new APIError(403, "You are not allowed to watch this video");
  }

  const processingId = video.videoFile.split("/")[1];

  const token = generateStreamToken({
    userId: req.user._id.toString(),
    videoId,
    processingId,
  });

  return res
    .status(200)
    .json(
      new APIResponse(200, { token }, "Stream token generated successfully")
    );
});

const searchVideos = asyncHandler(async (req, res) => {
  let { q, page = 1, limit = 10 } = req.query;

  if (!q?.trim()) {
    throw new APIError(400, "Search query is required!");
  }

  q = q.trim();

  const pipeline = [
    {
      $match: {
        $text: {
          $search: q,
        },
        isPublished: true,
        processingStatus: "ready",
      },
    },

    {
      $addFields: {
        searchScore: {
          $meta: "textScore",
        },
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },

    {
      $unwind: "$ownerDetails",
    },

    {
      $sort: {
        searchScore: -1,
      },
    },

    {
      $project: {
        searchScore: 0,
      },
    },
  ];

  const result = await Video.aggregatePaginate(Video.aggregate(pipeline), {
    page: Number(page),
    limit: Number(limit),
  });

  await SearchHistory.findOneAndUpdate(
    {
      user: req.user._id,
      query: q.toLowerCase(),
    },
    {
      $set: {
        searchedAt: new Date(),
      },
      $setOnInsert: {
        user: req.user._id,
        query: q.toLowerCase(),
      },
    },
    {
      upsert: true,
    }
  );

  return res
    .status(200)
    .json(new APIResponse(200, result, "Search results fetched successfully!"));
});

const recordVideoView = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { sessionId } = req.body;

  if (!videoId) {
    throw new APIError(400, "Video id is required!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video id!");
  }

  if (!sessionId) {
    throw new APIError(400, "Session id is required!");
  }

  if (!req.user?._id) {
    throw new APIError(401, "Authentication required!");
  }

  const videoObjectId = new mongoose.Types.ObjectId(videoId);
  const viewerId = req.user._id;

  const video = await Video.findById(videoObjectId);

  if (!video) {
    throw new APIError(404, "Video not found!");
  }

  const existingView = await VideoView.findOne({
    video: videoObjectId,
    viewer: viewerId,
    sessionId,
  });

  if (existingView) {
    return res.status(200).json(
      new APIResponse(
        200,
        {
          counted: false,
          views: video.views,
        },
        "View already recorded for this session."
      )
    );
  }

  await VideoView.create({
    video: videoObjectId,
    viewer: viewerId,
    sessionId,
  });

  const updatedVideo = await Video.findByIdAndUpdate(
    videoObjectId,
    {
      $inc: {
        views: 1,
      },
    },
    {
      returnDocument: "after",
    }
  );

  return res.status(200).json(
    new APIResponse(
      200,
      {
        counted: true,
        views: updatedVideo.views,
      },
      "Video view recorded successfully."
    )
  );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  recordVideoView,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  streamVideo,
  streamHLSFile,
  createStreamToken,
  searchVideos,
  getVideosByUsername,
};

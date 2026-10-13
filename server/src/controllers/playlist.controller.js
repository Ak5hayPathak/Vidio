import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PlaylistCollaborator } from "../models/playlistCollaborator.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new APIError(401, "Unauthorized request!");
  }

  const { name, description = "", isPublic = true } = req.body;

  if (!name?.trim()) {
    throw new APIError(400, "Playlist name is required!");
  }

  if (typeof isPublic !== "boolean") {
    throw new APIError(400, "Playlist visibility must be a boolean!");
  }

  const playlist = await Playlist.create({
    name,
    description,
    isPublic,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new APIError(
      500,
      "Something went wrong while creating the playlist!"
    );
  }

  return res
    .status(201)
    .json(new APIResponse(201, playlist, "Playlist created successfully!"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new APIError(400, "Playlist id is required!");
  }

  if (!mongoose.isValidObjectId(playlistId)) {
    throw new APIError(400, "Invalid playlist id!");
  }

  const { page = 1, limit = 10, sortType = "desc" } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
        $or: [
          { isPublic: true },
          {
            owner: new mongoose.Types.ObjectId(req.user._id),
          },
        ],
      },
    },
    {
      $addFields: {
        totalVideos: { $size: "$videos" },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videosDetails",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "userDetails",
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
            $unwind: "$userDetails",
          },
          {
            $sort: {
              createdAt: sortType === "asc" ? 1 : -1,
            },
          },
          { $skip: skip },
          { $limit: limitNumber },
          {
            $project: {
              title: 1,
              thumbnail: 1,
              createdAt: 1,
              userDetails: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerPlaylist",
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
        ownerPlaylist: { $first: "$ownerPlaylist" },
      },
    },
  ]);

  if (!playlist.length) {
    throw new APIError(404, "Playlist not found or is private!");
  }

  return res
    .status(200)
    .json(
      new APIResponse(200, playlist, "User playlist fetched successfully!")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new APIError(400, "User Id is required!");
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw new APIError(400, "invalid user Id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new APIError(404, "User not found!");
  }

  const { page = 1, limit = 10 } = req.query;

  const isProfileOwner = req.user?._id?.toString() === userId;

  const acceptedCollaborations = await PlaylistCollaborator.find({
    user: new mongoose.Types.ObjectId(userId),
    status: "accepted",
  })
    .select("playlist")
    .lean();

  const collaborativePlaylistIds = acceptedCollaborations.map(
    (collaboration) => collaboration.playlist
  );

  const currentUserId =
    req.user?._id && mongoose.isValidObjectId(req.user._id)
      ? new mongoose.Types.ObjectId(req.user._id)
      : null;

  const playlists = await Playlist.aggregatePaginate(
    Playlist.aggregate([
      {
        $match: {
          $or: [
            {
              owner: new mongoose.Types.ObjectId(userId),
            },
            {
              _id: { $in: collaborativePlaylistIds },
            },
          ],

          // Other users can see only public playlists.
          ...(!isProfileOwner && {
            isPublic: true,
          }),
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },

      // Get the ID of the first video in the playlist
      {
        $addFields: {
          firstVideoId: {
            $arrayElemAt: ["$videos", 0],
          },
        },
      },

      // Fetch the first video's thumbnail
      {
        $lookup: {
          from: "videos",
          let: {
            firstVideoId: "$firstVideoId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$firstVideoId"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                thumbnail: 1,
              },
            },
          ],
          as: "firstVideoDetails",
        },
      },

      // Add the thumbnail directly to the playlist
      {
        $addFields: {
          thumbnail: {
            $ifNull: [
              {
                $arrayElemAt: ["$firstVideoDetails.thumbnail", 0],
              },
              null,
            ],
          },
        },
      },

      // Fetch video details for all videos in the playlist
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videosDetails",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "userDetails",
                pipeline: [
                  {
                    $project: {
                      username: 1,
                      avatar: 1,
                      fullName: 1,
                    },
                  },
                ],
              },
            },

            {
              $unwind: "$userDetails",
            },

            {
              $project: {
                title: 1,
                thumbnail: 1,
                description: 1,
                userDetails: 1,
              },
            },
          ],
        },
      },

      // Count the videos whose details were successfully retrieved
      {
        $addFields: {
          totalVideos: {
            $size: "$videosDetails",
          },

          isCollaborative: {
            $in: ["$_id", collaborativePlaylistIds],
          },

          isOwner: {
            $eq: ["$owner", { $literal: currentUserId }],
          },
        },
      },

      // Remove internal fields used by the aggregation
      {
        $project: {
          firstVideoId: 0,
          firstVideoDetails: 0,
        },
      },
    ]),
    {
      page: Number(page),
      limit: Number(limit),
    }
  );

  if (playlists.docs.length === 0) {
    throw new APIError(404, "No playlists found!");
  }

  return res
    .status(200)
    .json(new APIResponse(200, playlists, "Playlists fetched successfully!"));
});

const getUserPlaylistsByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const channelOwner = await User.findOne({
    username: username.toLowerCase(),
  }).select("_id username");

  if (!channelOwner) {
    throw new APIError(404, "Channel not found.");
  }

  const channelOwnerId = channelOwner._id;

  const isProfileOwner =
    req.user?._id?.toString() === channelOwnerId.toString();

  // 1. Find playlists owned by this channel.
  const ownedPlaylists = await Playlist.find({
    owner: channelOwnerId,
    ...(!isProfileOwner && { isPublic: true }),
  }).lean();

  // 2. Find accepted collaborations for this channel owner.
  const acceptedCollaborations = await PlaylistCollaborator.find({
    user: channelOwnerId,
    status: "accepted",
  })
    .select("playlist")
    .lean();

  console.log("Channel owner:", channelOwner.username);
  console.log("Accepted collaborations:", acceptedCollaborations);

  const collaborativePlaylistIds = acceptedCollaborations.map(
    (collaboration) => collaboration.playlist
  );

  // 3. Fetch collaborative playlists.
  const collaborativePlaylists = collaborativePlaylistIds.length
    ? await Playlist.find({
        _id: { $in: collaborativePlaylistIds },
        ...(!isProfileOwner && { isPublic: true }),
      }).lean()
    : [];

  // 4. Combine both lists without duplicates.
  const playlistsById = new Map();

  for (const playlist of ownedPlaylists) {
    playlistsById.set(playlist._id.toString(), {
      ...playlist,
      isOwner: isProfileOwner,
      isCollaborative: false,
    });
  }

  for (const playlist of collaborativePlaylists) {
    const id = playlist._id.toString();

    // If the user owns the playlist, don't mark it as collaborative.
    const isOwner = playlist.owner.toString() === channelOwnerId.toString();

    playlistsById.set(id, {
      ...playlist,
      isOwner,
      isCollaborative: !isOwner,
    });
  }

  const formattedPlaylists = [...playlistsById.values()].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        formattedPlaylists,
        "Channel playlists fetched successfully."
      )
    );
});

const getMyPlaylists = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find accepted collaborations for the current user.
  const acceptedCollaborations = await PlaylistCollaborator.find({
    user: userId,
    status: "accepted",
  })
    .select("playlist")
    .lean();

  const collaborativePlaylistIds = acceptedCollaborations.map(
    (collaboration) => collaboration.playlist
  );

  // Fetch owned playlists.
  const ownedPlaylists = await Playlist.find({
    owner: userId,
  }).lean();

  // Fetch playlists where the current user is a collaborator.
  const collaborativePlaylists = collaborativePlaylistIds.length
    ? await Playlist.find({
        _id: { $in: collaborativePlaylistIds },
      }).lean()
    : [];

  // Combine playlists without duplicates.
  const playlistsById = new Map();

  for (const playlist of ownedPlaylists) {
    playlistsById.set(playlist._id.toString(), {
      ...playlist,
      isOwner: true,
      isCollaborative: false,
    });
  }

  for (const playlist of collaborativePlaylists) {
    const id = playlist._id.toString();
    const isOwner = playlist.owner.toString() === userId.toString();

    playlistsById.set(id, {
      ...playlist,
      isOwner,
      isCollaborative: !isOwner,
    });
  }

  const formattedPlaylists = [...playlistsById.values()].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        formattedPlaylists,
        "User playlists fetched successfully."
      )
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const playlist = req.playlist;

  if (!videoId) {
    throw new APIError(400, "Video id is required!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video id!");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new APIError(404, "Video not found!");
  }

  if (playlist.videos.some((id) => id.toString() === videoId)) {
    throw new APIError(400, "Video already exists in the playlist!");
  }

  playlist.videos.push(videoId);

  await playlist.save();

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        playlist,
        "Video added to the playlist successfully!"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const playlist = req.playlist;

  if (!videoId) {
    throw new APIError(400, "Video id is required!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video id!");
  }

  if (!playlist.videos.some((id) => id.toString() === videoId)) {
    throw new APIError(404, "Video does not exist in the playlist!");
  }

  playlist.videos.pull(videoId);

  await playlist.save();

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        playlist,
        "Video removed from the playlist successfully!"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new APIError(401, "Unauthorized request!");
  }
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new APIError(400, "Playlist id is required!");
  }

  if (!mongoose.isValidObjectId(playlistId)) {
    throw new APIError(400, "Invalid playlist id!");
  }

  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new APIError(404, "Playlist not found or access denied!");
  }

  await playlist.deleteOne();

  return res
    .status(200)
    .json(new APIResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const playlist = req.playlist;
  const { name, description } = req.body;

  if (name === undefined && description === undefined) {
    throw new APIError(400, "At least one field is required!");
  }

  if (name !== undefined) {
    if (!name.trim()) {
      throw new APIError(400, "Playlist name cannot be empty!");
    }

    playlist.name = name;
  }

  if (description !== undefined) {
    playlist.description = description;
  }

  await playlist.save();

  return res
    .status(200)
    .json(new APIResponse(200, playlist, "Playlist updated successfully!"));
});

const toggleVisibility = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new APIError(400, "Playlist id is required!");
  }

  if (!mongoose.isValidObjectId(playlistId)) {
    throw new APIError(400, "Invalid playlist id!");
  }

  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new APIError(404, "Playlist not found or access denied!");
  }

  const collaborator = await PlaylistCollaborator.findOne({
    playlist: playlistId,
  });

  if (collaborator) {
    throw new APIError(
      401,
      "This playlist have collaborator or pending collaborator, thus it cannot be made private"
    );
  }

  playlist.isPublic = !playlist.isPublic;
  await playlist.save();

  return res
    .status(200)
    .json(
      new APIResponse(200, playlist, "Visibility status updated successfully!")
    );
});

export {
  createPlaylist,
  getPlaylistById,
  getUserPlaylists,
  getMyPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  toggleVisibility,
  getUserPlaylistsByUsername,
};

import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary.service.js";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import { generateVerificationToken } from "../utils/emailVerification.js";
import { sendVerificationEmail } from "../services/email.service.js";
import { options } from "../config/configurations.js";

const generateAccessAndRefreshToken = async (userId, rememberMe) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new APIError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken(rememberMe);

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new APIError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  //console.log("email: ", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new APIError(400, "All fields are required!");
  }

  fullName = fullName.charAt(0).toUpperCase() + fullName.slice(1).toLowerCase();
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new APIError(409, "User with email or username already exists");
  }

  //console.log(req.files);

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  //or const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // if (!avatarLocalPath) {
  //   throw new APIError(400, "Avatar file is required!");
  // }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // if (!avatar) {
  //   throw new APIError(400, "Avatar file is required!");
  // }

  const { token, hashedToken, tokenExpires } = generateVerificationToken();

  const user = await User.create({
    fullName,
    avatar: avatar?.url || "",
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),

    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: tokenExpires,
  });

  await sendVerificationEmail(email, token);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new APIError(500, "Something went wrong while registring the user");
  }

  return res
    .status(201)
    .json(new APIResponse(201, createdUser, "User Registered Successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password, rememberMe } = req.body;

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new APIError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new APIError(404, "Invalid password");
  }

  if (!user.isEmailVerified) {
    throw new APIError(403, "Please verify your email before logging in");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
    rememberMe
  );

  const loggedinUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const refreshTokenOptions = {
    ...options,
    maxAge: rememberMe
      ? 10 * 24 * 60 * 60 * 1000 // 10 days
      : 1 * 24 * 60 * 60 * 1000, // 1 day
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json(
      new APIResponse(
        200,
        {
          user: loggedinUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { returnDocument: "after" }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new APIResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new APIError(401, "Unauthorized request");
  }

  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new APIError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new APIError(401, "Refresh token is expired or used");
    }

    const rememberMe = decodedToken.rememberMe;

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id,
      rememberMe
    );

    const refreshTokenOptions = {
      ...options,
      maxAge: rememberMe ? 10 * 24 * 60 * 60 * 1000 : 1 * 24 * 60 * 60 * 1000,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .json(
        new APIResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new APIError(401, error?.message || "Invalid Refresh Token");
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // console.log("VERIFY EMAIL REQUEST:", req.params.token);

  if (!token) {
    throw new APIError(400, "Verification token is required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new APIError(400, "Invalid or expired verification token");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationTokenExpires = null;

  await user.save();

  return res
    .status(200)
    .json(new APIResponse(200, null, "Email verified successfully!"));
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new APIError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new APIError(400, "Email is already verified");
  }

  const { token, hashedToken, tokenExpires } = generateVerificationToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpires = tokenExpires;

  await user.save();

  await sendVerificationEmail(user.email, token);

  return res
    .status(200)
    .json(new APIResponse(200, null, "Verification email sent successfully!"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new APIError(400, "All fields are mandatory!");
  }

  if (oldPassword === newPassword) {
    throw new APIError(400, "New password cannot be same as the old password");
  }

  if (confirmPassword !== newPassword) {
    throw new APIError(
      400,
      "Confirm password must be same as the new passoword"
    );
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new APIError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new APIError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new APIResponse(200, {}, "Password changed successfully!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new APIResponse(200, req.user, "User fetched successfully"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { username, fullName } = req.body;

  if (!username && !email && !fullName) {
    throw new APIError(400, "At least one field is required!");
  }

  const updateFields = {};

  if (fullName) updateFields.fullName = fullName.trim();

  if (username) {
    const normalizedUsername = username.trim().toLowerCase();

    const existingUser = await User.findOne({
      username: normalizedUsername,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      throw new APIError(400, "Username already exists");
    }

    updateFields.username = normalizedUsername;
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updateFields,
    },

    { returnDocument: "after" }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new APIResponse(200, user, "Account details updated successfully"));
});

const updateFiles = asyncHandler(async (req, res) => {
  if (!req.files) throw new APIError(400, "Files are missing");

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!(avatarLocalPath || coverImageLocalPath)) {
    throw new APIError(400, "At least one file is required!");
  }

  // Upload avatar + cover image concurrently instead of one after another.
  const [avatar, coverImage] = await Promise.all([
    avatarLocalPath ? uploadOnCloudinary(avatarLocalPath) : Promise.resolve(null),
    coverImageLocalPath ? uploadOnCloudinary(coverImageLocalPath) : Promise.resolve(null),
  ]);

  if (avatarLocalPath && !avatar?.url) {
    // !avatar?.url because if uploadOnCloudinary() returns null, then avatar.url throws:
    // "Cannot read properties of null"
    throw new APIError(400, "Error while uploading on avatar");
  }

  if (coverImageLocalPath && !coverImage?.url) {
    throw new APIError(500, "Error while uploading on cover image");
  }

  const updateFields = {};
  if (avatar?.url) updateFields.avatar = avatar.url;
  if (coverImage?.url) updateFields.coverImage = coverImage.url;

  // Single DB round trip: get the pre-update doc (for old asset URLs) AND
  // apply the update at the same time.
  const oldUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { returnDocument: "before" }
  ).select("avatar coverImage");

  if (!oldUser) {
    throw new APIError(404, "User not found");
  }

  const oldAvatar = oldUser.avatar;
  const oldCoverImg = oldUser.coverImage;

  // Fetch the fresh doc to return to the client.
  const user = await User.findById(req.user._id).select("-password -refreshToken");

  if (!user) {
    throw new APIError(404, "User not found");
  }

  // Clean up old Cloudinary assets in the background — don't block the
  // response on this, and don't fail an otherwise-successful update just
  // because stale-asset cleanup had a hiccup.
  const cleanupTasks = [];

  if (avatarLocalPath && oldAvatar) {
    cleanupTasks.push(deleteFromCloudinary(oldAvatar));
  }

  if (coverImageLocalPath && oldCoverImg) {
    cleanupTasks.push(deleteFromCloudinary(oldCoverImg));
  }

  if (cleanupTasks.length) {
    Promise.all(cleanupTasks).catch((err) => {
      console.error("Failed to delete old Cloudinary asset(s):", err.message);
    });
  }

  return res
    .status(200)
    .json(new APIResponse(200, user, "File(s) updated successfully!"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new APIError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new APIError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(
      new APIResponse(200, channel[0], "User channel fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },

    {
      $unwind: "$watchHistory",
    },

    {
      $lookup: {
        from: "videos",
        localField: "watchHistory.video",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
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
            },
          },
        ],
      },
    },

    {
      $unwind: "$videoDetails",
    },

    {
      $project: {
        _id: 0,
        video: "$videoDetails",
        watchedAt: "$watchHistory.watchedAt",
      },
    },
  ]);

  return res
    .status(200)
    .json(new APIResponse(200, user, "Watch history fetched successfully"));
});

const clearWatchHistory = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new APIError(401, "Unauthorized request!");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        watchHistory: [],
      },
    },
    {
      new: true,
    }
  );

  if (!user) {
    throw new APIError(404, "User not found!");
  }

  return res
    .status(200)
    .json(new APIResponse(200, null, "Watch history cleared successfully"));
});

const removeVideoFromWatchHistory = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new APIError(401, "Unauthorized request!");
  }

  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video id is required!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video id!");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        watchHistory: {
          video: videoId,
        },
      },
    },
    {
      new: true,
    }
  );

  if (!user) {
    throw new APIError(404, "User not found!");
  }

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        null,
        "Video removed from watch history successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  updateUserDetails,
  getCurrentUser,
  updateFiles,
  getUserChannelProfile,
  getWatchHistory,
  clearWatchHistory,
  removeVideoFromWatchHistory,
};

import mongoose from "mongoose";

import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";

const MAX_PAGE_SIZE = 100;

const validatePagination = (query) => {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);

  if (!Number.isSafeInteger(page) || page < 1) {
    throw new APIError(400, "Page must be a positive integer.");
  }

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
    throw new APIError(
      400,
      `Limit must be an integer between 1 and ${MAX_PAGE_SIZE}.`
    );
  }

  return { page, limit };
};

const buildNotificationsPipeline = (recipientId, unreadOnly = false) => {
  const match = { recipient: recipientId };

  if (unreadOnly) {
    match.isRead = false;
  }

  return Notification.aggregate([
    {
      $match: match,
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "senderDetails",
      },
    },
    {
      $unwind: {
        path: "$senderDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        recipient: 1,
        type: 1,
        message: 1,
        resource: 1,
        isRead: 1,
        createdAt: 1,
        updatedAt: 1,
        videoId: 1,
        sender: {
          $cond: [
            { $ifNull: ["$senderDetails._id", false] },
            {
              _id: "$senderDetails._id",
              username: "$senderDetails.username",
              fullName: "$senderDetails.fullName",
              avatar: "$senderDetails.avatar",
            },
            null,
          ],
        },
      },
    },
  ]);
};

const getUserNotifications = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new APIError(401, "Unauthorized request!");
  }

  const { page, limit } = validatePagination(req.query);

  const notifications = await Notification.aggregatePaginate(
    buildNotificationsPipeline(req.user._id),
    { page, limit }
  );

  return res
    .status(200)
    .json(
      new APIResponse(200, notifications, "Notifications fetched successfully!")
    );
});

const getUnreadNotifications = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new APIError(401, "Unauthorized request!");
  }

  const { page, limit } = validatePagination(req.query);

  const notifications = await Notification.aggregatePaginate(
    buildNotificationsPipeline(req.user._id, true),
    { page, limit }
  );

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        notifications,
        "Unread notifications fetched successfully!"
      )
    );
});

const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new APIError(401, "Unauthorized request!");
  }

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        { unreadCount },
        "Unread notification count fetched successfully!"
      )
    );
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new APIError(401, "Unauthorized request!");
  }

  const { notificationId } = req.params;

  if (!mongoose.isValidObjectId(notificationId)) {
    throw new APIError(400, "Invalid notification ID.");
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: req.user._id,
    },
    {
      $set: { isRead: true },
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!notification) {
    throw new APIError(404, "Notification not found!");
  }

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        notification,
        "Notification marked as read successfully!"
      )
    );
});

const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new APIError(401, "Unauthorized request!");
  }

  const result = await Notification.updateMany(
    {
      recipient: req.user._id,
      isRead: false,
    },
    {
      $set: { isRead: true },
    }
  );

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        { modifiedCount: result.modifiedCount },
        "All notifications marked as read successfully!"
      )
    );
});

export {
  getUserNotifications,
  getUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

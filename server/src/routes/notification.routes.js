import { Router } from "express";

import {
  getUserNotifications,
  getUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notification.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isEmailVerified } from "../middlewares/emailVerification.middleware.js";

const router = Router();

// All notification routes require authentication.
router.use(verifyJWT);

// Fetch notifications.
router.get("/", isEmailVerified, getUserNotifications);

// Fetch unread notifications and their count.
router.get("/unread", isEmailVerified, getUnreadNotifications);
router.get("/unread-count", isEmailVerified, getUnreadNotificationCount);

// Mark notifications as read.
router.patch("/read-all", isEmailVerified, markAllNotificationsAsRead);
router.patch("/:notificationId/read", isEmailVerified, markNotificationAsRead);

export default router;

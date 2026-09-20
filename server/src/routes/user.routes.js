import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  verifyEmail,
  resendVerificationEmail,
  refreshAccessToken,
  registerUser,
  updateAbout,
  updateFiles,
  updateUserDetails,
  clearWatchHistory,
  removeVideoFromWatchHistory,
  forgotPassword,
  resetPassword,
  changeEmail,
  verifyEmailChange,
} from "../controllers/user.controller.js";

import {
  validateChangedPassword,
  validateLoginUser,
  validateRegisterUser,
} from "../middlewares/validation.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isEmailVerified } from "../middlewares/emailVerification.middleware.js";

const router = Router();


/* Authentication                                                             */


// Register
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  validateRegisterUser,
  registerUser
);

// Login
router.route("/login").post(validateLoginUser, loginUser);

// Logout
router.route("/logout").post(verifyJWT, logoutUser);

// Refresh access token
router.route("/refresh-token").post(refreshAccessToken);


/* Email Verification                                                         */


// Verify email
router.route("/verify-email/:token").get(verifyEmail);

// Resend verification email
router
  .route("/resend-verification-email")
  .post(verifyJWT, resendVerificationEmail);


/* Password Recovery                                                          */


// Forgot password
router.route("/forgot-password").post(forgotPassword);

// Reset password
router.route("/reset-password/:token").post(resetPassword);


/* Current User / Account                                                     */


// Get currently authenticated user
router.route("/current-user").get(verifyJWT, getCurrentUser);

// Change password
router
  .route("/change-password")
  .post(
    verifyJWT,
    isEmailVerified,
    validateChangedPassword,
    changePassword
  );

// Change email
router.route("/change-email").post(verifyJWT, changeEmail);

// Verify changed email
router.route("/verify-changed-email/:token").post(verifyEmailChange);


/* Profile                                                                     */


// Update user details
router
  .route("/update-details")
  .patch(verifyJWT, isEmailVerified, updateUserDetails);

// Update about/bio
router.route("/update-about").patch(verifyJWT, updateAbout);

// Update avatar / cover image
router.route("/update-files").patch(
  verifyJWT,
  isEmailVerified,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  updateFiles
);

// Get user's channel/profile
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);


/* Watch History                                                               */


// Get watch history
router.route("/history").get(verifyJWT, getWatchHistory);

// Remove a specific video from history
router
  .route("/history/clear/:videoId")
  .get(verifyJWT, isEmailVerified, removeVideoFromWatchHistory);

// Clear entire watch history
router
  .route("/history/clear")
  .get(verifyJWT, isEmailVerified, clearWatchHistory);

export default router;
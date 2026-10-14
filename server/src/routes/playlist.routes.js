import { Router } from "express";

import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  getMyPlaylists,
  removeVideoFromPlaylist,
  toggleVisibility,
  updatePlaylist,
  getUserPlaylistsByUsername,
  searchPlaylists,
} from "../controllers/playlist.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isEmailVerified } from "../middlewares/emailVerification.middleware.js";
import { verifyPlaylistEditor } from "../middlewares/authPlaylist.middleware.js";

const router = Router();

// Create a playlist.
router.post("/", verifyJWT, isEmailVerified, createPlaylist);

// Fetch the authenticated user's playlists.
router.get("/user/me", verifyJWT, isEmailVerified, getMyPlaylists);

// Fetch playlists by username.
// Public access; the controller must enforce playlist visibility.
router.get("/user/username/:username", getUserPlaylistsByUsername);

// Fetch playlists belonging to a specific user.
// Public access; the controller must enforce playlist visibility.
router.get("/user/:userId", getUserPlaylists);

// Add a video to a playlist.
router.patch(
  "/add/:videoId/:playlistId",
  verifyJWT,
  isEmailVerified,
  verifyPlaylistEditor,
  addVideoToPlaylist
);

router.get("/search", verifyJWT, isEmailVerified, searchPlaylists);

// Remove a video from a playlist.
router.patch(
  "/remove/:videoId/:playlistId",
  verifyJWT,
  isEmailVerified,
  verifyPlaylistEditor,
  removeVideoFromPlaylist
);

// Change playlist visibility.
router.patch(
  "/:playlistId/visibility",
  verifyJWT,
  isEmailVerified,
  verifyPlaylistEditor,
  toggleVisibility
);

// Fetch, update, or delete a playlist by ID.
router
  .route("/:playlistId")
  .get(verifyJWT, getPlaylistById)
  .patch(verifyJWT, isEmailVerified, verifyPlaylistEditor, updatePlaylist)
  .delete(verifyJWT, isEmailVerified, verifyPlaylistEditor, deletePlaylist);

export default router;

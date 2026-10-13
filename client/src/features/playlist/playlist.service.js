import api from "../../services/api.js";

// Create a playlist.
async function createPlaylist(playlistData) {
  const response = await api.post("/playlist/", playlistData);
  return response.data;
}

// Fetch the authenticated user's playlists.
async function getMyPlaylists() {
  const response = await api.get("/playlist/user/me");
  return response.data;
}

// Fetch playlists by username.
async function getUserPlaylistsByUsername(username) {
  const response = await api.get(
    `/playlist/user/username/${encodeURIComponent(username)}`,
  );

  return response.data;
}

// Fetch playlists belonging to a specific user.
async function getUserPlaylists(userId) {
  const response = await api.get(`/playlist/user/${userId}`);
  return response.data;
}

// Fetch a playlist by ID.
async function getPlaylistById(playlistId) {
  const response = await api.get(`/playlist/${playlistId}`);
  return response.data;
}

// Update a playlist.
async function updatePlaylist(playlistId, playlistData) {
  const response = await api.patch(`/playlist/${playlistId}`, playlistData);

  return response.data;
}

// Delete a playlist.
async function deletePlaylist(playlistId) {
  const response = await api.delete(`/playlist/${playlistId}`);
  return response.data;
}

// Add a video to a playlist.
async function addVideoToPlaylist(videoId, playlistId) {
  const response = await api.patch(`/playlist/add/${videoId}/${playlistId}`);

  return response.data;
}

// Remove a video from a playlist.
async function removeVideoFromPlaylist(videoId, playlistId) {
  const response = await api.patch(`/playlist/remove/${videoId}/${playlistId}`);

  return response.data;
}

// Toggle playlist visibility.
async function togglePlaylistVisibility(playlistId) {
  const response = await api.patch(`/playlist/${playlistId}/visibility`);

  return response.data;
}

export {
  createPlaylist,
  getMyPlaylists,
  getUserPlaylistsByUsername,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  togglePlaylistVisibility,
};

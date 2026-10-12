import api from "../../services/api.js";

async function createPlaylist(playlistData) {
  const response = await api.post("/playlist/", playlistData);

  return response.data;
}

async function getUserPlaylists(userId) {
  const response = await api.get(`/playlist/user/${userId}`);

  return response.data;
}

async function getPlaylistById(playlistId) {
  const response = await api.get(`/playlist/${playlistId}`);

  return response.data;
}

async function updatePlaylist(playlistId, playlistData) {
  const response = await api.patch(`/playlist/${playlistId}`, playlistData);

  return response.data;
}

async function deletePlaylist(playlistId) {
  const response = await api.delete(`/playlist/${playlistId}`);

  return response.data;
}

async function addVideoToPlaylist(videoId, playlistId) {
  const response = await api.patch(`/playlist/add/${videoId}/${playlistId}`);

  return response.data;
}

async function removeVideoFromPlaylist(videoId, playlistId) {
  const response = await api.patch(`/playlist/remove/${videoId}/${playlistId}`);

  return response.data;
}

async function togglePlaylistVisibility(playlistId) {
  const response = await api.patch(`/playlist/${playlistId}/visibility`);

  return response.data;
}

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  togglePlaylistVisibility,
};

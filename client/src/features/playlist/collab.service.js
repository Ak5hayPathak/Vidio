import api from "../../services/api.js";

const BASE_URL = "/playlist-collab";

// Search users by username or full name.
async function searchUsers(query, limit = 10) {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return [];
  }

  const response = await api.get("/users/search", {
    params: {
      q: normalizedQuery,
      limit,
    },
  });

  return response.data?.data ?? [];
}

// Send an invitation to collaborate on a playlist.
async function invitePlaylistCollaborator(playlistId, userId) {
  const response = await api.post(
    `${BASE_URL}/playlist/${playlistId}/invite/${userId}`,
  );

  return response.data;
}

// Get accepted collaborators for a playlist.
async function getPlaylistCollaborators(playlistId, params = {}) {
  const response = await api.get(
    `${BASE_URL}/playlist/${playlistId}/collaborators`,
    { params },
  );

  return response.data?.data;
}

// Remove an accepted collaborator.
async function removePlaylistCollaborator(playlistId, userId) {
  const response = await api.delete(
    `${BASE_URL}/playlist/${playlistId}/collaborator/${userId}`,
  );

  return response.data;
}

// Cancel an invitation sent by the current user.
async function cancelPlaylistInvitation(invitationId) {
  const response = await api.delete(
    `${BASE_URL}/invitation/${invitationId}/cancel`,
  );

  return response.data;
}

// Get all received invitations.
async function getAllPlaylistInvitations(params = {}) {
  const response = await api.get(`${BASE_URL}/invitations`, { params });

  return response.data?.data;
}

// Get received pending invitations.
async function getPendingPlaylistInvitations(params = {}) {
  const response = await api.get(`${BASE_URL}/invitations/pending`, {
    params,
  });

  return response.data?.data;
}

// Get received accepted invitations.
async function getAcceptedPlaylistInvitations(params = {}) {
  const response = await api.get(`${BASE_URL}/invitations/accepted`, {
    params,
  });

  return response.data?.data;
}

// Get invitations sent by the current user.
async function getSentPlaylistInvitations(params = {}) {
  const response = await api.get(`${BASE_URL}/invitations/sent`, {
    params,
  });

  return response.data?.data;
}

// Get pending invitations sent by the current user.
async function getSentPendingPlaylistInvitations(params = {}) {
  const response = await api.get(`${BASE_URL}/invitations/sent/pending`, {
    params,
  });

  return response.data?.data;
}

// Get accepted invitations sent by the current user.
async function getSentAcceptedPlaylistInvitations(params = {}) {
  const response = await api.get(`${BASE_URL}/invitations/sent/accepted`, {
    params,
  });

  return response.data?.data;
}

// Accept a received invitation.
async function acceptPlaylistInvitation(invitationId) {
  const response = await api.patch(
    `${BASE_URL}/invitation/${invitationId}/accept`,
  );

  return response.data;
}

// Reject a received invitation.
async function rejectPlaylistInvitation(invitationId) {
  const response = await api.delete(
    `${BASE_URL}/invitation/${invitationId}/reject`,
  );

  return response.data;
}

export {
  searchUsers,
  invitePlaylistCollaborator,
  getPendingPlaylistInvitations,
  getAllPlaylistInvitations,
  getAcceptedPlaylistInvitations,
  getSentPlaylistInvitations,
  getSentPendingPlaylistInvitations,
  getSentAcceptedPlaylistInvitations,
  getPlaylistCollaborators,
  rejectPlaylistInvitation,
  removePlaylistCollaborator,
  acceptPlaylistInvitation,
  cancelPlaylistInvitation,
};

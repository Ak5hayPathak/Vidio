import api from "../../services/api.js";

async function getChannelStats(signal) {
  const response = await api.get("/dashboard/stats", {
    signal,
  });

  return response.data.data;
}

async function getChannelVideos(signal) {
  const response = await api.get("/dashboard/videos", {
    signal,
  });

  return response.data.data.docs || [];
}

async function getUserChannel(username, signal) {
  const response = await api.get(`/users/c/${username}`, {
    signal,
  });

  return response.data.data;
}

async function updateChannelDetails(fullName, username) {
  const response = await api.patch("/users/update-details", {
    fullName,
    username,
  });

  return response.data;
}

async function updateChannelFiles(formData) {
  const response = await api.patch("/users/update-files", formData);

  return response.data;
}

async function getUserChannelVideos(username, signal) {
  const response = await api.get(`/videos/c/${username}/videos`, {
    signal,
  });

  return response.data.data;
}

async function toggleSubscription(channelId) {
  const response = await api.post(`/subscriptions/c/${channelId}`);

  return response.data.data;
}

export {
  getChannelStats,
  getChannelVideos,
  updateChannelDetails,
  updateChannelFiles,
  getUserChannelVideos,
  toggleSubscription,
  getUserChannel,
};

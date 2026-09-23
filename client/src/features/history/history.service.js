import api from "../../services/api.js";

async function getWatchHistory(signal) {
  const response = await api.get("/users/history", {
    signal,
  });

  return response.data?.data || [];
}

async function clearWatchHistory() {
  const response = await api.delete("/users/history/clear");

  return response.data;
}

async function removeFromWatchHistory(videoId) {
  const response = await api.delete(`/users/history/clear/${videoId}`);

  return response.data;
}

export { getWatchHistory, clearWatchHistory, removeFromWatchHistory };

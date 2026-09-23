import api from "../../services/api.js";

export async function getChannelStats(signal) {
  const response = await api.get("/dashboard/stats", {
    signal,
  });

  return response.data.data;
}

export async function getChannelVideos(signal) {
  const response = await api.get("/dashboard/videos", {
    signal,
  });

  return response.data.data.docs || [];
}
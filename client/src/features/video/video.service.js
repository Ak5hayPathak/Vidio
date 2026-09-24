import api from "../../services/api.js";

const uploadVideo = async (
  { title, description, tags, videoFile, thumbnail },
  onUploadProgress,
) => {
  const formData = new FormData();

  formData.append("title", title.trim());
  formData.append("description", description.trim());

  const parsedTags = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  parsedTags.forEach((tag) => {
    formData.append("tags", tag);
  });

  formData.append("videoFile", videoFile);

  if (thumbnail) {
    formData.append("thumbnail", thumbnail);
  }

  const response = await api.post("/videos", formData, {
    onUploadProgress,
  });

  return response.data.data;
};

const getVideo = async (videoId) => {
  const response = await api.get(`/videos/${videoId}`);

  return response.data.data;
};
const getStreamToken = async (videoId) => {
  const response = await api.post(`/videos/${videoId}/stream-token`);

  return response.data.data.token;
};

const getStreamUrl = (videoId) => {
  return `${api.defaults.baseURL}/videos/${videoId}/stream`;
};

const getHlsFileUrl = (processingId, path) => {
  return `${api.defaults.baseURL}/videos/stream/${processingId}/${path}`;
};

async function recordVideoView(videoId, sessionId) {
  const response = await api.post(`/videos/${videoId}/view`, {
    sessionId,
  });

  return response.data.data;
}

const updateVideo = async ({
  videoId,
  title,
  description,
  tags,
  thumbnail,
}) => {
  const formData = new FormData();

  formData.append("title", title);
  formData.append("description", description);
  formData.append("tags", tags);

  if (thumbnail) {
    formData.append("thumbnail", thumbnail);
  }

  const response = await api.patch(`/videos/${videoId}`, formData);

  return response.data;
};

const togglePublishStatus = async (videoId) => {
  const response = await api.patch(`/videos/toggle/publish/${videoId}`);

  return response.data;
};

const deleteVideo = async (videoId) => {
  const response = await api.delete(`/videos/${videoId}`);
  return response.data.data;
};

export {
  getHlsFileUrl,
  getStreamToken,
  getStreamUrl,
  getVideo,
  recordVideoView,
  updateVideo,
  togglePublishStatus,
  deleteVideo,
  uploadVideo,
};

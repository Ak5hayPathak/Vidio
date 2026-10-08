import api from "../../services/api";

// Get comments for a video
async function getVideoComments(videoId, params = {}) {
  const response = await api.get(`/comments/${videoId}`, {
    params,
  });

  return response.data.data;
}

// Get a single comment
async function getCommentById(commentId) {
  const response = await api.get(`/comments/c/${commentId}`);

  return response.data.data;
}

// Add a top-level comment
async function addComment(videoId, content) {
  const response = await api.post(`/comments/${videoId}`, {
    content,
  });

  return response.data.data;
}

// Update a comment/reply
async function updateComment(commentId, content) {
  const response = await api.patch(`/comments/c/${commentId}`, {
    content,
  });

  return response.data.data;
}

// Delete a comment/reply and its replies
async function deleteComment(commentId) {
  const response = await api.delete(`/comments/c/${commentId}`);

  return response.data.data;
}

// Get replies for a comment
async function getReplies(commentId, params = {}) {
  const response = await api.get(`/comments/c/${commentId}/replies`, {
    params,
  });

  return response.data.data;
}

// Add a reply to a comment
async function addReply(commentId, content) {
  const response = await api.post(`/comments/c/${commentId}/replies`, {
    content,
  });

  return response.data.data;
}

async function toggleCommentLike(commentId) {
  const response = await api.post(`/likes/toggle/c/${commentId}`);

  return response.data.data;
}

// Get number of replies
async function getRepliesCount(commentId) {
  const response = await api.get(`/comments/c/${commentId}/replies/count`);

  return response.data.data;
}

export {
  getVideoComments,
  getCommentById,
  addComment,
  updateComment,
  deleteComment,
  getReplies,
  addReply,
  toggleCommentLike,
  getRepliesCount,
};

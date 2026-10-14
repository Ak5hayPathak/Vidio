import api from "../../../../services/api.js";

// Default pagination metadata.
const EMPTY_PAGINATION = {
  docs: [],
  page: 1,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
  totalDocs: 0,
};

// Search videos by title, description, or tags with pagination.
async function searchVideos(query, page = 1, limit = 10) {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 1) {
    return { ...EMPTY_PAGINATION };
  }

  const response = await api.get("/videos/search", {
    params: {
      q: normalizedQuery,
      page,
      limit,
    },
  });

  return response.data?.data ?? { ...EMPTY_PAGINATION };
}

// Search users by username or full name with pagination.
async function searchUsers(query, page = 1, limit = 10) {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return { ...EMPTY_PAGINATION };
  }

  const response = await api.get("/users/search", {
    params: {
      q: normalizedQuery,
      page,
      limit,
    },
  });

  return response.data?.data ?? { ...EMPTY_PAGINATION };
}

// Search playlists by name or description.
async function searchPlaylists(query, page = 1, limit = 10) {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return { ...EMPTY_PAGINATION };
  }

  const response = await api.get("/playlist/search", {
    params: {
      q: normalizedQuery,
      page,
      limit,
    },
  });

  return response.data?.data ?? { ...EMPTY_PAGINATION };
}

export { searchVideos, searchUsers, searchPlaylists };

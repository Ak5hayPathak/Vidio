export function extractPlaylist(response) {
  const candidates = [
    response?.data?.data?.playlist,
    response?.data?.playlist,
    response?.data?.data,
    response?.data,
    response?.playlist,
    response,
  ];

  for (const item of candidates) {
    // The aggregation endpoint returns an array containing the playlist.
    const playlist = Array.isArray(item) ? item[0] : item;

    if (
      playlist &&
      typeof playlist === "object" &&
      !Array.isArray(playlist) &&
      (playlist._id || playlist.id) &&
      (playlist.name !== undefined || playlist.videos !== undefined)
    ) {
      return playlist;
    }
  }

  return null;
}

export function normalizeVideo(video) {
  if (!video || typeof video !== "object") return null;

  const owner =
    video.owner && typeof video.owner === "object" ? video.owner : {};

  return {
    ...video,
    id: video.id || video._id,
    channel:
      video.channel ||
      owner.fullName ||
      owner.username ||
      owner.name ||
      "Unknown",
    avatar: video.avatar || owner.avatar || "",
    uploaded: video.uploaded || video.createdAt || video.updatedAt || "",
    views: video.views ?? video.viewCount ?? 0,
    thumbnail: video.thumbnail || "",
    duration: video.duration ?? 0,
  };
}

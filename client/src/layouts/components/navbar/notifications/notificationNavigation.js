export function getNotificationPath(notification) {
  const { type, resource, sender, videoId } = notification;

  switch (type) {
    case "new_subscriber":
      return sender?.username ? `/channel/${sender.username}` : null;

    case "new_video":
    case "video_like": {
      const id = typeof resource === "object" ? resource?._id : resource;

      return id ? `/video/watch/${id}` : null;
    }

    case "video_comment":
    case "comment_reply":
    case "comment_like": {
      const video = typeof videoId === "object" ? videoId?._id : videoId;

      const comment = typeof resource === "object" ? resource?._id : resource;

      if (!video) return null;

      return comment
        ? `/video/watch/${video}?comment=${encodeURIComponent(comment)}`
        : `/video/watch/${video}`;
    }

    case "playlist_invitation":
    case "playlist_invitation_accepted": {
      const playlistId =
        typeof resource === "object" ? resource?._id : resource;

      return playlistId ? `/playlists/${playlistId}` : null;
    }

    case "tweet_like":
    case "new_tweet":
      return null;

    default:
      return null;
  }
}

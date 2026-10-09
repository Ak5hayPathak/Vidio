import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MoreVertical,
  Pencil,
  ClockPlus,
  Clock,
  ListPlus,
  HeartOff,
  Trash2,
} from "lucide-react";

import { addToWatchLater, removeFromWatchLater } from "../../features/video/video.service.js";

function VideoCard({
  video,
  isOwner = false,
  variant = "default",
  onRemove,
  onAddToPlaylist,
  removing = false,
  isInWatchLater = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const [savedInWatchLater, setSavedInWatchLater] = useState(isInWatchLater);
  const [watchLaterLoading, setWatchLaterLoading] = useState(false);
  const [watchLaterError, setWatchLaterError] = useState("");

  const menuRef = useRef(null);

  // Synchronize with the parent when the saved status changes.
  useEffect(() => {
    setSavedInWatchLater(isInWatchLater);
  }, [isInWatchLater]);

  // Close the menu when the user clicks outside it.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setWatchLaterError("");
    setMenuOpen((previous) => !previous);
  };

  const handleAction = (callback) => {
    setMenuOpen(false);
    callback?.(video);
  };

  // Add or remove this video using the Watch Later API.
  const handleToggleWatchLater = async () => {
    if (watchLaterLoading || !video?.id) return;

    setWatchLaterLoading(true);
    setWatchLaterError("");

    try {
      if (savedInWatchLater) {
        await removeFromWatchLater(video.id);
        setSavedInWatchLater(false);
      } else {
        await addToWatchLater(video.id);
        setSavedInWatchLater(true);
      }

      setMenuOpen(false);
    } catch (err) {
      setWatchLaterError(
        err.response?.data?.message ??
          "Unable to update Watch Later. Please try again.",
      );
    } finally {
      setWatchLaterLoading(false);
    }
  };

  const isCollectionCard = ["liked", "watchLater", "history"].includes(variant);

  const removeLabel =
    variant === "liked"
      ? "Remove from Liked Videos"
      : variant === "watchLater"
        ? "Remove from Watch Later"
        : "Remove from History";

  const duration = Math.max(0, Number(video.duration) || 0);
  const channelName = video.channel || "Unknown";

  const formattedDate = video.uploaded
    ? new Date(video.uploaded).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const formattedViews =
    typeof video.views === "number"
      ? `${video.views} views`
      : video.views || "0 views";

  return (
    <article className="group">
      {/* Thumbnail */}
      <Link to={`/video/watch/${video.id}`}>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-[#181a20]">
          {!thumbnailError && video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title || "Video thumbnail"}
              loading="lazy"
              onError={() => setThumbnailError(true)}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
              Thumbnail unavailable
            </div>
          )}

          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {`${Math.floor(duration / 60)}:${String(
              Math.floor(duration % 60),
            ).padStart(2, "0")}`}
          </span>
        </div>
      </Link>

      {/* Video information */}
      <div className="mt-3 flex gap-3">
        {/* Channel avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-red-600 text-xs font-semibold text-white">
          {video.avatar && !avatarError ? (
            <img
              src={video.avatar}
              alt={`${channelName} avatar`}
              loading="lazy"
              onError={() => setAvatarError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            channelName.charAt(0).toUpperCase() || "?"
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <Link
              to={`/video/watch/${video.id}`}
              className="min-w-0 flex-1 line-clamp-2 text-sm font-semibold leading-5 text-white transition duration-200 hover:text-gray-300"
            >
              {video.title}
            </Link>

            {/* Options menu */}
            <div ref={menuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={handleMenuToggle}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Video options"
                aria-expanded={menuOpen}
              >
                <MoreVertical size={18} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-9 z-50 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#111318] py-1 shadow-xl">
                  {isCollectionCard ? (
                    <button
                      type="button"
                      disabled={removing}
                      onClick={() => handleAction(onRemove)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-300 transition hover:bg-white/5 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {variant === "liked" ? (
                        <HeartOff size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}

                      <span>{removing ? "Removing..." : removeLabel}</span>
                    </button>
                  ) : (
                    <>
                      {/* Add / remove Watch Later */}
                      <button
                        type="button"
                        disabled={watchLaterLoading}
                        onClick={handleToggleWatchLater}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savedInWatchLater ? (
                          <Clock size={16} />
                        ) : (
                          <ClockPlus size={16} />
                        )}

                        <span>
                          {watchLaterLoading
                            ? "Updating Watch Later..."
                            : savedInWatchLater
                              ? "Remove from Watch Later"
                              : "Add to Watch Later"}
                        </span>
                      </button>

                      {/* Watch Later error */}
                      {watchLaterError && (
                        <p
                          role="alert"
                          className="px-3 py-2 text-xs text-red-400"
                        >
                          {watchLaterError}
                        </p>
                      )}

                      {/* Add to Playlist */}
                      <button
                        type="button"
                        onClick={() => handleAction(onAddToPlaylist)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                      >
                        <ListPlus size={16} />
                        <span>Add to Playlist</span>
                      </button>

                      {/* Edit Video */}
                      {isOwner && (
                        <Link
                          to={`/video/edit/${video.id}`}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                        >
                          <Pencil size={16} />
                          <span>Edit Video</span>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Channel */}
          <Link
            to={`/channel/${video.channel}`}
            className="mt-1 block truncate text-sm text-gray-400 transition duration-200 hover:text-gray-200"
          >
            {channelName}
          </Link>

          {/* Views and upload date */}
          <p className="text-xs text-gray-500">
            {formattedViews} · {formattedDate}
          </p>
        </div>
      </div>
    </article>
  );
}

export default VideoCard;

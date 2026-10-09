import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import WatchLaterHeader from "../components/watch-later/WatchLaterHeader.jsx";
import WatchLaterGrid from "../components/watch-later/WatchLaterGrid.jsx";

import { getWatchLaterVideos, removeFromWatchLater } from "../video.service.js";

function WatchLater() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingVideoId, setRemovingVideoId] = useState(null);

  const fetchWatchLaterVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getWatchLaterVideos();

      const savedVideos = Array.isArray(response)
        ? response
        : (response?.docs ?? []);

      const formattedVideos = savedVideos
        .map((item) => {
          const video = item.videos ?? item.video ?? item;
          const owner = video?.ownerDetails ?? video?.owner ?? {};

          if (!video?._id) return null;

          return {
            id: video._id,
            title: video.title ?? "Untitled video",
            thumbnail: video.thumbnail ?? "",
            duration: video.duration ?? 0,
            channel: owner.username ?? owner.fullName ?? "Unknown",
            avatar:
              typeof owner.avatar === "string"
                ? owner.avatar.replace(/^http:\/\//i, "https://")
                : "",
            views: `${video.views ?? 0} views`,
            uploaded: video.createdAt ?? "",
          };
        })
        .filter(Boolean);

      setVideos(formattedVideos);
    } catch (err) {
      setError(
        err.response?.data?.message ??
          "Unable to load your Watch Later videos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchLaterVideos();
  }, [fetchWatchLaterVideos]);

  const handleRemoveVideo = async (video) => {
    if (removingVideoId) return;

    setError("");
    setRemovingVideoId(video.id);

    const previousVideos = videos;

    // Remove immediately for a responsive UI.
    setVideos((current) => current.filter((item) => item.id !== video.id));

    try {
      await removeFromWatchLater(video.id);
    } catch (err) {
      // Restore the list if the API request fails.
      setVideos(previousVideos);

      setError(
        err.response?.data?.message ??
          "Unable to remove this video from Watch Later.",
      );
    } finally {
      setRemovingVideoId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#08090b] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <WatchLaterHeader count={videos.length} />

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchWatchLaterVideos}
              className="inline-flex items-center gap-2 font-medium hover:text-white"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div
            className="flex min-h-72 items-center justify-center"
            role="status"
          >
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#CE2029]" />
              <p className="text-sm">Loading Watch Later...</p>
            </div>
          </div>
        ) : (
          <WatchLaterGrid
            videos={videos}
            onRemove={handleRemoveVideo}
            removingVideoId={removingVideoId}
          />
        )}
      </div>
    </main>
  );
}

export default WatchLater;

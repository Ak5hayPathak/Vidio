import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Video } from "lucide-react";

import VideoCard from "../../../components/videoCard/VideoCard.jsx";
import { getMyVideos } from "../video.service.js";

function YourVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyVideos();

      const results = Array.isArray(response)
        ? response
        : (response?.docs ?? []);

      const formattedVideos = results
        .map((video) => {
          const owner = video.ownerDetails ?? video.owner ?? {};

          if (!video._id) return null;

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
            views: video.views ?? 0,
            uploaded: video.createdAt ?? "",
          };
        })
        .filter(Boolean);

      setVideos(formattedVideos);
    } catch (err) {
      setError(
        err.response?.data?.message ??
          "Unable to load your videos. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyVideos();
  }, [fetchMyVideos]);

  return (
    <main className="min-h-screen bg-[#08090b] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">Your Videos</h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage and revisit videos you've uploaded.
          </p>

          {!loading && !error && (
            <p className="mt-3 text-sm text-gray-500">
              {videos.length} {videos.length === 1 ? "video" : "videos"}
            </p>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchMyVideos}
              className="inline-flex items-center gap-2 font-medium hover:text-white"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div
            className="flex min-h-72 items-center justify-center"
            role="status"
          >
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#CE2029]" />
              <p className="text-sm">Loading your videos...</p>
            </div>
          </div>
        ) : !error && videos.length === 0 ? (
          /* Empty state */
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <Video size={28} className="text-gray-400" />
            </div>

            <h2 className="text-lg font-semibold">
              You haven't uploaded any videos yet
            </h2>

            <p className="mt-2 max-w-sm text-sm text-gray-400">
              Your published videos will appear here once they're ready.
            </p>
          </div>
        ) : !error ? (
          /* Video grid */
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} isOwner />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default YourVideos;

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import LikedVideosHeader from "../components/liked/LikedVideosHeader.jsx";
import LikedVideosGrid from "../components/liked/LikedVideosGrid.jsx";

import {
  getLikedVideos,
  toggleVideoLike,
} from "../video.service.js";

function LikedVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingVideoId, setRemovingVideoId] = useState(null);

  const fetchLikedVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLikedVideos();

      const likedVideos = Array.isArray(response)
        ? response
        : response?.docs ??
          response?.videos ??
          response?.likedVideos ??
          [];

      const formattedVideos = likedVideos
        .map((item) => {
          const video = item.videos ?? item.video ?? item;
          const owner = video?.ownerDetails ?? video?.owner ?? {};

          if (!video?._id) return null;

          return {
            id: video._id,
            title: video.title,
            thumbnail: video.thumbnail,
            duration: video.duration ?? 0,
            channel: owner.username ?? owner.fullName ?? "Unknown",
            avatar: owner.avatar ?? "",
            views: `${video.views ?? 0} views`,
            uploaded: video.createdAt
              ? new Date(video.createdAt).toLocaleDateString()
              : "",
          };
        })
        .filter(Boolean);

      setVideos(formattedVideos);
    } catch (err) {
      setError(
        err.response?.data?.message ??
          "Unable to load your liked videos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLikedVideos();
  }, [fetchLikedVideos]);

  const handleRemoveVideo = async (video) => {
    if (removingVideoId) return;

    setError("");
    setRemovingVideoId(video.id);

    const previousVideos = videos;

    // Optimistically remove the video from the UI.
    setVideos((current) =>
      current.filter((item) => item.id !== video.id),
    );

    try {
      await toggleVideoLike(video.id);
    } catch (err) {
      setVideos(previousVideos);

      setError(
        err.response?.data?.message ??
          "Unable to remove this video from your liked videos.",
      );
    } finally {
      setRemovingVideoId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#08090b] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <LikedVideosHeader count={videos.length} />

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchLikedVideos}
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
              <p className="text-sm">Loading liked videos...</p>
            </div>
          </div>
        ) : (
          <LikedVideosGrid
            videos={videos}
            onRemove={handleRemoveVideo}
            removingVideoId={removingVideoId}
          />
        )}
      </div>
    </main>
  );
}

export default LikedVideos;

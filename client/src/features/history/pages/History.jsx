import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { useAuth } from "../../../context/AuthContext.jsx";
import api from "../../../services/api.js";
import VideoCard from "../../video/components/VideoCard.jsx";

function History() {
  const { user, loading: authLoading } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  /*
   * Fetch watch history
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?._id) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/users/history",
          {
            signal: controller.signal,
          },
        );

        const historyData =
          response.data?.data || [];

        setHistory(historyData);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(
          "Failed to fetch watch history:",
          err,
        );

        setError(
          err.response?.data?.message ||
            "Failed to load your watch history.",
        );

        setHistory([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => controller.abort();
  }, [user, authLoading]);

  /*
   * Group history into:
   *
   * Today
   * Yesterday
   * Earlier
   */
  const groupedHistory = useMemo(() => {
    const today = [];
    const yesterday = [];
    const earlier = [];

    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const startOfYesterday = new Date(
      startOfToday,
    );

    startOfYesterday.setDate(
      startOfYesterday.getDate() - 1,
    );

    history.forEach((item) => {
      if (!item?.video || !item?.watchedAt) {
        return;
      }

      const watchedAt = new Date(
        item.watchedAt,
      );

      if (watchedAt >= startOfToday) {
        today.push(item);
      } else if (
        watchedAt >= startOfYesterday
      ) {
        yesterday.push(item);
      } else {
        earlier.push(item);
      }
    });

    return {
      today,
      yesterday,
      earlier,
    };
  }, [history]);

  /*
   * Convert backend video data
   * into the format expected by VideoCard.
   */
  const formatVideo = useCallback(
    (item) => {
      const video = item.video;

      const owner =
        video?.ownerDetails ||
        video?.owner ||
        {};

      return {
        id: video?._id,

        thumbnail: video?.thumbnail,

        title: video?.title || "Untitled video",

        channel:
          owner?.fullName ||
          owner?.username ||
          "Unknown channel",

        views: `${Number(
          video?.views || 0,
        ).toLocaleString()} views`,

        uploaded: new Date(
          item.watchedAt,
        ).toLocaleDateString(),

        duration: video?.duration,
      };
    },
    [],
  );

  /*
   * Clear complete watch history
   */
  const handleClearHistory = async () => {
    if (clearing || history.length === 0) {
      return;
    }

    try {
      setClearing(true);
      setError("");

      await api.delete("/users/history/clear");

      setHistory([]);
    } catch (err) {
      console.error(
        "Failed to clear watch history:",
        err,
      );

      setError(
        err.response?.data?.message ||
          "Failed to clear your watch history.",
      );
    } finally {
      setClearing(false);
    }
  };

  /*
   * Remove a single video from history
   */
  const handleRemoveVideo = async (
    videoId,
  ) => {
    try {
      await api.delete(
        `/users/history/clear/${videoId}`,
      );

      setHistory((current) =>
        current.filter(
          (item) =>
            item.video?._id !== videoId,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to remove video from history:",
        err,
      );
    }
  };

  const renderVideos = (items) => {
    return (
      <div
        className="
          grid
          grid-cols-1
          gap-x-5
          gap-y-8
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        {items.map((item) => (
          <div
            key={`${item.video._id}-${item.watchedAt}`}
            className="relative"
          >
            <VideoCard
              video={formatVideo(item)}
            />

            {/* Remove from history */}
            <button
              type="button"
              onClick={() =>
                handleRemoveVideo(
                  item.video._id,
                )
              }
              title="Remove from history"
              className="
                absolute
                right-2
                top-2
                z-10
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-black/70
                text-gray-400
                backdrop-blur
                transition
                hover:bg-red-600
                hover:text-white
              "
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">

        {/* Page heading */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              History
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Videos you've watched recently
            </p>
          </div>

          {/* Clear history */}
          <button
            type="button"
            onClick={handleClearHistory}
            disabled={
              clearing ||
              history.length === 0
            }
            className="
              hidden
              rounded-lg
              border
              border-white/10
              px-4
              py-2
              text-sm
              font-medium
              text-gray-400
              transition
              hover:border-red-600/40
              hover:bg-red-600/10
              hover:text-red-500
              disabled:cursor-not-allowed
              disabled:opacity-40
              sm:block
            "
          >
            {clearing
              ? "Clearing..."
              : "Clear history"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="
              mb-8
              rounded-xl
              border
              border-red-500/20
              bg-red-500/10
              px-4
              py-3
              text-sm
              text-red-400
            "
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center text-sm text-gray-500">
            Loading your history...
          </div>
        )}

        {/* Empty history */}
        {!loading && !error && history.length === 0 && (
          <div
            className="
              flex
              min-h-80
              items-center
              justify-center
              rounded-2xl
              border
              border-dashed
              border-white/10
              bg-[#111318]
              px-6
              text-center
            "
          >
            <div>
              <h2 className="text-xl font-semibold">
                No watch history
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Videos you watch will appear here.
              </p>
            </div>
          </div>
        )}

        {/* History */}
        {!loading && history.length > 0 && (
          <>
            {/* Today */}
            {groupedHistory.today.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-5 text-lg font-semibold">
                  Today
                </h2>

                {renderVideos(
                  groupedHistory.today,
                )}
              </section>
            )}

            {/* Yesterday */}
            {groupedHistory.yesterday.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-5 text-lg font-semibold">
                  Yesterday
                </h2>

                {renderVideos(
                  groupedHistory.yesterday,
                )}
              </section>
            )}

            {/* Earlier */}
            {groupedHistory.earlier.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-5 text-lg font-semibold">
                  Earlier
                </h2>

                {renderVideos(
                  groupedHistory.earlier,
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default History;
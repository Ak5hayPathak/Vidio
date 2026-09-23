import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../../context/AuthContext.jsx";

import {
  getWatchHistory,
  clearWatchHistory,
  removeFromWatchHistory,
} from "../history.service.js";

import { groupHistoryByDate } from "../history.utils.js";

import HistorySection from "../components/HistorySection.jsx";

function History() {
  const { user, loading: authLoading } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  //Fetch Watch History
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

        const historyData =
          await getWatchHistory(controller.signal);

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
  const groupedHistory = useMemo(
    () => groupHistoryByDate(history),
    [history],
  );

  // Clear complete watch history

  const handleClearHistory = async () => {
    if (clearing || history.length === 0) {
      return;
    }

    try {
      setClearing(true);
      setError("");

      await clearWatchHistory();

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

  //Remove a single video from history
  
  const handleRemoveVideo = async (videoId) => {
    try {
      await removeFromWatchHistory(videoId);

      setHistory((current) =>
        current.filter(
          (item) => item.video?._id !== videoId,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to remove video from history:",
        err,
      );
    }
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
        {!loading &&
          !error &&
          history.length === 0 && (
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
            <HistorySection
              title="Today"
              items={groupedHistory.today}
              onRemove={handleRemoveVideo}
            />

            <HistorySection
              title="Yesterday"
              items={groupedHistory.yesterday}
              onRemove={handleRemoveVideo}
            />

            <HistorySection
              title="Earlier"
              items={groupedHistory.earlier}
              onRemove={handleRemoveVideo}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default History;
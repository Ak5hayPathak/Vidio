import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ListVideo,
  LoaderCircle,
  LockKeyhole,
  Plus,
  Search,
  X,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext.jsx";
import {
  getUserPlaylists,
  addVideoToPlaylist,
} from "../playlist.service.js";

function getPlaylistId(playlist) {
  return playlist?._id || playlist?.id;
}

function getVideoId(video) {
  return typeof video === "string" ? video : video?._id || video?.id;
}

function extractPlaylists(response) {
  const candidates = [
    response?.data?.docs,
    response?.data?.data?.docs,
    response?.data?.playlists,
    response?.data?.data?.playlists,
    response?.docs,
    response?.playlists,
    response?.data,
    response,
  ];

  return candidates.find(Array.isArray) || [];
}

function AddToPlaylistDialog({ video, onClose }) {
  const { user } = useAuth();

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const videoId = getVideoId(video);
  const userId = user?._id || user?.id;

  useEffect(() => {
    let cancelled = false;

    async function fetchPlaylists() {
      if (!userId) {
        setError("Please sign in to add videos to playlists.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getUserPlaylists(userId);

        if (!cancelled) {
          setPlaylists(extractPlaylists(response));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load your playlists. Please try again.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPlaylists();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Close the dialog with Escape and prevent the background from scrolling.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !adding) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [adding, onClose]);

  const filteredPlaylists = useMemo(() => {
    const query = search.trim().toLowerCase();

    return playlists.filter((playlist) =>
      (playlist.name || "").toLowerCase().includes(query),
    );
  }, [playlists, search]);

  const selectedPlaylist = playlists.find(
    (playlist) => getPlaylistId(playlist) === selectedPlaylistId,
  );

  const isVideoInPlaylist = (playlist) =>
    (playlist.videosDetails || playlist.videos || []).some(
      (item) => getVideoId(item) === videoId,
    );

  const handleAdd = async () => {
    if (!selectedPlaylistId || !videoId || adding) return;

    setAdding(true);
    setError("");
    setSuccess("");

    try {
      await addVideoToPlaylist(videoId, selectedPlaylistId);
      setSuccess(`Added to "${selectedPlaylist?.name || "playlist"}".`);

      // Let the user see the confirmation before closing.
      setTimeout(onClose, 700);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to add this video. Please try again.",
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !adding) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-playlist-title"
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111214] text-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
              <ListVideo size={21} />
            </div>

            <div>
              <h2 id="add-playlist-title" className="font-semibold">
                Add to playlist
              </h2>
              <p className="mt-0.5 max-w-[250px] truncate text-xs text-gray-400">
                {video?.title || "Choose a playlist for this video"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={adding}
            aria-label="Close dialog"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#08090b] px-3">
            <Search size={17} className="shrink-0 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your playlists..."
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Playlist list */}
        <div className="min-h-32 flex-1 overflow-y-auto px-3 py-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-400">
              <LoaderCircle size={25} className="animate-spin" />
              <p className="text-sm">Loading your playlists...</p>
            </div>
          ) : error && playlists.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setError("");
                  getUserPlaylists(userId)
                    .then((response) =>
                      setPlaylists(extractPlaylists(response)),
                    )
                    .catch((err) =>
                      setError(
                        err.response?.data?.message ||
                          "Unable to load your playlists. Please try again.",
                      ),
                    )
                    .finally(() => setLoading(false));
                }}
                className="mt-3 text-sm font-medium text-white underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          ) : playlists.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-gray-500">
                <ListVideo size={25} />
              </div>
              <p className="mt-4 font-medium">No playlists yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Create a playlist first, then you can add videos to it.
              </p>
            </div>
          ) : filteredPlaylists.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              No playlists match "{search}".
            </p>
          ) : (
            <div className="space-y-1">
              {filteredPlaylists.map((playlist) => {
                const playlistId = getPlaylistId(playlist);
                const selected = selectedPlaylistId === playlistId;
                const alreadyAdded = isVideoInPlaylist(playlist);
                const firstVideo = (playlist.videosDetails ||
                  playlist.videos ||
                  [])[0];

                const thumbnail =
                  playlist.thumbnail ||
                  (typeof firstVideo === "object"
                    ? firstVideo?.thumbnail
                    : null);

                return (
                  <button
                    key={playlistId}
                    type="button"
                    disabled={!playlistId || alreadyAdded || adding}
                    onClick={() => {
                      setSelectedPlaylistId(playlistId);
                      setError("");
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      alreadyAdded
                        ? "cursor-not-allowed opacity-60"
                        : selected
                          ? "bg-red-600/10 ring-1 ring-red-500/70"
                          : "hover:bg-white/5"
                    }`}
                  >
                    <div className="relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#24262b]">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ListVideo size={22} className="text-gray-500" />
                      )}

                      {selected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Check size={23} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-100">
                        {playlist.name || "Untitled playlist"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {playlist.totalVideos ??
                          playlist.videos?.length ??
                          playlist.videosDetails?.length ??
                          0}{" "}
                        videos
                        {playlist.isPublic === false && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <LockKeyhole size={11} />
                            Private
                          </span>
                        )}
                      </p>
                      {alreadyAdded && (
                        <p className="mt-1 text-xs text-gray-500">
                          Already in this playlist
                        </p>
                      )}
                    </div>

                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-red-500 bg-red-600"
                          : "border-gray-600"
                      }`}
                    >
                      {selected && <Check size={12} />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-5 py-4">
          {error && playlists.length > 0 && (
            <p role="alert" className="mb-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="mb-3 text-sm text-green-400">
              {success}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-xs text-gray-500">
              {selectedPlaylist
                ? `Selected: ${selectedPlaylist.name}`
                : "Select a playlist"}
            </span>

            <button
              type="button"
              onClick={handleAdd}
              disabled={
                !selectedPlaylistId ||
                adding ||
                loading ||
                !videoId ||
                isVideoInPlaylist(selectedPlaylist || {})
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {adding ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AddToPlaylistDialog;

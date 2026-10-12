import { useCallback, useEffect, useState } from "react";
import { ListVideo, Plus, RefreshCw, Search, X } from "lucide-react";

import { useAuth } from "../../../context/AuthContext.jsx";
import {
  createPlaylist,
  getUserPlaylists,
  updatePlaylist,
  deletePlaylist,
} from "../playlist.service.js";

import PlaylistCard from "../components/PlaylistCard.jsx";
import PlaylistEmptyState from "../components/PlaylistEmptyState.jsx";
import CreatePlaylistDialog from "../components/CreatePlaylistDialog.jsx";
import EditPlaylistDialog from "../components/EditPlaylistDialog.jsx";
import DeletePlaylistDialog from "../components/DeletePlaylistDialog.jsx";

function Playlists() {
  const { user, loading: authLoading } = useAuth();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState(null);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const userId = user?._id || user?.id;

  const fetchPlaylists = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      const response = await getUserPlaylists(userId);
      const result = response?.data;

      const playlistList = Array.isArray(result) ? result : result?.docs || [];

      setPlaylists(playlistList);
    } catch (err) {
      if (err.response?.status === 404) {
        setPlaylists([]);
      } else {
        setError(
          err.response?.data?.message ||
            "We couldn't load your playlists. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      setPlaylists([]);
      setLoading(false);
      return;
    }

    fetchPlaylists();
  }, [authLoading, userId, fetchPlaylists]);

  const handleCreatePlaylist = async (playlistData) => {
    await createPlaylist(playlistData);
    await fetchPlaylists();
  };

  const handleUpdatePlaylist = async (playlistData) => {
    if (!playlistToEdit) return;

    await updatePlaylist(playlistToEdit._id || playlistToEdit.id, playlistData);

    setPlaylistToEdit(null);
    await fetchPlaylists();
  };

  const handleDeletePlaylist = async () => {
    if (!playlistToDelete) return;

    await deletePlaylist(playlistToDelete._id || playlistToDelete.id);

    setPlaylistToDelete(null);
    await fetchPlaylists();
  };

  const filteredPlaylists = playlists.filter((playlist) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    return (
      playlist.name?.toLowerCase().includes(query) ||
      playlist.description?.toLowerCase().includes(query)
    );
  });

  if (authLoading || (loading && playlists.length === 0 && !error)) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#08090b] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-8 w-44 animate-pulse rounded-lg bg-white/10" />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-xl"
              >
                <div className="aspect-video rounded-xl bg-white/5" />
                <div className="mt-3 h-4 w-3/4 rounded bg-white/10" />
                <div className="mt-2 h-3 w-1/2 rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#08090b] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/10 text-red-500">
              <ListVideo size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Your playlists
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Organize the videos you love.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#08090b]"
          >
            <Plus size={19} />
            Create playlist
          </button>
        </div>

        {/* Search and playlist count */}
        {/* {!loading && !error && playlists.length > 0 && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-400">
              {playlists.length}{" "}
              {playlists.length === 1 ? "playlist" : "playlists"}
            </p>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search your playlists"
                aria-label="Search your playlists"
                className="w-full rounded-full border border-white/10 bg-[#111214] py-2.5 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white/25"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )} */}

        {/* Error state */}
        {error && (
          <section className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#101113] px-5 py-16 text-center">
            <p className="max-w-md text-sm text-gray-400">{error}</p>

            <button
              type="button"
              onClick={fetchPlaylists}
              disabled={loading}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-medium transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Try again
            </button>
          </section>
        )}

        {/* Empty state */}
        {!loading && !error && playlists.length === 0 && (
          <PlaylistEmptyState
            onCreatePlaylist={() => setIsCreateDialogOpen(true)}
          />
        )}

        {/* No search results */}
        {!loading &&
          !error &&
          playlists.length > 0 &&
          filteredPlaylists.length === 0 && (
            <section className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#101113] px-5 py-16 text-center">
              <Search size={32} className="mb-4 text-gray-600" />

              <h2 className="text-lg font-semibold">No playlists found</h2>

              <p className="mt-2 max-w-sm text-sm text-gray-400">
                Try another search term to find the playlist you're looking for.
              </p>

              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-5 text-sm font-medium text-red-500 transition hover:text-red-400"
              >
                Clear search
              </button>
            </section>
          )}

        {/* Playlist grid */}
        {!error && filteredPlaylists.length > 0 && (
          <section
            aria-label="Your playlists"
            className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredPlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist._id || playlist.id}
                playlist={playlist}
                onEditClick={setPlaylistToEdit}
                onDeleteClick={setPlaylistToDelete}
              />
            ))}
          </section>
        )}

        {/* Refresh indicator */}
        {loading && playlists.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <RefreshCw size={15} className="animate-spin" />
            Refreshing playlists...
          </div>
        )}
      </div>

      {/* Create playlist dialog */}
      {isCreateDialogOpen && (
        <CreatePlaylistDialog
          onClose={() => setIsCreateDialogOpen(false)}
          onCreate={handleCreatePlaylist}
        />
      )}

      {/* Edit playlist dialog */}
      {playlistToEdit && (
        <EditPlaylistDialog
          playlist={playlistToEdit}
          onClose={() => setPlaylistToEdit(null)}
          onUpdate={handleUpdatePlaylist}
        />
      )}

      {/* Delete playlist dialog */}
      {playlistToDelete && (
        <DeletePlaylistDialog
          playlist={playlistToDelete}
          onClose={() => setPlaylistToDelete(null)}
          onDelete={handleDeletePlaylist}
        />
      )}
    </main>
  );
}

export default Playlists;

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext.jsx";

import {
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  removeVideoFromPlaylist,
  togglePlaylistVisibility,
} from "../playlist.service.js";

import {
  extractPlaylist,
  normalizeVideo,
} from "../playlist.utils.js";

import PlaylistHeader from "../components/playlistDetails/PlaylistHeader.jsx";
import PlaylistVideosSection from "../components/playlistDetails/PlaylistVideosSection.jsx";
import PlaylistFeedback from "../components/playlistDetails/PlaylistFeedback.jsx";
import PlaylistLoading from "../components/playlistDetails/PlaylistLoading.jsx";
import PlaylistError from "../components/playlistDetails/PlaylistError.jsx";

import EditPlaylistDialog from "../components/EditPlaylistDialog.jsx";
import DeletePlaylistDialog from "../components/DeletePlaylistDialog.jsx";

function PlaylistDetails() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [removingVideoId, setRemovingVideoId] = useState("");
  const [visibilityLoading, setVisibilityLoading] = useState(false);

  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const currentUserId = user?._id || user?.id;

  const ownerId =
    typeof playlist?.owner === "object"
      ? playlist.owner?._id || playlist.owner?.id
      : playlist?.owner;

  const isOwner =
    Boolean(currentUserId) &&
    Boolean(ownerId) &&
    String(currentUserId) === String(ownerId);

  const owner =
    playlist?.owner && typeof playlist.owner === "object"
      ? playlist.owner
      : null;

  const videos = (playlist?.videosDetails || playlist?.videos || [])
    .map(normalizeVideo)
    .filter(Boolean);

  const totalVideos = playlist?.totalVideos ?? videos.length;

  const fetchPlaylist = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getPlaylistById(playlistId);
        const result = extractPlaylist(response);

        if (!result) {
          throw new Error("The playlist response was empty or invalid.");
        }

        setPlaylist(result);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load this playlist. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [playlistId],
  );

  useEffect(() => {
    if (!authLoading) {
      fetchPlaylist();
    }
  }, [authLoading, fetchPlaylist]);

  const handleUpdatePlaylist = async (playlistData) => {
    try {
      await updatePlaylist(playlistId, playlistData);

      setEditing(false);
      setActionError("");
      setNotice("Playlist updated successfully.");

      await fetchPlaylist(true);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Unable to update this playlist.",
      );
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      await deletePlaylist(playlistId);
      navigate("/playlists", { replace: true });
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Unable to delete this playlist.",
      );
      setConfirmDelete(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (visibilityLoading) return;

    setVisibilityLoading(true);
    setActionError("");
    setNotice("");

    try {
      await togglePlaylistVisibility(playlistId);

      setNotice("Playlist visibility updated.");
      await fetchPlaylist(true);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Unable to change playlist visibility.",
      );
    } finally {
      setVisibilityLoading(false);
    }
  };

  const handleRemoveVideo = async (video) => {
    const videoId = video?.id || video?._id;

    if (!videoId || removingVideoId) return;

    setRemovingVideoId(String(videoId));
    setActionError("");
    setNotice("");

    try {
      await removeVideoFromPlaylist(videoId, playlistId);

      setPlaylist((previous) => {
        if (!previous) return previous;

        const filterVideo = (item) =>
          String(item?._id || item?.id || item) !== String(videoId);

        return {
          ...previous,
          videos: Array.isArray(previous.videos)
            ? previous.videos.filter(filterVideo)
            : previous.videos,
          videosDetails: Array.isArray(previous.videosDetails)
            ? previous.videosDetails.filter(filterVideo)
            : previous.videosDetails,
          totalVideos: Math.max(
            0,
            (previous.totalVideos ?? videos.length) - 1,
          ),
        };
      });

      setNotice("Video removed from playlist.");
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Unable to remove this video from the playlist.",
      );
    } finally {
      setRemovingVideoId("");
    }
  };

  if (authLoading || loading) {
    return <PlaylistLoading />;
  }

  if (error && !playlist) {
    return (
      <PlaylistError
        error={error}
        onRetry={() => fetchPlaylist()}
        onBack={() => navigate("/playlists")}
      />
    );
  }

  if (!playlist) return null;

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
      <PlaylistHeader
        playlist={playlist}
        videos={videos}
        totalVideos={totalVideos}
        owner={owner}
        isOwner={isOwner}
        visibilityLoading={visibilityLoading}
        onEdit={() => setEditing(true)}
        onDelete={() => setConfirmDelete(true)}
        onToggleVisibility={handleToggleVisibility}
      />

      <PlaylistFeedback
        actionError={actionError}
        notice={notice}
        error={error}
        onRetry={() => fetchPlaylist(true)}
      />

      <PlaylistVideosSection
        videos={videos}
        totalVideos={totalVideos}
        isOwner={isOwner}
        refreshing={refreshing}
        removingVideoId={removingVideoId}
        onRefresh={() => fetchPlaylist(true)}
        onRemoveVideo={handleRemoveVideo}
      />

      {editing && (
        <EditPlaylistDialog
          playlist={playlist}
          onClose={() => setEditing(false)}
          onUpdate={handleUpdatePlaylist}
        />
      )}

      {confirmDelete && (
        <DeletePlaylistDialog
          playlist={playlist}
          onClose={() => setConfirmDelete(false)}
          onDelete={handleDeletePlaylist}
        />
      )}
    </section>
  );
}

export default PlaylistDetails;
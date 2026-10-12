import { Link } from "react-router-dom";
import { ArrowLeft, Globe, ListVideo, LockKeyhole, Play } from "lucide-react";

import PlaylistActionsMenu from "./PlaylistActionsMenu.jsx";

function PlaylistHeader({
  playlist,
  videos,
  totalVideos,
  owner,
  isOwner,
  visibilityLoading,
  onEdit,
  onDelete,
  onToggleVisibility,
}) {
  return (
    <>
      <Link
        to="/playlists"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
      >
        <ArrowLeft size={17} />
        All playlists
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111214]">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-transparent" />

        <div className="relative flex flex-col gap-5 p-5 sm:p-7 md:flex-row md:items-center">
          <div className="flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#202126] sm:w-64 md:w-72">
            {playlist.thumbnail || videos[0]?.thumbnail ? (
              <img
                src={playlist.thumbnail || videos[0]?.thumbnail}
                alt={`${playlist.name} thumbnail`}
                className="h-full w-full object-cover"
              />
            ) : (
              <ListVideo size={52} className="text-gray-600" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
              <ListVideo size={14} />
              Playlist
            </div>

            <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {playlist.name}
            </h1>

            {playlist.description && (
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-400">
                {playlist.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
              {owner && (
                <Link
                  to={`/channel/${owner.username || owner._id}`}
                  className="font-medium text-gray-200 transition hover:text-white"
                >
                  {owner.fullName || owner.username || owner.name || "Channel"}
                </Link>
              )}

              <span>
                {totalVideos} {totalVideos === 1 ? "video" : "videos"}
              </span>

              <span className="inline-flex items-center gap-1.5">
                {playlist.isPublic === false ? (
                  <LockKeyhole size={14} />
                ) : (
                  <Globe size={14} />
                )}

                {playlist.isPublic === false ? "Private" : "Public"}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {videos.length > 0 && (
                <Link
                  to={`/video/watch/${videos[0].id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <Play size={16} fill="currentColor" />
                  Play first video
                </Link>
              )}

              {isOwner && (
                <PlaylistActionsMenu
                  isPublic={playlist.isPublic !== false}
                  visibilityLoading={visibilityLoading}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleVisibility={onToggleVisibility}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PlaylistHeader;

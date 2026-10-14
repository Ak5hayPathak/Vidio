import { Link } from "react-router-dom";
import { ListVideo, Play } from "lucide-react";

function PlaylistSearchCard({ playlist }) {
  const playlistId = playlist._id ?? playlist.id;
  const owner = playlist.ownerDetails ?? playlist.owner ?? {};
  const videos = Array.isArray(playlist.videos) ? playlist.videos : [];

  const thumbnail =
    playlist.thumbnail?.url ??
    playlist.thumbnail ??
    playlist.firstVideo?.thumbnail?.url ??
    playlist.firstVideo?.thumbnail ??
    videos[0]?.thumbnail?.url ??
    videos[0]?.thumbnail ??
    "";

  const title = playlist.name || playlist.title || "Untitled playlist";
  const username = owner.username;
  const fullName = owner.fullName ?? username;
  const videoCount = Number(playlist.videoCount ?? videos.length);

  return (
    <article className="w-full max-w-4xl">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Playlist thumbnail */}
        <Link
          to={`/playlists/${playlistId}`}
          className="
            relative block aspect-video w-36 shrink-0 overflow-hidden
            rounded-lg bg-[#181a20] sm:w-52 md:w-60
          "
          aria-label={`Open playlist ${title}`}
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-200 hover:brightness-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              <ListVideo size={28} />
            </div>
          )}

          <div className="absolute inset-y-0 right-0 flex w-10 flex-col items-center justify-center gap-1 bg-black/75 text-white sm:w-12">
            <ListVideo size={17} />
            <span className="text-xs font-semibold">{videoCount}</span>
            <Play size={12} />
          </div>
        </Link>

        {/* Playlist information */}
        <div className="min-w-0 flex-1">
          <Link
            to={`/playlists/${playlistId}`}
            className="line-clamp-2 text-sm font-medium leading-5 text-white hover:text-red-400 sm:text-base sm:leading-6"
          >
            {title}
          </Link>

          <p className="mt-1 text-[11px] text-gray-400 sm:text-xs">
            {videoCount} {videoCount === 1 ? "video" : "videos"}
          </p>

          {username && (
            <Link
              to={`/channel/${encodeURIComponent(username)}`}
              className="mt-2 block truncate text-xs text-gray-400 hover:text-white"
            >
              {fullName || `@${username}`}
            </Link>
          )}

          {playlist.description && (
            <p className="mt-2 hidden line-clamp-2 text-xs leading-5 text-gray-500 sm:block">
              {playlist.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default PlaylistSearchCard;

import { Link } from "react-router-dom";
import { Eye, Play } from "lucide-react";

function formatViews(value) {
  const views = Number(value ?? 0);

  return `${new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number.isFinite(views) ? views : 0)} views`;
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDuration(value) {
  if (value == null || !Number.isFinite(Number(value))) return "";

  const seconds = Math.max(0, Math.floor(Number(value)));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
    : `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function VideoSearchCard({ video }) {
  const videoId = video._id ?? video.id;
  const owner = video.ownerDetails ?? video.owner ?? {};
  const username = owner.username ?? video.channel?.username;
  const fullName = owner.fullName ?? video.channel?.fullName ?? username;
  const avatar = owner.avatar ?? video.channel?.avatar;

  const thumbnail =
    video.thumbnail?.url ?? video.thumbnail ?? video.thumbnailUrl ?? "";

  const duration = formatDuration(video.duration);
  const uploaded = formatDate(video.createdAt ?? video.uploaded);

  return (
    <article className="w-full max-w-4xl">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Thumbnail */}
        <Link
          to={`/video/watch/${videoId}`}
          className="
            relative block aspect-video w-36 shrink-0 overflow-hidden
            rounded-lg bg-[#181a20] sm:w-52 md:w-60
          "
          aria-label={`Watch ${video.title || "video"}`}
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={video.title || "Video thumbnail"}
              loading="lazy"
              className="h-full w-full object-cover transition duration-200 hover:brightness-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              <Play size={24} />
            </div>
          )}

          {duration && (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-0.5 text-[10px] font-medium text-white sm:text-xs">
              {duration}
            </span>
          )}
        </Link>

        {/* Video information */}
        <div className="min-w-0 flex-1">
          <Link
            to={`/video/watch/${videoId}`}
            className="line-clamp-2 text-sm font-medium leading-5 text-white hover:text-red-400 sm:text-base sm:leading-6"
          >
            {video.title || "Untitled video"}
          </Link>

          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400 sm:text-xs">
            <Eye size={12} />
            <span>{formatViews(video.views)}</span>

            {uploaded && (
              <>
                <span>·</span>
                <span>{uploaded}</span>
              </>
            )}
          </p>

          {username && (
            <Link
              to={`/channel/${encodeURIComponent(username)}`}
              className="mt-2 flex w-fit max-w-full items-center gap-2 text-xs text-gray-400 hover:text-white"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  loading="lazy"
                  className="h-5 w-5 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px]">
                  {(fullName || username).charAt(0).toUpperCase()}
                </span>
              )}

              <span className="truncate">{fullName || `@${username}`}</span>
            </Link>
          )}

          {video.description && (
            <p className="mt-2 hidden line-clamp-2 text-xs leading-5 text-gray-500 sm:block">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default VideoSearchCard;

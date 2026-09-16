import { Link } from "react-router-dom";

function VideoCard({ video }) {
  return (
    <article className="group">
      {/* Thumbnail */}
      <Link to={`/watch/${video.id}`}>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-200">
          <img
            src={`${video.thumbnail}?auto=format&fit=crop&w=800&q=80`}
            alt={video.title}
            className="
              h-full
              w-full
              object-cover
              transition
              duration-300
              group-hover:scale-105
            "
          />

          {/* Duration */}
          <span
            className="
    absolute
    bottom-2
    right-2
    rounded
    bg-black/80
    px-1.5
    py-0.5
    text-xs
    font-medium
    text-white
  "
          >
            {`${Math.floor(video.duration / 60)}:${String(
              Math.floor(video.duration % 60),
            ).padStart(2, "0")}`}
          </span>
        </div>
      </Link>

      {/* Video information */}
      <div className="mt-3 flex gap-3">
        {/* Channel avatar */}
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-red-600
            text-xs
            font-semibold
            text-white
          "
        >
          {video.channel.charAt(0)}
        </div>

        {/* Text */}
        <div className="min-w-0">
          <Link
            to={`/watch/${video.id}`}
            className="
              line-clamp-2
              text-sm
              font-semibold
              leading-5
              text-white
              transition
              group-hover:text-gray-600
            "
          >
            {video.title}
          </Link>

          <Link
            to={`/channel/${video.channel}`}
            className="
              mt-1
              block
              truncate
              text-sm
              text-gray-400
              group-hover:text-red-500
            "
          >
            {video.channel}
          </Link>

          <p className="text-xs text-gray-500">
            {video.views} · {video.uploaded}
          </p>
        </div>
      </div>
    </article>
  );
}

export default VideoCard;

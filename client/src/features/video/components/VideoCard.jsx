import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical, Pencil } from "lucide-react";

function VideoCard({ video, isOwner = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleMenuToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setMenuOpen((previous) => !previous);
  };

  return (
    <article className="group">
      {/* Thumbnail */}
      <Link to={`/video/watch/${video.id}`}>
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
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            {/* Title */}
            <Link
              to={`/video/watch/${video.id}`}
              className="
                min-w-0
                flex-1
                line-clamp-2
                text-sm
                font-semibold
                leading-5
                text-white
                transition
                duration-200
                hover:text-gray-300
              "
            >
              {video.title}
            </Link>

            {/* Owner menu */}
            {isOwner && (
              <div
                ref={menuRef}
                className="relative shrink-0"
              >
                <button
                  type="button"
                  onClick={handleMenuToggle}
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    text-gray-400
                    transition
                    hover:bg-white/10
                    hover:text-white
                  "
                  aria-label="Video options"
                  aria-expanded={menuOpen}
                >
                  <MoreVertical size={18} />
                </button>

                {menuOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      top-9
                      z-50
                      w-40
                      overflow-hidden
                      rounded-xl
                      border
                      border-white/10
                      bg-[#111318]
                      py-1
                      shadow-xl
                    "
                  >
                    <Link
                      to={`/video/edit/${video.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="
                        flex
                        items-center
                        gap-3
                        px-3
                        py-2.5
                        text-sm
                        text-gray-300
                        transition
                        hover:bg-white/5
                        hover:text-white
                      "
                    >
                      <Pencil size={16} />
                      <span>Edit Video</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Channel */}
          <Link
            to={`/channel/${video.channel}`}
            className="
              mt-1
              block
              truncate
              text-sm
              text-gray-400
              transition
              duration-200
              hover:text-gray-200
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